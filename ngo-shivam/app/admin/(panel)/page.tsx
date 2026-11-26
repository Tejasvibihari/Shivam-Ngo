import type { Metadata } from "next";
import Dashboard from "@/features/admin/dashboard/components/Dashboard";

export const metadata: Metadata = { title: "Admin dashboard" };

// The panel renders its pages only after the client-side session check (ProtectedRoute), so they
// cannot be instant navigations. Opts out of Next.js's instant-navigation validation (dev warning).
export const instant = false;

export default function AdminDashboardPage() {
    return <Dashboard />;
}
