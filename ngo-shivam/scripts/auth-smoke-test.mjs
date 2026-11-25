#!/usr/bin/env node
/**
 * End-to-end check of the authentication API against a RUNNING server.
 *
 *   BASE_URL=http://localhost:3000 TEST_EMAIL=admin@example.com TEST_PASSWORD='...' \
 *     node scripts/auth-smoke-test.mjs
 *
 * Uses only Node's built-in fetch. Run it against a development database: the
 * last step deliberately triggers the login rate limit for TEST_EMAIL.
 */
const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;
if (!EMAIL || !PASSWORD) {
    console.error("Set TEST_EMAIL and TEST_PASSWORD (a user created with scripts/dev-seed-user.mjs).");
    process.exit(2);
}

let failures = 0;
const check = (name, ok, extra = "") => {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  ${extra}`}`);
    if (!ok) failures++;
};
const post = (path, body, headers = {}) =>
    fetch(BASE + path, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: typeof body === "string" ? body : JSON.stringify(body),
        redirect: "manual",
    });
const cookieOf = (res) => (res.headers.get("set-cookie") ?? "").split(";")[0];

// 1. unauthenticated access is rejected
let res = await fetch(`${BASE}/api/admin/auth/me`);
check("GET /me without cookie -> 401", res.status === 401, `got ${res.status}`);

// 2. validation
res = await post("/api/admin/auth/login", { email: "not-an-email", password: "x" });
check("login with bad email format -> 400", res.status === 400, `got ${res.status}`);
res = await post("/api/admin/auth/login", { email: EMAIL, password: PASSWORD, role: "super_admin" });
check("login with extra field (role) -> 400", res.status === 400, `got ${res.status}`);
res = await post("/api/admin/auth/login", "{not json");
check("login with malformed JSON -> 400", res.status === 400, `got ${res.status}`);
res = await fetch(`${BASE}/api/admin/auth/login`, { method: "POST", headers: { "content-type": "text/plain" }, body: "x" });
check("login with wrong content-type -> 415", res.status === 415, `got ${res.status}`);

// 3. CSRF: cross-site origin is blocked
res = await post("/api/admin/auth/login", { email: EMAIL, password: PASSWORD }, { origin: "https://evil.example" });
check("login from foreign Origin -> 403", res.status === 403, `got ${res.status}`);

// 4. wrong credentials give one generic answer
const wrong = await post("/api/admin/auth/login", { email: EMAIL, password: "definitely-wrong-password" });
const unknown = await post("/api/admin/auth/login", { email: "nobody-here@example.com", password: "definitely-wrong-password" });
const wrongBody = await wrong.json();
const unknownBody = await unknown.json();
check("wrong password -> 401", wrong.status === 401, `got ${wrong.status}`);
check("unknown email -> 401 with identical body", unknown.status === 401 && wrongBody.error === unknownBody.error && wrongBody.code === unknownBody.code);

// 5. successful login
res = await post("/api/admin/auth/login", { email: EMAIL, password: PASSWORD });
const loginBody = await res.json();
const setCookie = res.headers.get("set-cookie") ?? "";
const cookie = cookieOf(res);
check("login -> 200", res.status === 200, `got ${res.status} ${JSON.stringify(loginBody)}`);
check("cookie is HttpOnly + SameSite=Lax", /httponly/i.test(setCookie) && /samesite=lax/i.test(setCookie), setCookie);
check("response never contains a password hash", !JSON.stringify(loginBody).toLowerCase().includes("hash"));
check("Cache-Control: no-store", (res.headers.get("cache-control") ?? "").includes("no-store"));

// 6. current user
res = await fetch(`${BASE}/api/admin/auth/me`, { headers: { cookie } });
const me = await res.json();
check("GET /me with cookie -> 200 and correct email", res.status === 200 && me.user?.email === EMAIL.toLowerCase(), `got ${res.status}`);
check("/me exposes no passwordHash", me.user && !("passwordHash" in me.user));

// 7. forged cookie
res = await fetch(`${BASE}/api/admin/auth/me`, { headers: { cookie: cookie.split("=")[0] + "=" + "A".repeat(43) } });
check("forged session cookie -> 401", res.status === 401, `got ${res.status}`);

// 8. logout invalidates the session server-side
res = await post("/api/admin/auth/logout", {}, { cookie });
check("logout -> 200", res.status === 200, `got ${res.status}`);
res = await fetch(`${BASE}/api/admin/auth/me`, { headers: { cookie } });
check("old cookie is rejected after logout -> 401", res.status === 401, `got ${res.status}`);

// 9. rate limit (last, because it locks TEST_EMAIL for the rest of the window)
let limited = false;
for (let i = 0; i < 15 && !limited; i++) {
    const r = await post("/api/admin/auth/login", { email: EMAIL, password: `wrong-password-${i}` });
    if (r.status === 429) limited = r.headers.has("retry-after");
}
check("repeated failures -> 429 with Retry-After", limited);

console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
