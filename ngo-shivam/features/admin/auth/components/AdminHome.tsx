"use client";

import { useState } from "react";
import { IconLoader2, IconLogout } from "@tabler/icons-react";
import { useAuth } from "@/features/admin/auth/AuthProvider";

/**
 * Placeholder landing page of the admin panel. It exists so the protected area
 * has a first route and shows the auth state working; real dashboard content
 * comes in later tasks.
 */
export default function AdminHome() {
    const { user, signOut } = useAuth();
    const [leaving, setLeaving] = useState(false);
    const [error, setError] = useState("");

    const onSignOut = async () => {
        if (leaving) return;
        setLeaving(true);
        setError("");
        const result = await signOut();
        // On success the state becomes "unauthenticated" and ProtectedRoute redirects to the login page.
        if (!result.ok) {
            setError(result.message);
            setLeaving(false);
        }
    };

    return (
        <main className="min-h-screen w-full bg-brand-light px-4 py-12 sm:px-6">
            <div className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/10 sm:p-9">
                <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Admin dashboard</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Signed in as <span className="font-semibold text-foreground">{user?.name}</span> ({user?.email}).
                </p>
                <p className="mt-4 text-sm text-muted-foreground">Admin tools will appear here.</p>

                <button
                    type="button"
                    onClick={onSignOut}
                    disabled={leaving}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {leaving ? <IconLoader2 size={18} aria-hidden className="animate-spin" /> : <IconLogout size={18} aria-hidden />}
                    {leaving ? "Signing out..." : "Sign out"}
                </button>
                {error && (
                    <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
                        {error}
                    </p>
                )}
            </div>
        </main>
    );
}
