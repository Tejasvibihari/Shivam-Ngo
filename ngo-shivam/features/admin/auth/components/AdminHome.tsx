"use client";

import Link from "next/link";
import { ADMIN_HOME_PATH, roleLabel } from "@/features/admin/access/policy";
import { useAccess } from "@/features/admin/access/useAccess";
import { useAuth } from "@/features/admin/auth/AuthProvider";

/**
 * Landing page of the admin panel (inside AdminShell, which provides the menu
 * and the sign-out button). It lists the sections the signed-in role may open;
 * real dashboard content comes in later tasks.
 */
export default function AdminHome() {
    const { user } = useAuth();
    const { navItems } = useAccess();
    const sections = navItems.filter((item) => item.href !== ADMIN_HOME_PATH);

    return (
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/10 sm:p-9">
            <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Admin dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{user?.name}</span> ({user?.email}) with the{" "}
                <span className="font-semibold text-foreground">{roleLabel(user?.role)}</span> role.
            </p>

            {sections.length > 0 ? (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {sections.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className="block h-full rounded-2xl border border-border p-4 transition hover:bg-muted focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
                            >
                                <span className="text-sm font-bold text-foreground">{item.label}</span>
                                <span className="mt-1 block text-xs text-muted-foreground">{item.description}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-4 text-sm text-muted-foreground">No admin tools are available for your account.</p>
            )}
        </div>
    );
}
