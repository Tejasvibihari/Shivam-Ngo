#!/usr/bin/env node
/**
 * End-to-end check of PIN-protected signup and the signup-PIN settings endpoint
 * against a RUNNING server. Uses only Node's built-in fetch (and the `mongodb`
 * driver for one optional storage check).
 *
 *   BASE_URL=http://localhost:3000 \
 *   TEST_EMAIL=admin@example.com TEST_PASSWORD='correct-horse-battery-9' \
 *   SIGNUP_PIN=123456 \
 *   node --env-file=.env.local scripts/signup-smoke-test.mjs
 *
 * Needs:
 *  - a Super Admin (create one with scripts/dev-seed-user.mjs --role super_admin);
 *  - the CURRENT signup PIN in SIGNUP_PIN (the value of SIGNUP_PIN_INITIAL on first run);
 *  - TRUST_PROXY unset on the server (otherwise the per-IP limit of 5 attempts per
 *    15 minutes is reached before the checks finish).
 *
 * Run it against a DEVELOPMENT database. It creates two throw-away editor accounts
 * (signup-test-*@example.com), temporarily changes the PIN (and restores it), and
 * its last steps deliberately trigger the signup and PIN-change rate limits.
 * Unlock afterwards with  db.rate_limits.deleteMany({})  in mongosh, or wait.
 */
import { randomBytes } from "node:crypto";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.TEST_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_PASSWORD;
const PIN = process.env.SIGNUP_PIN;
const TEMP_PIN = process.env.TEMP_PIN ?? (PIN === "654321" ? "765432" : "654321");
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !PIN) {
    console.error("Set TEST_EMAIL and TEST_PASSWORD (a Super Admin) and SIGNUP_PIN (the current signup PIN).");
    process.exit(2);
}

let failures = 0;
const check = (name, ok, extra = "") => {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  ${extra}`}`);
    if (!ok) failures++;
};
const send = (method, path, body, headers = {}) =>
    fetch(BASE + path, {
        method,
        headers: { "content-type": "application/json", ...headers },
        body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
        redirect: "manual",
    });
const cookieOf = (res) => (res.headers.get("set-cookie") ?? "").split(";")[0];
const tag = randomBytes(4).toString("hex");
const PASSWORD = "a-long-test-password-1";
const signup = (over = {}) =>
    send("POST", "/api/admin/auth/signup", {
        name: "Signup Test",
        email: `signup-test-${tag}-${Math.random().toString(36).slice(2, 8)}@example.com`,
        password: PASSWORD,
        pin: PIN,
        ...over,
    });
const login = async (email, password) => {
    const res = await send("POST", "/api/admin/auth/login", { email, password });
    return { res, cookie: cookieOf(res) };
};
const putPin = (body, cookie) => send("PUT", "/api/admin/settings/signup-pin", body, cookie ? { cookie } : {});

// ---------------------------------------------------------------- status
let res = await fetch(`${BASE}/api/admin/auth/signup`);
let body = await res.json();
check("GET signup status -> 200 { enabled: true }", res.status === 200 && body.enabled === true, `got ${res.status} ${JSON.stringify(body)} (is there a Super Admin and a PIN?)`);
check("status response is not cacheable", (res.headers.get("cache-control") ?? "").includes("no-store"));

// ------------------------------------------- validation (not counted by the limiter)
res = await signup({ pin: undefined });
check("signup without PIN -> 400", res.status === 400, `got ${res.status}`);
res = await signup({ pin: "12ab56" });
check("signup with non-numeric PIN -> 400", res.status === 400, `got ${res.status}`);
res = await signup({ role: "super_admin" });
check("signup with extra field `role` -> 400 (no privilege escalation)", res.status === 400, `got ${res.status}`);
res = await signup({ password: "short" });
check("signup with short password -> 400", res.status === 400, `got ${res.status}`);
res = await send("POST", "/api/admin/auth/signup", "{not json");
check("signup with malformed JSON -> 400", res.status === 400, `got ${res.status}`);
res = await fetch(`${BASE}/api/admin/auth/signup`, { method: "POST", headers: { "content-type": "text/plain" }, body: "x" });
check("signup with wrong content-type -> 415", res.status === 415, `got ${res.status}`);
res = await send("POST", "/api/admin/auth/signup", { name: "x", email: "a@b.co", password: PASSWORD, pin: PIN }, { origin: "https://evil.example" });
check("signup from foreign Origin -> 403", res.status === 403, `got ${res.status}`);

// ------------------------------------------------------------ PIN checks
const wrongPin = PIN === "000000" ? "111111" : "000000";
res = await signup({ pin: wrongPin });
body = await res.json();
check("signup with wrong PIN -> 403 invalid_pin", res.status === 403 && body.code === "invalid_pin", `got ${res.status} ${JSON.stringify(body)}`);

