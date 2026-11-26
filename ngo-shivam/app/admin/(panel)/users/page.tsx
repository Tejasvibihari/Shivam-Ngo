import type { Metadata } from "next";
import UsersManagement from "@/features/admin/users/components/UsersManagement";

export const metadata: Metadata = { title: "Users" };

// The panel renders its pages only after the client-side session check (ProtectedRoute), so they
// cannot be instant navigations. Opts out of Next.js's instant-navigation validation (dev warning).
export const instant = false;

export default function AdminUsersPage() {
    return <UsersManagement />;
}
