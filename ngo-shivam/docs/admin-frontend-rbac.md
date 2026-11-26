# Admin frontend role-based access control (Task 05B-2)

Decides **which admin pages a signed-in user may open and which menu items they
see**. It sits on top of the frontend auth state (`docs/admin-frontend-auth.md`)
and reuses the backend rules (`docs/authorization.md`); nothing changed on the server.

> This is a UX layer. Hiding a page or a menu item does not protect data: every
> admin API call is still authorised on the server by `withAuth()`. Pages must
> never contain sensitive data themselves; they must load it from a guarded API.

## How it fits together

| File | Purpose |
|---|---|
| `features/admin/access/policy.ts` | Pure logic. `ADMIN_ROUTES` (the page map), `findAdminRoute()`, `canAccessPath()`, `navItemsForRole()`, `isAllowed()`, `roleLabel()`. Decisions go through the backend's `evaluateAccess()`. |
| `features/admin/access/useAccess.ts` | Hook: `role`, `permissions`, `can(...)`, `canAccessPath()`, `navItems`. Reads the user from the existing `useAuth()`; no second copy of auth state. |
| `features/admin/access/components/RoleGuard.tsx` | Reusable guard: `<RoleGuard requirement={{ permission: "users:read" }}>`. |
| `features/admin/access/components/PanelAccessGuard.tsx` | Applies the page map to the current URL for every page in `(panel)`. |
| `features/admin/access/components/AccessDenied.tsx` | The access-denied view (also served at `/admin/access-denied`). |
| `features/admin/access/components/AdminShell.tsx` | Responsive frame (sidebar / mobile menu) with the role-filtered navigation and the Sign out button. |
| `app/admin/(panel)/layout.tsx` | `ProtectedRoute` > `AdminShell` > `PanelAccessGuard`. |

Permissions come from the role with `permissionsForRole()` (the same function
behind `permissions` in `GET /api/admin/auth/me`), so frontend and backend use
one matrix. The role itself is the one already in `AuthProvider` state, which is
re-checked from the server on load and when the tab regains focus, so a role
change applies on the next check.

## Page access and navigation per role

| Page | Needs permission | Super Admin | Admin | Editor |
|---|---|:-:|:-:|:-:|
| `/admin` Dashboard | `admin:access` | Y | Y | Y |
| `/admin/content` Content | `content:read` | Y | Y | Y |
| `/admin/media` Media | `media:read` | Y | Y | Y |
| `/admin/submissions` Submissions | `submissions:read` | Y | Y | |
| `/admin/users` Users | `users:read` | Y | Y | |
| `/admin/audit` Audit log | `audit:read` | Y | | |
| `/admin/settings` Settings | `settings:read` | Y | Y | |
| `/admin/access-denied` | `admin:access` | Y | Y | Y |

The menu shows exactly the "Y" pages of the role (access-denied is never listed):

* **Super Admin:** Dashboard, Content, Media, Submissions, Users, Audit log, Settings
* **Admin:** Dashboard, Content, Media, Submissions, Users, Settings
* **Editor:** Dashboard, Content, Media

Sub-paths use the rule of their section (`/admin/users/123` needs `users:read`).
The content, media, submissions, users, audit and settings screens are
placeholders for later tasks; their access rules already apply.

## Behaviour

* Denied page: the URL stays, the page body is **not rendered**, and the access-denied
  view is shown inside the normal shell (no redirect, so no loops and Back works).
  It does not name the missing permission.
* Fail closed: a page under `(panel)` with no entry in `ADMIN_ROUTES`, an unknown
  role, a path with `..`, `//`, `\` or control characters, or a look-alike such as
  `/admin/users-evil` is denied. A non-existent URL gets the normal 404.
* Not signed in: still handled by `ProtectedRoute` (redirect to login with `next`).

## Adding a page or hiding part of a page

1. Create `app/admin/(panel)/<section>/page.tsx` and add `export const instant = false;` next to
   `metadata` (panel pages render only after the client-side session check, so Next.js's dev-only
   instant-navigation validation must be opted out per page; copy any existing panel page).
2. Add an entry to `ADMIN_ROUTES` (`href`, `label`, `description`, `requirement`, and
   `icon` to list it in the menu). `tests/admin-client/access.test.ts` fails if a page
   has no entry. A sub-page needing more privilege gets its own, longer `href`.
3. Optional, inside a page: `<RoleGuard requirement={{ permission: "settings:update_sensitive" }} fallback={null}>...</RoleGuard>`
   hides one section; `const { can } = useAccess(); can("users:create")` toggles a button.

Still add the matching `withAuth()` permission to the API route that serves the data.

## Testing

```bash
pnpm test:admin-client   # redirect tests + access tests (matrix, fail-closed paths, page map)
pnpm test:authz          # existing backend authorization tests
```

Manual (needs MongoDB; see `docs/authentication.md` to seed users). Sign in as each role:

* Editor: menu has Dashboard, Content, Media. Opening `/admin/users`, `/admin/submissions`,
  `/admin/audit` or `/admin/settings` by URL shows "Access denied".
* Admin: menu adds Submissions, Users, Settings. `/admin/audit` shows "Access denied".
* Super Admin: all seven items; no page is denied.
* Narrow the window below 1024px: the sidebar becomes a top bar with a menu button.
* Sign out from the menu returns to the login page.
