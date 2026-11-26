"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    IconArticle,
    IconHistory,
    IconInbox,
    IconLayoutDashboard,
    IconLoader2,
    IconLogout,
    IconMenu2,
    IconPhoto,
    IconSettings,
    IconUsers,
    IconX,
} from "@tabler/icons-react";
import { findAdminRoute, roleLabel, type NavIcon } from "@/features/admin/access/policy";
import { useAccess } from "@/features/admin/access/useAccess";
import { useAuth } from "@/features/admin/auth/AuthProvider";

const ICONS: Record<NavIcon, typeof IconUsers> = {
    dashboard: IconLayoutDashboard,
    content: IconArticle,
    media: IconPhoto,
    submissions: IconInbox,
    users: IconUsers,
    audit: IconHistory,
    settings: IconSettings,
};

function NavList({ onNavigate }: { onNavigate?: () => void }) {
    const { navItems } = useAccess();
    const current = findAdminRoute(usePathname());

    return (
        <ul className="space-y-1">
            {navItems.map((item) => {
                const Icon = item.icon ? ICONS[item.icon] : IconLayoutDashboard;
                const active = current?.href === item.href;
                return (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            onClick={onNavigate}
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none ${
                                active ? "bg-primary/15 text-primary" : "text-foreground hover:bg-muted"
                            }`}
                        >
                            <Icon size={20} aria-hidden />
                            {item.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

function AccountBox() {
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
        <div className="border-t border-border pt-4">
            <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            <p className="mt-2 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                {roleLabel(user?.role)}
            </p>
            <button
                type="button"
                onClick={onSignOut}
                disabled={leaving}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
            >
                {leaving ? <IconLoader2 size={18} aria-hidden className="animate-spin" /> : <IconLogout size={18} aria-hidden />}
                {leaving ? "Signing out..." : "Sign out"}
            </button>
            {error && (
                <p role="alert" className="mt-2 text-xs font-semibold text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

/**
 * Frame of every admin page: a sidebar on large screens, a top bar with a
 * collapsible menu on small ones. The menu comes from useAccess(), so each role
 * sees only the pages it may open. Render it inside <ProtectedRoute>.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-brand-light lg:flex">
            <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-card p-4 lg:flex lg:min-h-screen">
                <nav aria-label="Admin navigation">
                    <p className="px-3 pb-4 pt-2 text-lg font-bold tracking-tight text-brand-dark">Admin panel</p>
                    <NavList />
                </nav>
                <AccountBox />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="border-b border-border bg-card px-4 py-3 lg:hidden">
                    <div className="flex items-center justify-between">
                        <p className="text-base font-bold tracking-tight text-brand-dark">Admin panel</p>
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-controls="admin-mobile-menu"
                            aria-label={open ? "Close menu" : "Open menu"}
                            className="flex size-10 items-center justify-center rounded-lg text-foreground transition hover:bg-muted focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
                        >
                            {open ? <IconX size={22} aria-hidden /> : <IconMenu2 size={22} aria-hidden />}
                        </button>
                    </div>
                    {open && (
                        <nav id="admin-mobile-menu" aria-label="Admin navigation" className="mt-3 space-y-4">
                            <NavList onNavigate={() => setOpen(false)} />
                            <AccountBox />
                        </nav>
                    )}
                </header>

                <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
            </div>
        </div>
    );
}
