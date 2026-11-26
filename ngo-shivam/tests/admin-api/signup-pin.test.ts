import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { PASSWORD, call, freshDb, rows, seedPin, seedUser } from "./helpers";
import { PATHS, routes } from "./routes";

/** Task 07 check 3 (signup PIN protection). */

const signup = (body: Record<string, unknown>, extra = {}) => call(routes.signup.POST, { method: "POST", path: PATHS.signup, body, ...extra });
const valid = (over: Record<string, unknown> = {}) => ({ name: "Some Person", email: "person@example.org", password: PASSWORD, pin: "123456", ...over });

describe("signup is closed unless everything is in place", () => {
    beforeEach(freshDb);

    it("is closed with no Super Admin, even when a PIN is configured", async () => {
        await seedPin("123456");
        assert.equal((await call(routes.signup.GET, { path: PATHS.signup })).body.enabled, false);
        const res = await signup(valid());
        assert.equal(res.status, 403);
        assert.equal(res.body.code, "signup_disabled");
        assert.equal(rows("users").length, 0);
    });

    it("is closed with a Super Admin but no PIN", async () => {
        await seedUser("super_admin");
        assert.equal((await call(routes.signup.GET, { path: PATHS.signup })).body.enabled, false);
        assert.equal((await signup(valid())).status, 403);
    });

    it("is closed when the only Super Admin is disabled", async () => {
        await seedUser("super_admin", { status: "disabled" });
        await seedPin("123456");
        assert.equal((await signup(valid())).status, 403);
    });

    it("is closed by the SIGNUP_ENABLED=false kill switch whatever the PIN", async () => {
        await seedUser("super_admin");
        await seedPin("123456");
        process.env.SIGNUP_ENABLED = "false";
        try {
            assert.equal((await signup(valid())).status, 403);
            assert.equal((await call(routes.signup.GET, { path: PATHS.signup })).body.enabled, false);
        } finally {
            delete process.env.SIGNUP_ENABLED;
        }
    });

    it("seeds the hashed PIN from SIGNUP_PIN_INITIAL once, and never exposes it", async () => {
        await seedUser("super_admin");
        process.env.SIGNUP_PIN_INITIAL = "246810";
        try {
            assert.equal((await call(routes.signup.GET, { path: PATHS.signup })).body.enabled, true);
            const [setting] = rows("settings");
            assert.match(setting.hash as string, /^scrypt\$/);
            assert.ok(!JSON.stringify(setting).includes("246810"));
            assert.equal((await signup(valid({ pin: "246810" }))).status, 201);
        } finally {
            delete process.env.SIGNUP_PIN_INITIAL;
        }
    });

    it("an invalid SIGNUP_PIN_INITIAL (not 6-12 digits) is ignored and signup stays closed", async () => {
        await seedUser("super_admin");
        process.env.SIGNUP_PIN_INITIAL = "12ab56";
        try {
            assert.equal((await call(routes.signup.GET, { path: PATHS.signup })).body.enabled, false);
            assert.equal(rows("settings").length, 0);
        } finally {
            delete process.env.SIGNUP_PIN_INITIAL;
        }
    });
});

