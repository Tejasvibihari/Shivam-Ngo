import type { Metadata } from "next";
import SignupForm from "@/features/admin/auth/components/SignupForm";

export const metadata: Metadata = {
    title: "Admin sign up",
    // the admin panel is private; keep it out of search results
    robots: { index: false, follow: false },
};

export default function AdminSignupPage() {
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-brand-light px-4 py-12 sm:px-6">
            <SignupForm />
        </main>
    );
}
