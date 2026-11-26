import type { Metadata } from "next";
import SignupPinSettings from "@/features/admin/settings/components/SignupPinSettings";

export const metadata: Metadata = { title: "Signup PIN" };

// The panel renders its pages only after the client-side session check (ProtectedRoute), so they
// cannot be instant navigations. Opts out of Next.js's instant-navigation validation (dev warning).
export const instant = false;

export default function AdminSignupPinPage() {
    return <SignupPinSettings />;
}
