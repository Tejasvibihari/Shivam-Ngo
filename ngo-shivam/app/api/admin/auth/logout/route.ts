import type { NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/auth/audit";
import { clientIp, fail, handleError, isSameOrigin, json } from "@/lib/admin/auth/request";
import { clearSessionCookie, destroySession, readSessionToken, resolveSession } from "@/lib/admin/auth/session";

/**
 * POST /api/admin/auth/logout
 * Deletes the server-side session and clears the cookie. Idempotent: calling it
 * without a (valid) session still succeeds and clears the cookie.
 */
export async function POST(request: NextRequest) {
    try {
        if (!isSameOrigin(request)) return fail(403, "bad_origin", "Cross-site request blocked.");

        const token = readSessionToken(request);
        const active = await resolveSession(token);
        await destroySession(token);
        if (active) {
            await writeAudit({
                action: "auth.logout",
                actorId: active.user._id,
                targetId: active.user._id,
                ip: clientIp(request),
            });
        }

        const response = json({ ok: true as const });
        clearSessionCookie(response);
        return response;
    } catch (err) {
        return handleError(err);
    }
}
