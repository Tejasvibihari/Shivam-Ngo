import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SIGNUP_DEFAULT_ROLE } from "@/lib/admin/auth/config";
import {
    ASSIGNABLE_ROLES,
    PERMISSIONS,
    PERMISSION_GRANTS,
    SELF_REGISTRATION_ROLES,
    assertSelfRegistrationRole,
    authorizeUserChange,
    authorizeUserCreate,
    canAssignRole,
    canManageRole,
    evaluateAccess,
    isPermission,
    isRole,
    permissionsForRole,
    roleHasPermission,
    type AccessRequirement,
    type Permission,
} from "@/lib/admin/auth/permissions";
import { ROLES, type Role } from "@/lib/admin/db/models";

/**
 * Pure tests: no database, no server. The expected matrix below is written out by
 * hand on purpose. If someone changes a grant in permissions.ts by mistake, these
 * lists no longer match and the test fails.
 */

const EDITOR_PERMISSIONS: Permission[] = [
    "admin:access",
    "content:read",
    "content:create",
    "content:update",
    "media:read",
    "media:upload",
    "submissions:read",
];
const ADMIN_PERMISSIONS: Permission[] = [
    ...EDITOR_PERMISSIONS,
    "content:publish",
    "content:delete",
    "media:delete",
    "submissions:delete",
    "users:read",
    "users:create",
    "users:update",
    "users:disable",
    "settings:read",
    "settings:update",
];
const SUPER_ADMIN_ONLY: Permission[] = ["users:change_role", "audit:read", "settings:update_sensitive"];

const sorted = (list: readonly string[]) => [...list].sort();

describe("role / permission matrix", () => {
    it("editor holds exactly the editor permissions", () => {
        assert.deepEqual(sorted(permissionsForRole("editor")), sorted(EDITOR_PERMISSIONS));
    });

    it("admin holds exactly the admin permissions", () => {
        assert.deepEqual(sorted(permissionsForRole("admin")), sorted(ADMIN_PERMISSIONS));
    });

    it("super_admin holds every permission", () => {
        assert.deepEqual(sorted(permissionsForRole("super_admin")), sorted(PERMISSIONS));
        assert.deepEqual(sorted(PERMISSIONS), sorted([...ADMIN_PERMISSIONS, ...SUPER_ADMIN_ONLY]));
    });

    it("sensitive settings (and role changes, audit log) are Super Admin only", () => {
        for (const permission of SUPER_ADMIN_ONLY) {
            assert.deepEqual([...PERMISSION_GRANTS[permission]], ["super_admin"], permission);
            assert.equal(roleHasPermission("admin", permission), false, `admin / ${permission}`);
            assert.equal(roleHasPermission("editor", permission), false, `editor / ${permission}`);
        }
    });

    it("an editor can read submissions but cannot delete them or manage users", () => {
        assert.equal(roleHasPermission("editor", "submissions:read"), true);
        assert.equal(roleHasPermission("admin", "submissions:read"), true);
        assert.equal(roleHasPermission("super_admin", "submissions:read"), true);
        assert.equal(roleHasPermission("editor", "submissions:delete"), false);
        for (const permission of [
            "content:publish",
            "content:delete",
            "media:delete",
            "users:read",
            "users:create",
            "settings:read",
            "settings:update",
        ] as const) {
            assert.equal(roleHasPermission("editor", permission), false, permission);
        }
    });

    it("every grant names only real roles, and every permission has a holder", () => {
        for (const permission of PERMISSIONS) {
            const holders = PERMISSION_GRANTS[permission];
            assert.ok(holders.length > 0, `${permission} is granted to nobody`);
            assert.ok(holders.every((role) => ROLES.includes(role)), `${permission} lists an unknown role`);
        }
    });

    it("the tables are frozen at run time", () => {
        assert.ok(Object.isFrozen(PERMISSION_GRANTS));
        assert.ok(Object.isFrozen(PERMISSION_GRANTS["settings:update_sensitive"]));
        assert.ok(Object.isFrozen(ASSIGNABLE_ROLES));
        assert.ok(Object.isFrozen(ASSIGNABLE_ROLES.admin));
        assert.throws(() => (PERMISSION_GRANTS["settings:update_sensitive"] as Role[]).push("editor"), TypeError);
    });
});

