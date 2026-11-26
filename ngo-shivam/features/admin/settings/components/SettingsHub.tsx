"use client";

import Link from "next/link";
import { IconChevronRight, IconKey, IconUser } from "@tabler/icons-react";
import { PROFILE_PATH, SIGNUP_PIN_PATH } from "@/features/admin/access/policy";
import { useAccess } from "@/features/admin/access/useAccess";
import PageHeading from "@/features/admin/ui/PageHeading";

/** Settings landing page. A card only appears for roles that may open its target page. */
export default function SettingsHub() {
    const { canAccessPath } = useAccess();
    const items = [
        { href: PROFILE_PATH, title: "Profile settings", text: "Change your name and password.", icon: IconUser },
        { href: SIGNUP_PIN_PATH, title: "Signup PIN", text: "Change the PIN needed to create an account (Super Admin only).", icon: IconKey },
    ].filter((item) => canAccessPath(item.href));

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            <PageHeading title="Settings" description="Account security and sign-up settings." />
            <ul className="grid gap-4 sm:grid-cols-2">
                {items.map(({ href, title, text, icon: Icon }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 transition hover:bg-muted focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
                        >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                <Icon size={20} aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-foreground">{title}</span>
                                <span className="mt-1 block text-xs text-muted-foreground">{text}</span>
                            </span>
                            <IconChevronRight size={18} aria-hidden className="mt-1 text-muted-foreground" />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
