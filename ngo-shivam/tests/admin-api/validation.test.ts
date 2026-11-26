import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { PASSWORD, call, freshDb, rows, seedPin, seedUser, tokenFrom } from "./helpers";
import { PATHS, routes } from "./routes";

/** Task 07 check 7 (input validation). */

const login = (body: unknown, extra = {}) => call(routes.login.POST, { method: "POST", path: PATHS.login, body, ...extra });

describe("input validation: login", () => {
    beforeEach(freshDb);

    it("rejects NoSQL-operator objects, arrays and non-strings as credentials (400, never a query)", async () => {
        await seedUser("super_admin", { email: "root@example.org" });
        const attacks = [
            { email: { $ne: null }, password: { $ne: null } },
            { email: { $gt: "" }, password: PASSWORD },
            { email: "root@example.org", password: { $ne: "" } },
            { email: ["root@example.org"], password: PASSWORD },
            { email: "root@example.org", password: [PASSWORD] },
            { email: 1, password: 2 },
            { email: null, password: null },
        ];
        for (const body of attacks) {
            const res = await login(body);
            assert.equal(res.status, 400, JSON.stringify(body));
            assert.equal(res.cookie, null);
        }
    });

    it("rejects missing fields, unknown fields, empty and oversized values", async () => {
        const cases: unknown[] = [
            {},
            { email: "a@example.org" },
            { password: PASSWORD },
            { email: "a@example.org", password: "" },
            { email: "a@example.org", password: PASSWORD, role: "super_admin" },
            { email: "not-an-email", password: PASSWORD },
            { email: `${"a".repeat(250)}@example.org`, password: PASSWORD },
            { email: "a@example.org", password: "x".repeat(129) },
            { email: "a b@example.org", password: PASSWORD },
            { email: "<script>@example.org", password: PASSWORD },
        ];
        for (const body of cases) assert.equal((await login(body)).status, 400, JSON.stringify(body).slice(0, 60));
    });

    it("rejects malformed JSON, wrong content types, oversized bodies and empty bodies", async () => {
        assert.equal((await login(undefined, { rawBody: "{ nope" })).status, 400);
        assert.equal((await login(undefined, { rawBody: "" })).status, 400);
        assert.equal((await login(undefined, { rawBody: "null" })).status, 400);
        assert.equal((await login(undefined, { rawBody: "email=a&password=b", contentType: "text/plain" })).status, 415);
        assert.equal((await login(undefined, { rawBody: "x".repeat(10_000) })).status, 413);
        assert.equal((await login(undefined, { rawBody: "{}", contentType: null })).status, 415);
        const lying = await login(undefined, { rawBody: "{}", headers: { "content-length": "999999" } });
        assert.equal(lying.status, 413);
    });

    it("error bodies carry a code and field messages but no stack traces or internals", async () => {
        const res = await login({ email: "bad", password: "" });
        assert.equal(res.body.code, "validation_error");
        assert.ok(res.body.fieldErrors.email);
        const text = JSON.stringify(res.body);
        assert.ok(!/at .*\.ts|node_modules|mongodb|stack/i.test(text));
    });

    it("an e-mail with SQL / Mongo / HTML payloads just fails as an invalid login or a validation error", async () => {
        for (const email of ["admin'--@example.org", "a@example.org'; db.users.drop()", "{\"$ne\":1}@example.org", "<img src=x onerror=alert(1)>@example.org"]) {
            const res = await login({ email, password: PASSWORD });
            assert.ok([400, 401].includes(res.status), email);
        }
        assert.equal(rows("users").length, 0);
    });
});

