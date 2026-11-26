import { writeAudit } from "@/lib/admin/auth/audit";
import { PIN_CHANGE_MAX_PER_USER, PIN_CHANGE_WINDOW_MS } from "@/lib/admin/auth/config";
import { withAuth } from "@/lib/admin/auth/guard";
import { consume, pinChangeUserKey, resetLimit } from "@/lib/admin/auth/rate-limit";
import { clientIp, fail, json, readJson, validationFail } from "@/lib/admin/auth/request";
import { getSignupPinHash, saveSignupPin, verifyPin } from "@/lib/admin/auth/signup-pin";
import { changeSignupPinSchema } from "@/lib/admin/auth/validation";

/**
 * PUT /api/admin/settings/signup-pin   { "currentPin": "123456", "newPin": "654321" }
 *
 * Super Admin only (permission `settings:update_sensitive`): `withAuth` returns 401
 * without a valid session and 403 for any other role, before this handler runs or
 * reads the body. The PIN is stored only as a hash and the response never contains
 * the PIN or the hash.
 *
 * When no PIN is configured yet (no SIGNUP_PIN_INITIAL), `currentPin` is not needed
 * and this call sets the first PIN.
 */
export const PUT = withAuth(
    async (request, auth) => {
        const body = await readJson(request);
        if (!body.ok) return body.response;

        const parsed = changeSignupPinSchema.safeParse(body.data);
        if (!parsed.success) return validationFail(parsed.error);
        const { currentPin, newPin } = parsed.data;

        const ip = clientIp(request);
        const limitKey = pinChangeUserKey(auth.userId.toHexString());
        const limit = await consume(limitKey, PIN_CHANGE_MAX_PER_USER, PIN_CHANGE_WINDOW_MS);
        if (!limit.allowed) {
            return fail(429, "rate_limited", "Too many attempts. Please try again later.", {
                headers: { "Retry-After": String(limit.retryAfterSeconds) },
            });
        }

        const storedHash = await getSignupPinHash();
        if (storedHash) {
            if (!currentPin) {
                return fail(400, "validation_error", "Please check the highlighted fields.", {
                    fieldErrors: { currentPin: "Current PIN is required." },
                });
            }
            if (!(await verifyPin(currentPin, storedHash))) {
                await writeAudit({
                    action: "settings.signup_pin_change_failed",
                    actorId: auth.userId,
                    ip,
                    meta: { reason: "bad_current_pin" },
                });
                return fail(403, "invalid_current_pin", "The current PIN is not correct.", {
                    fieldErrors: { currentPin: "The current PIN is not correct." },
                });
            }
        }

        const saved = await saveSignupPin(newPin, auth.userId, storedHash);
        if (!saved) {
            return fail(409, "conflict", "The signup PIN was changed by someone else. Please try again.");
        }

        await resetLimit(limitKey);
        await writeAudit({
            action: "settings.signup_pin_changed",
            actorId: auth.userId,
            ip,
            meta: { firstPin: storedHash === null },
        });
        return json({ ok: true as const, message: "Signup PIN updated.", updatedAt: new Date() });
    },
    { permission: "settings:update_sensitive" },
);
