"use client";

import Link from "next/link";
import { IconShieldCheck, IconUserCheck, IconUserOff, IconUsers, IconDeviceDesktop } from "@tabler/icons-react";
import { ADMIN_HOME_PATH, roleLabel } from "@/features/admin/access/policy";
import { useAccess } from "@/features/admin/access/useAccess";
import { useAdminData } from "@/features/admin/api/useAdminData";
import { useAuth } from "@/features/admin/auth/AuthProvider";
import { ErrorBlock, LoadingBlock } from "@/features/admin/ui/DataState";
import PageHeading from "@/features/admin/ui/PageHeading";
import StatCard from "@/features/admin/ui/StatCard";
import { adminCardClass } from "@/features/admin/ui/styles";
import type { Role } from "@/lib/admin/db/models";

type Stats = {
    activeSessions: number;
    users: { total: number; active: number; disabled: number; byRole: Record<Role, number> } | null;
};

/** Landing page of the panel. Every number comes from GET /api/admin/stats (MongoDB). */
export default function Dashboard() {
    const { user } = useAuth();
    const { navItems } = useAccess();
    const stats = useAdminData<Stats>("/api/admin/stats");
    const sections = navItems.filter((item) => item.href !== ADMIN_HOME_PATH);

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <PageHeading
                title="Admin dashboard"
                description={`Welcome, ${user?.name ?? ""}. You are signed in with the ${roleLabel(user?.role)} role.`}
            />

            {stats.state === "loading" && <LoadingBlock label="Loading statistics..." />}
            {stats.state === "error" && <ErrorBlock message={stats.error} onRetry={stats.reload} />}
            {stats.state === "ready" && (
                <section aria-label="Statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.data.users && (
                        <>
                            <StatCard label="Total accounts" value={stats.data.users.total} icon={IconUsers} />
                            <StatCard label="Active accounts" value={stats.data.users.active} icon={IconUserCheck} />
                            <StatCard label="Disabled accounts" value={stats.data.users.disabled} icon={IconUserOff} />
                        </>
                    )}
                    <StatCard label="Your active sessions" value={stats.data.activeSessions} hint="Devices signed in to your account" icon={IconDeviceDesktop} />
                    {stats.data.users && (
                        <StatCard
                            label="Admins"
                            value={stats.data.users.byRole.super_admin + stats.data.users.byRole.admin}
                            hint={`${stats.data.users.byRole.super_admin} Super Admin, ${stats.data.users.byRole.admin} Admin, ${stats.data.users.byRole.editor} Editor`}
                            icon={IconShieldCheck}
                        />
                    )}
                </section>
            )}

            {sections.length > 0 && (
                <section aria-label="Sections" className={adminCardClass}>
                    <h2 className="text-lg font-bold text-brand-dark">Sections you can open</h2>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                </section>
            )}
        </div>
    );
}
