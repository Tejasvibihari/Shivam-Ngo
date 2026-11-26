import AdminShell from "@/features/admin/access/components/AdminShell";
import PanelAccessGuard from "@/features/admin/access/components/PanelAccessGuard";
import ProtectedRoute from "@/features/admin/auth/components/ProtectedRoute";

/**
 * Every page inside this `(panel)` route group requires a signed-in user
 * (ProtectedRoute) and a role that may open that page (PanelAccessGuard, driven
 * by the page map in features/admin/access/policy.ts; add an entry there for every
 * new page). AdminShell is the frame with the role-filtered menu.
 * Put new admin pages here (app/admin/(panel)/<section>/page.tsx); the group
 * name does not appear in the URL. Public admin pages (login, signup) live
 * OUTSIDE this group on purpose.
 */
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <AdminShell>
                <PanelAccessGuard>{children}</PanelAccessGuard>
            </AdminShell>
        </ProtectedRoute>
    );
}
