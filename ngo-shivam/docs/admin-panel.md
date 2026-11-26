# Admin panel: audit, setup and API reference (Task 07)

This is the final audit of the admin panel. It lists what was tested, what was
fixed, how to install and configure it, and the full API. Detailed designs of
each part stay in `authentication.md`, `authorization.md`, `signup-pin.md`,
`mongodb-setup.md`, `admin-frontend-auth.md`, `admin-frontend-rbac.md` and `admin-ui.md`.

## 1. Security audit summary

Scope: everything under `lib/admin`, `app/api/admin`, `app/admin`, `features/admin`,
`proxy.ts` and the admin tests. The public website was not touched.

### Fixed in this task

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | High | **No way to create the first Super Admin in production.** The project required a "secure one-time setup process", and `SETUP_TOKEN`, the `/admin/setup` path, the `setup` settings document and the `setup.super_admin_created` audit action all existed, but no route or page used them. Signup stays closed until a Super Admin exists, and `scripts/dev-seed-user.mjs` refuses to run in production, so a fresh production install could never be used. | New `GET/POST /api/admin/setup` and page `/admin/setup`, see section 5.1. Closed by default, protected by `SETUP_TOKEN` (constant-time compare), rate limited, atomic (fixed `_id` marker), closes for good after use. |
| 2 | Medium | **`GET /api/admin/users` returned one user per page when `pageSize` was omitted.** `Number(null)` is `0`, which was clamped up to the minimum instead of using the default of 20. | Missing or empty `page` / `pageSize` now use the defaults (`app/api/admin/users/route.ts`). |
| 3 | Medium | **No clickjacking / sniffing protection on the admin area.** | `next.config.ts` now sends `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` and `Cache-Control: no-store` for `/admin/*` and `/api/admin/*`. |
| 4 | Low | `.env.example` did not say that `SETUP_TOKEN` needs 32+ characters. | Documented; a short or placeholder token keeps setup closed. |

### Verified as already correct (covered by tests)

- Passwords and the signup PIN are stored only as scrypt hashes; the PIN is first run through HMAC-SHA256 keyed with `AUTH_SECRET`, so a leaked database alone cannot be brute-forced. No API, audit row or log ever contains a PIN, a password, a token or a hash.
- Sessions are opaque 256-bit cookies (`HttpOnly`, `SameSite=Lax`, `Secure` + `__Host-` prefix in production). MongoDB stores only an HMAC of the token. Logout, password change, disabling a user and deleting a user take effect on the next request. Sessions end after 7 days (absolute) or 12 hours without use.
- Login gives one generic answer for wrong password, unknown e-mail and disabled account, spends the same time in all three cases, and is rate limited per e-mail and per IP.
- Every admin API route is wrapped in `withAuth()` (or is on an explicit public list that a test checks against `proxy.ts`). Roles always come from the database, never from the request. Unknown roles and permissions are denied.
- Cross-site state-changing requests are rejected (`Origin` check) on every route.
- Signup cannot choose a role or status (strict schemas), always creates an `editor`, and is closed unless a PIN is configured, a Super Admin exists and `SIGNUP_ENABLED` is not `false`.
- Query-string and JSON inputs are validated with strict schemas; search text is regex-escaped; operator objects (`{"$ne": null}`) never reach MongoDB.

### Recommendations (not changed, need your decision)

1. **Rotate the secrets that were in the ZIP.** The uploaded project contains a `.env` file with values that look real (SMTP password, `AUTH_SECRET`, MongoDB URI, an initial signup PIN). `.gitignore` keeps it out of git, but the ZIP itself carries it. Treat those values as exposed: change the SMTP password, generate a new `AUTH_SECRET` (this invalidates sessions and the stored PIN hash, see `signup-pin.md`), and set a new PIN afterwards. This patch does not modify `.env`. Its `SETUP_TOKEN` is still the placeholder, so `/admin/setup` stays closed until you set a real one.
2. **Remove `SIGNUP_PIN_INITIAL` and `SETUP_TOKEN` from the environment** once the PIN is stored and the Super Admin exists.
3. **Set `TRUST_PROXY=true` only behind a proxy that overwrites `X-Forwarded-For`.** Without it the per-IP limits are off and only per-e-mail and global limits apply.
4. **Lock-out trade-off (by design).** Ten failed logins for one e-mail block that e-mail for 15 minutes, and 20 signup attempts an hour block signup for everyone. An attacker can use this to annoy, not to get in. A Super Admin can clear `rate_limits` in MongoDB.
5. **No full Content-Security-Policy for scripts.** Only `frame-ancestors` is set; a script CSP needs per-request nonces and was not added without being able to run the app.
6. **Not implemented yet (out of scope for the existing tasks):** endpoints that change another user's role or status, and a read API for the audit log. The users page is read-only and the audit page is a placeholder. `authorizeUserChange()` already contains the escalation rules for when they are added, and it is unit tested.

