import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { PASSWORD, call, freshDb, rows, seedPin, seedUser } from "./helpers";
import { PATHS, routes } from "./routes";

/** One-time Super Admin setup (POST /api/admin/setup). */

const TOKEN = () => process.env.SETUP_TOKEN as string;
const setup = (body: Record<string, unknown>, extra = {}) => call(routes.setup.POST, { method: "POST", path: PATHS.setup, body, ...extra });
const valid = (over: Record<string, unknown> = {}) => ({ setupToken: TOKEN(), name: "First Admin", email: "first@example.org", password: PASSWORD, ...over });

describe("one-time Super Admin setup", () => {
    beforeEach(freshDb);

    it("is available on an empty installation and says nothing else", async () => {
        const res = await call(routes.setup.GET, { path: PATHS.setup });
        assert.deepEqual(res.body, { ok: true, available: true });
    });

    it("creates exactly one active super_admin with the right token and stores a hash only", async () => {
        const res = await setup(valid());
        assert.equal(res.status, 201);
        assert.equal(res.body.user.role, "super_admin");
        assert.equal(res.cookie, null, "no session is created by setup");
        assert.ok(!JSON.stringify(res.body).includes("passwordHash"));
        const [user] = rows("users");
        assert.equal(user.role, "super_admin");
        assert.match(user.passwordHash as string, /^scrypt\$/);
        assert.ok(!JSON.stringify(rows("users")).includes(PASSWORD));
        const [marker] = rows("settings");
        assert.equal(marker._id, "setup");
        assert.ok(rows("audit_logs").some((r) => r.action === "setup.super_admin_created"));
        assert.ok(!JSON.stringify(rows("audit_logs")).includes(TOKEN()));
    });

    it("the new Super Admin can sign in, and signup stays closed until a PIN is set", async () => {
        await setup(valid());
        const login = await call(routes.login.POST, { method: "POST", path: PATHS.login, body: { email: "first@example.org", password: PASSWORD } });
        assert.equal(login.status, 200);
        assert.equal((await call(routes.signup.GET, { path: PATHS.signup })).body.enabled, false);
        await seedPin("123456");
        assert.equal((await call(routes.signup.GET, { path: PATHS.signup })).body.enabled, true);
    });

    it("closes for good after use: a second setup is refused and the first account is untouched", async () => {
        await setup(valid());
        assert.equal((await call(routes.setup.GET, { path: PATHS.setup })).body.available, false);
        const again = await setup(valid({ email: "second@example.org" }));
        assert.equal(again.status, 403);
        assert.equal(again.body.code, "setup_unavailable");
        assert.equal(rows("users").length, 1);
    });

    it("stays closed even if the Super Admin account is later deleted (the marker remains)", async () => {
        await setup(valid());
        (await import("./fakes/db-client")).tables.users.docs.clear();
        assert.equal((await call(routes.setup.GET, { path: PATHS.setup })).body.available, false, "the page must not offer setup again");
        assert.equal((await setup(valid({ email: "hijack@example.org" }))).status, 403);
        assert.equal(rows("users").length, 0);
    });

    it("is closed when a Super Admin already exists (seeded by script or by hand)", async () => {
        await seedUser("super_admin");
        assert.equal((await call(routes.setup.GET, { path: PATHS.setup })).body.available, false);
        assert.equal((await setup(valid())).status, 403);
        assert.equal(rows("users").length, 1);
    });

    it("still works when only non-super-admin accounts exist", async () => {
        await seedUser("editor");
        assert.equal((await setup(valid())).status, 201);
    });

    it("rejects a wrong token (403) without creating anything, and audits it without the token", async () => {
        const res = await setup(valid({ setupToken: "x".repeat(64) }));
        assert.equal(res.status, 403);
        assert.equal(res.body.code, "invalid_setup_token");
        assert.equal(rows("users").length, 0);
        assert.equal(rows("settings").length, 0);
        const entry = rows("audit_logs").find((r) => r.action === "setup.failed");
        assert.ok(entry);
        assert.ok(!JSON.stringify(rows("audit_logs")).includes("xxxxxxxx"));
    });

    it("rejects near-miss tokens (prefix, suffix, case, whitespace, empty) and operator objects", async () => {
        const t = TOKEN();
        for (const setupToken of [t.slice(0, -1), `${t}x`, t.toUpperCase().replace(/[a-f]/g, "G"), ` ${t}`, "", { $ne: "" }, [t], null]) {
            const res = await setup(valid({ setupToken }));
            assert.ok([400, 403].includes(res.status), JSON.stringify(setupToken));
        }
        assert.equal(rows("users").length, 0);
    });

    it("stays closed when SETUP_TOKEN is missing, too short or the placeholder (fail closed)", async () => {
        const saved = process.env.SETUP_TOKEN;
        try {
            for (const value of [undefined, "", "short", "put-a-one-time-setup-token-here", "changeme"]) {
                if (value === undefined) delete process.env.SETUP_TOKEN;
                else process.env.SETUP_TOKEN = value;
                assert.equal((await call(routes.setup.GET, { path: PATHS.setup })).body.available, false, String(value));
                const res = await setup(valid({ setupToken: String(value ?? "anything-at-all") }));
                assert.equal(res.status, 403, String(value));
            }
            assert.equal(rows("users").length, 0);
        } finally {
            process.env.SETUP_TOKEN = saved;
        }
    });

    it("cannot choose a role or status: extra keys are a 400", async () => {
        for (const extra of [{ role: "admin" }, { role: "super_admin" }, { status: "active" }]) {
            assert.equal((await setup(valid(extra))).status, 400);
        }
        assert.equal(rows("users").length, 0);
    });

    it("validates name, e-mail and password strength", async () => {
        for (const over of [{ password: "short" }, { password: " ".repeat(14) }, { email: "nope" }, { name: "A" }]) {
            assert.equal((await setup(valid(over))).status, 400, JSON.stringify(over));
        }
    });

    it("two simultaneous setups produce exactly one Super Admin", async () => {
        const [a, b] = await Promise.all([setup(valid({ email: "one@example.org" })), setup(valid({ email: "two@example.org" }))]);
        assert.deepEqual([a.status, b.status].sort(), [201, 403]);
        assert.equal(rows("users").filter((u) => u.role === "super_admin").length, 1);
        assert.equal(rows("settings").length, 1);
    });

    it("an e-mail clash releases the one-time slot so the operator can retry", async () => {
        await seedUser("editor", { email: "first@example.org" });
        const clash = await setup(valid());
        assert.equal(clash.status, 409);
        assert.equal(rows("settings").length, 0);
        assert.equal((await setup(valid({ email: "other@example.org" }))).status, 201);
    });

    it("rate limits attempts per IP and globally, and blocks cross-site requests", async () => {
        for (let i = 0; i < 10; i++) assert.equal((await setup(valid({ setupToken: "y".repeat(40) }), { ip: "203.0.113.77" })).status, 403);
        const res = await setup(valid(), { ip: "203.0.113.77" });
        assert.equal(res.status, 429);
        assert.equal(rows("users").length, 0);
        const cross = await setup(valid(), { origin: "https://evil.example", ip: "203.0.113.78" });
        assert.equal(cross.status, 403);
        assert.equal(cross.body.code, "bad_origin");
    });
});
