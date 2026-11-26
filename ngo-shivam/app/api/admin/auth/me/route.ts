import { json } from "@/lib/admin/auth/request";
import { withAuth } from "@/lib/admin/auth/guard";
import { permissionsForRole } from "@/lib/admin/auth/permissions";

/**
 * GET /api/admin/auth/me : the signed-in user and what their role may do
 * (401 when there is no valid session, 403 when the role cannot use the admin API).
 *
 * `permissions` is for the UI to show or hide controls. It is only a hint:
 * every API route enforces its own permission on the server.
 */
export const GET = withAuth(
    async (_request, auth) =>
        json({ ok: true as const, user: auth.user, permissions: permissionsForRole(auth.user.role) }),
    { permission: "admin:access" },
);
