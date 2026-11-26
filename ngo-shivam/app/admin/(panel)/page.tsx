import type { Metadata } from "next";
import AdminHome from "@/features/admin/auth/components/AdminHome";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminDashboardPage() {
    return <AdminHome />;
}
