import type { NextRequest } from "next/server";
import { LOGIN_MAX_PER_EMAIL, LOGIN_MAX_PER_IP, LOGIN_WINDOW_MS } from "@/lib/admin/auth/config";
import { writeAudit } from "@/lib/admin/auth/audit";
import { needsRehash, hashPassword, verifyAgainstDummy, verifyPassword } from "@/lib/admin/auth/password";
import { consume, loginEmailKey, loginIpKey, resetLimit, type RateLimitResult } from "@/lib/admin/auth/rate-limit";
import { clientIp, fail, handleError, isSameOrigin, json, readJson } from "@/lib/admin/auth/request";
import { createSession, setSessionCookie } from "@/lib/admin/auth/session";
import { loginSchema } from "@/lib/admin/auth/validation";
import { usersCollection } from "@/lib/admin/db/client";
import { toPublicUser } from "@/lib/admin/db/models";

/**
 * POST /api/admin/auth/login   { "email": "...", "password": "..." }
 * Public. Sets an HttpOnly session cookie on success.
 */

const INVALID = () => fail(401, "invalid_credentials", "Invalid email or password.");

function tooMany(result: RateLimitResult) {
    return fail(429, "rate_limited", "Too many login attempts. Please try again later.", {
        headers: { "Retry-After": String(result.retryAfterSeconds) },
    });
}

export async function POST(request: NextRequest) {
    try {
        if (!isSameOrigin(request)) return fail(403, "bad_origin", "Cross-site request blocked.");

        const body = await readJson(request);
        if (!body.ok) return body.response;

        const parsed = loginSchema.safeParse(body.data);
        if (!parsed.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of parsed.error.issues) {
                const field = String(issue.path[0] ?? "body");
                fieldErrors[field] ??= issue.message;
            }
            return fail(400, "validation_error", "Please check the highlighted fields.", { fieldErrors });
        }
        const { email, password } = parsed.data;

        // Throttle BEFORE touching passwords. Per-IP stops one machine trying many accounts;
        // per-e-mail stops many machines (or spoofed IPs) trying one account.
        const ip = clientIp(request);
        if (ip) {
            const byIp = await consume(loginIpKey(ip), LOGIN_MAX_PER_IP, LOGIN_WINDOW_MS);
            if (!byIp.allowed) return tooMany(byIp);
        }
        const emailKey = loginEmailKey(email);
        const byEmail = await consume(emailKey, LOGIN_MAX_PER_EMAIL, LOGIN_WINDOW_MS);
        if (!byEmail.allowed) return tooMany(byEmail);

        const users = await usersCollection();
        const user = await users.findOne({ email });

        // Same work whether or not the account exists, and one generic message for
        // "no such user", "wrong password" and "disabled account".
        let passwordOk = false;
        if (user) passwordOk = await verifyPassword(password, user.passwordHash);
        else await verifyAgainstDummy(password);

        if (!user || !passwordOk || user.status !== "active") {
            await writeAudit({
                action: "auth.login_failed",
                targetId: user?._id ?? null,
                ip,
                meta: { reason: !user ? "unknown_user" : !passwordOk ? "bad_password" : "disabled" },
            });
            return INVALID();
        }

        // Success: the e-mail counter is cleared so a legitimate user is never locked out by their own typos.
        await resetLimit(emailKey);

        const now = new Date();
        const update: { lastLoginAt: Date; updatedAt: Date; passwordHash?: string } = {
            lastLoginAt: now,
            updatedAt: now,
        };
        if (needsRehash(user.passwordHash)) update.passwordHash = await hashPassword(password);
        await users.updateOne({ _id: user._id }, { $set: update });

        const session = await createSession(user._id, {
            ip,
            userAgent: request.headers.get("user-agent"),
        });
        await writeAudit({ action: "auth.login_success", actorId: user._id, targetId: user._id, ip });

        const response = json({ ok: true as const, user: toPublicUser({ ...user, lastLoginAt: now }) });
        setSessionCookie(response, session);
        return response;
    } catch (err) {
        return handleError(err);
    }
}
