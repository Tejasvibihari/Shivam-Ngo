"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
    IconArticle,
    IconChevronDown,
    IconHistory,
    IconInbox,
    IconLayoutDashboard,
    IconLoader2,
    IconLogout,
    IconMenu2,
    IconPhoto,
    IconSettings,
    IconUser,
    IconUsers,
    IconX,
} from "@tabler/icons-react";
import { findAdminRoute, PROFILE_PATH, roleLabel, type NavIcon } from "@/features/admin/access/policy";
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
    // "Signup PIN" lives under Settings, so Settings stays highlighted there.
    const activeHref = current?.icon ? current.href : navItems.find((i) => current?.href.startsWith(`${i.href}/`))?.href;

    return (
        <ul className="space-y-1">
            {navItems.map((item) => {
                const Icon = item.icon ? ICONS[item.icon] : IconLayoutDashboard;
                const active = activeHref === item.href;
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

/** Sign-out button + the error it may show. */
function SignOutButton({ className }: { className: string }) {
    const { signOut } = useAuth();
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
        <>
            <button type="button" onClick={onSignOut} disabled={leaving} className={className}>
                {leaving ? <IconLoader2 size={18} aria-hidden className="animate-spin" /> : <IconLogout size={18} aria-hidden />}
                {leaving ? "Signing out..." : "Sign out"}
            </button>
            {error && (
                <p role="alert" className="px-3 pb-2 text-xs font-semibold text-destructive">
                    {error}
                </p>
            )}
        </>
    );
}

/** Account menu in the top bar: who is signed in, link to the profile page, sign out. */
function UserMenu() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    useEffect(() => {
        if (!open) return;
        const onPointer = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const initial = (user?.name?.trim().charAt(0) || "?").toUpperCase();

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={menuId}
                aria-haspopup="true"
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 transition hover:bg-muted focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
            >
                <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {initial}
                </span>
                <span className="hidden max-w-40 truncate text-sm font-semibold text-foreground sm:block">{user?.name}</span>
                <IconChevronDown size={16} aria-hidden className="text-muted-foreground" />
            </button>

            {open && (
                <div id={menuId} className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary/10">
                    <div className="px-3 py-2">
                        <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                        <p className="mt-2 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">{roleLabel(user?.role)}</p>
                    </div>
                    <div className="mt-1 border-t border-border pt-1">
                        <Link
                            href={PROFILE_PATH}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
                        >
                            <IconUser size={18} aria-hidden />
                            Profile settings
                        </Link>
                        <SignOutButton className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70" />
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Frame of every admin page: a sidebar on large screens, and a top bar on every screen size
 * (page title, account menu, and on small screens the button that opens the collapsible menu).
 * The menu comes from useAccess(), so each role sees only the pages it may open.
 * Render it inside <ProtectedRoute>.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const route = findAdminRoute(usePathname());

    return (
        <div className="min-h-screen w-full bg-brand-light lg:flex">
            <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-4 lg:block">
                <nav aria-label="Admin navigation" className="sticky top-4">
                    <p className="px-3 pb-4 pt-2 text-lg font-bold tracking-tight text-brand-dark">Admin panel</p>
                    <NavList />
                </nav>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setOpen((v) => !v)}
                                aria-expanded={open}
                                aria-controls="admin-mobile-menu"
                                aria-label={open ? "Close menu" : "Open menu"}
                                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground transition hover:bg-muted focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none lg:hidden"
                            >
                                {open ? <IconX size={22} aria-hidden /> : <IconMenu2 size={22} aria-hidden />}
                            </button>
                            <p className="truncate text-base font-bold tracking-tight text-brand-dark">{route?.label ?? "Admin panel"}</p>
                        </div>
                        <UserMenu />
                    </div>
                    {open && (
                        <nav id="admin-mobile-menu" aria-label="Admin navigation" className="mt-3 border-t border-border pt-3 lg:hidden">
                            <NavList onNavigate={() => setOpen(false)} />
                        </nav>
                    )}
                </header>

                <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
            </div>
        </div>
    );
}