const editorEmail = `signup-test-${tag}-editor@example.com`;
res = await signup({ email: editorEmail });
body = await res.json();
check("signup with valid PIN -> 201", res.status === 201 && body.ok === true, `got ${res.status} ${JSON.stringify(body)}`);
check("new account is an `editor`, never a super admin", body.user?.role === "editor", JSON.stringify(body.user));
check("signup response exposes no password hash or PIN", !/hash|"pin"|password/i.test(JSON.stringify(body)));
check("signup does not log the new user in (no Set-Cookie)", !res.headers.get("set-cookie"));

res = await signup({ email: editorEmail });
body = await res.json();
check("duplicate e-mail with valid PIN -> 409", res.status === 409 && body.code === "email_taken", `got ${res.status}`);

// ------------------------------------------- signup PIN endpoint: authorization
res = await putPin({ currentPin: PIN, newPin: TEMP_PIN });
check("PUT signup-pin without a session -> 401", res.status === 401, `got ${res.status}`);

const editor = await login(editorEmail, PASSWORD);
check("new editor can sign in", editor.res.status === 200 && editor.cookie !== "", `got ${editor.res.status}`);
res = await putPin({ currentPin: PIN, newPin: TEMP_PIN }, editor.cookie);
check("PUT signup-pin as editor -> 403", res.status === 403, `got ${res.status}`);

const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
check("Super Admin can sign in", admin.res.status === 200 && admin.cookie !== "", `got ${admin.res.status}`);
const adminUser = (await admin.res.json()).user;
check("TEST_EMAIL is really a super_admin", adminUser?.role === "super_admin", `role is ${adminUser?.role}`);

// ------------------------------------------- signup PIN endpoint: validation
res = await putPin({ currentPin: PIN, newPin: "12ab" }, admin.cookie);
check("PUT with malformed newPin -> 400", res.status === 400, `got ${res.status}`);
res = await putPin({ currentPin: PIN, newPin: PIN }, admin.cookie);
check("PUT with newPin equal to currentPin -> 400", res.status === 400, `got ${res.status}`);
res = await putPin({ currentPin: PIN, newPin: TEMP_PIN, role: "x" }, admin.cookie);
check("PUT with unknown field -> 400", res.status === 400, `got ${res.status}`);
res = await putPin({ currentPin: wrongPin, newPin: TEMP_PIN }, admin.cookie);
body = await res.json();
check("PUT with wrong currentPin -> 403", res.status === 403 && body.code === "invalid_current_pin", `got ${res.status} ${JSON.stringify(body)}`);
res = await putPin({ newPin: TEMP_PIN }, admin.cookie);
check("PUT without currentPin (PIN already set) -> 400", res.status === 400, `got ${res.status}`);

// ------------------------------------------- change the PIN and prove it took effect
res = await putPin({ currentPin: PIN, newPin: TEMP_PIN }, admin.cookie);
body = await res.json();
check("PUT with correct currentPin -> 200", res.status === 200 && body.ok === true, `got ${res.status} ${JSON.stringify(body)}`);
check("PUT response contains neither a PIN nor a hash", !JSON.stringify(body).includes(PIN) && !JSON.stringify(body).includes(TEMP_PIN) && !/hash|scrypt/i.test(JSON.stringify(body)));

res = await signup({ pin: PIN });
check("old PIN no longer works for signup -> 403", res.status === 403, `got ${res.status}`);
res = await signup({ pin: TEMP_PIN });
check("new PIN works for signup -> 201", res.status === 201, `got ${res.status}`);

// ------------------------------------------- the stored value is a hash (optional: needs MONGODB_URI)
if (process.env.MONGODB_URI) {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const doc = await client.db(process.env.MONGODB_DB ?? "ngo_shivam").collection("settings").findOne({ _id: "signupPin" });
        check("stored PIN is a scrypt hash, not the PIN", typeof doc?.hash === "string" && doc.hash.startsWith("scrypt$") && !doc.hash.includes(TEMP_PIN), JSON.stringify(doc));
    } finally {
        await client.close();
    }
} else {
    console.log("SKIP  stored-hash check (set MONGODB_URI / MONGODB_DB, e.g. with node --env-file=.env.local)");
}

// restore the original PIN so the script can be run again
res = await putPin({ currentPin: TEMP_PIN, newPin: PIN }, admin.cookie);
check("restore the original PIN -> 200", res.status === 200, `got ${res.status}`);

// ------------------------------------------- rate limits (last: they lock things for a while)
let limited = false;
for (let i = 0; i < 8 && !limited; i++) {
    const r = await putPin({ currentPin: wrongPin, newPin: TEMP_PIN }, admin.cookie);
    if (r.status === 429) limited = r.headers.has("retry-after");
}
check("repeated wrong currentPin -> 429 with Retry-After", limited);

limited = false;
for (let i = 0; i < 30 && !limited; i++) {
    const r = await signup({ pin: wrongPin });
    if (r.status === 429) limited = r.headers.has("retry-after");
}
check("repeated wrong signup PIN -> 429 with Retry-After", limited);
res = await signup({ pin: PIN });
check("while limited, even the correct PIN is refused -> 429", res.status === 429, `got ${res.status}`);

console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