## 2. Test results

Run: `pnpm test:admin` (or the three parts below).

| Suite | Command | Tests | Result |
|---|---|---|---|
| Authentication, unauthorized access, session expiry | `tests/admin-api/auth.test.ts` | 29 | pass |
| Authorization matrix, role escalation, Super Admin PIN change | `tests/admin-api/authz.test.ts` | 34 | pass |
| Signup PIN protection | `tests/admin-api/signup-pin.test.ts` | 17 | pass |
| Input validation | `tests/admin-api/validation.test.ts` | 12 | pass |
| One-time Super Admin setup | `tests/admin-api/setup.test.ts` | 15 | pass |
| `proxy.ts` gate | `tests/admin-api/proxy.test.ts` | 6 | pass |
| Permission matrix (existing) | `pnpm test:authz` (`permissions.test.ts`) | 34 | pass |
| Route guard coverage (existing, updated for setup) | `pnpm test:authz` (`route-guards.test.ts`) | 7 | pass |
| Admin client policy (existing) | `pnpm test:admin-client` | 35 | pass |
| **Total** | | **189** | **189 pass, 0 fail** |

What the new tests do: `pnpm test:admin-api` runs the **real route handlers, auth
code, session code, PIN code, validation and rate limiting** from a plain Node
process. Only the edges are replaced: MongoDB by an in-memory store
(`tests/admin-api/fakes/db-client.ts`) and `next/server` by a thin wrapper over
Node's `Request` / `Response`. Time-based cases (session expiry) edit the stored
timestamps instead of waiting.

Mapping to the Task 07 checklist:

| Check | Where |
|---|---|
| Authentication | `auth.test.ts` "authentication" |
| Authorization | `authz.test.ts` "authorization matrix" (every guarded route x every role) |
| Signup PIN protection | `signup-pin.test.ts` |
| Super Admin permissions | `authz.test.ts` "Super Admin: change the signup PIN" |
| Unauthorized API access | `auth.test.ts` "unauthorized API access", `proxy.test.ts` |
| Role escalation attempts | `authz.test.ts` "role escalation attempts" |
| Input validation | `validation.test.ts`, plus the PIN / signup / setup suites |
| Session expiration | `auth.test.ts` "session expiration" |
| Existing project tests | `permissions`, `route-guards`, `admin-client` suites |

Mutation checks: the key guards were broken on purpose (PIN route permission,
idle and absolute session expiry, strict signup schema, setup token compare and
marker, PIN verification, pagination default) and the suites failed each time.

### Not verified in this audit

These need a machine with dependencies, MongoDB and a browser, and were **not** run:

- `pnpm install`, `pnpm build`, `pnpm lint` and a full `tsc` (the review environment had no network, so `next`, `mongodb` and React were not installed). The changed files were syntax-checked, and the pure modules were type-checked in strict mode.
- A real MongoDB: the `$jsonSchema` validators, TTL indexes and unique indexes are not emulated by the in-memory store.
- The browser pages (`/admin/setup` and the responsive layout) were written but not rendered.
- The existing live smoke tests in `scripts/` (`auth-smoke-test.mjs`, `signup-smoke-test.mjs`, `authz-smoke-test.mjs`) need a running server and database; run them as described in section 6.

## 3. Installation

```bash
pnpm install
cp .env.example .env.local        # then edit the values below
pnpm dev                          # http://localhost:3000
```

Required variables for the admin panel (names only; see `.env.example`):

| Variable | Notes |
|---|---|
| `MONGODB_URI`, `MONGODB_DB` | See section 4. |
| `AUTH_SECRET` | 32+ random characters: `openssl rand -base64 48`. Never reuse a value that was shared. |
| `SETUP_TOKEN` | 32+ random characters: `openssl rand -hex 32`. Needed only until the first Super Admin exists. |
| `SIGNUP_PIN_INITIAL` | Optional, 6 to 12 digits. Alternative: set the first PIN from the panel. |
| `SIGNUP_ENABLED` | Optional kill switch: `false` closes signup. |
| `TRUST_PROXY` | `true` only behind a proxy that overwrites `X-Forwarded-For`. |

### First start

