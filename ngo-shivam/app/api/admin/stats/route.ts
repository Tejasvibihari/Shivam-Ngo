import { withAuth } from "@/lib/admin/auth/guard";
import { json } from "@/lib/admin/auth/request";
import { roleHasPermission } from "@/lib/admin/auth/permissions";
import { sessionsCollection, usersCollection } from "@/lib/admin/db/client";

/**
 * GET /api/admin/stats : counts for the dashboard cards, read from MongoDB.
 *
 * Open to every role that may use the admin API, but the account counts are only
 * included for roles holding `users:read`, so an Editor learns nothing about other accounts.
 * Counts only; no personal data.
 */
export const GET = withAuth(
    async (_request, auth) => {
        const mine = { ok: true as const, activeSessions: 0 };
        const now = new Date();
        const sessions = await sessionsCollection();
        mine.activeSessions = await sessions.countDocuments({ userId: auth.userId, expiresAt: { $gt: now } });

        if (!roleHasPermission(auth.user.role, "users:read")) return json({ ...mine, users: null });

        const users = await usersCollection();
        const [total, active, disabled, superAdmins, admins, editors] = await Promise.all([
            users.countDocuments({}),
            users.countDocuments({ status: "active" }),
            users.countDocuments({ status: "disabled" }),
            users.countDocuments({ role: "super_admin" }),
            users.countDocuments({ role: "admin" }),
            users.countDocuments({ role: "editor" }),
        ]);
        return json({ ...mine, users: { total, active, disabled, byRole: { super_admin: superAdmins, admin: admins, editor: editors } } });
    },
    { permission: "admin:access" },
);
