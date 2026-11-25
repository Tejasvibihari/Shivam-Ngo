# Authentication (Task 03)

Email + password login for the admin panel, with server-side sessions, rate
limiting and a reusable authentication middleware. Signup, the one-time Super
Admin setup and the signup PIN are separate tasks and are **not** part of this
patch: there is deliberately no endpoint that creates users or assigns roles.

## 1. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI`, `MONGODB_DB` | yes | See `docs/mongodb-setup.md`. |
| `AUTH_SECRET` | yes | 32+ random characters (`openssl rand -base64 48`). Used to HMAC session tokens and rate-limit keys. Rotating it signs everyone out. |
| `TRUST_PROXY` | optional | `true` only behind a reverse proxy / CDN that overwrites `X-Forwarded-For`. Without it the client IP is unknown, so the per-IP login limit is skipped (the per-email limit always applies). |

## 2. How it works

* **Passwords**: scrypt (`N=2^15, r=8, p=3`, random 16-byte salt), stored as
  `scrypt$N$r$p$salt$hash`. Compared in constant time. Hashes are upgraded
  automatically at login when the parameters are raised. Plaintext is never
  stored or logged.
* **Sessions**: on login the server creates 256 random bits, sets them in an
  `HttpOnly; SameSite=Lax` cookie (`__Host-ngo_session` + `Secure` in
  production, `ngo_session` in development) and stores only an HMAC of the token
  in the `sessions` collection. Limits: 7 days absolute, 12 hours idle.
  Logout deletes the row, so the cookie stops working immediately. A disabled
  user is rejected on their next request.
* **Rate limiting** (MongoDB, shared across instances, 15-minute window):
  20 login attempts per IP and 10 per e-mail address. A successful login clears
  that e-mail's counter. Exceeding a limit returns `429` + `Retry-After`.
  Trade-off: someone who knows an e-mail address can lock that address out for
  up to 15 minutes by failing deliberately; this is the usual price of
  per-account throttling and does not reveal whether the account exists.
* **No user enumeration**: unknown e-mail, wrong password and disabled account
  all return the same `401` body, and the unknown-e-mail path performs a
  dummy hash so timing is similar.
* **CSRF**: state-changing requests with a foreign `Origin` are rejected (`403`),
  in addition to `SameSite=Lax`.
* **Validation** (zod, strict): unknown fields such as `role` are rejected, so
  roles cannot be supplied through authentication input.
* **Audit log**: `auth.login_success`, `auth.login_failed` (with a reason, never
  the e-mail or password) and `auth.logout`.
* **`proxy.ts`** is only a first gate: it returns `401` / redirects to
  `/admin/login` when there is no session cookie. It cannot know if the session
  is valid, so every route still validates with `withAuth()` and every admin
  page must call `getCurrentUser()`.

## 3. API

All responses are JSON with `Cache-Control: no-store`. Errors look like
`{ "ok": false, "code": "...", "error": "human message", "fieldErrors"?: {...} }`.

### POST `/api/admin/auth/login` (public)

```json
{ "email": "admin@example.com", "password": "..." }
```

| Status | `code` | Meaning |
|---|---|---|
| 200 | | `{ "ok": true, "user": { id, name, email, role, status, lastLoginAt, createdAt } }` and `Set-Cookie` |
| 400 | `validation_error` / `invalid_json` | Bad email format, missing password, unknown field, malformed JSON (`fieldErrors` lists the fields) |
| 401 | `invalid_credentials` | Wrong email/password or disabled account (identical response) |
| 403 | `bad_origin` | Cross-site request |
| 413 / 415 | `payload_too_large` / `unsupported_media_type` | Body over 4 KB / not `application/json` |
| 429 | `rate_limited` | Too many attempts; see `Retry-After` (seconds) |
| 503 | `database_unavailable` / `not_configured` | MongoDB down or `AUTH_SECRET` missing |

### POST `/api/admin/auth/logout`

No body. Deletes the session and clears the cookie. Always `200 { "ok": true }`
(idempotent, also without a session).

### GET `/api/admin/auth/me`

`200 { "ok": true, "user": {...} }`, or `401 unauthenticated`. The user never
includes the password hash.

### Protecting other routes

```ts
import { withAuth } from "@/lib/admin/auth/guard";
import { json } from "@/lib/admin/auth/request";

// any signed-in user
export const GET = withAuth(async (_req, auth) => json({ ok: true, role: auth.user.role }));

// Super Admin only (e.g. PUT /api/admin/settings/signup-pin in a later task)
export const PUT = withAuth(async (req, auth) => { /* ... */ }, { minRole: "super_admin" });
```

`withAuth` checks Origin (unsafe methods), the session, and the role
(`401` / `403`), and converts thrown errors into safe `500`/`503` responses.
Admin pages (Server Components) use `getCurrentUser()` from the same module.

## 4. Data added

New collection `sessions` (validator + TTL index on `expiresAt`, created
automatically by `ensureSchema()` on first start; no manual migration).

## 5. Testing

Requires MongoDB (see `docs/mongodb-setup.md`) and `.env.local` with
`MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`.

```bash
pnpm install
pnpm dev                       # http://localhost:3000

# 1. Create a throw-away user (dev only; refuses NODE_ENV=production).
#    The real first Super Admin is created by the one-time setup task later.
SEED_PASSWORD='correct-horse-battery-9' node --env-file=.env.local \
  scripts/dev-seed-user.mjs --email admin@example.com --name "Test Admin" --role super_admin

# 2. Automated end-to-end checks (18 assertions)
BASE_URL=http://localhost:3000 TEST_EMAIL=admin@example.com \
TEST_PASSWORD='correct-horse-battery-9' node scripts/auth-smoke-test.mjs
```

The smoke test ends by triggering the rate limit for that e-mail. To unlock it:
`db.rate_limits.deleteMany({})` in `mongosh`, or wait 15 minutes.

Manual checks with curl:

```bash
curl -i -c jar.txt -X POST localhost:3000/api/admin/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@example.com","password":"correct-horse-battery-9"}'
curl -b jar.txt localhost:3000/api/admin/auth/me
curl -b jar.txt -X POST localhost:3000/api/admin/auth/logout
curl -b jar.txt localhost:3000/api/admin/auth/me      # 401 now
```

In `mongosh` confirm nothing sensitive is stored: `users.passwordHash` starts
with `scrypt$`, `sessions._id` is a 64-character hex HMAC (not the cookie
value), and `rate_limits._id` contains no e-mail address.

Production note: the cookie is `Secure`, so browsers only keep it over HTTPS
(or `localhost`). Test with `pnpm dev` or behind HTTPS.