1. Start the app with MongoDB reachable. Collections, validators and indexes are created automatically on first use.
2. Open `/admin/setup`, enter the `SETUP_TOKEN`, a name, an e-mail and a password (12+ characters). This creates the **Super Admin**. The page then shows "Setup is not available" for good.
3. Remove `SETUP_TOKEN` from the environment.
4. Sign in at `/admin/login`, open **Settings > Signup PIN** and set the PIN (or start with `SIGNUP_PIN_INITIAL`). Share the PIN only with people who should be able to sign up at `/admin/signup`; they get the Editor role.

Production notes: serve over HTTPS (the session cookie is `__Host-` + `Secure`),
set `NODE_ENV=production` (the default for `pnpm build` / `pnpm start`), and keep
the environment variables in the hosting panel, not in files.

## 4. MongoDB configuration

- Any MongoDB 6+ (Atlas free tier is enough). Create a database user with **readWrite on the `MONGODB_DB` database only**.
- `MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net` (URL-encode special characters in the password), `MONGODB_DB=ngo_shivam` (letters, digits, `_`, `-`; max 38 characters).
- Local: `docker run -d --name ngo-mongo -p 27017:27017 mongo:7` with `MONGODB_URI=mongodb://127.0.0.1:27017`.
- Allow-list only your server's outbound IP in Atlas.

Collections created on first start (`ensureSchema()`, idempotent, strict `$jsonSchema` validators):

| Collection | Holds | Indexes |
|---|---|---|
| `users` | accounts: name, lower-case e-mail, scrypt hash, role, status | unique `email`; `role+status`; `createdAt` |
| `settings` | `_id: "signupPin"` (hash only) and `_id: "setup"` (one-time marker) | `_id` |
| `sessions` | HMAC of each session token, user, last seen, expiry | TTL on `expiresAt`; `userId` |
| `rate_limits` | login / signup / setup / PIN-change counters | TTL on `expiresAt` |
| `audit_logs` | security events (no secrets) | `createdAt`; `actorId+createdAt`; `action+createdAt` |

The audit validator gained one action, `setup.failed`; existing databases pick
it up on the next start (`collMod`). More in `mongodb-setup.md`.

## 5. API documentation

Base path `/api/admin`. All bodies are JSON (`Content-Type: application/json`, max
4 KB). Every response is `Cache-Control: no-store`. Errors look like
`{ "ok": false, "code": "...", "error": "...", "fieldErrors": { "field": "message" } }`.
State-changing requests from another site are rejected with `403 bad_origin`.
Without a session cookie every non-public route answers `401 unauthenticated`.

Roles: `super_admin` > `admin` > `editor`. The full permission matrix is in `authorization.md`.

| Method and path | Who | Purpose |
|---|---|---|
| `GET /setup` | public | `{ ok, available }` |
| `POST /setup` | public + `SETUP_TOKEN` | create the first Super Admin (once) |
| `POST /auth/login` | public | sign in, sets the session cookie |
| `POST /auth/logout` | public | end the caller's own session |
| `GET /auth/signup` | public | `{ ok, enabled }` |
| `POST /auth/signup` | public + signup PIN | create an Editor account |
| `GET /auth/me` | any role | current user and permissions |
| `PATCH /auth/profile` | any role | change own display name |
| `PUT /auth/password` | any role | change own password (ends all other sessions) |
| `GET /stats` | any role | dashboard counts (account counts only for Admin and Super Admin) |
| `GET /users` | Admin, Super Admin | list accounts (never hashes) |
| `GET /submissions` | Editor, Admin, Super Admin | search and page through website form submissions |
| `GET /submissions/:id/files/:kind` | Editor, Admin, Super Admin | view a submitted photo or download a resume |
| `PUT /settings/signup-pin` | **Super Admin only** | change the signup PIN |

### 5.1 First Super Admin: `POST /api/admin/setup`

```json
{ "setupToken": "<SETUP_TOKEN>", "name": "First Admin", "email": "admin@example.org", "password": "at-least-12-characters" }
```

- `201` `{ "ok": true, "user": { id, name, email, role: "super_admin", status, ... } }` (no session is created; sign in next).
- `400 validation_error` (bad or extra fields; there is no `role` field), `403 invalid_setup_token`, `403 setup_unavailable` (already done, token not configured, or a Super Admin exists), `409 email_taken`, `429 rate_limited`.
- Open only while: `SETUP_TOKEN` is valid, the `setup` marker does not exist and no Super Admin exists. Concurrent requests cannot both succeed.

### 5.2 Login: `POST /api/admin/auth/login`

`{ "email": "...", "password": "..." }` gives `200 { ok, user }` and a `Set-Cookie` session.
`401 invalid_credentials` is the same for every failure; `429` after 10 failures per e-mail or 20 per IP in 15 minutes.

