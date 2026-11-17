"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
    IconCopy,
    IconCoinRupee,
    IconHeartHandshake,
    IconMail,
    IconPhone,
    IconShare3,
} from "@tabler/icons-react";
import { useState } from "react";
import { CONTACT } from "@/lib/org";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Support Our Work",
    title: "Your support keeps our work going",
    intro:
        "Every contribution, big or small, helps us continue our sanitation, education, training and health-awareness work in the community.",
};

/**
 * Add the organisation's REAL payment details here once they are verified.
 * Anything left out is simply not shown, so nothing is invented.
 * Example:  { upiId: "name@bank", accountName: "...", accountNumber: "...", ifsc: "...", bankName: "..." }
 */
const PAYMENT: {
    upiId?: string;
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
} = {};

const WAYS = [
    {
        title: "Donate",
        description: "Contribute towards our projects and programmes.",
        icon: IconCoinRupee,
    },
    {
        title: "Volunteer",
        description: "Give your time and skills on the ground.",
        icon: IconHeartHandshake,
        href: "#volunteer",
        cta: "Become a volunteer",
    },
    {
        title: "Spread the word",
        description: "Tell friends and family about our work.",
        icon: IconShare3,
    },
];

const POLICY = { label: "Read our Donation Policy", href: "/donation-policy" };
/* ===================================================================== */

function CopyRow({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard not available: the value is still visible to copy by hand */
        }
    };
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3">
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                    {label}
                </p>
                <p className="mt-0.5 break-all text-sm font-semibold">{value}</p>
            </div>
            <button
                type="button"
                onClick={copy}
                aria-label={`Copy ${label}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold transition hover:bg-white/25"
            >
                <IconCopy size={14} aria-hidden />
                {copied ? "Copied" : "Copy"}
            </button>
        </div>
    );
}

export default function DonateSection() {
    const rows: { label: string; value?: string }[] = [
        { label: "UPI ID", value: PAYMENT.upiId },
        { label: "Account name", value: PAYMENT.accountName },
        { label: "Bank", value: PAYMENT.bankName },
        { label: "Account number", value: PAYMENT.accountNumber },
        { label: "IFSC", value: PAYMENT.ifsc },
    ];
    const shown = rows.filter((r) => r.value) as { label: string; value: string }[];

    return (
        <section
            id="donate"
            className="relative isolate w-full overflow-hidden bg-gradient-to-br from-primary to-brand-dark px-6 py-24 text-primary-foreground sm:py-28"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-cta/25 blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-24 -z-10 size-96 rounded-full bg-white/10 blur-3xl"
            />

            <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
                <motion.div
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                        {SECTION.eyebrow}
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                        {SECTION.title}
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
                        {SECTION.intro}
                    </p>

                    <ul className="mt-8 space-y-4">
                        {WAYS.map((way) => {
                            const Icon = way.icon;
                            return (
                                <li key={way.title} className="flex items-start gap-4">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                        <Icon size={22} aria-hidden />
                                    </span>
                                    <div>
                                        <p className="font-bold">{way.title}</p>
                                        <p className="text-sm text-white/75">
                                            {way.description}
                                            {way.href && (
                                                <>
                                                    {" "}
                                                    <a
                                                        href={way.href}
                                                        className="font-semibold underline underline-offset-4 hover:text-cta"
                                                    >
                                                        {way.cta}
                                                    </a>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="rounded-3xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-sm sm:p-9"
                >
                    <h3 className="text-xl font-bold">How to donate</h3>

                    {shown.length > 0 ? (
                        <div className="mt-5 space-y-3">
                            {shown.map((r) => (
                                <CopyRow key={r.label} label={r.label} value={r.value} />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm leading-relaxed text-white/80">
                            To contribute, please get in touch with us and our team will
                            guide you through the donation process.
                        </p>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <a
                            href={CONTACT.phones[0].href}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-base font-bold text-cta-foreground shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                        >
                            <IconPhone size={20} aria-hidden />
                            Call to Donate
                        </a>
                        <a
                            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Donation enquiry")}`}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-base font-bold transition duration-200 hover:bg-white/15"
                        >
                            <IconMail size={20} aria-hidden />
                            Email Us
                        </a>
                    </div>

                    <Link
                        href={POLICY.href}
                        className="mt-5 inline-block text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-white"
                    >
                        {POLICY.label}
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
