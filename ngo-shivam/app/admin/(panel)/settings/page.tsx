import type { Metadata } from "next";
import SettingsHub from "@/features/admin/settings/components/SettingsHub";

export const metadata: Metadata = { title: "Settings" };

// The panel renders its pages only after the client-side session check (ProtectedRoute), so they
// cannot be instant navigations. Opts out of Next.js's instant-navigation validation (dev warning).
export const instant = false;

export default function AdminSettingsPage() {
    return <SettingsHub />;
}
