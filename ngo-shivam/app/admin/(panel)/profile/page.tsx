import type { Metadata } from "next";
import ProfileSettings from "@/features/admin/profile/components/ProfileSettings";

export const metadata: Metadata = { title: "Profile settings" };

// The panel renders its pages only after the client-side session check (ProtectedRoute), so they
// cannot be instant navigations. Opts out of Next.js's instant-navigation validation (dev warning).
export const instant = false;

export default function AdminProfilePage() {
    return <ProfileSettings />;
}
