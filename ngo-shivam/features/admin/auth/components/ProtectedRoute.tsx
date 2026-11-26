"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { IconAlertCircle } from "@tabler/icons-react";
import { useAuth } from "@/features/admin/auth/AuthProvider";
import AuthLoading from "@/features/admin/auth/components/AuthLoading";
import { buildLoginUrl } from "@/features/admin/auth/redirect";

/**
 * Wrap anything that needs a signed-in user:
 *
 *   <ProtectedRoute>{children}</ProtectedRoute>
 *
 * - loading: shows a loading screen; `children` are NOT rendered yet.
 * - unauthenticated (never signed in, expired, or revoked): redirects to
 *   /admin/login?next=<this page> and renders nothing protected meanwhile.
 * - error (check could not complete): shows a retry screen; it does not sign
 *   the user out, because the session may still be valid.
 * - authenticated: renders `children`.
 *
 * This is a UX layer. Real enforcement is on the server (proxy.ts cookie gate,
 * `withAuth()` on every API route, `getCurrentUser()` for server pages).
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { status, reason, error, refresh } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status !== "unauthenticated") return;
        // After an intentional sign-out nobody wants to come back to this page.
        const next = reason === "signed_out" ? undefined : pathname + window.location.search;
        router.replace(buildLoginUrl({ next, reason: reason ?? undefined }));
    }, [status, reason, pathname, router]);

    if (status === "authenticated") return <>{children}</>;

    if (status === "error") {
        return (
            <main className="flex min-h-screen w-full items-center justify-center bg-brand-light px-4">
                <div role="alert" className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl shadow-primary/10">
                    <IconAlertCircle size={32} aria-hidden className="mx-auto text-destructive" />
                    <h1 className="mt-4 text-xl font-bold text-brand-dark">We could not verify your session</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                    <button
                        type="button"
                        onClick={() => void refresh()}
                        className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    }

    return <AuthLoading label={status === "unauthenticated" ? "Redirecting to sign in..." : "Checking your session..."} />;
}
