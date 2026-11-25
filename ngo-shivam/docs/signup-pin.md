# PIN-protected signup (Task 04)

Anyone who knows the **signup PIN** can create an admin-panel account. Only a
**Super Admin** can change that PIN. New accounts are always created with the
lowest role (`editor`); roles can never be chosen by the person signing up.

Adds:

| What | Where |
|---|---|
| Signup page | `/admin/signup` (`app/admin/signup/page.tsx`, `features/admin/auth/components/SignupForm.tsx`) |
| Signup API | `GET` + `POST /api/admin/auth/signup` (public, PIN-protected) |
| PIN settings API | `PUT /api/admin/settings/signup-pin` (Super Admin only) |
| PIN service | `lib/admin/auth/signup-pin.ts` |
| Smoke test | `scripts/signup-smoke-test.mjs` |

Nothing else in the database changes. The `settings` collection (already created
by `ensureSchema()`) holds the PIN hash; two audit actions were added
(`auth.signup_failed`, `settings.signup_pin_change_failed`) and the audit-log
validator picks them up automatically on the next start.

## 1. Configuration

| Variable | Required | Purpose |
|---|---|---|
| `AUTH_SECRET`, `MONGODB_URI`, `MONGODB_DB` | yes | As in `docs/authentication.md` and `docs/mongodb-setup.md`. |
| `SIGNUP_PIN_INITIAL` | optional | First PIN, 6 to 12 digits. Hashed and stored in MongoDB the first time it is needed, then **ignored**: a later change through the API is never undone by a restart. Remove it from the hosting panel once the app has started. Invalid values are ignored (and logged). |
| `SIGNUP_ENABLED` | optional | `false` closes signup completely (kill switch). Anything else, or unset, means normal behaviour. |
| `TRUST_PROXY` | optional | `true` only behind a proxy that overwrites `X-Forwarded-For`. Without it the client IP is unknown and only the global signup limit applies. |

If `SIGNUP_PIN_INITIAL` is empty, signup stays closed until a Super Admin sets
the first PIN with the endpoint below (in that one case `currentPin` is not needed).

### When is signup open?

Signup is open only when **all** of these are true; otherwise the form shows
"Signup is closed" and `POST` returns `403 signup_disabled`:

1. `SIGNUP_ENABLED` is not `false`;
2. a PIN is configured (stored hash, or `SIGNUP_PIN_INITIAL` to seed it);
3. an **active Super Admin exists**. Until the first Super Admin has been created
   nobody can sign up, so a fresh deployment cannot be claimed through signup.

The response is the same for every reason, so it does not reveal which one applies.

## 2. Security model

* **PIN storage.** Only a hash is stored (`settings` document `_id: "signupPin"`).
  A 6-digit PIN has just 10^6 values, so a plain hash would be crackable in hours if
  the database leaked. The PIN is therefore first run through HMAC-SHA256 keyed with
  `AUTH_SECRET` (which is *not* in the database) and the result is hashed with scrypt
  (same parameters and format as passwords). The PIN is never logged, audited or
  returned by any endpoint; verification is constant-time.
* **Authorisation.** `PUT /api/admin/settings/signup-pin` uses `withAuth(..., { minRole: "super_admin" })`:
  `401` without a valid session, `403` for `admin` / `editor`. The role is re-read from
  MongoDB on every request. `proxy.ts` only blocks requests that have no session cookie
  at all; it is not the security boundary.
* **No privilege escalation.** The signup schema is strict: sending `role`, `status` or
  any other unknown field is a `400`. The role is the server constant `SIGNUP_DEFAULT_ROLE`
  (`editor`). Signup can never produce a Super Admin.
* **Order of checks** (`POST /signup`): Origin (CSRF) → signup open? → body shape → rate
  limit → **PIN** → create user. The PIN is verified before anything about the e-mail is
  looked up, so "e-mail already registered" is only ever revealed to someone who holds
  the PIN.
* **Rate limiting** (MongoDB-backed, shared by all instances, `429` + `Retry-After`).
  Every attempt that passes validation counts, successful or not:

  | Limit | Key | Default |
  |---|---|---|
  | Signup per IP (needs `TRUST_PROXY=true`) | `signup:ip:<ip>` | 5 per 15 minutes |
  | Signup overall | `signup:global` | 20 per hour |
  | PIN change per Super Admin | `pin-change:user:<id>` | 5 per 15 minutes (cleared on success) |

  The overall limit keeps the PIN safe even when the IP is unknown: about 480 guesses a
  day against at least 10^6 possibilities. Trade-off: someone can deliberately burn the
  20 hourly attempts and delay legitimate signups; they still cannot get in. Values are
  constants in `lib/admin/auth/config.ts`.
* **Concurrency.** The PIN update is compare-and-swap, so two Super Admins changing the
  PIN at the same moment cannot overwrite each other (the loser gets `409`).
* **Audit log.** `auth.signup`, `auth.signup_failed` (`bad_pin` / `email_taken`),
  `settings.signup_pin_changed`, `settings.signup_pin_change_failed`. Never the PIN,
  password, hash or e-mail.
* **No automatic login.** Signup does not create a session; the new user signs in through
  `POST /api/admin/auth/login`.

## 3. API

JSON everywhere, `Cache-Control: no-store`, errors as
`{ "ok": false, "code": "...", "error": "...", "fieldErrors"?: { ... } }`.

### GET `/api/admin/auth/signup` (public)

`200 { "ok": true, "enabled": true | false }`. Lets the form show a closed state. Reveals no secret.

### POST `/api/admin/auth/signup` (public, PIN-protected)

```json
{ "name": "Asha Verma", "email": "asha@example.com", "password": "a-long-password-1", "pin": "123456" }
```

