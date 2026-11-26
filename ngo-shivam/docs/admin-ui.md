# Admin panel UI (Task 06)

Responsive admin dashboard connected to the real backend. No fake users, statistics or sessions:
every number and row on screen comes from MongoDB through the APIs below.

## Pages

| URL | Who | Component | API used |
|---|---|---|---|
| `/admin/login` | public | `features/admin/auth/components/LoginForm` (existing) | `POST /api/admin/auth/login` |
| `/admin/signup` | public (PIN) | `features/admin/auth/components/SignupForm` (existing) | `GET`/`POST /api/admin/auth/signup` |
| `/admin` | every role | `features/admin/dashboard/components/Dashboard` | `GET /api/admin/stats` |
| `/admin/users` | Admin, Super Admin (`users:read`) | `features/admin/users/components/UsersManagement` | `GET /api/admin/users` |
| `/admin/profile` | every role | `features/admin/profile/components/ProfileSettings` | `PATCH /api/admin/auth/profile`, `PUT /api/admin/auth/password` |
| `/admin/settings` | Admin, Super Admin (`settings:read`) | `features/admin/settings/components/SettingsHub` | none |
| `/admin/settings/signup-pin` | Super Admin only (`settings:update_sensitive`) | `features/admin/settings/components/SignupPinSettings` | `PUT /api/admin/settings/signup-pin` |

Login and signup already existed and follow the same design system; they were left unchanged.

## Components

* `AdminShell` (rewritten): sidebar on large screens, **top bar on every screen size** (page title,
  account menu with Profile settings + Sign out, hamburger that opens the menu on small screens).
* `StatCard`, `PageHeading`, `LoadingBlock` / `ErrorBlock`, `AdminField` / `SecretInput`
  (`features/admin/ui/`), plus shared class strings in `ui/styles.ts`.
* `useAdminData(url)` (loading / ready / error + reload) and `apiRequest()` (`features/admin/api/`).
* `AuthProvider` gained `updateUser()` so the top bar shows a new name immediately after a rename.

## Backend added (needed by the UI; nothing existed for these)

All routes use `withAuth()`, return `Cache-Control: no-store` and never return a password hash.

| Route | Permission | Notes |
|---|---|---|
| `GET /api/admin/users` | `users:read` | Paged (`page`, `pageSize` max 50), filters `q`, `role`, `status`. Filters are validated or regex-escaped. Read only. |
| `GET /api/admin/stats` | `admin:access` | Account counts are included only for roles with `users:read`; others get just their own session count. |
| `PATCH /api/admin/auth/profile` | `admin:access` | Strict schema: only `name`; always the session's own account. |
| `PUT /api/admin/auth/password` | `admin:access` | Needs the current password, rate limited (5 / 15 min), ends all sessions and issues a fresh one. |

New audit actions: `auth.profile_updated`, `auth.password_changed`, `auth.password_change_failed`
(the MongoDB audit validator is rebuilt from `AUDIT_ACTIONS`, as in earlier tasks).

## Access control

* New entries in `ADMIN_ROUTES` (`access/policy.ts`): `/admin/settings/signup-pin` (Super Admin only,
  longer than `/admin/settings` so it overrides it) and `/admin/profile` (every role, reached from the
  account menu, not listed in the sidebar). Tests in `tests/admin-client/access.test.ts` were updated.
* Hiding pages is a convenience; every API call is checked again on the server.

## Not included (no backend exists yet)

Creating, editing, disabling or changing the role of other users from the Users page. The page is
read-only until those APIs are built. The Content, Media, Submissions and Audit pages remain placeholders.
