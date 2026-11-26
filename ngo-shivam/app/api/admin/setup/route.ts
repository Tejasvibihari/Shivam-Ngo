import type { NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/auth/audit";
import { SETUP_MAX_GLOBAL, SETUP_MAX_PER_IP, SETUP_WINDOW_MS } from "@/lib/admin/auth/config";
import { consume, SETUP_GLOBAL_KEY, setupIpKey, type RateLimitResult } from "@/lib/admin/auth/rate-limit";
import { clientIp, fail, handleError, isSameOrigin, json, readJson, validationFail } from "@/lib/admin/auth/request";
import { createFirstSuperAdmin, isSetupOpen, verifySetupToken } from "@/lib/admin/auth/setup";
import { setupSchema } from "@/lib/admin/auth/validation";
import { toPublicUser } from "@/lib/admin/db/models";

/**
 * One-time setup of the FIRST Super Admin. Public route (listed in proxy.ts), protected by
 * the SETUP_TOKEN secret instead of a session, and closed for good once it has been used.
 *
 *   GET  /api/admin/setup   -> { ok: true, available: boolean }
 *   POST /api/admin/setup   { setupToken, name, email, password }
 *
 * - The role is fixed to super_admin by the server; the strict schema has no role field.
 * - The token is checked (constant time) BEFORE anything is created or any e-mail is looked up.
 * - Attempts are rate limited per IP (needs TRUST_PROXY) and globally.
 * - A closed setup answers 403 setup_unavailable and reveals nothing else.
 */

const CLOSED = () => fail(403, "setup_unavailable", "Setup is not available.");

function tooMany(result: RateLimitResult) {
    return fail(429, "rate_limited", "Too many setup attempts. Please try again later.", {
        headers: { "Retry-After": String(result.retryAfterSeconds) },
    });
}

export async function GET(request: NextRequest) {
    try {
        void request.headers; // keeps the handler dynamic
        return json({ ok: true as const, available: await isSetupOpen() });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!isSameOrigin(request)) return fail(403, "bad_origin", "Cross-site request blocked.");
        if (!(await isSetupOpen())) return CLOSED();

        const body = await readJson(request);
        if (!body.ok) return body.response;
        const parsed = setupSchema.safeParse(body.data);
        if (!parsed.success) return validationFail(parsed.error);
        const { setupToken, name, email, password } = parsed.data;

        const ip = clientIp(request);
        if (ip) {
            const byIp = await consume(setupIpKey(ip), SETUP_MAX_PER_IP, SETUP_WINDOW_MS);
            if (!byIp.allowed) return tooMany(byIp);
        }
        const overall = await consume(SETUP_GLOBAL_KEY, SETUP_MAX_GLOBAL, SETUP_WINDOW_MS);
        if (!overall.allowed) return tooMany(overall);

        if (!verifySetupToken(setupToken)) {
            await writeAudit({ action: "setup.failed", ip, meta: { reason: "bad_token" } });
            return fail(403, "invalid_setup_token", "The setup token is not correct.", {
                fieldErrors: { setupToken: "The setup token is not correct." },
            });
        }

        const result = await createFirstSuperAdmin({ name, email, password });
        if (!result.ok) {
            if (result.reason === "email_taken") {
                await writeAudit({ action: "setup.failed", ip, meta: { reason: "email_taken" } });
                return fail(409, "email_taken", "An account with this email already exists.", {
                    fieldErrors: { email: "An account with this email already exists." },
                });
            }
            return CLOSED();
        }

        await writeAudit({
            action: "setup.super_admin_created",
            actorId: result.user._id,
            targetId: result.user._id,
            ip,
        });
        // No session is created: the new Super Admin signs in through the normal login endpoint.
        return json({ ok: true as const, user: toPublicUser(result.user) }, 201);
    } catch (err) {
        return handleError(err);
    }
}
