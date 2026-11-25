import "server-only";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { ObjectId } from "mongodb";
import { SESSION_COOKIE_NAME } from "@/lib/admin/auth/config";
import { fail, handleError, isSameOrigin, isUnsafeMethod } from "@/lib/admin/auth/request";
import { readSessionToken, resolveSession } from "@/lib/admin/auth/session";
import { hasRole, toPublicUser, type PublicUser, type Role } from "@/lib/admin/db/models";

/**
 * Authentication / authorization middleware for admin API routes.
 *
 *   export const GET = withAuth(async (request, auth) => json({ user: auth.user }));
 *   export const PUT = withAuth(handler, { minRole: "super_admin" });
 *
 * The user is re-read from MongoDB on every request, so a disabled account or
 * a changed role applies immediately. Handlers only ever see `PublicUser`
 * (never the password hash).
 */

export type AuthContext = {
    user: PublicUser;
    userId: ObjectId;
    sessionId: string;
};

/** The signed-in user for this request, or null. */
export async function authenticate(request: NextRequest): Promise<AuthContext | null> {
    const active = await resolveSession(readSessionToken(request));
    if (!active) return null;
    return { user: toPublicUser(active.user), userId: active.user._id, sessionId: active.sessionId };
}

type Options = {
    /** Minimum role required. Omit to allow any signed-in user. */
    minRole?: Role;
};

export function withAuth<Ctx = unknown>(
    handler: (request: NextRequest, auth: AuthContext, ctx: Ctx) => Promise<Response> | Response,
    options: Options = {},
) {
    return async (request: NextRequest, ctx: Ctx): Promise<Response> => {
        try {
            if (isUnsafeMethod(request.method) && !isSameOrigin(request)) {
                return fail(403, "bad_origin", "Cross-site request blocked.");
            }
            const auth = await authenticate(request);
            if (!auth) return fail(401, "unauthenticated", "Authentication required.");
            if (options.minRole && !hasRole(auth.user.role, options.minRole)) {
                return fail(403, "forbidden", "You do not have permission to do this.");
            }
            return await handler(request, auth, ctx);
        } catch (err) {
            return handleError(err);
        }
    };
}

/**
 * For Server Components / layouts (admin pages, later tasks). Always
 * re-validate here; do not rely on proxy.ts alone.
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    const active = await resolveSession(token);
    return active ? toPublicUser(active.user) : null;
}
