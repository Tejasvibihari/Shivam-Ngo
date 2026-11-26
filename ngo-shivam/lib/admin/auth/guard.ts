import "server-only";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { ObjectId } from "mongodb";
import { writeAudit } from "@/lib/admin/auth/audit";
import { SESSION_COOKIE_NAME } from "@/lib/admin/auth/config";
import { evaluateAccess, type AccessRequirement, type Permission } from "@/lib/admin/auth/permissions";
import { consume } from "@/lib/admin/auth/rate-limit";
import { clientIp, fail, handleError, isSameOrigin, isUnsafeMethod } from "@/lib/admin/auth/request";
import { readSessionToken, resolveSession } from "@/lib/admin/auth/session";
import { toPublicUser, type PublicUser } from "@/lib/admin/db/models";

/**
 * Authentication + authorization middleware for admin API routes.
 *
 *   // any role that may use the admin API (self-service routes)
 *   export const GET = withAuth(async (request, auth) => json({ user: auth.user }), { permission: "admin:access" });
 *
 *   // a specific permission (see the matrix in permissions.ts)
 *   export const PUT = withAuth(handler, { permission: "settings:update_sensitive" });
 *
 *   // several permissions: the caller needs ALL of them
 *   export const DELETE = withAuth(handler, { permission: ["content:delete", "media:delete"] });
 *
 * The requirement is MANDATORY (a route cannot be written without saying who may
 * call it), and `tests/authz/route-guards.test.ts` fails when an admin route is
 * neither guarded nor on the explicit public list.
 *
 * Order of checks: cross-site request (unsafe methods) -> valid session (401) ->
 * role/permission (403) -> your handler. The body is not read before the 403, so
 * an unauthorised caller learns nothing about the request format.
 *
 * The user is re-read from MongoDB on every request, so a disabled account or
 * a changed role applies immediately. Handlers only ever see `PublicUser`
 * (never the password hash). A role is never taken from the request.
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

/* ------------------------------------------------------------ denial audit */

/**
 * Failed authorization is written to the audit log (who, which route, why),
 * but at most DENIED_AUDIT_MAX rows per user per window: a signed-in user with
 * low privileges must not be able to fill the log by hammering a forbidden route.
 * The request is denied either way; a logging problem never changes the answer.
 */
const DENIED_AUDIT_MAX = 20;
const DENIED_AUDIT_WINDOW_MS = 15 * 60 * 1000;

async function recordDenied(request: NextRequest, auth: AuthContext, reason: string): Promise<void> {
    try {
        const budget = await consume(
            `authz-denied:user:${auth.userId.toHexString()}`,
            DENIED_AUDIT_MAX,
            DENIED_AUDIT_WINDOW_MS,
        );
        if (!budget.allowed) return;
        await writeAudit({
            action: "authz.access_denied",
            actorId: auth.userId,
            ip: clientIp(request),
            // route + reason only: never the query string, body, cookies or headers
            meta: { reason, method: request.method, path: request.nextUrl.pathname.slice(0, 120) },
        });
    } catch (err) {
        console.error("[authz] Could not record denied access:", err instanceof Error ? err.message : "unknown");
    }
}

/** Null when `auth` satisfies `requirement`; otherwise the 403 response to return (and the denial is audited). */
async function denyUnless(request: NextRequest, auth: AuthContext, requirement: AccessRequirement) {
    const decision = evaluateAccess(auth.user.role, requirement);
    if (decision.allowed) return null;
    await recordDenied(request, auth, decision.reason);
    return fail(403, "forbidden", "You do not have permission to do this.");
}

/**
 * For checks INSIDE a handler, when the permission depends on the request (for
 * example the target of the request):
 *
 *   const denied = await requirePermission(request, auth, "users:change_role");
 *   if (denied) return denied;
 */
export async function requirePermission(
    request: NextRequest,
    auth: AuthContext,
    permission: Permission,
): Promise<Response | null> {
    return denyUnless(request, auth, { permission });
}

/* -------------------------------------------------------------- middleware */

/** A route handler wrapped by `withAuth`, carrying the requirement it enforces (`authz`) for tests and tooling. */
export type GuardedRoute<Ctx> = ((request: NextRequest, ctx: Ctx) => Promise<Response>) & {
    readonly authz: AccessRequirement;
};

export function withAuth<Ctx = unknown>(
    handler: (request: NextRequest, auth: AuthContext, ctx: Ctx) => Promise<Response> | Response,
    requirement: AccessRequirement,
): GuardedRoute<Ctx> {
    const guarded = async (request: NextRequest, ctx: Ctx): Promise<Response> => {
        try {
            if (isUnsafeMethod(request.method) && !isSameOrigin(request)) {
                return fail(403, "bad_origin", "Cross-site request blocked.");
            }
            const auth = await authenticate(request);
            if (!auth) return fail(401, "unauthenticated", "Authentication required.");

            const denied = await denyUnless(request, auth, requirement);
            if (denied) return denied;

            return await handler(request, auth, ctx);
        } catch (err) {
            return handleError(err);
        }
    };
    return Object.assign(guarded, { authz: Object.freeze({ ...requirement }) as AccessRequirement });
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