### 5.3 Signup: `POST /api/admin/auth/signup`

`{ "name": "...", "email": "...", "password": "12+ chars", "pin": "123456" }` gives `201 { ok, user }` with `role: "editor"`.
`403 signup_disabled` (closed), `403 invalid_pin`, `409 email_taken` (only after the PIN is proven), `429` (5 per IP per 15 min, 20 per hour overall).

### 5.4 Change the signup PIN: `PUT /api/admin/settings/signup-pin`

```json
{ "currentPin": "123456", "newPin": "654321" }
```

- `200 { ok: true, message: "Signup PIN updated.", updatedAt }`. The response never contains a PIN or hash.
- `401` no session, `403 forbidden` for Admin and Editor (checked before the body is read), `403 invalid_current_pin`, `400 validation_error` (PINs are 6 to 12 digits, new must differ from current, no extra keys), `409 conflict` (changed by someone else at the same time), `429` (5 attempts per 15 minutes).
- `currentPin` is required whenever a PIN is already set. Only when none exists yet can it be omitted to set the first PIN.

### 5.5 Other routes

- `GET /auth/me` -> `{ ok, user, permissions: [...] }`.
- `PATCH /auth/profile` `{ "name": "..." }` -> `{ ok, user }`. Only the signed-in user, only `name`.
- `PUT /auth/password` `{ "currentPassword", "newPassword" }` -> `{ ok, message }` plus a fresh session cookie. `403 invalid_current_password`, `429` after 5 attempts per 15 minutes.
- `GET /stats` -> `{ ok, activeSessions, users: null | { total, active, disabled, byRole } }`.
- `GET /users?page=1&pageSize=20&q=text&role=editor&status=active` -> `{ ok, users, total, page, pageSize }`. Defaults: page 1, 20 per page; `pageSize` max 50; `role` and `status` must be known values.
- `GET /submissions?page=1&pageSize=20&q=text&type=career` -> `{ ok, submissions, total, page, pageSize }`. Types: `contact`, `volunteer`, `career`, `donation`; page size max 50. Any signed-in Editor, Admin or Super Admin may view submissions and uploaded files; only Admin and Super Admin may delete submissions.

### 5.6 Website forms

`POST /api/forms` stores contact, volunteer, career and donation-enquiry submissions in `form_submissions`, then sends an email notification when SMTP is configured. Career applications use `multipart/form-data`: a resume is required (PDF, DOC or DOCX, max 10 MB) and a photo is required (JPG, PNG or WebP, max 5 MB). Files are stored in the `form_uploads` GridFS bucket. The donation form records an enquiry only; it does not process payments.

## 6. Running the checks

```bash
pnpm test:admin            # all of the below
pnpm test:authz            # permission matrix + route guard coverage
pnpm test:admin-client     # frontend access policy
pnpm test:admin-api        # real handlers against an in-memory store (new)
```

With a real MongoDB and a running server you can also run the live smoke tests:

```bash
BASE_URL=http://localhost:3000 TEST_EMAIL=... TEST_PASSWORD=... node scripts/auth-smoke-test.mjs
```

(`signup-smoke-test.mjs` and `authz-smoke-test.mjs` are described in `signup-pin.md` and `authorization.md`.)

## 7. Files changed by this task

New:

- `app/api/admin/setup/route.ts`, `app/admin/setup/page.tsx`
- `features/admin/setup/components/SetupForm.tsx`
- `lib/admin/auth/setup.ts`
- `docs/admin-panel.md`
- `tests/admin-api/` (`register.mjs`, `loader.mjs`, `env.ts`, `helpers.ts`, `routes.ts`, `fakes/*`, `auth.test.ts`, `authz.test.ts`, `signup-pin.test.ts`, `validation.test.ts`, `setup.test.ts`, `proxy.test.ts`)

Modified:

- `app/api/admin/users/route.ts` (pagination default fix)
- `lib/admin/auth/config.ts`, `lib/admin/auth/crypto.ts`, `lib/admin/auth/rate-limit.ts`, `lib/admin/auth/validation.ts`, `lib/admin/db/models.ts` (setup settings, token check, `setup.failed` audit action)
- `proxy.ts` (`/api/admin/setup` is public)
- `next.config.ts` (admin security headers)
- `package.json` (`test:admin-api`, `test:admin`), `.env.example`
- `tests/authz/route-guards.test.ts` (setup routes on the public list)
- `docs/authentication.md`, `docs/signup-pin.md` (setup is no longer "a later task")
