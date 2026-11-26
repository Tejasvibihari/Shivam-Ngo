import { describe, it } from "node:test";
import assert from "node:assert/strict";
import "./env";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";

/** Task 07: the first gate in front of every admin page and admin API (proxy.ts). It only checks that a cookie exists; real validation is in withAuth() / the client guards. */

const req = (path: string, cookie?: string) => new NextRequest(`http://localhost:3000${path}`, { headers: cookie ? { cookie } : {} });

describe("proxy.ts (admin gate)", () => {
    it("redirects every protected admin page to the login page when there is no session cookie", () => {
        for (const path of ["/admin", "/admin/users", "/admin/settings", "/admin/settings/signup-pin", "/admin/audit", "/admin/anything-else"]) {
            const res = proxy(req(path));
            assert.equal(res.status, 307, path);
            const location = new URL(res.headers.get("location") as string);
            assert.equal(location.pathname, "/admin/login", path);
            if (path !== "/admin") assert.equal(location.searchParams.get("next"), path);
        }
    });

    it("lets the login, signup and setup pages through without a cookie", () => {
        for (const path of ["/admin/login", "/admin/signup", "/admin/setup"]) assert.equal(proxy(req(path)).status, 200, path);
    });

    it("answers 401 JSON for admin API calls without a cookie, except the public routes", () => {
        for (const path of ["/api/admin/users", "/api/admin/stats", "/api/admin/auth/me", "/api/admin/settings/signup-pin", "/api/admin/auth/password", "/api/admin/auth/profile", "/api/admin/unknown"]) {
            const res = proxy(req(path));
            assert.equal(res.status, 401, path);
            assert.equal(res.headers.get("cache-control"), "no-store");
        }
        for (const path of ["/api/admin/auth/login", "/api/admin/auth/logout", "/api/admin/auth/signup", "/api/admin/setup"]) {
            assert.equal(proxy(req(path)).status, 200, path);
        }
    });

    it("looks lookalike paths up exactly: a prefix of a public path is not public", () => {
        for (const path of ["/api/admin/auth/login/extra", "/api/admin/setup/x", "/api/admin/auth/signup2", "/admin/login/../users"]) {
            const res = proxy(req(path));
            assert.notEqual(res.status, 200, path);
        }
    });

    it("passes a request that carries a session cookie on (validity is checked by the route / page, not here)", () => {
        assert.equal(proxy(req("/admin/users", "ngo_session=anything")).status, 200);
        assert.equal(proxy(req("/api/admin/users", "ngo_session=anything")).status, 200);
    });

    it("an empty cookie value does not count as a session", () => {
        assert.equal(proxy(req("/admin/users", "ngo_session=")).status, 307);
        assert.equal(proxy(req("/api/admin/users", "ngo_session=")).status, 401);
    });
});
