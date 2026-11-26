import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { PASSWORD, call, freshDb, rows, seedPin, seedUser, tables, tokenFrom } from "./helpers";
import { PATHS, routes } from "./routes";
import { verifyPin } from "@/lib/admin/auth/signup-pin";
import type { Role } from "@/lib/admin/db/models";

/** Task 07 checks 2 (authorization), 4 (Super Admin permissions) and 6 (role escalation). */

async function sessionFor(role: Role, options: { email?: string } = {}) {
    const user = await seedUser(role, options);
    const res = await call(routes.login.POST, { method: "POST", path: PATHS.login, body: { email: user.email, password: PASSWORD } });
    return { token: tokenFrom(res), user };
}

describe("authorization matrix (real routes, real roles)", () => {
    beforeEach(freshDb);

    const expectations: { name: string; run: (token: string) => Promise<{ status: number }>; allowed: Role[] }[] = [
        { name: "GET /me", run: (token) => call(routes.me.GET, { path: PATHS.me, token }), allowed: ["super_admin", "admin", "editor"] },
        { name: "GET /stats", run: (token) => call(routes.stats.GET, { path: PATHS.stats, token }), allowed: ["super_admin", "admin", "editor"] },
        { name: "GET /users", run: (token) => call(routes.users.GET, { path: PATHS.users, token }), allowed: ["super_admin", "admin"] },
        {
            name: "PUT /settings/signup-pin",
            run: (token) => call(routes.pin.PUT, { method: "PUT", path: PATHS.pin, token, body: { newPin: "482915" } }),
            allowed: ["super_admin"],
        },
    ];

    for (const { name, run, allowed } of expectations) {
        for (const role of ["super_admin", "admin", "editor"] as Role[]) {
            it(`${name} as ${role}: ${allowed.includes(role) ? "allowed" : "403"}`, async () => {
                const { token } = await sessionFor(role);
                const res = await run(token);
                if (allowed.includes(role)) assert.ok(res.status >= 200 && res.status < 300, `status ${res.status}`);
                else assert.equal(res.status, 403);
            });
        }
    }

    it("the dashboard stats hide account counts from editors", async () => {
        await seedUser("admin");
        const editor = await sessionFor("editor");
        const res = await call(routes.stats.GET, { path: PATHS.stats, token: editor.token });
        assert.equal(res.body.users, null);
        const admin = await sessionFor("admin");
        const adminRes = await call(routes.stats.GET, { path: PATHS.stats, token: admin.token });
        assert.equal(adminRes.body.users.byRole.editor, 1);
    });

    it("denied requests are audited with route and reason only (no body, cookie or query)", async () => {
        const { token } = await sessionFor("editor");
        await call(routes.pin.PUT, { method: "PUT", path: PATHS.pin, token, body: { currentPin: "123456", newPin: "654321" } });
        const denied = rows("audit_logs").filter((r) => r.action === "authz.access_denied");
        assert.equal(denied.length, 1);
        assert.deepEqual(Object.keys(denied[0].meta as object).sort(), ["method", "path", "reason"]);
        assert.ok(!JSON.stringify(denied).includes("654321"));
    });

    it("a user with an invalid role value in the database is denied everywhere (fail closed)", async () => {
        const { token, user } = await sessionFor("editor");
        const key = `oid:${user.id.toHexString()}`;
        tables.users.docs.set(key, { ...tables.users.docs.get(key)!, role: "root" });
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token })).status, 403);
        assert.equal((await call(routes.stats.GET, { path: PATHS.stats, token })).status, 403);
    });

    it("a role change in the database applies to the live session on the very next request", async () => {
        const { token, user } = await sessionFor("admin");
        assert.equal((await call(routes.users.GET, { path: PATHS.users, token })).status, 200);
        const key = `oid:${user.id.toHexString()}`;
        tables.users.docs.set(key, { ...tables.users.docs.get(key)!, role: "editor" });
        assert.equal((await call(routes.users.GET, { path: PATHS.users, token })).status, 403);
    });
});

