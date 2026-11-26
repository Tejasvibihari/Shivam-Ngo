import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ADMIN_HOME, buildLoginUrl, isLoginReason, safeAdminPath } from "@/features/admin/auth/redirect";

describe("safeAdminPath (post-login redirect target)", () => {
    it("keeps in-app admin paths, including the query string", () => {
        assert.equal(safeAdminPath("/admin"), "/admin");
        assert.equal(safeAdminPath("/admin/news"), "/admin/news");
        assert.equal(safeAdminPath("/admin/news?page=2"), "/admin/news?page=2");
    });

    it("falls back to the admin home for missing or non-string values", () => {
        for (const value of [undefined, null, "", 42, {}, []]) assert.equal(safeAdminPath(value), ADMIN_HOME);
    });

    it("rejects open-redirect attempts", () => {
        for (const value of [
            "https://evil.example/admin",
            "//evil.example",
            "/\\evil.example",
            "/admin\\..\\..\\x",
            "javascript:alert(1)",
            "/admin/%0d%0a",
            "/admin\n/x",
            "/admin/%5Cevil",
            "/admin/x?y=%0a",
            "/admin/%E0%A4%A",
        ]) {
            assert.equal(safeAdminPath(value), ADMIN_HOME, value);
        }
    });

    it("rejects paths outside /admin and look-alikes", () => {
        for (const value of ["/", "/about", "/administrator", "/api/admin/auth/me", "/admin-panel"]) {
            assert.equal(safeAdminPath(value), ADMIN_HOME, value);
        }
    });

    it("normalises traversal so it cannot leave /admin", () => {
        assert.equal(safeAdminPath("/admin/../about"), ADMIN_HOME);
        assert.equal(safeAdminPath("/admin/./news"), "/admin/news");
    });

    it("never returns the login / signup pages (redirect loop)", () => {
        for (const value of ["/admin/login", "/admin/login/", "/admin/signup", "/admin/setup", "/admin/login?next=/admin"]) {
            assert.equal(safeAdminPath(value), ADMIN_HOME, value);
        }
    });

    it("rejects very long values", () => {
        assert.equal(safeAdminPath(`/admin/${"a".repeat(600)}`), ADMIN_HOME);
    });
});

describe("buildLoginUrl", () => {
    it("is the plain login path with no options", () => {
        assert.equal(buildLoginUrl(), "/admin/login");
    });

    it("carries a safe next path and a reason, URL-encoded", () => {
        assert.equal(buildLoginUrl({ next: "/admin/news?page=2", reason: "expired" }), "/admin/login?next=%2Fadmin%2Fnews%3Fpage%3D2&reason=expired");
    });

    it("drops an unsafe or default next path", () => {
        assert.equal(buildLoginUrl({ next: "https://evil.example" }), "/admin/login");
        assert.equal(buildLoginUrl({ next: "/admin" }), "/admin/login");
    });

    it("keeps only the reason after an intentional sign-out", () => {
        assert.equal(buildLoginUrl({ reason: "signed_out" }), "/admin/login?reason=signed_out");
    });
});

describe("isLoginReason", () => {
    it("accepts only known reasons", () => {
        assert.equal(isLoginReason("expired"), true);
        assert.equal(isLoginReason("signed_out"), true);
        assert.equal(isLoginReason("forbidden"), true);
        assert.equal(isLoginReason("<script>"), false);
        assert.equal(isLoginReason(undefined), false);
    });
});
