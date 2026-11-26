import { z } from "zod";
import { emailSchema, nameSchema, pinSchema } from "@/lib/admin/db/models";

/**
 * Input rules for authentication. No `server-only`, so forms can reuse them.
 * `.strict()` rejects unknown keys, which also means a caller cannot smuggle a
 * `role` or `status` field into an authentication request.
 */

export const PASSWORD_MIN = 12;
/** Upper bound protects the server from huge inputs going into scrypt. */
export const PASSWORD_MAX = 128;

/** Rules for NEW passwords (signup, password change; later tasks). */
export const newPasswordSchema = z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters.`)
    .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters.`)
    .refine((v) => v.trim().length > 0, "Password cannot be only spaces.");

/**
 * Login only checks shape: existing accounts must always be able to log in, and
 * the message must not reveal the password policy.
 */
export const loginSchema = z.strictObject({
    email: emailSchema,
    password: z.string().min(1, "Password is required.").max(PASSWORD_MAX, "Invalid email or password."),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Signup. Strict on purpose: there is no `role` or `status` field, so a caller
 * cannot choose their own privileges (an extra key is a 400, not ignored).
 */
export const signupSchema = z.strictObject({
    name: nameSchema,
    email: emailSchema,
    password: newPasswordSchema,
    pin: pinSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

/**
 * PUT /api/admin/settings/signup-pin. `currentPin` is optional in the schema
 * only because the very first PIN has nothing to compare against; the route
 * requires it whenever a PIN is already configured.
 */
export const changeSignupPinSchema = z
    .strictObject({
        currentPin: pinSchema.optional(),
        newPin: pinSchema,
    })
    .refine((v) => v.currentPin === undefined || v.currentPin !== v.newPin, {
        path: ["newPin"],
        message: "New PIN must be different from the current PIN.",
    });
export type ChangeSignupPinInput = z.infer<typeof changeSignupPinSchema>;

/** PATCH /api/admin/auth/profile. Strict: only the display name can be changed here (never role/status/email). */
export const updateProfileSchema = z.strictObject({ name: nameSchema });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** PUT /api/admin/auth/password. */
export const changePasswordSchema = z
    .strictObject({
        currentPassword: z.string().min(1, "Current password is required.").max(PASSWORD_MAX, "Current password is not correct."),
        newPassword: newPasswordSchema,
    })
    .refine((v) => v.currentPassword !== v.newPassword, {
        path: ["newPassword"],
        message: "New password must be different from the current password.",
    });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