describe("role escalation attempts", () => {
    beforeEach(freshDb);

    it("signup cannot choose a role or status (strict schema), and nothing is created", async () => {
        await seedUser("super_admin");
        await seedPin("123456");
        for (const extra of [{ role: "super_admin" }, { role: "admin" }, { status: "active" }, { isAdmin: true }, { permissions: ["users:change_role"] }]) {
            const res = await call(routes.signup.POST, {
                method: "POST",
                path: PATHS.signup,
                body: { name: "Mallory", email: "m@example.org", password: PASSWORD, pin: "123456", ...extra },
            });
            assert.equal(res.status, 400, JSON.stringify(extra));
        }
        assert.equal(rows("users").length, 1);
    });

    it("a self-registered account is always an editor, whatever the request says", async () => {
        await seedUser("super_admin");
        await seedPin("123456");
        const res = await call(routes.signup.POST, {
            method: "POST",
            path: PATHS.signup,
            body: { name: "New Person", email: "new@example.org", password: PASSWORD, pin: "123456" },
        });
        assert.equal(res.status, 201);
        assert.equal(res.body.user.role, "editor");
        assert.equal(rows("users").find((u) => u.email === "new@example.org")!.role, "editor");
    });

    it("an editor cannot change their role or status through the profile endpoint", async () => {
        const { token, user } = await sessionFor("editor");
        for (const body of [{ name: "Eve", role: "super_admin" }, { name: "Eve", status: "active" }, { role: "admin" }, { name: "Eve", email: "x@example.org" }]) {
            const res = await call(routes.profile.PATCH, { method: "PATCH", path: PATHS.profile, token, body });
            assert.equal(res.status, 400, JSON.stringify(body));
        }
        assert.equal(tables.users.docs.get(`oid:${user.id.toHexString()}`)!.role, "editor");
    });

    it("the profile endpoint only ever edits the signed-in user, even if another id is sent", async () => {
        const victim = await seedUser("super_admin", { name: "Original Name" });
        const { token } = await sessionFor("editor");
        const res = await call(routes.profile.PATCH, { method: "PATCH", path: `${PATHS.profile}?id=${victim.id}`, token, body: { name: "Changed Name" } });
        assert.equal(res.status, 200);
        assert.equal(tables.users.docs.get(`oid:${victim.id.toHexString()}`)!.name, "Original Name");
    });

    it("an editor and an admin cannot change the signup PIN, and the stored hash is unchanged", async () => {
        await seedUser("super_admin");
        await seedPin("123456");
        const before = rows("settings")[0].hash;
        for (const role of ["editor", "admin"] as Role[]) {
            const { token } = await sessionFor(role);
            const res = await call(routes.pin.PUT, { method: "PUT", path: PATHS.pin, token, body: { currentPin: "123456", newPin: "654321" } });
            assert.equal(res.status, 403, role);
        }
        assert.equal(rows("settings")[0].hash, before);
    });

    it("forged or modified cookies do not raise privileges", async () => {
        const { token } = await sessionFor("editor");
        const attempts = [
            `ngo_session=${token}; role=super_admin`,
            `ngo_session=${token}x`,
            `ngo_session=${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`,
            `ngo_session=${Buffer.from(JSON.stringify({ role: "super_admin" })).toString("base64url")}`,
        ];
        for (const cookie of attempts.slice(1)) {
            assert.equal((await call(routes.pin.PUT, { method: "PUT", path: PATHS.pin, cookie, body: { newPin: "482915" } })).status, 401, cookie);
        }
        // the first attempt carries a valid token plus a junk cookie: still only an editor
        const res = await call(routes.pin.PUT, { method: "PUT", path: PATHS.pin, cookie: attempts[0], body: { newPin: "482915" } });
        assert.equal(res.status, 403);
    });

    it("role / permission hints in headers, query string or body are ignored", async () => {
        const { token } = await sessionFor("editor");
        const res = await call(routes.users.GET, {
            path: `${PATHS.users}?role=super_admin&permission=users:read`,
            token,
            headers: { "x-role": "super_admin", "x-user-role": "super_admin", authorization: "Bearer super_admin" },
        });
        assert.equal(res.status, 403);
    });

    it("an admin sees accounts but never password hashes", async () => {
        await seedUser("editor");
        const { token } = await sessionFor("admin");
        const res = await call(routes.users.GET, { path: PATHS.users, token });
        assert.equal(res.status, 200);
        assert.ok(res.body.users.length >= 2);
        assert.ok(!JSON.stringify(res.body).includes("passwordHash"));
        assert.ok(!JSON.stringify(res.body).includes("scrypt$"));
    });
});

