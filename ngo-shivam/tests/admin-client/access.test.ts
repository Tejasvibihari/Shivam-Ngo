import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
    ACCESS_DENIED_PATH,
    ADMIN_ROUTES,
    canAccessPath,
    findAdminRoute,
    isAllowed,
    navItemsForRole,
    roleLabel,
} from "@/features/admin/access/policy";
import { roleHasPermission } from "@/lib/admin/auth/permissions";
import { ROLES, type Role } from "@/lib/admin/db/models";

/** Hand-written copy of what each role may see in the menu (docs/admin-frontend-rbac.md). */
const NAV: Record<Role, string[]> = {
    super_admin: ["/admin", "/admin/submissions", "/admin/users", "/admin/audit", "/admin/settings"],
    admin: ["/admin", "/admin/submissions", "/admin/users", "/admin/settings"],
    editor: ["/admin", "/admin/submissions"],
};

const hrefs = (role: unknown) => navItemsForRole(role).map((item) => item.href);

describe("navigation per role", () => {
    for (const role of ROLES) {
        it(`${role} sees exactly the expected menu`, () => {
            assert.deepEqual(hrefs(role), NAV[role]);
        });
    }

    it("hides every item the role cannot open, and shows every item it can", () => {
        for (const role of ROLES) {
            for (const route of ADMIN_ROUTES.filter((r) => r.icon)) {
                assert.equal(hrefs(role).includes(route.href), canAccessPath(role, route.href), `${role} ${route.href}`);
            }
        }
    });

    it("hides Content and Media menu links while keeping their pages accessible", () => {
        for (const role of ROLES) {
            for (const href of ["/admin/content", "/admin/media"]) {
                assert.equal(hrefs(role).includes(href), false, `${role} menu ${href}`);
                assert.equal(canAccessPath(role, href), true, `${role} page ${href}`);
            }
        }
    });

    it("an unknown, missing or malformed role gets no menu at all", () => {
        for (const role of [undefined, null, "", "root", "SUPER_ADMIN", "owner", 1, {}, []]) {
            assert.deepEqual(hrefs(role), [], String(role));
        }
    });
});

describe("page access per role", () => {
    it("Super Admin may open every page", () => {
        for (const route of ADMIN_ROUTES) assert.equal(canAccessPath("super_admin", route.href), true, route.href);
    });

    it("Admin may not open the audit log", () => {
        assert.equal(canAccessPath("admin", "/admin/audit"), false);
        assert.equal(canAccessPath("admin", "/admin/users"), true);
        assert.equal(canAccessPath("admin", "/admin/settings"), true);
        assert.equal(canAccessPath("admin", "/admin/submissions"), true);
    });

    it("Editor may open dashboard, content, media, submissions, their own profile and the access-denied page", () => {
        const allowed = ADMIN_ROUTES.filter((r) => canAccessPath("editor", r.href)).map((r) => r.href);
        assert.deepEqual(allowed, ["/admin", "/admin/content", "/admin/media", "/admin/submissions", "/admin/profile", ACCESS_DENIED_PATH]);
        for (const denied of ["/admin/users", "/admin/audit", "/admin/settings"]) {
            assert.equal(canAccessPath("editor", denied), false, denied);
        }
    });

    it("the signup PIN page is Super Admin only, even though Admin may open Settings", () => {
        assert.equal(canAccessPath("super_admin", "/admin/settings/signup-pin"), true);
        assert.equal(canAccessPath("admin", "/admin/settings"), true);
        assert.equal(canAccessPath("admin", "/admin/settings/signup-pin"), false);
        assert.equal(canAccessPath("editor", "/admin/settings/signup-pin"), false);
    });

    it("every role may open its own profile page, and it is not in the menu", () => {
        for (const role of ROLES) {
            assert.equal(canAccessPath(role, "/admin/profile"), true, role);
            assert.equal(hrefs(role).includes("/admin/profile"), false, role);
        }
    });

    it("sub-paths use the rule of their section", () => {
        assert.equal(canAccessPath("editor", "/admin/users/123"), false);
        assert.equal(canAccessPath("editor", "/admin/content/news/new"), true);
        assert.equal(canAccessPath("admin", "/admin/audit/2026"), false);
        assert.equal(canAccessPath("super_admin", "/admin/audit/2026"), true);
    });

    it("ignores query string, hash and trailing slashes when matching", () => {
        assert.equal(canAccessPath("editor", "/admin/users?x=1"), false);
        assert.equal(canAccessPath("editor", "/admin/users/"), false);
        assert.equal(canAccessPath("editor", "/admin/users#top"), false);
        assert.equal(canAccessPath("editor", "/admin/content/"), true);
    });

    it("every role is denied by an unknown or malformed role value", () => {
        for (const role of [undefined, null, "", "root", "Super_Admin", 7]) {
            for (const route of ADMIN_ROUTES) assert.equal(canAccessPath(role, route.href), false, `${String(role)} ${route.href}`);
        }
    });
});

