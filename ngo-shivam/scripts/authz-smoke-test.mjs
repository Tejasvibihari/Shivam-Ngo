#!/usr/bin/env node
/**
 * End-to-end check of backend authorization (roles and permissions) against a
 * RUNNING server and the MongoDB it uses. Uses Node's built-in fetch and the
 * `mongodb` driver.
 *
 *   BASE_URL=http://localhost:3000 SIGNUP_PIN=123456 \
 *   node --env-file=.env.local scripts/authz-smoke-test.mjs
 *
 * Needs:
 *  - MONGODB_URI / MONGODB_DB pointing at the SAME database as the server
 *    (`--env-file=.env.local` supplies them). The script creates one throw-away
 *    account per role with scripts/dev-seed-user.mjs, changes their role / status
 *    directly in the database to prove the server re-checks on every request, and
 *    reads the audit log. It deletes those accounts and their sessions at the end.
 *  - SIGNUP_PIN (optional): the current signup PIN. Without it the signup checks are skipped.
 *  - TRUST_PROXY unset on the server, and a DEVELOPMENT database only.
 *
 * Nothing here changes the signup PIN or any other setting.
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const PIN = process.env.SIGNUP_PIN;
if (!process.env.MONGODB_URI) {
    console.error("Set MONGODB_URI / MONGODB_DB (e.g. run with: node --env-file=.env.local scripts/authz-smoke-test.mjs).");
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
const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

/* What each role may do, written out independently of the server code (docs/authorization.md). */
const EDITOR = ["admin:access", "content:read", "content:create", "content:update", "media:read", "media:upload"];
const ADMIN = [
    ...EDITOR,
    "content:publish", "content:delete", "media:delete", "submissions:read", "submissions:delete",
    "users:read", "users:create", "users:update", "users:disable", "settings:read", "settings:update",
];
const SUPER_ADMIN = [...ADMIN, "users:change_role", "audit:read", "settings:update_sensitive"];
const EXPECTED = { super_admin: SUPER_ADMIN, admin: ADMIN, editor: EDITOR };

const tag = randomBytes(4).toString("hex");
const PASSWORD = "a-long-test-password-1";
const emailOf = (key) => `authz-test-${tag}-${key}@example.com`;
const accounts = { super_admin: emailOf("super"), admin: emailOf("admin"), editor: emailOf("editor") };

const seed = (email, role, name) =>
    execFileSync(process.execPath, [fileURLToPath(new URL("./dev-seed-user.mjs", import.meta.url)), "--email", email, "--name", name, "--role", role], {
        env: { ...process.env, SEED_PASSWORD: PASSWORD },
        stdio: ["ignore", "pipe", "pipe"],
    });

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB ?? "ngo_shivam");
const users = db.collection("users");
const sessions = db.collection("sessions");
const audit = db.collection("audit_logs");
const settings = db.collection("settings");

const login = async (email) => {
    const res = await send("POST", "/api/admin/auth/login", { email, password: PASSWORD });
    return { status: res.status, cookie: cookieOf(res), body: await res.json() };
};
const putPin = (body, cookie, headers = {}) =>
    send("PUT", "/api/admin/settings/signup-pin", body, { ...(cookie ? { cookie } : {}), ...headers });

