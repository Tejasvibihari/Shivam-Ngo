import { PASSWORD_CHANGE_MAX_PER_USER, PASSWORD_CHANGE_WINDOW_MS } from "@/lib/admin/auth/config";
import { writeAudit } from "@/lib/admin/auth/audit";
import { withAuth } from "@/lib/admin/auth/guard";
import { hashPassword, verifyPassword } from "@/lib/admin/auth/password";
import { consume, passwordChangeUserKey, resetLimit } from "@/lib/admin/auth/rate-limit";
import { clientIp, fail, json, readJson, validationFail } from "@/lib/admin/auth/request";
import { createSession, destroyAllUserSessions, setSessionCookie } from "@/lib/admin/auth/session";
import { changePasswordSchema } from "@/lib/admin/auth/validation";
import { usersCollection } from "@/lib/admin/db/client";

/**
 * PUT /api/admin/auth/password   { "currentPassword": "...", "newPassword": "..." }
 * Changes the signed-in user's own password. Needs the current password (rate limited), then
 * ends EVERY session of the account (including other devices) and starts a fresh one for this browser.
 */
export const PUT = withAuth(
    async (request, auth) => {
        const body = await readJson(request);
        if (!body.ok) return body.response;
        const parsed = changePasswordSchema.safeParse(body.data);
        if (!parsed.success) return validationFail(parsed.error);
        const { currentPassword, newPassword } = parsed.data;

        const ip = clientIp(request);
        const limitKey = passwordChangeUserKey(auth.userId.toHexString());
        const limit = await consume(limitKey, PASSWORD_CHANGE_MAX_PER_USER, PASSWORD_CHANGE_WINDOW_MS);
        if (!limit.allowed) {
            return fail(429, "rate_limited", "Too many attempts. Please try again later.", {
                headers: { "Retry-After": String(limit.retryAfterSeconds) },
            });
        }

        const users = await usersCollection();
        const user = await users.findOne({ _id: auth.userId });
        if (!user) return fail(404, "not_found", "Account not found.");

        if (!(await verifyPassword(currentPassword, user.passwordHash))) {
            await writeAudit({ action: "auth.password_change_failed", actorId: auth.userId, ip, meta: { reason: "bad_current_password" } });
            return fail(403, "invalid_current_password", "The current password is not correct.", {
                fieldErrors: { currentPassword: "The current password is not correct." },
            });
        }

        await users.updateOne({ _id: auth.userId }, { $set: { passwordHash: await hashPassword(newPassword), updatedAt: new Date() } });
        await destroyAllUserSessions(auth.userId);
        const session = await createSession(auth.userId, { ip, userAgent: request.headers.get("user-agent") });
        await resetLimit(limitKey);
        await writeAudit({ action: "auth.password_changed", actorId: auth.userId, targetId: auth.userId, ip });

        const response = json({ ok: true as const, message: "Password updated." });
        setSessionCookie(response, session);
        return response;
    },
    { permission: "admin:access" },
);