describe("fail closed on paths", () => {
    it("a path with no entry is denied, even for the Super Admin", () => {
        for (const p of ["/admin/unknown", "/admin/usersx", "/admin/users-evil", "/admin/audits"]) {
            assert.equal(findAdminRoute(p), null, p);
            assert.equal(canAccessPath("super_admin", p), false, p);
        }
    });

    it("look-alike prefixes do not inherit a section's rule", () => {
        assert.equal(findAdminRoute("/admin/contents"), null);
        assert.equal(findAdminRoute("/admin/media-private"), null);
    });

    it("traversal, double slashes, backslashes and control characters are not matched", () => {
        for (const p of ["/admin/content/../users", "/admin//users", "/admin/content/./x", "/admin\\users", "/admin/content\n", "/admin/content/.."]) {
            assert.equal(findAdminRoute(p), null, JSON.stringify(p));
            assert.equal(canAccessPath("super_admin", p), false, JSON.stringify(p));
        }
    });

    it("paths outside /admin and non-strings are not admin pages", () => {
        for (const p of ["/", "/about", "/api/admin/auth/me", "/administrator", "admin/users", "", undefined, null, 5]) {
            assert.equal(findAdminRoute(p), null, String(p));
        }
    });

    it("/admin covers only itself, never the other pages", () => {
        assert.equal(findAdminRoute("/admin")?.href, "/admin");
        assert.equal(findAdminRoute("/admin/")?.href, "/admin");
        assert.equal(findAdminRoute("/admin/users/7")?.href, "/admin/users");
    });
});

describe("isAllowed (shared with the backend rules)", () => {
    it("agrees with the permission matrix for every role and every page", () => {
        for (const role of ROLES) {
            for (const route of ADMIN_ROUTES) {
                const permission = route.requirement.permission;
                assert.equal(typeof permission, "string", `${route.href} should name one permission`);
                assert.equal(isAllowed(role, route.requirement), roleHasPermission(role, permission), `${role} ${route.href}`);
            }
        }
    });

    it("supports minRole and refuses an empty requirement", () => {
        assert.equal(isAllowed("admin", { minRole: "admin" }), true);
        assert.equal(isAllowed("editor", { minRole: "admin" }), false);
        assert.equal(isAllowed("super_admin", {} as never), false);
    });
});

describe("page map", () => {
    it("has unique, normalised hrefs under /admin", () => {
        const seen = new Set<string>();
        for (const { href } of ADMIN_ROUTES) {
            assert.ok(href === "/admin" || href.startsWith("/admin/"), href);
            assert.ok(href === "/admin" || !href.endsWith("/"), href);
            assert.ok(!seen.has(href), `duplicate ${href}`);
            seen.add(href);
        }
    });

    it("covers every page under app/admin/(panel) (a new page needs a map entry)", () => {
        const panel = path.resolve(import.meta.dirname, "../../app/admin/(panel)");
        const pages: string[] = [];
        const walk = (dir: string) => {
            for (const name of readdirSync(dir).sort()) {
                const full = path.join(dir, name);
                if (statSync(full).isDirectory()) walk(full);
                else if (name === "page.tsx") {
                    const rel = path.relative(panel, dir).split(path.sep).filter(Boolean).join("/");
                    pages.push(rel ? `/admin/${rel}` : "/admin");
                }
            }
        };
        walk(panel);
        assert.ok(pages.length >= ADMIN_ROUTES.length, "expected the panel pages to be found");
        for (const page of pages) assert.notEqual(findAdminRoute(page), null, `${page} has no entry in ADMIN_ROUTES`);
        for (const { href } of ADMIN_ROUTES) assert.ok(pages.includes(href), `${href} is in ADMIN_ROUTES but has no page`);
    });
});

describe("roleLabel", () => {
    it("names the three roles and never throws on junk", () => {
        assert.equal(roleLabel("super_admin"), "Super Admin");
        assert.equal(roleLabel("admin"), "Admin");
        assert.equal(roleLabel("editor"), "Editor");
        assert.equal(roleLabel("root"), "Unknown role");
        assert.equal(roleLabel(undefined), "Unknown role");
    });
});