try {
    for (const [role, email] of Object.entries(accounts)) seed(email, role, `Authz ${role}`);
    const session = {};
    for (const role of Object.keys(accounts)) {
        session[role] = await login(accounts[role]);
        check(`${role} can sign in`, session[role].status === 200 && session[role].cookie !== "", `got ${session[role].status}`);
    }

    // ------------------------------------------------ no session: default deny
    let res = await send("GET", "/api/admin/auth/me");
    check("GET /me without a cookie -> 401", res.status === 401, `got ${res.status}`);
    res = await putPin({ newPin: "123456" });
    check("PUT signup-pin without a cookie -> 401", res.status === 401, `got ${res.status}`);
    res = await send("GET", "/api/admin/users");
    check("an admin route that does not exist yet is also 401 without a cookie (deny by default)", res.status === 401, `got ${res.status}`);

    const cookieName = session.editor.cookie.split("=")[0];
    const forged = `${cookieName}=${"A".repeat(43)}`;
    res = await send("GET", "/api/admin/auth/me", undefined, { cookie: forged });
    check("forged session cookie on /me -> 401", res.status === 401, `got ${res.status}`);
    res = await putPin({ newPin: "123456" }, forged);
    check("forged session cookie on signup-pin -> 401", res.status === 401, `got ${res.status}`);
    const tampered = session.editor.cookie.slice(0, -2) + (session.editor.cookie.endsWith("AA") ? "BB" : "AA");
    res = await send("GET", "/api/admin/auth/me", undefined, { cookie: tampered });
    check("tampered real session cookie -> 401", res.status === 401, `got ${res.status}`);

    // ------------------------------------------------ /me exposes the role's permissions
    for (const role of ["super_admin", "admin", "editor"]) {
        res = await send("GET", "/api/admin/auth/me", undefined, { cookie: session[role].cookie });
        const body = await res.json();
        check(`GET /me as ${role} -> 200 with role ${role}`, res.status === 200 && body.user?.role === role, `got ${res.status} ${JSON.stringify(body.user)}`);
        check(`${role}: permissions match the matrix`, Array.isArray(body.permissions) && sameSet(body.permissions, EXPECTED[role]), JSON.stringify(body.permissions));
        check(`${role}: /me exposes no password hash`, !JSON.stringify(body).toLowerCase().includes("hash"));
    }

    // ------------------------------------------------ sensitive settings: Super Admin only
    const pinBefore = await settings.findOne({ _id: "signupPin" });
    for (const role of ["editor", "admin"]) {
        res = await putPin({ currentPin: "123456", newPin: "654321" }, session[role].cookie);
        const body = await res.json();
        check(`PUT signup-pin as ${role} -> 403 forbidden`, res.status === 403 && body.code === "forbidden", `got ${res.status} ${JSON.stringify(body)}`);
    }
    res = await putPin("{not json", session.editor.cookie);
    check("403 comes BEFORE body parsing: editor + malformed JSON -> 403 (not 400)", res.status === 403, `got ${res.status}`);
    res = await fetch(`${BASE}/api/admin/settings/signup-pin`, { method: "PUT", headers: { "content-type": "text/plain", cookie: session.editor.cookie }, body: "x" });
    check("403 comes BEFORE content-type check: editor + text/plain -> 403 (not 415)", res.status === 403, `got ${res.status}`);

    res = await putPin({ currentPin: "123456", newPin: "654321", role: "super_admin", permissions: ["settings:update_sensitive"] }, session.editor.cookie);
    check("editor cannot escalate by adding role / permissions to the payload -> 403", res.status === 403, `got ${res.status}`);
    res = await putPin({ currentPin: "123456", newPin: "654321" }, session.editor.cookie, {
        "x-user-role": "super_admin",
        "x-role": "super_admin",
        "x-forwarded-user": "admin",
        "x-middleware-subrequest": "proxy",
        authorization: "Bearer super_admin",
    });
    check("editor cannot escalate with role-like request headers -> 403", res.status === 403, `got ${res.status}`);

    res = await putPin({ newPin: "12" }, session.super_admin.cookie);
    const reached = await res.json();
    check("PUT signup-pin as super_admin passes authorization (reaches validation -> 400)", res.status === 400 && reached.code === "validation_error", `got ${res.status} ${JSON.stringify(reached)}`);
    res = await putPin({ newPin: "123456" }, session.super_admin.cookie, { origin: "https://evil.example" });
    check("PUT signup-pin from a foreign Origin -> 403 bad_origin (even for super_admin)", res.status === 403 && (await res.json()).code === "bad_origin", `got ${res.status}`);

    const pinAfter = await settings.findOne({ _id: "signupPin" });
    check("the stored signup PIN was not touched by any of the above", (pinBefore?.hash ?? null) === (pinAfter?.hash ?? null));

    // ------------------------------------------------ denials are audited (and capped)
    const editorId = (await users.findOne({ email: accounts.editor }))._id;
    const denied = await audit.find({ action: "authz.access_denied", actorId: editorId }).toArray();
    check("denied attempts are in the audit log", denied.length >= 1, `found ${denied.length}`);
    const sample = denied[0];
    check(
        "audit row names route and reason, nothing else",
        sample?.meta?.method === "PUT" &&
            sample?.meta?.path === "/api/admin/settings/signup-pin" &&
            sample?.meta?.reason === "permission:settings:update_sensitive" &&
            sameSet(Object.keys(sample?.meta ?? {}), ["method", "path", "reason"]),
        JSON.stringify(sample?.meta),
    );
    check("audit row never holds the PIN, the body or the cookie", !/123456|654321|ngo_session/.test(JSON.stringify(sample?.meta)));

    for (let i = 0; i < 30; i++) await putPin({ currentPin: "123456", newPin: "654321" }, session.editor.cookie);
    const afterBurst = await audit.countDocuments({ action: "authz.access_denied", actorId: editorId });
    check("a burst of 30 more denials cannot flood the audit log (capped at 20 rows)", afterBurst <= 20 && afterBurst > 0, `rows: ${afterBurst}`);
    res = await putPin({ currentPin: "123456", newPin: "654321" }, session.editor.cookie);
    check("...and the request is still denied once the audit cap is reached -> 403", res.status === 403, `got ${res.status}`);

    // ------------------------------------------------ role / status are re-read on every request
    await users.updateOne({ email: accounts.super_admin }, { $set: { role: "editor" } });
    res = await putPin({ newPin: "12" }, session.super_admin.cookie);
    check("demoting a user in the database takes effect on their EXISTING session -> 403", res.status === 403, `got ${res.status}`);
    res = await send("GET", "/api/admin/auth/me", undefined, { cookie: session.super_admin.cookie });
    check("...they keep admin:access but lose Super Admin permissions on /me", res.status === 200 && sameSet((await res.json()).permissions, EDITOR));

    await users.updateOne({ email: accounts.editor }, { $set: { status: "disabled" } });
    res = await send("GET", "/api/admin/auth/me", undefined, { cookie: session.editor.cookie });
    check("disabling a user locks out their existing session -> 401", res.status === 401, `got ${res.status}`);
    await users.updateOne({ email: accounts.editor }, { $set: { status: "active" } });
    res = await send("GET", "/api/admin/auth/me", undefined, { cookie: session.editor.cookie });
    check("re-enabling does not resurrect the old session -> 401", res.status === 401, `got ${res.status}`);

    // ------------------------------------------------ privilege escalation through payloads (public endpoints)
    res = await send("POST", "/api/admin/auth/login", { email: accounts.admin, password: PASSWORD, role: "super_admin" });
    check("login with an extra `role` field -> 400", res.status === 400, `got ${res.status}`);

    if (!PIN) {
        console.log("SKIP  signup escalation checks (set SIGNUP_PIN to the current signup PIN)");
    } else {
        const signup = (extra = {}) =>
            send("POST", "/api/admin/auth/signup", {
                name: "Authz Signup",
                email: emailOf(`signup-${Math.random().toString(36).slice(2, 8)}`),
                password: PASSWORD,
                pin: PIN,
                ...extra,
            });
        const status = await (await fetch(`${BASE}/api/admin/auth/signup`)).json();
        if (!status.enabled) {
            console.log("SKIP  signup escalation checks (signup is closed: needs a PIN and an active Super Admin)");
        } else {
            for (const extra of [{ role: "super_admin" }, { role: "admin" }, { status: "active" }, { isSuperAdmin: true }, { permissions: ["settings:update_sensitive"] }]) {
                res = await signup(extra);
                check(`signup with valid PIN + ${JSON.stringify(extra)} -> 400, no account`, res.status === 400, `got ${res.status}`);
            }
            const email = emailOf("signup-ok");
            res = await signup({ email });
            const created = await res.json();
            check("signup with valid PIN -> 201 and role editor", res.status === 201 && created.user?.role === "editor", `got ${res.status} ${JSON.stringify(created)}`);
            const stored = await users.findOne({ email });
            check("the stored account has role editor and status active", stored?.role === "editor" && stored?.status === "active", JSON.stringify(stored && { role: stored.role, status: stored.status }));
            check("no account was created by the rejected escalation attempts", (await users.countDocuments({ email: { $regex: `^authz-test-${tag}-signup-` } })) === 1);
            const fresh = await login(email);
            res = await putPin({ currentPin: PIN, newPin: "654321" }, fresh.cookie);
            check("a freshly signed-up account cannot change the signup PIN -> 403", res.status === 403, `got ${res.status}`);
        }
    }
} finally {
    const escaped = `^authz-test-${tag}-`;
    const doomed = await users.find({ email: { $regex: escaped } }, { projection: { _id: 1 } }).toArray();
    await sessions.deleteMany({ userId: { $in: doomed.map((u) => u._id) } });
    await users.deleteMany({ email: { $regex: escaped } });
    await client.close();
}

console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