Rules: `name` 2 to 100 characters; `email` valid (stored lower-case, unique); `password`
12 to 128 characters; `pin` 6 to 12 digits. No other fields.

| Status | `code` | Meaning |
|---|---|---|
| 201 | | `{ "ok": true, "user": { id, name, email, role: "editor", status, lastLoginAt, createdAt } }` (no hash, no cookie) |
| 400 | `validation_error` / `invalid_json` | Bad or missing field, unknown field such as `role`, malformed JSON (`fieldErrors` lists fields) |
| 403 | `signup_disabled` | Signup closed (see section 1) |
| 403 | `invalid_pin` | Wrong PIN |
| 403 | `bad_origin` | Cross-site request |
| 409 | `email_taken` | E-mail already registered (only after the PIN was accepted) |
| 413 / 415 | `payload_too_large` / `unsupported_media_type` | Body over 4 KB / not `application/json` |
| 429 | `rate_limited` | Too many attempts; wait `Retry-After` seconds |
| 503 | `database_unavailable` / `not_configured` | MongoDB down / `AUTH_SECRET` missing |

### PUT `/api/admin/settings/signup-pin` (Super Admin only)

```json
{ "currentPin": "123456", "newPin": "654321" }
```

`newPin`: 6 to 12 digits and different from `currentPin`. `currentPin` is required
whenever a PIN is configured; it may be omitted only to set the very first PIN.

| Status | `code` | Meaning |
|---|---|---|
| 200 | | `{ "ok": true, "message": "Signup PIN updated.", "updatedAt": "..." }` (never the PIN or hash) |
| 400 | `validation_error` | Malformed PIN, same PIN, missing `currentPin`, unknown field |
| 401 | `unauthenticated` | No / invalid session |
| 403 | `forbidden` | Signed in but not a Super Admin |
| 403 | `invalid_current_pin` | `currentPin` is wrong |
| 403 | `bad_origin` | Cross-site request |
| 409 | `conflict` | PIN changed by someone else at the same moment; retry |
| 429 | `rate_limited` | More than 5 attempts in 15 minutes |
| 503 | `database_unavailable` / `not_configured` | As above |

```bash
# as a signed-in Super Admin (cookie jar from the login call, see docs/authentication.md)
curl -b jar.txt -X PUT localhost:3000/api/admin/settings/signup-pin \
  -H 'content-type: application/json' \
  -d '{"currentPin":"123456","newPin":"654321"}'
```

## 4. Operations

* **Change the PIN:** use the endpoint above. Tell people the new PIN out of band.
  Existing accounts are unaffected.
* **Close signup:** set `SIGNUP_ENABLED=false` and restart.
* **Forgot the PIN, or `AUTH_SECRET` was rotated** (the stored hash no longer verifies):
  remove the stored hash, then set a new `SIGNUP_PIN_INITIAL` and restart, or set the
  first PIN as a Super Admin (`currentPin` is not needed when no PIN exists):

  ```js
  // mongosh
  db.settings.deleteOne({ _id: "signupPin" })
  ```
* **Unlock rate limits:** `db.rate_limits.deleteMany({})`, or wait for the window to end.

## 5. Testing

Requires MongoDB (`docs/mongodb-setup.md`) and `.env.local` with `MONGODB_URI`,
`MONGODB_DB`, `AUTH_SECRET` and `SIGNUP_PIN_INITIAL=123456`. Leave `TRUST_PROXY` unset
for the automated test.

```bash
pnpm install
pnpm dev                                   # http://localhost:3000

# 1. A Super Admin is required (signup is closed without one). Dev-only seed script:
SEED_PASSWORD='correct-horse-battery-9' node --env-file=.env.local \
  scripts/dev-seed-user.mjs --email admin@example.com --name "Test Admin" --role super_admin

# 2. Automated end-to-end checks (34 assertions)
BASE_URL=http://localhost:3000 TEST_EMAIL=admin@example.com \
TEST_PASSWORD='correct-horse-battery-9' SIGNUP_PIN=123456 \
node --env-file=.env.local scripts/signup-smoke-test.mjs
```

The script covers: signup closed/open status, validation and unknown fields, wrong and
valid PIN, `editor`-only role, duplicate e-mail, no hash/PIN in any response, PUT without
a session (`401`) and as an editor (`403`), wrong/missing/identical PIN (`403`/`400`),
a real PIN change and that the old PIN stops working, the stored value being a scrypt
hash, restoring the PIN, and finally both rate limits. It leaves two `signup-test-*`
editor accounts behind and ends with signup and PIN changes rate-limited; run
`db.rate_limits.deleteMany({})` before running it again.

Manual checks:

1. **Browser.** Open `/admin/signup`. Submit empty (inline errors), then with a wrong PIN
   (`The signup PIN is not correct.`), then with the right one (account created). Check
   it on a phone-width window.
2. **Closed states.** Start the server with `SIGNUP_ENABLED=false`, or against an empty
   database (no Super Admin): the page shows "Signup is closed" and
   `curl -X POST localhost:3000/api/admin/auth/signup ...` returns `403 signup_disabled`.
3. **Per-IP limit.** With `TRUST_PROXY=true`, send six wrong-PIN signups with
   `-H 'x-forwarded-for: 203.0.113.9'`: the sixth returns `429` with `Retry-After`.
4. **Storage.** In `mongosh`: `db.settings.findOne({ _id: "signupPin" })` shows a
   `scrypt$...` hash and no PIN; new users have `role: "editor"`.

### Not part of this task

The `/admin/login` page (the signup success screen links to it), the one-time Super
Admin setup, user/role management and the dashboard are separate tasks. Until the
setup task exists, create the first Super Admin with `scripts/dev-seed-user.mjs`
(development only).