describe("signup PIN check", () => {
    beforeEach(async () => {
        freshDb();
        await seedUser("super_admin");
        await seedPin("123456");
    });

    it("creates an active editor with the right PIN and returns no secrets", async () => {
        const res = await signup(valid());
        assert.equal(res.status, 201);
        assert.equal(res.body.user.role, "editor");
        assert.equal(res.body.user.status, "active");
        assert.ok(!JSON.stringify(res.body).includes("passwordHash"));
        assert.equal(res.cookie, null, "signup does not log anyone in");
        const created = rows("users").find((u) => u.email === "person@example.org")!;
        assert.match(created.passwordHash as string, /^scrypt\$/);
        assert.ok(!JSON.stringify(created).includes(PASSWORD));
    });

    it("rejects a wrong PIN with 403, creates nothing, and does not say whether the e-mail exists", async () => {
        const taken = await seedUser("editor", { email: "taken@example.org" });
        void taken;
        const wrongForNew = await signup(valid({ pin: "000000" }));
        const wrongForTaken = await signup(valid({ pin: "000000", email: "taken@example.org" }));
        assert.equal(wrongForNew.status, 403);
        assert.equal(wrongForTaken.status, 403);
        assert.deepEqual(wrongForNew.body, wrongForTaken.body, "no e-mail enumeration without the PIN");
        assert.equal(rows("users").filter((u) => u.email === "person@example.org").length, 0);
    });

    it("rejects a missing PIN or PINs of the wrong shape (400) before touching the database", async () => {
        const before = rows("rate_limits").length;
        for (const pin of [undefined, "", "12345", "1234567890123", "abcdef", 123456, null, ["123456"], { $ne: "x" }]) {
            const body = valid({ pin });
            if (pin === undefined) delete (body as Record<string, unknown>).pin;
            assert.equal((await signup(body)).status, 400, JSON.stringify(pin));
        }
        assert.equal(rows("rate_limits").length, before);
        assert.equal(rows("users").length, 1);
    });

    it("tells the caller when the e-mail is already registered, but only after the PIN is proven", async () => {
        await signup(valid());
        const res = await signup(valid());
        assert.equal(res.status, 409);
        assert.equal(res.body.code, "email_taken");
    });

    it("treats e-mail case and surrounding spaces as the same address", async () => {
        assert.equal((await signup(valid({ email: "  Person@Example.ORG " }))).status, 201);
        assert.equal((await signup(valid({ email: "person@example.org" }))).status, 409);
    });

    it("limits one IP to 5 signup attempts per window (wrong PINs count) and answers 429 with Retry-After", async () => {
        for (let i = 0; i < 5; i++) assert.equal((await signup(valid({ pin: "000000" }), { ip: "203.0.113.9" })).status, 403);
        const res = await signup(valid({ pin: "123456" }), { ip: "203.0.113.9" });
        assert.equal(res.status, 429);
        assert.ok(Number(res.headers.get("retry-after")) > 0);
        assert.equal(rows("users").length, 1, "the right PIN did not get through while limited");
    });

    it("also limits attempts globally (20 per hour) so rotating IPs cannot guess the PIN", async () => {
        let last = 0;
        for (let i = 0; i < 21; i++) last = (await signup(valid({ pin: "000000" }), { ip: `198.51.100.${i + 1}` })).status;
        assert.equal(last, 429);
    });

    it("failed attempts are audited without the PIN value", async () => {
        await signup(valid({ pin: "000000" }));
        const entry = rows("audit_logs").find((r) => r.action === "auth.signup_failed");
        assert.ok(entry);
        assert.ok(!JSON.stringify(rows("audit_logs")).includes("000000"));
    });

    it("GET /signup reveals only { ok, enabled }", async () => {
        const res = await call(routes.signup.GET, { path: PATHS.signup });
        assert.deepEqual(res.body, { ok: true, enabled: true });
    });

    it("no public endpoint ever returns the PIN or its hash", async () => {
        const hash = rows("settings")[0].hash as string;
        const replies = [
            await call(routes.signup.GET, { path: PATHS.signup }),
            await signup(valid({ pin: "000000" })),
            await signup(valid()),
            await call(routes.setup.GET, { path: PATHS.setup }),
        ];
        for (const r of replies) {
            const text = JSON.stringify(r.body) + (r.cookie ?? "") + [...r.headers.values()].join(" ");
            assert.ok(!text.includes(hash) && !text.includes("123456") && !text.includes("scrypt$"));
        }
    });

    it("a PIN hashed under another AUTH_SECRET no longer verifies (the pepper is not in the database)", async () => {
        const stored = rows("settings")[0].hash as string;
        const { verifyPassword } = await import("@/lib/admin/auth/password");
        assert.equal(await verifyPassword("123456", stored), false, "the raw PIN is not what was hashed");
    });
});
