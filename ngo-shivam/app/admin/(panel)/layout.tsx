import ProtectedRoute from "@/features/admin/auth/components/ProtectedRoute";

/**
 * Every page inside this `(panel)` route group requires a signed-in user.
 * Put new admin pages here (app/admin/(panel)/<section>/page.tsx); the group
 * name does not appear in the URL. Public admin pages (login, signup) live
 * OUTSIDE this group on purpose.
 */
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
