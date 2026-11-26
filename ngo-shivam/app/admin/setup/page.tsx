import type { Metadata } from "next";
import SetupForm from "@/features/admin/setup/components/SetupForm";

export const metadata: Metadata = {
    title: "Admin setup",
    // the admin panel is private; keep it out of search results
    robots: { index: false, follow: false },
};

export default function AdminSetupPage() {
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-brand-light px-4 py-12 sm:px-6">
            <SetupForm />
        </main>
    );
}
