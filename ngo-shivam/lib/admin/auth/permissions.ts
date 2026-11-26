import { ROLES, hasRole, type Role } from "@/lib/admin/db/models";

/**
 * Role-based access control (RBAC) for the admin panel: the permission list, the
 * role -> permission matrix, and the rules for who may hand out which role.
 *
 * This file is the single source of truth. It is deliberately pure (no
 * `server-only`, no database, no cookies), so it is easy to unit-test and a later
 * UI can import it to hide buttons. Hiding a button is only a convenience: every
 * API route re-checks on the server (see `withAuth` in guard.ts).
 *
 * Rules the rest of the code relies on:
 *  - A role comes ONLY from the database; it is re-read on every request
 *    (session.ts). Nothing in a request body, header or cookie can name a role
 *    or a permission.
 *  - Everything fails closed: an unknown role, an unknown permission or an empty
 *    requirement is a denial, never an "allow".
 *
 * Documentation and the printed matrix: docs/authorization.md.
 */

/* -------------------------------------------------------------- permissions */

/** `resource:action`. Add new permissions here AND to PERMISSION_GRANTS (the compiler enforces it). */
export const PERMISSIONS = [
    // can use the admin API at all (every role has it; a user with no valid role does not)
    "admin:access",
    // website content (news, activities, gallery, team ...)
    "content:read",
    "content:create",
    "content:update",
    "content:publish",
    "content:delete",
    // uploaded files
    "media:read",
    "media:upload",
    "media:delete",
    // website form submissions (personal data)
    "submissions:read",
    "submissions:delete",
    // admin accounts
    "users:read",
    "users:create",
    "users:update",
    "users:disable",
    "users:change_role",
    // security audit log
    "audit:read",
    // site settings; "sensitive" ones (signup PIN ...) are Super Admin only
    "settings:read",
    "settings:update",
    "settings:update_sensitive",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Frozen, so no other code can add a role to a grant at run time. */
const roles = (...list: Role[]): readonly Role[] => Object.freeze(list);

const EVERYONE = roles("super_admin", "admin", "editor");
const ADMINS = roles("super_admin", "admin");
const SUPER_ADMIN_ONLY = roles("super_admin");

/**
 * THE MATRIX. Which roles hold each permission. Read it as a table: a role has a
 * permission only if it is listed. Grants are explicit (not inherited), so a new
 * permission is denied to everyone until someone adds it here on purpose.
 */
export const PERMISSION_GRANTS = Object.freeze({
    "admin:access": EVERYONE,

    "content:read": EVERYONE,
    "content:create": EVERYONE,
    "content:update": EVERYONE,
    "content:publish": ADMINS,
    "content:delete": ADMINS,

    "media:read": EVERYONE,
    "media:upload": EVERYONE,
    "media:delete": ADMINS,

    "submissions:read": EVERYONE,
    "submissions:delete": ADMINS,

    "users:read": ADMINS,
    "users:create": ADMINS, // an Admin can only create Editors, see ASSIGNABLE_ROLES
    "users:update": ADMINS,
    "users:disable": ADMINS,
    "users:change_role": SUPER_ADMIN_ONLY,

    "audit:read": SUPER_ADMIN_ONLY,

    "settings:read": ADMINS,
    "settings:update": ADMINS,
    "settings:update_sensitive": SUPER_ADMIN_ONLY,
} satisfies Record<Permission, readonly Role[]>);

/* ------------------------------------------------------------ type guards */

export function isRole(value: unknown): value is Role {
    return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isPermission(value: unknown): value is Permission {
    return typeof value === "string" && (PERMISSIONS as readonly string[]).includes(value);
}

/* ---------------------------------------------------------------- lookups */

/** True when `role` holds `permission`. Unknown roles and unknown permissions are denied. */
export function roleHasPermission(role: unknown, permission: unknown): boolean {
    if (!isRole(role) || !isPermission(permission)) return false;
    return PERMISSION_GRANTS[permission].includes(role);
}

/** Every permission a role holds (empty for an unknown role). Safe to send to the browser. */
export function permissionsForRole(role: unknown): Permission[] {
    if (!isRole(role)) return [];
    return PERMISSIONS.filter((p) => PERMISSION_GRANTS[p].includes(role));
}

/* ------------------------------------------------------- access decisions */

type PermissionSpec = Permission | readonly [Permission, ...Permission[]];

/**
 * What a route demands. At least one of the two is required (enforced by the
 * type AND at run time). When both are given, both must pass. A list of
 * permissions means ALL of them.
 *
 * Prefer `permission`: it names the thing being protected. `minRole` is a plain
 * "at least this rank" check kept for simple cases.
 */
export type AccessRequirement =
    | { minRole: Role; permission?: PermissionSpec }
    | { minRole?: Role; permission: PermissionSpec };

export type AccessDecision = { allowed: true } | { allowed: false; reason: string };

const ALLOW: AccessDecision = { allowed: true };
const deny = (reason: string): AccessDecision => ({ allowed: false, reason: reason.slice(0, 80) });

/**
 * Decide whether `role` satisfies `requirement`. `reason` is for logs and the
 * audit trail only and is never sent to the client.
 */
export function evaluateAccess(role: unknown, requirement: AccessRequirement): AccessDecision {
    if (!isRole(role)) return deny("invalid_role");

    const { minRole, permission } = requirement;
    const needed: readonly unknown[] =
        permission === undefined ? [] : typeof permission === "string" ? [permission] : permission;

    // A route that demands nothing is a programming mistake: refuse rather than allow everyone.
    if (minRole === undefined && needed.length === 0) return deny("no_requirement");

    if (minRole !== undefined && !(isRole(minRole) && hasRole(role, minRole))) {
        return deny(`min_role:${String(minRole)}`);
    }
    for (const p of needed) {
        if (!roleHasPermission(role, p)) return deny(`permission:${String(p)}`);
    }
    return ALLOW;
}

/* ------------------------------------------- who may grant / manage which role */

/**
 * For each acting role, the roles it may give to someone and, by the same
 * token, the roles of the accounts it may manage (edit, disable, ...).
 * Nobody can grant or touch a role above their own, and an Admin cannot touch
 * other Admins: that is what stops privilege escalation through a request body.
 */
export const ASSIGNABLE_ROLES = Object.freeze({
    super_admin: roles("super_admin", "admin", "editor"),
    admin: roles("editor"),
    editor: roles(),
} satisfies Record<Role, readonly Role[]>);

/** May `actorRole` give `targetRole` to a user? Unknown roles are denied. */
export function canAssignRole(actorRole: unknown, targetRole: unknown): boolean {
    if (!isRole(actorRole) || !isRole(targetRole)) return false;
    return ASSIGNABLE_ROLES[actorRole].includes(targetRole);
}

/** May `actorRole` manage an account that currently has `targetRole`? */
export function canManageRole(actorRole: unknown, targetRole: unknown): boolean {
    return canAssignRole(actorRole, targetRole);
}

export type UserChange = {
    actor: { id: string; role: unknown };
    target: { id: string; role: unknown };
    /** Set ONLY when the request asks to change the role / status. */
    newRole?: unknown;
    newStatus?: unknown;
};

export type UserChangeDecision =
    | { allowed: true }
    | { allowed: false; code: "forbidden" | "self_change" | "target_not_manageable" | "role_not_assignable" };

/**
 * The one gate for any request that creates or changes another account's role
 * or status. Call it with values read from the DATABASE (actor, target) and the
 * parsed request (newRole, newStatus). It checks, in order:
 *   1. the actor holds the permission for what is being asked;
 *   2. nobody changes their OWN role or status (no self-promotion, no self-lockout);
 *   3. the actor may manage the target's CURRENT role;
 *   4. the actor may grant the NEW role.
 *
 * It cannot see the database, so the caller must still keep at least one active
 * Super Admin (refuse to demote / disable the last one).
 */
export function authorizeUserChange(change: UserChange): UserChangeDecision {
    const { actor, target, newRole, newStatus } = change;

    const needs: Permission[] = [];
    if (newRole !== undefined) needs.push("users:change_role");
    if (newStatus !== undefined) needs.push("users:disable");
    if (needs.length === 0) needs.push("users:update");
    if (!needs.every((p) => roleHasPermission(actor.role, p))) return { allowed: false, code: "forbidden" };

    if (actor.id === target.id && (newRole !== undefined || newStatus !== undefined)) {
        return { allowed: false, code: "self_change" };
    }
    if (!canManageRole(actor.role, target.role)) return { allowed: false, code: "target_not_manageable" };
    if (newRole !== undefined && !canAssignRole(actor.role, newRole)) {
        return { allowed: false, code: "role_not_assignable" };
    }
    return { allowed: true };
}

/**
 * Creating a brand-new user (admin-created accounts): the actor needs
 * `users:create` and may only give a role it is allowed to assign.
 */
export function authorizeUserCreate(actorRole: unknown, newRole: unknown): boolean {
    return roleHasPermission(actorRole, "users:create") && canAssignRole(actorRole, newRole);
}

/* --------------------------------------------------- public self-registration */

/** Roles that anonymous signup may ever produce. Never `super_admin`, never `admin`. */
export const SELF_REGISTRATION_ROLES = roles("editor");

/**
 * Last line of defence for the public signup route: throws unless `role` is a
 * self-registration role, so a wrong constant (or a future bug) can never
 * create a privileged account from an unauthenticated request.
 */
export function assertSelfRegistrationRole(role: unknown): Role {
    if (!isRole(role) || !SELF_REGISTRATION_ROLES.includes(role)) {
        throw new Error("Role is not allowed for self-registration.");
    }
    return role;
}
