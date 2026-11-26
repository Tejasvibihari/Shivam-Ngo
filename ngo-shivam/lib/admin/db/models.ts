import type { ObjectId } from "mongodb";
import { z } from "zod";

/**
 * Database models for the admin panel: TypeScript document types, Zod input
 * schemas (application-level validation) and the collection names.
 * The matching MongoDB-level validators and indexes live in `schema.ts`.
 *
 * No `server-only` here on purpose: the role list and input schemas are safe
 * to reuse in client-side forms. Never put secrets or hashes in this file.
 */

export const COLLECTIONS = {
    users: "users",
    settings: "settings",
    rateLimits: "rate_limits",
    auditLogs: "audit_logs",
    sessions: "sessions",
} as const;

/* ------------------------------------------------------------------ roles */

/** Highest privilege first. Add new roles at the end of the right level. */
export const ROLES = ["super_admin", "admin", "editor"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["active", "disabled"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

const ROLE_RANK: Record<Role, number> = { super_admin: 3, admin: 2, editor: 1 };

/** True when `role` is at least as powerful as `minimum`. */
export function hasRole(role: Role, minimum: Role): boolean {
    return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/* ------------------------------------------------------------- field rules */

export const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Email is too long.")
    .regex(/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/, "Please enter a valid email address.");

export const nameSchema = z
    .string()
    .trim()
    .min(2, "Name is too short.")
    .max(100, "Name is too long.");

/** Signup / signup-PIN format. Digits only, 6 to 12 long (hashed before storage). */
export const pinSchema = z.string().regex(/^\d{6,12}$/, "PIN must be 6 to 12 digits.");

export const roleSchema = z.enum(ROLES);
export const userStatusSchema = z.enum(USER_STATUSES);

/**
 * What a caller must supply to create a user; the password hash is added server-side.
 *
 * SHAPE ONLY. `role` here is untrusted input: a route that uses this schema must
 * also call `authorizeUserCreate(actor.role, input.role)` (lib/admin/auth/permissions.ts),
 * otherwise an Admin could create a Super Admin by sending `"role": "super_admin"`.
 */
export const newUserInputSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    role: roleSchema,
});
export type NewUserInput = z.infer<typeof newUserInputSchema>;

/* ---------------------------------------------------------------- users */

export interface UserDoc {
    _id: ObjectId;
    name: string;
    /** Lower-case, unique. */
    email: string;
    /** scrypt hash string. Never returned by any API. */
    passwordHash: string;
    role: Role;
    status: UserStatus;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

/** Shape that is safe to send to the browser. */
export type PublicUser = Pick<UserDoc, "name" | "email" | "role" | "status" | "lastLoginAt" | "createdAt"> & {
    id: string;
};

export function toPublicUser(user: UserDoc): PublicUser {
    return {
        id: user._id.toHexString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
    };
}

/* ------------------------------------------------------------- settings */

/** One document per setting, keyed by a fixed string `_id`. */
export const SETTING_IDS = {
    signupPin: "signupPin",
    setup: "setup",
} as const;

/** Hash of the signup PIN. The PIN itself is never stored. */
export interface SignupPinSettingDoc {
    _id: typeof SETTING_IDS.signupPin;
    hash: string;
    updatedAt: Date;
    /** null when seeded from the environment. */
    updatedBy: ObjectId | null;
}

/**
 * Written exactly once when the first Super Admin is created. Its fixed `_id`
 * makes the insert atomic: a second concurrent setup hits a duplicate-key error.
 */
export interface SetupSettingDoc {
    _id: typeof SETTING_IDS.setup;
    completedAt: Date;
    superAdminId: ObjectId;
}

export type SettingDoc = SignupPinSettingDoc | SetupSettingDoc;

/* ---------------------------------------------------------- rate limits */

/** Brute-force counters. MongoDB deletes expired documents automatically (TTL index). */
export interface RateLimitDoc {
    /** e.g. "login:ip:203.0.113.7" or "pin:ip:203.0.113.7" */
    _id: string;
    count: number;
    windowStart: Date;
    expiresAt: Date;
}

/* ------------------------------------------------------------- sessions */

/**
 * Server-side login session. The browser only holds a random token; the
 * `_id` here is an HMAC of that token, so a database leak cannot be replayed
 * as cookies. MongoDB deletes the document once `expiresAt` has passed.
 */
export interface SessionDoc {
    _id: string;
    userId: ObjectId;
    createdAt: Date;
    lastSeenAt: Date;
    /** Absolute expiry (TTL index). */
    expiresAt: Date;
    ip: string | null;
    userAgent: string | null;
}

/* ----------------------------------------------------------- audit logs */

export const AUDIT_ACTIONS = [
    "setup.super_admin_created",
    "auth.login_success",
    "auth.login_failed",
    "auth.logout",
    "auth.signup",
    "auth.signup_failed",
    "authz.access_denied",
    "settings.signup_pin_changed",
    "settings.signup_pin_change_failed",
    "user.role_changed",
    "user.status_changed",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLogDoc {
    _id: ObjectId;
    action: AuditAction;
    actorId: ObjectId | null;
    targetId: ObjectId | null;
    ip: string | null;
    /** Small, non-sensitive context. Never store passwords, PINs or hashes. */
    meta: Record<string, string | number | boolean>;
    createdAt: Date;
}