describe("fails closed on unknown input", () => {
    const BAD_ROLES = [undefined, null, "", "root", "SUPER_ADMIN", "superadmin", "__proto__", "constructor", "toString", 1, {}, []];

    it("an unknown role has no permissions", () => {
        for (const role of BAD_ROLES) {
            assert.equal(isRole(role), false, String(role));
            assert.deepEqual(permissionsForRole(role), [], String(role));
            for (const permission of PERMISSIONS) assert.equal(roleHasPermission(role, permission), false);
        }
    });

    it("an unknown permission is never granted", () => {
        for (const permission of [undefined, null, "", "content:everything", "__proto__", "constructor", 7]) {
            assert.equal(isPermission(permission), false);
            for (const role of ROLES) assert.equal(roleHasPermission(role, permission), false);
        }
    });
});

describe("evaluateAccess", () => {
    it("allows when the role holds the permission, denies otherwise", () => {
        assert.deepEqual(evaluateAccess("editor", { permission: "content:update" }), { allowed: true });
        const denied = evaluateAccess("editor", { permission: "settings:update_sensitive" });
        assert.equal(denied.allowed, false);
        assert.equal(denied.allowed === false && denied.reason, "permission:settings:update_sensitive");
    });

    it("minRole follows the hierarchy super_admin > admin > editor", () => {
        assert.equal(evaluateAccess("super_admin", { minRole: "admin" }).allowed, true);
        assert.equal(evaluateAccess("admin", { minRole: "admin" }).allowed, true);
        assert.equal(evaluateAccess("editor", { minRole: "admin" }).allowed, false);
        assert.equal(evaluateAccess("admin", { minRole: "super_admin" }).allowed, false);
    });

    it("several permissions need ALL of them", () => {
        assert.equal(evaluateAccess("admin", { permission: ["content:delete", "media:delete"] }).allowed, true);
        assert.equal(evaluateAccess("admin", { permission: ["content:delete", "audit:read"] }).allowed, false);
        assert.equal(evaluateAccess("editor", { permission: ["content:read", "content:delete"] }).allowed, false);
    });

    it("minRole and permission together need both", () => {
        assert.equal(evaluateAccess("admin", { minRole: "admin", permission: "content:delete" }).allowed, true);
        assert.equal(evaluateAccess("admin", { minRole: "super_admin", permission: "content:delete" }).allowed, false);
        assert.equal(evaluateAccess("editor", { minRole: "editor", permission: "content:delete" }).allowed, false);
    });

    it("denies an invalid or missing role, even for the loosest requirement", () => {
        for (const role of [undefined, null, "root", "__proto__", 3]) {
            assert.equal(evaluateAccess(role, { permission: "admin:access" }).allowed, false, String(role));
            assert.equal(evaluateAccess(role, { minRole: "editor" }).allowed, false, String(role));
        }
    });

    it("denies a route that demands nothing (programming mistake) instead of allowing everyone", () => {
        for (const broken of [{}, { permission: [] }, { permission: undefined }] as unknown as AccessRequirement[]) {
            const decision = evaluateAccess("super_admin", broken);
            assert.equal(decision.allowed, false, JSON.stringify(broken));
        }
    });

    it("denies a requirement that names an unknown permission or role", () => {
        assert.equal(evaluateAccess("super_admin", { permission: "typo:here" } as unknown as AccessRequirement).allowed, false);
        assert.equal(evaluateAccess("super_admin", { minRole: "root" } as unknown as AccessRequirement).allowed, false);
    });
});

describe("who may assign / manage which role", () => {
    const assignable = (actor: Role) => ROLES.filter((target) => canAssignRole(actor, target));

    it("super_admin may assign any role", () => assert.deepEqual(assignable("super_admin"), [...ROLES]));
    it("admin may assign editor only", () => assert.deepEqual(assignable("admin"), ["editor"]));
    it("editor may assign nothing", () => assert.deepEqual(assignable("editor"), []));

    it("unknown actors or targets are refused", () => {
        for (const bad of [undefined, null, "root", "__proto__"]) {
            assert.equal(canAssignRole(bad, "editor"), false);
            assert.equal(canAssignRole("super_admin", bad), false);
            assert.equal(canManageRole(bad, "editor"), false);
        }
    });

    it("an admin cannot manage other admins or super admins", () => {
        assert.equal(canManageRole("admin", "editor"), true);
        assert.equal(canManageRole("admin", "admin"), false);
        assert.equal(canManageRole("admin", "super_admin"), false);
    });

    describe("authorizeUserCreate (admin-created accounts)", () => {
        it("an admin can create editors only", () => {
            assert.equal(authorizeUserCreate("admin", "editor"), true);
            assert.equal(authorizeUserCreate("admin", "admin"), false);
            assert.equal(authorizeUserCreate("admin", "super_admin"), false);
        });
        it("an editor cannot create anyone", () => {
            for (const role of ROLES) assert.equal(authorizeUserCreate("editor", role), false, role);
        });
        it("a super admin can create any role, but not an invalid one", () => {
            for (const role of ROLES) assert.equal(authorizeUserCreate("super_admin", role), true, role);
            assert.equal(authorizeUserCreate("super_admin", "root"), false);
        });
    });
});

