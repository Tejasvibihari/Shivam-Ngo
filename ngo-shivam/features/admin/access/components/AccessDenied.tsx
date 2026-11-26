"use client";

import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import { roleLabel } from "@/features/admin/access/policy";
import { useAuth } from "@/features/admin/auth/AuthProvider";

/**
 * "You may not open this page". Used by RoleGuard when a signed-in user lacks
 * the permission, and by the /admin/access-denied page. It deliberately does not
 * say which permission was missing.
 */
export default function AccessDenied() {
    const { user } = useAuth();

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-xl shadow-primary/10 sm:p-10">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <IconLock size={28} aria-hidden />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-brand-dark">Access denied</h1>
            <p role="alert" className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {user
                    ? `Your ${roleLabel(user.role)} account does not have permission to open this page.`
                    : "You do not have permission to open this page."}{" "}
                If you think this is a mistake, please contact a Super Admin.
            </p>
            <Link
                href="/admin"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
            >
                Back to dashboard
            </Link>
        </div>
    );
}
