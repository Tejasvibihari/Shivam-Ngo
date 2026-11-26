import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";
import {
    PERMISSIONS,
    evaluateAccess,
    isPermission,
    isRole,
    type AccessRequirement,
} from "@/lib/admin/auth/permissions";
import { ROLES } from "@/lib/admin/db/models";

/**
 * Secure-by-default check for the admin API. It imports EVERY route file under
 * app/api/admin and requires each exported HTTP handler to be either
 *   - wrapped by withAuth() (so it carries an `authz` requirement), or
 *   - on the explicit PUBLIC list below.
 * A new admin route that forgets withAuth() fails this test until someone adds it
 * to the list on purpose, which shows up in code review.
 */

const ROOT = path.resolve(import.meta.dirname, "../..");
const ADMIN_API = path.join(ROOT, "app/api/admin");
const HTTP_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const;

/** Routes that are public on purpose, and what protects each one instead of a session. */
const PUBLIC_ROUTES: Record<string, string> = {
    "POST /api/admin/auth/login": "email + password, rate limited",
    "POST /api/admin/auth/logout": "idempotent; only ever ends the caller's own session",
    "GET /api/admin/auth/signup": "returns only { enabled }",
    "POST /api/admin/auth/signup": "signup PIN, rate limited, role fixed to editor",
    "GET /api/admin/setup": "returns only { available }",
    "POST /api/admin/setup": "SETUP_TOKEN, rate limited, role fixed to super_admin, closed once a Super Admin exists",
};

function routeFiles(dir: string): string[] {
    return readdirSync(dir)
        .sort()
        .flatMap((name) => {
            const full = path.join(dir, name);
            if (statSync(full).isDirectory()) return routeFiles(full);
            return name === "route.ts" ? [full] : [];
        });
}

type Handler = { file: string; method: string; route: string; authz?: AccessRequirement };

async function loadHandlers(): Promise<Handler[]> {
    const handlers: Handler[] = [];
    for (const file of routeFiles(ADMIN_API)) {
        const route = "/" + path.relative(path.join(ROOT, "app"), path.dirname(file)).split(path.sep).join("/");
        const mod = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
        for (const method of HTTP_METHODS) {
            const fn = mod[method];
            if (fn === undefined) continue;
            assert.equal(typeof fn, "function", `${method} ${route} is not a function`);
            handlers.push({ file, method, route, authz: (fn as { authz?: AccessRequirement }).authz });
        }
    }
    return handlers;
}

const label = (h: Handler) => `${h.method} ${h.route}`;
const describeAuthz = (a: AccessRequirement) =>
    [a.minRole && `minRole=${a.minRole}`, a.permission && `permission=${[a.permission].flat().join("+")}`]
        .filter(Boolean)
        .join(", ");

describe("admin API route coverage", async () => {
    const handlers = await loadHandlers();

    it("finds the admin routes (guards against scanning the wrong folder)", () => {
        assert.ok(handlers.length >= 5, `only ${handlers.length} handlers found`);
    });

    it("every handler is guarded with withAuth() or on the explicit public list", (t) => {
        const unguarded = handlers.filter((h) => !h.authz && !(label(h) in PUBLIC_ROUTES));
        assert.deepEqual(unguarded.map(label), [], "these admin handlers have no authorization");

        for (const h of handlers) {
            t.diagnostic(`${label(h).padEnd(40)} ${h.authz ? `PROTECTED  ${describeAuthz(h.authz)}` : `PUBLIC     ${PUBLIC_ROUTES[label(h)]}`}`);
        }
    });

    it("the public list has no stale entries and never overlaps a guarded handler", () => {
        const found = new Map(handlers.map((h) => [label(h), h]));
        for (const key of Object.keys(PUBLIC_ROUTES)) {
            const handler = found.get(key);
            assert.ok(handler, `public list names a handler that does not exist: ${key}`);
            assert.equal(handler.authz, undefined, `${key} is both public and guarded: pick one`);
        }
    });

    it("every guard names real roles / permissions and lets a super_admin in", () => {
        for (const h of handlers.filter((x) => x.authz)) {
            const authz = h.authz as AccessRequirement;
            assert.ok(authz.minRole !== undefined || authz.permission !== undefined, `${label(h)} demands nothing`);
            if (authz.minRole !== undefined) assert.ok(isRole(authz.minRole), `${label(h)}: unknown role`);
            for (const p of [authz.permission ?? []].flat()) assert.ok(isPermission(p), `${label(h)}: unknown permission ${p}`);
            assert.equal(evaluateAccess("super_admin", authz).allowed, true, `${label(h)} locks out the super admin`);
            assert.equal(evaluateAccess("not-a-role", authz).allowed, false, `${label(h)} allows an invalid role`);
        }
    });

    it("proxy.ts lets exactly the public routes through without a cookie", () => {
        const source = readFileSync(path.join(ROOT, "proxy.ts"), "utf8");
        const declaration = /const PUBLIC_API = new Set\(\[([^\]]*)\]\)/.exec(source);
        assert.ok(declaration, "PUBLIC_API not found in proxy.ts");
        const inProxy = [...declaration[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
        const inRoutes = [...new Set(Object.keys(PUBLIC_ROUTES).map((k) => k.split(" ")[1]))].sort();
        assert.deepEqual(inProxy, inRoutes);
    });

    it("sensitive settings need settings:update_sensitive (Super Admin only)", () => {
        const pin = handlers.find((h) => label(h) === "PUT /api/admin/settings/signup-pin");
        assert.ok(pin?.authz, "PUT signup-pin must be guarded");
        assert.deepEqual(pin.authz.permission, "settings:update_sensitive");
        assert.equal(evaluateAccess("super_admin", pin.authz).allowed, true);
        for (const role of ROLES.filter((r) => r !== "super_admin")) {
            assert.equal(evaluateAccess(role, pin.authz).allowed, false, role);
        }
    });

    it("the admin API itself needs a valid role (GET /me)", () => {
        const me = handlers.find((h) => label(h) === "GET /api/admin/auth/me");
        assert.deepEqual(me?.authz, { permission: "admin:access" });
        assert.ok(PERMISSIONS.includes("admin:access"));
    });
});
