import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { PASSWORD, call, freshDb, rows, seedUser, tables, tokenFrom } from "./helpers";
import { PATHS, routes } from "./routes";

/** Task 07 checks 1 (authentication), 5 (unauthorized API access) and 8 (session expiry). */

const login = (email: string, password = PASSWORD, extra = {}) =>
    call(routes.login.POST, { method: "POST", path: PATHS.login, body: { email, password }, ...extra });

describe("authentication", () => {
    beforeEach(freshDb);

    it("logs in with the right credentials and sets a hardened session cookie", async () => {
        const user = await seedUser("editor");
        const res = await login(user.email);
        assert.equal(res.status, 200);
        assert.equal(res.body.ok, true);
        assert.equal(res.body.user.email, user.email);
        assert.match(res.cookie ?? "", /HttpOnly/);
        assert.match(res.cookie ?? "", /SameSite=Lax/);
        assert.match(res.cookie ?? "", /Path=\//);
        assert.match(res.headers.get("cache-control") ?? "", /no-store/);
    });

    it("never returns the password hash, and stores only a hash of the session token", async () => {
        const user = await seedUser("admin");
        const res = await login(user.email);
        assert.ok(!JSON.stringify(res.body).includes("passwordHash"));
        assert.ok(!JSON.stringify(res.body).includes("scrypt$"));
        const token = tokenFrom(res);
        const [session] = rows("sessions");
        assert.notEqual(session._id, token, "the raw token must not be the database key");
        assert.equal((session._id as string).length, 64, "HMAC-SHA256 hex");
        assert.ok(!JSON.stringify(rows("sessions")).includes(token));
    });

    it("gives the same answer for a wrong password, an unknown e-mail and a disabled account", async () => {
        const active = await seedUser("editor");
        const disabled = await seedUser("editor", { status: "disabled" });
        const wrongPassword = await login(active.email, "not-the-password-1");
        const unknown = await login("nobody@example.org");
        const off = await login(disabled.email);
        for (const r of [wrongPassword, unknown, off]) {
            assert.equal(r.status, 401);
            assert.equal(r.body.code, "invalid_credentials");
            assert.equal(r.cookie, null);
        }
        assert.equal(wrongPassword.body.error, unknown.body.error);
        assert.equal(unknown.body.error, off.body.error);
    });

    it("audits failed and successful logins without storing the password", async () => {
        const user = await seedUser("editor");
        await login(user.email, "wrong-password-123");
        await login(user.email);
        const actions = rows("audit_logs").map((r) => r.action);
        assert.deepEqual(actions, ["auth.login_failed", "auth.login_success"]);
        assert.ok(!JSON.stringify(rows("audit_logs")).includes("wrong-password-123"));
    });

    it("rate limits repeated failures for one e-mail (429 + Retry-After) and the correct password is blocked too", async () => {
        const user = await seedUser("editor");
        for (let i = 0; i < 10; i++) assert.equal((await login(user.email, "wrong-password-123")).status, 401);
        const blocked = await login(user.email, "wrong-password-123");
        assert.equal(blocked.status, 429);
        assert.ok(Number(blocked.headers.get("retry-after")) > 0);
        assert.equal((await login(user.email)).status, 429, "even the right password waits for the window");
    });

    it("rate limits one IP trying many accounts", async () => {
        let last = 0;
        for (let i = 0; i < 21; i++) last = (await login(`user${i}@example.org`, PASSWORD, { ip: "203.0.113.50" })).status;
        assert.equal(last, 429);
    });

    it("rejects the forwarded-for header when TRUST_PROXY is off (client cannot pick its own IP)", async () => {
        process.env.TRUST_PROXY = "false";
        try {
            for (let i = 0; i < 25; i++) {
                const r = await login(`user${i}@example.org`, PASSWORD, { ip: `203.0.113.${i}` });
                assert.equal(r.status, 401, "per-IP counters are not used, so no 429 from spoofed addresses");
            }
            assert.equal(rows("rate_limits").filter((r) => String(r._id).startsWith("login:ip:")).length, 0);
        } finally {
            process.env.TRUST_PROXY = "true";
        }
    });

    it("/me returns the user and permissions for a valid session", async () => {
        const user = await seedUser("editor");
        const token = tokenFrom(await login(user.email));
        const res = await call(routes.me.GET, { path: PATHS.me, token });
        assert.equal(res.status, 200);
        assert.equal(res.body.user.role, "editor");
        assert.ok(res.body.permissions.includes("content:read"));
        assert.ok(!res.body.permissions.includes("settings:update_sensitive"));
    });

    it("logout deletes the server-side session, so the old cookie stops working at once", async () => {
        const user = await seedUser("editor");
        const token = tokenFrom(await login(user.email));
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token })).status, 200);
        const out = await call(routes.logout.POST, { method: "POST", path: PATHS.logout, token });
        assert.equal(out.status, 200);
        assert.match(out.cookie ?? "", /Max-Age=0/);
        assert.equal(rows("sessions").length, 0);
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token })).status, 401);
    });

    it("each login issues a new token (no session fixation)", async () => {
        const user = await seedUser("editor");
        const a = tokenFrom(await login(user.email));
        const b = tokenFrom(await login(user.email));
        assert.notEqual(a, b);
    });

    it("changing the password ends every other session of that account", async () => {
        const user = await seedUser("admin");
        const phone = tokenFrom(await login(user.email));
        const laptop = tokenFrom(await login(user.email));
        const res = await call(routes.password.PUT, {
            method: "PUT",
            path: PATHS.password,
            token: laptop,
            body: { currentPassword: PASSWORD, newPassword: "another-long-passphrase-7" },
        });
        assert.equal(res.status, 200);
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token: phone })).status, 401);
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token: laptop })).status, 401, "old token replaced");
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token: tokenFrom(res) })).status, 200);
        assert.equal((await login(user.email, "another-long-passphrase-7")).status, 200);
    });

    it("password change requires the correct current password", async () => {
        const user = await seedUser("editor");
        const token = tokenFrom(await login(user.email));
        const res = await call(routes.password.PUT, {
            method: "PUT",
            path: PATHS.password,
            token,
            body: { currentPassword: "wrong-current-password", newPassword: "another-long-passphrase-7" },
        });
        assert.equal(res.status, 403);
        assert.equal(res.body.code, "invalid_current_password");
    });
});

