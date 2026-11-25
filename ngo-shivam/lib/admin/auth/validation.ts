import { z } from "zod";
import { emailSchema } from "@/lib/admin/db/models";

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