describe("Super Admin: change the signup PIN (PUT /api/admin/settings/signup-pin)", () => {
    beforeEach(freshDb);

    const put = (token: string, body: unknown, extra = {}) => call(routes.pin.PUT, { method: "PUT", path: PATHS.pin, token, body, ...extra });

    it("changes the PIN with the right current PIN; only a hash is stored and the response leaks nothing", async () => {
        await seedPin("123456");
        const { token, user } = await sessionFor("super_admin");
        const res = await put(token, { currentPin: "123456", newPin: "654321" });
        assert.equal(res.status, 200);
        assert.equal(res.body.ok, true);
        const text = JSON.stringify(res.body);
        assert.ok(!text.includes("654321") && !text.includes("123456") && !text.includes("scrypt$") && !/hash/i.test(text));
        const [setting] = rows("settings");
        assert.match(setting.hash as string, /^scrypt\$/);
        assert.ok(!JSON.stringify(setting).includes("654321"));
        assert.equal(await verifyPin("654321", setting.hash as string), true);
        assert.equal(await verifyPin("123456", setting.hash as string), false);
        assert.equal((setting.updatedBy as { toHexString(): string }).toHexString(), user.id.toHexString());
    });

    it("the audit log records the change without any PIN value", async () => {
        await seedPin("123456");
        const { token } = await sessionFor("super_admin");
        await put(token, { currentPin: "123456", newPin: "654321" });
        const entry = rows("audit_logs").find((r) => r.action === "settings.signup_pin_changed");
        assert.ok(entry);
        assert.ok(!JSON.stringify(rows("audit_logs")).includes("654321"));
        assert.ok(!JSON.stringify(rows("audit_logs")).includes("123456"));
    });

    it("rejects a wrong current PIN (403), changes nothing, and audits the failure", async () => {
        await seedPin("123456");
        const { token } = await sessionFor("super_admin");
        const before = rows("settings")[0].hash;
        const res = await put(token, { currentPin: "000000", newPin: "654321" });
        assert.equal(res.status, 403);
        assert.equal(res.body.code, "invalid_current_pin");
        assert.equal(rows("settings")[0].hash, before);
        assert.ok(rows("audit_logs").some((r) => r.action === "settings.signup_pin_change_failed"));
    });

    it("requires currentPin once a PIN exists", async () => {
        await seedPin("123456");
        const { token } = await sessionFor("super_admin");
        const res = await put(token, { newPin: "654321" });
        assert.equal(res.status, 400);
        assert.equal(res.body.fieldErrors.currentPin, "Current PIN is required.");
    });

    it("sets the first PIN without currentPin when none is configured yet", async () => {
        const { token } = await sessionFor("super_admin");
        const res = await put(token, { newPin: "654321" });
        assert.equal(res.status, 200);
        assert.equal(rows("settings").length, 1);
    });

    it("rejects a new PIN equal to the current one, and malformed PINs", async () => {
        await seedPin("123456");
        const { token } = await sessionFor("super_admin");
        assert.equal((await put(token, { currentPin: "123456", newPin: "123456" })).status, 400);
        for (const newPin of ["12345", "1234567890123", "abcdef", "12 3456", "１２３４５６", "12345.6", "", null, 123456, ["123456"], { $ne: "" }]) {
            const res = await put(token, { currentPin: "123456", newPin });
            assert.equal(res.status, 400, JSON.stringify(newPin));
        }
    });

    it("rejects unknown keys (strict body) and wrong content types", async () => {
        await seedPin("123456");
        const { token } = await sessionFor("super_admin");
        assert.equal((await put(token, { currentPin: "123456", newPin: "654321", role: "admin" })).status, 400);
        const res = await call(routes.pin.PUT, { method: "PUT", path: PATHS.pin, token, rawBody: "newPin=654321", contentType: "application/x-www-form-urlencoded" });
        assert.equal(res.status, 415);
    });

    it("limits guessing of the current PIN to 5 attempts per window, then answers 429", async () => {
        await seedPin("123456");
        const { token } = await sessionFor("super_admin");
        for (let i = 0; i < 5; i++) assert.equal((await put(token, { currentPin: "000000", newPin: "654321" })).status, 403);
        const res = await put(token, { currentPin: "123456", newPin: "654321" });
        assert.equal(res.status, 429, "even the right PIN waits");
        assert.ok(res.headers.get("retry-after"));
    });

    it("the new PIN works on the signup form and the old one stops working", async () => {
        await seedPin("123456");
        const { token } = await sessionFor("super_admin");
        await put(token, { currentPin: "123456", newPin: "654321" });
        const body = (pin: string, email: string) => ({ name: "Some Person", email, password: PASSWORD, pin });
        assert.equal((await call(routes.signup.POST, { method: "POST", path: PATHS.signup, body: body("123456", "a@example.org") })).status, 403);
        assert.equal((await call(routes.signup.POST, { method: "POST", path: PATHS.signup, body: body("654321", "b@example.org") })).status, 201);
    });

    it("does not read the body of a request that is not allowed (403 before validation)", async () => {
        const { token } = await sessionFor("editor");
        const res = await call(routes.pin.PUT, { method: "PUT", path: PATHS.pin, token, rawBody: "{not json" });
        assert.equal(res.status, 403, "an unauthorised caller learns nothing about the body format");
    });
});
