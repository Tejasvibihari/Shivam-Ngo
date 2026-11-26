import { ObjectId } from "mongodb";
import type { NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/auth/audit";
import {
    SIGNUP_DEFAULT_ROLE,
    SIGNUP_GLOBAL_WINDOW_MS,
    SIGNUP_MAX_GLOBAL,
    SIGNUP_MAX_PER_IP,
    SIGNUP_WINDOW_MS,
} from "@/lib/admin/auth/config";
import { hashPassword } from "@/lib/admin/auth/password";
import { assertSelfRegistrationRole } from "@/lib/admin/auth/permissions";
import { consume, SIGNUP_GLOBAL_KEY, signupIpKey, type RateLimitResult } from "@/lib/admin/auth/rate-limit";
import { clientIp, fail, handleError, isSameOrigin, json, readJson, validationFail } from "@/lib/admin/auth/request";
import { getSignupPinHash, isSignupOpen, verifyPin } from "@/lib/admin/auth/signup-pin";
import { signupSchema } from "@/lib/admin/auth/validation";
import { usersCollection } from "@/lib/admin/db/client";
import { isDuplicateKeyError } from "@/lib/admin/db/errors";
import { toPublicUser, type UserDoc } from "@/lib/admin/db/models";

/**
 * Public routes (listed in proxy.ts), protected by the signup PIN instead of a session.
 *
 *   GET  /api/admin/auth/signup   -> { ok: true, enabled: boolean }
 *   POST /api/admin/auth/signup   { name, email, password, pin }
 *
 * What stops unauthorised account creation:
 *  1. signup is closed unless a PIN is configured and a Super Admin exists
 *     (and SIGNUP_ENABLED is not "false");
 *  2. the PIN is checked against its scrypt hash BEFORE anything else is looked
 *     up or written, so no e-mail address is ever confirmed to someone without it;
 *  3. attempts are rate limited per IP and globally (see config.ts);
 *  4. the role is fixed server-side to SIGNUP_DEFAULT_ROLE, the strict input
 *     schema rejects a `role` / `status` field, and assertSelfRegistrationRole()
 *     refuses (500, nothing is created) any role that anonymous signup may not give;
 *  5. cross-site requests are rejected (Origin check).
 */

const CLOSED = () => fail(403, "signup_disabled", "Signup is currently disabled.");

function tooMany(result: RateLimitResult) {
    return fail(429, "rate_limited", "Too many signup attempts. Please try again later.", {
        headers: { "Retry-After": String(result.retryAfterSeconds) },
    });
}

/** Lets the signup form show "signup is closed" instead of a form that cannot work. Reveals no secret. */
export async function GET(request: NextRequest) {
    try {
        // Reading the request keeps this handler dynamic (it is never prerendered at build time).
        void request.headers;
        return json({ ok: true as const, enabled: await isSignupOpen() });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!isSameOrigin(request)) return fail(403, "bad_origin", "Cross-site request blocked.");
        if (!(await isSignupOpen())) return CLOSED();

        const body = await readJson(request);
        if (!body.ok) return body.response;

        const parsed = signupSchema.safeParse(body.data);
        if (!parsed.success) return validationFail(parsed.error);
        const { name, email, password, pin } = parsed.data;

        // Throttle BEFORE the (slow) PIN check. Every attempt counts, successful or not.
        const ip = clientIp(request);
        if (ip) {
            const byIp = await consume(signupIpKey(ip), SIGNUP_MAX_PER_IP, SIGNUP_WINDOW_MS);
            if (!byIp.allowed) return tooMany(byIp);
        }
        const overall = await consume(SIGNUP_GLOBAL_KEY, SIGNUP_MAX_GLOBAL, SIGNUP_GLOBAL_WINDOW_MS);
        if (!overall.allowed) return tooMany(overall);

        const pinHash = await getSignupPinHash();
        if (!pinHash) return CLOSED(); // the PIN was removed since the check above
        if (!(await verifyPin(pin, pinHash))) {
            await writeAudit({ action: "auth.signup_failed", ip, meta: { reason: "bad_pin" } });
            return fail(403, "invalid_pin", "The signup PIN is not correct.", {
                fieldErrors: { pin: "The signup PIN is not correct." },
            });
        }

        // The caller is now authorised to create an account (and only an `editor` one).
        const now = new Date();
        const user: UserDoc = {
            _id: new ObjectId(),
            name,
            email,
            passwordHash: await hashPassword(password),
            role: assertSelfRegistrationRole(SIGNUP_DEFAULT_ROLE),
            status: "active",
            lastLoginAt: null,
            createdAt: now,
            updatedAt: now,
        };
        try {
            await (await usersCollection()).insertOne(user);
        } catch (err) {
            if (isDuplicateKeyError(err, "email")) {
                await writeAudit({ action: "auth.signup_failed", ip, meta: { reason: "email_taken" } });
                return fail(409, "email_taken", "An account with this email already exists.", {
                    fieldErrors: { email: "An account with this email already exists." },
                });
            }
            throw err;
        }

        await writeAudit({
            action: "auth.signup",
            actorId: user._id,
            targetId: user._id,
            ip,
            meta: { role: user.role },
        });
        // No session is created: the new user signs in through the normal login endpoint.
        return json({ ok: true as const, user: toPublicUser(user) }, 201);
    } catch (err) {
        return handleError(err);
    }
}
