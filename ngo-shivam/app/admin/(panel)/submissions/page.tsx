import type { Metadata } from "next";
import SubmissionsManagement from "@/features/admin/submissions/components/SubmissionsManagement";

export const metadata: Metadata = { title: "Submissions" };

// The panel renders its pages only after the client-side session check (ProtectedRoute), so they
// cannot be instant navigations. Opts out of Next.js's instant-navigation validation (dev warning).
export const instant = false;

export default function AdminSubmissionsPage() {
    return <SubmissionsManagement />;
}
