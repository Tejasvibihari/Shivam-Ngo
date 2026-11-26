# Authorization / role-based access control (Task 05A)

Backend-only. Decides **what a signed-in admin user may do**; who they are is
handled by `docs/authentication.md`. There is no frontend route protection or
dashboard here (later tasks). Everything below is enforced by the API on the
server, so a hidden button or a hand-edited request gets no extra power.

| What | Where |
|---|---|
| Roles, permissions, the matrix, role-assignment rules | `lib/admin/auth/permissions.ts` (pure, no I/O) |
| Middleware `withAuth(handler, requirement)`, `requirePermission()` | `lib/admin/auth/guard.ts` |
| Unit tests (no database) | `tests/authz/*.test.ts`, run with `pnpm test:authz` |
| Live end-to-end test | `scripts/authz-smoke-test.mjs` |

## 1. Roles and permissions

Roles (unchanged, highest first): `super_admin` > `admin` > `editor`.
A permission is `resource:action`. **Y** = granted. Grants are explicit, not
inherited, so a new permission is denied to everyone until it is added to the
matrix on purpose.

| Permission | Super Admin | Admin | Editor |
|---|:-:|:-:|:-:|
| `admin:access` (use the admin API at all) | Y | Y | Y |
| `content:read` / `content:create` / `content:update` | Y | Y | Y |
| `content:publish` / `content:delete` | Y | Y | |
| `media:read` / `media:upload` | Y | Y | Y |
| `media:delete` | Y | Y | |
| `submissions:read` / `submissions:delete` (form data, personal) | Y | Y | |
| `users:read` / `users:create` / `users:update` / `users:disable` | Y | Y | |
| `users:change_role` | Y | | |
| `audit:read` | Y | | |
| `settings:read` / `settings:update` (non-sensitive) | Y | Y | |
| `settings:update_sensitive` (signup PIN, ...) | Y | | |

Most of these guard features that do not exist yet (content, media, submissions,
user management). They are defined now so later tasks reuse one matrix instead of
inventing rules. To change a grant, edit `PERMISSION_GRANTS`; `permissions.test.ts`
contains a hand-written copy of the matrix and fails until both agree.

### Who may grant or manage which role

| Acting role | May give / manage these roles |
|---|---|
| Super Admin | `super_admin`, `admin`, `editor` |
| Admin | `editor` only |
| Editor | none |

Rules enforced by `authorizeUserChange()` / `authorizeUserCreate()` (to be called by
every future user-management route): nobody can grant or touch a role above their
own; an Admin cannot touch other Admins or Super Admins; **nobody can change their own
role or status** (no self-promotion, no self-lockout); changing roles needs
`users:change_role` (Super Admin only). These functions cannot see the database, so
the route must also refuse to demote or disable the **last active Super Admin**.

## 2. How a request is authorised

`withAuth(handler, requirement)` runs, in this order:

1. unsafe method + foreign `Origin` -> `403 bad_origin`;
2. valid session, user re-read from MongoDB (disabled user, expired or unknown
   session) -> else `401 unauthenticated`;
3. role/permission check -> else `403 forbidden` and an audit row;
4. your handler. **The body is not read before step 3.**

* The requirement is mandatory: `{ permission: "..." }`, `{ permission: [a, b] }`
  (needs all) or `{ minRole: "admin" }`. The type forbids an empty one and the run
  time refuses it (a route that demands nothing is denied, not allowed).
* The role always comes from the database row, on every request. Nothing in the body,
  query, headers or cookie value can name a role or permission. A user whose stored
  role is invalid has no permissions.
* `proxy.ts` is unchanged: it only rejects requests without any session cookie. It is
  not the security boundary.
* Denials are written to `audit_logs` as `authz.access_denied` (actor, method, path,
  reason; never body, query, cookie or PIN), at most 20 rows per user per 15 minutes
  so a signed-in user cannot flood the log. The request is denied either way.
* For a check that depends on the request (for example the target user), use
  `requirePermission(request, auth, "users:disable")` inside the handler.

## 3. Admin API endpoints

| Endpoint | Protection |
|---|---|
| `GET /api/admin/auth/me` | **Protected**: `admin:access`. Response now also has `permissions` (the role's list) for the UI |
| `PUT /api/admin/settings/signup-pin` | **Protected**: `settings:update_sensitive` (Super Admin only). Was `minRole: "super_admin"` |
| `POST /api/admin/auth/login` | Public: email + password, rate limited |
| `POST /api/admin/auth/logout` | Public: idempotent, ends only the caller's own session |
| `GET /api/admin/auth/signup` | Public: returns only `{ enabled }` |
| `POST /api/admin/auth/signup` | Public, signup-PIN protected, role fixed to `editor` |
| any other `/api/admin/*` path | `401` without a session cookie (`proxy.ts`), and a route cannot be added without `withAuth` (see `tests/authz/route-guards.test.ts`) |

### Privilege escalation

* Public signup always creates an `editor`: the role is a server constant, the input
  schema is strict (`role`, `status`, `permissions`, any unknown key -> `400`), and
  `assertSelfRegistrationRole()` throws before the insert if the constant is ever
  changed to anything but a self-registration role (`editor`).
* `newUserInputSchema` (models.ts) validates shape only; a route using it must call
  `authorizeUserCreate()` or an Admin could send `"role": "super_admin"`.
* Rules for new routes: parse bodies with `z.strictObject`, never copy request fields
  into a user document, and send every role/status change through `authorizeUserChange()`.

## 4. Data and configuration

No new environment variables and no migration. One new audit action,
`authz.access_denied`, is added to the `audit_logs` validator, which `ensureSchema()`
refreshes on the next server start.

## 5. Testing

```bash
# Unit tests: no database, no server (Node 20.11+; run on 22)
pnpm test:authz
```

Covers the matrix, fail-closed behaviour for unknown roles/permissions, access
evaluation, role-assignment and privilege-escalation rules, signup role, and that
every `app/api/admin/**/route.ts` handler is guarded or on the explicit public list
(and that list matches `proxy.ts`).

```bash
# Live test: needs MongoDB, .env.local, and `pnpm dev` running
SIGNUP_PIN=123456 node --env-file=.env.local scripts/authz-smoke-test.mjs
```

It creates a throw-away Super Admin / Admin / Editor, then checks: no/forged/tampered
cookie -> `401`; each role's `/me` permissions; the signup-PIN endpoint as each role
(`403` before the body is parsed, `200/400` for Super Admin); role/header/payload
escalation attempts; the audit log and its cap; that demoting or disabling a user in
the database hits their existing session immediately; and the signup escalation
attempts. It deletes its users afterwards and never changes the signup PIN.
The existing `scripts/auth-smoke-test.mjs` and `scripts/signup-smoke-test.mjs` still
pass unchanged.