describe("unauthorized API access (no / bad / forged credentials)", () => {
    beforeEach(freshDb);

    const guarded: [string, keyof typeof routes, string][] = [
        ["GET", "me", PATHS.me],
        ["GET", "stats", PATHS.stats],
        ["GET", "users", PATHS.users],
        ["PUT", "pin", PATHS.pin],
        ["PUT", "password", PATHS.password],
        ["PATCH", "profile", PATHS.profile],
    ];

    for (const [method, name, path] of guarded) {
        it(`${method} ${path}: 401 without a cookie, with garbage, and with a well-formed but unknown token`, async () => {
            const handler = (routes[name] as Record<string, never>)[method];
            const body = method === "GET" ? undefined : { x: 1 };
            for (const cookie of [undefined, "ngo_session=garbage", `ngo_session=${"A".repeat(43)}`, "ngo_session=", "ngo_session=' OR 1=1 --"]) {
                const res = await call(handler, { method, path, body, cookie });
                assert.equal(res.status, 401, `${cookie}`);
                assert.equal(res.body.code, "unauthenticated");
            }
        });
    }

    it("a token that is the stored database key (not the cookie value) is not accepted", async () => {
        const user = await seedUser("super_admin");
        const token = tokenFrom(await login(user.email));
        void token;
        const [session] = rows("sessions");
        const res = await call(routes.me.GET, { path: PATHS.me, token: session._id as string });
        assert.equal(res.status, 401, "knowing the DB row (a DB leak) must not give a usable cookie");
    });

    it("blocks cross-site state changes on guarded routes (403 bad_origin) even with a valid session", async () => {
        const user = await seedUser("super_admin");
        const token = tokenFrom(await login(user.email));
        const res = await call(routes.pin.PUT, {
            method: "PUT",
            path: PATHS.pin,
            token,
            origin: "https://evil.example",
            body: { newPin: "999999" },
        });
        assert.equal(res.status, 403);
        assert.equal(res.body.code, "bad_origin");
        assert.equal(rows("settings").length, 0);
    });

    it("blocks cross-site login, signup and logout", async () => {
        for (const [name, path] of [["login", PATHS.login], ["signup", PATHS.signup], ["logout", PATHS.logout]] as const) {
            const res = await call((routes[name] as { POST: never }).POST, { method: "POST", path, origin: "https://evil.example", body: {} });
            assert.equal(res.status, 403, name);
        }
    });

    it("accepts a same-origin Origin header", async () => {
        const user = await seedUser("editor");
        const res = await login(user.email, PASSWORD, { origin: "http://localhost:3000" });
        assert.equal(res.status, 200);
    });
});

