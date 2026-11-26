# Admin frontend authentication (Task 05B-1)

Client-side authentication state and protected routes for the admin panel. It
reuses the existing backend routes (`/api/admin/auth/me`, `/login`, `/logout`);
nothing changed on the server. Roles/permissions are NOT interpreted here yet.

## Pieces

| File | Purpose |
|---|---|
| `features/admin/auth/AuthProvider.tsx` | Context + reducer. `useAuth()` gives `status`, `user`, `reason`, `error`, `signIn`, `signOut`, `refresh`, `authFetch`. |
| `features/admin/auth/api.ts` | Typed calls to the existing auth routes. |
| `features/admin/auth/redirect.ts` | `safeAdminPath()` (open-redirect safe `?next=`), `buildLoginUrl()`. |
| `features/admin/auth/components/ProtectedRoute.tsx` | Loading / redirect / retry / render-children gate. |
| `features/admin/auth/components/LoginForm.tsx` | Login form using `useAuth().signIn`. |
| `app/admin/layout.tsx` | Mounts `AuthProvider` for the whole admin area. |
| `app/admin/(panel)/layout.tsx` | Wraps every panel page in `ProtectedRoute`. |

## How to add a protected page

Create it under `app/admin/(panel)/<section>/page.tsx`. Pages outside the
`(panel)` group (login, signup) stay public.

## Behaviour

* State is memory-only (no localStorage / readable cookies); the HttpOnly
  session cookie stays the source of truth. A reload asks `/me` again.
* `loading` -> loading screen; `unauthenticated` -> `/admin/login?next=...`;
  `error` (server/network) -> retry screen, the user is not signed out.
* A 401 from `authFetch`, or from a re-check when the tab regains focus (at
  most once a minute), marks the session expired and redirects with
  `reason=expired`.
* After login the user returns to `next` (validated, only `/admin/...`),
  default `/admin`.

## Testing

```bash
pnpm test:admin-client   # redirect sanitiser unit tests
pnpm test:authz          # existing tests still pass
```

Manual (needs MongoDB; see `docs/authentication.md` to seed a user): open
`/admin/news` signed out -> redirected to login with `next`; sign in -> back
on the requested page; remove the session in MongoDB (or let it expire), then
refocus the tab -> redirected with "session expired"; Sign out -> login page.