describe("authorizeUserChange (privilege-escalation rules)", () => {
    const actor = (role: unknown, id = "a1") => ({ id, role });
    const target = (role: unknown, id = "t1") => ({ id, role });
    const code = (d: ReturnType<typeof authorizeUserChange>) => (d.allowed ? "allowed" : d.code);

    it("an admin can disable an editor but cannot change any role", () => {
        assert.equal(code(authorizeUserChange({ actor: actor("admin"), target: target("editor"), newStatus: "disabled" })), "allowed");
        assert.equal(code(authorizeUserChange({ actor: actor("admin"), target: target("editor"), newRole: "admin" })), "forbidden");
        assert.equal(code(authorizeUserChange({ actor: actor("admin"), target: target("editor"), newRole: "super_admin" })), "forbidden");
    });

    it("an admin cannot touch admins or super admins (no horizontal or upward reach)", () => {
        for (const role of ["admin", "super_admin"]) {
            assert.equal(
                code(authorizeUserChange({ actor: actor("admin"), target: target(role), newStatus: "disabled" })),
                "target_not_manageable",
                role,
            );
        }
    });

    it("an editor can change nothing", () => {
        for (const change of [{ newStatus: "disabled" }, { newRole: "editor" }, {}]) {
            assert.equal(code(authorizeUserChange({ actor: actor("editor"), target: target("editor", "t2"), ...change })), "forbidden");
        }
    });

    it("nobody changes their own role or status (no self-promotion, no self-lockout)", () => {
        const self = (role: Role) => ({ actor: actor(role, "me"), target: target(role, "me") });
        // allowed to disable / re-role OTHER accounts, but never their own
        assert.equal(code(authorizeUserChange({ ...self("admin"), newStatus: "disabled" })), "self_change");
        assert.equal(code(authorizeUserChange({ ...self("super_admin"), newStatus: "disabled" })), "self_change");
        assert.equal(code(authorizeUserChange({ ...self("super_admin"), newRole: "editor" })), "self_change");
        assert.equal(code(authorizeUserChange({ ...self("super_admin"), newRole: "super_admin" })), "self_change");
        // without the permission it is refused earlier, so a promotion attempt never gets further
        assert.equal(code(authorizeUserChange({ ...self("admin"), newRole: "super_admin" })), "forbidden");
        assert.equal(code(authorizeUserChange({ ...self("editor"), newRole: "super_admin" })), "forbidden");
    });

    it("a super admin can promote and demote others, but only to real roles", () => {
        for (const newRole of ROLES) {
            assert.equal(code(authorizeUserChange({ actor: actor("super_admin"), target: target("editor"), newRole })), "allowed", newRole);
        }
        for (const newRole of ["root", "", null, 5, "__proto__"]) {
            assert.equal(code(authorizeUserChange({ actor: actor("super_admin"), target: target("editor"), newRole })), "role_not_assignable", String(newRole));
        }
    });

    it("an unknown actor role is refused", () => {
        for (const bad of [undefined, "root", "__proto__"]) {
            assert.equal(code(authorizeUserChange({ actor: actor(bad), target: target("editor"), newStatus: "disabled" })), "forbidden");
        }
    });

    it("an account with an unknown stored role cannot be managed by an admin", () => {
        assert.equal(code(authorizeUserChange({ actor: actor("admin"), target: target("root"), newStatus: "disabled" })), "target_not_manageable");
    });
});

describe("public signup can never create a privileged account", () => {
    it("only editor is a self-registration role", () => assert.deepEqual([...SELF_REGISTRATION_ROLES], ["editor"]));

    it("the configured signup role is accepted", () => {
        assert.equal(assertSelfRegistrationRole(SIGNUP_DEFAULT_ROLE), "editor");
    });

    it("super_admin, admin and junk are rejected", () => {
        for (const role of ["super_admin", "admin", "root", "", undefined, null, {}]) {
            assert.throws(() => assertSelfRegistrationRole(role), /self-registration/, String(role));
        }
    });
});