describe("input validation: signup, profile, password", () => {
    beforeEach(freshDb);

    it("signup rejects weak / oversized / malformed fields", async () => {
        await seedUser("super_admin");
        await seedPin("123456");
        const base = { name: "Some Person", email: "p@example.org", password: PASSWORD, pin: "123456" };
        const bad: Record<string, unknown>[] = [
            { password: "short" },
            { password: " ".repeat(14) },
            { password: "x".repeat(129) },
            { name: "A" },
            { name: " ".repeat(5) },
            { name: "N".repeat(101) },
            { email: "nope" },
            { name: ["Some", "Person"] },
            { name: { $gt: "" } },
        ];
        for (const over of bad) {
            const res = await call(routes.signup.POST, { method: "POST", path: PATHS.signup, body: { ...base, ...over } });
            assert.equal(res.status, 400, JSON.stringify(over).slice(0, 60));
        }
    });

    it("profile accepts only a sensible name (2-100 chars) and trims it", async () => {
        const user = await seedUser("editor");
        const token = tokenFrom(await login({ email: user.email, password: PASSWORD }));
        const patch = (body: unknown) => call(routes.profile.PATCH, { method: "PATCH", path: PATHS.profile, token, body });
        for (const name of ["", "A", " ", "x".repeat(101), 5, null, ["Ab"], { $set: { role: "admin" } }]) assert.equal((await patch({ name })).status, 400, JSON.stringify(name));
        const ok = await patch({ name: "  New Name  " });
        assert.equal(ok.status, 200);
        assert.equal(ok.body.user.name, "New Name");
    });

    it("password change enforces the length rules and a different new password", async () => {
        const user = await seedUser("editor");
        const token = tokenFrom(await login({ email: user.email, password: PASSWORD }));
        const put = (body: unknown) => call(routes.password.PUT, { method: "PUT", path: PATHS.password, token, body });
        for (const newPassword of ["short", "x".repeat(129), " ".repeat(20), PASSWORD, 12345678901234, null]) {
            assert.equal((await put({ currentPassword: PASSWORD, newPassword })).status, 400, String(newPassword).slice(0, 20));
        }
        assert.equal((await put({ currentPassword: PASSWORD, newPassword: "ok-long-new-passphrase-1", extra: 1 })).status, 400);
    });
});

describe("input validation: GET /api/admin/users query string", () => {
    beforeEach(freshDb);

    async function admin() {
        const user = await seedUser("admin", { name: "Alice Admin" });
        await seedUser("editor", { name: "Bob (Editor)", email: "bob.editor@example.org" });
        return tokenFrom(await login({ email: user.email, password: PASSWORD }));
    }
    const list = (token: string, query: string) => call(routes.users.GET, { path: `${PATHS.users}?${query}`, token });

    it("rejects unknown role / status filters and operator-style parameters", async () => {
        const token = await admin();
        assert.equal((await list(token, "role=root")).status, 400);
        assert.equal((await list(token, "status=banned")).status, 400);
        assert.equal((await list(token, "role[$ne]=editor")).status, 200, "bracket syntax is just an unknown parameter, not an operator");
        assert.equal((await list(token, "role[$ne]=editor")).body.users.length, 2);
        assert.equal((await list(token, "role=%7B%22%24ne%22%3A%22%22%7D")).status, 400);
    });

    it("treats the search text literally (regex metacharacters cannot match everything or hang the server)", async () => {
        const token = await admin();
        for (const q of [".*", "(a+)+$", "[", "\\", "$ne", "a{1,}", ".+", "^Alice", "Alice|Bob"]) {
            const res = await list(token, `q=${encodeURIComponent(q)}`);
            assert.equal(res.status, 200, q);
            assert.equal(res.body.users.length, 0, `${q} must not match as a pattern`);
        }
        // a metacharacter that really is in a name matches only as plain text
        assert.equal((await list(token, `q=${encodeURIComponent("(Editor)")}`)).body.users.length, 1);
        assert.equal((await list(token, `q=${encodeURIComponent("(")}`)).body.users.length, 1);
    });

    it("clamps page and pageSize to safe values", async () => {
        const token = await admin();
        const huge = await list(token, "page=999999999999&pageSize=999999");
        assert.equal(huge.status, 200);
        assert.equal(huge.body.pageSize, 50);
        assert.equal(huge.body.page, 100000, "page is capped, not unbounded");
        assert.deepEqual(huge.body.users, []);
        const neg = await list(token, "page=-5&pageSize=0");
        assert.equal(neg.body.page, 1);
        assert.equal(neg.body.pageSize, 1);
        const junk = await list(token, "page=abc&pageSize=1.5");
        assert.equal(junk.body.page, 1);
        assert.equal(junk.body.pageSize, 20);
    });

    it("uses the defaults (page 1, 20 per page) when the parameters are missing or empty", async () => {
        const token = await admin();
        for (const query of ["", "page=&pageSize=", "pageSize=", "page="]) {
            const res = await list(token, query);
            assert.equal(res.body.page, 1, query);
            assert.equal(res.body.pageSize, 20, `pageSize for "${query}"`);
            assert.equal(res.body.users.length, 2, query);
        }
    });
});