describe("session expiration", () => {
    beforeEach(freshDb);

    async function session() {
        const user = await seedUser("super_admin");
        const token = tokenFrom(await login(user.email));
        const key = [...tables.sessions.docs.keys()][0];
        return { token, key, user };
    }
    const patch = (key: string, fields: Record<string, unknown>) => {
        const doc = tables.sessions.docs.get(key)!;
        tables.sessions.docs.set(key, { ...doc, ...fields });
    };

    it("is valid inside both limits", async () => {
        const { token } = await session();
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token })).status, 200);
    });

    it("ends after the 7-day absolute lifetime and the row is removed", async () => {
        const { token, key } = await session();
        patch(key, { expiresAt: new Date(Date.now() - 1000) });
        const res = await call(routes.me.GET, { path: PATHS.me, token });
        assert.equal(res.status, 401);
        assert.equal(rows("sessions").length, 0);
    });

    it("ends after 12 hours of inactivity even though the absolute lifetime is not over", async () => {
        const { token, key } = await session();
        patch(key, { lastSeenAt: new Date(Date.now() - 12 * 60 * 60 * 1000 - 5000) });
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token })).status, 401);
        assert.equal(rows("sessions").length, 0);
    });

    it("stays valid just inside the idle limit and then refreshes lastSeenAt", async () => {
        const { token, key } = await session();
        const old = new Date(Date.now() - 11 * 60 * 60 * 1000);
        patch(key, { lastSeenAt: old });
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token })).status, 200);
        assert.ok((tables.sessions.docs.get(key)!.lastSeenAt as Date).getTime() > old.getTime());
    });

    it("the cookie lifetime matches the absolute session lifetime", async () => {
        const user = await seedUser("editor");
        const res = await login(user.email);
        const expires = /Expires=([^;]+)/.exec(res.cookie ?? "")?.[1];
        assert.ok(expires);
        const days = (new Date(expires).getTime() - Date.now()) / 86_400_000;
        assert.ok(days > 6.9 && days <= 7.01, `cookie lives ${days.toFixed(2)} days`);
    });

    it("a disabled account loses its live session immediately", async () => {
        const { token, user } = await session();
        const doc = tables.users.docs.get(`oid:${user.id.toHexString()}`)!;
        tables.users.docs.set(`oid:${user.id.toHexString()}`, { ...doc, status: "disabled" });
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token })).status, 401);
        assert.equal(rows("sessions").length, 0);
    });

    it("a deleted account loses its live session immediately", async () => {
        const { token, user } = await session();
        tables.users.docs.delete(`oid:${user.id.toHexString()}`);
        assert.equal((await call(routes.me.GET, { path: PATHS.me, token })).status, 401);
    });
});
