import type { Metadata } from "next";
import { AuthProvider } from "@/features/admin/auth/AuthProvider";

export const metadata: Metadata = {
    // the admin panel is private; keep every admin page out of search results
    robots: { index: false, follow: false },
};

/** One AuthProvider for the whole admin area (login, signup and the protected panel). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
