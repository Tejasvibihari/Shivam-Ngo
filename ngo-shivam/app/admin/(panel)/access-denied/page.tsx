import type { Metadata } from "next";
import AccessDenied from "@/features/admin/access/components/AccessDenied";

export const metadata: Metadata = { title: "Access denied" };

// The panel renders its pages only after the client-side session check (ProtectedRoute), so they
// cannot be instant navigations. Opts out of Next.js's instant-navigation validation (dev warning).
export const instant = false;

export default function AdminAccessDeniedPage() {
    return <AccessDenied />;
}
