"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
    IconCalendarEvent,
    IconSchool,
    IconSparkles,
    IconSpeakerphone,
} from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Get Involved",
    title: "Take part in our activities",
    intro:
        "You do not need special skills to help. Here are some of the ways you can join us on the ground.",
    cta: { label: "Become a Volunteer", href: "/volunteer" },
};

/** Matches the volunteer roles on the home page. */
const ROLES = [
    {
        title: "Cleanliness drives",
        icon: IconSparkles,
        text: "Join community clean-ups in neighbourhoods and shared spaces.",
    },
    {
        title: "Awareness campaigns",
        icon: IconSpeakerphone,
        text: "Help spread messages on health, hygiene and sanitation.",
    },
    {
        title: "Teaching & training",
        icon: IconSchool,
        text: "Share your knowledge in education and skill-training programmes.",
    },
    {
        title: "Event support",
        icon: IconCalendarEvent,
        text: "Lend a hand organising camps, drives and community events.",
    },
];
/* ===================================================================== */

export default function GetInvolved() {
    return (
        <section className="relative w-full bg-background px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <span className="inline-block rounded-full border border-primary/30 bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        {SECTION.eyebrow}
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                        {SECTION.title}
                    </h2>
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">{SECTION.intro}</p>
                </motion.div>

                <div className="mt-14 grid gap-6 sm:grid-cols-2">
                    {ROLES.map(({ title, icon: Icon, text }, i) => (
                        <motion.article
                            key={title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease: "easeOut" }}
                            className="flex items-start gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                        >
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                                <Icon size={24} aria-hidden />
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-brand-dark">{title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                            </div>
                        </motion.article>
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <Link
                        href={SECTION.cta.href}
                        className="inline-flex items-center rounded-full bg-cta px-8 py-3.5 text-base font-bold text-cta-foreground shadow-lg shadow-cta/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                    >
                        {SECTION.cta.label}
                    </Link>
                </div>
            </div>
        </section>
    );
}
