"use client";

import { motion } from "motion/react";
import {
    IconCalendarEvent,
    IconCheck,
    IconSchool,
    IconSparkles,
    IconSpeakerphone,
} from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Ways to Help",
    title: "Find a role that suits you",
    intro: "Choose what you enjoy most. You can pick one or try a few.",
};

/** Titles match the "I am interested in" options on the form. Edit the bullets to match real activities. */
export const ROLES = [
    {
        title: "Cleanliness drives",
        icon: IconSparkles,
        text: "Join community clean-ups in neighbourhoods and shared spaces.",
        tasks: ["Join clean-up drives with the team", "Help keep streets and shared spaces clean", "Encourage neighbours to take part"],
    },
    {
        title: "Awareness campaigns",
        icon: IconSpeakerphone,
        text: "Help spread messages on health, hygiene and sanitation.",
        tasks: ["Take part in rallies and awareness drives", "Talk to families about everyday health", "Help share our messages locally"],
    },
    {
        title: "Teaching & training",
        icon: IconSchool,
        text: "Share your knowledge in education and skill-training programmes.",
        tasks: ["Support learning for children and adults", "Help in skill-training sessions", "Share a skill you already have"],
    },
    {
        title: "Event support",
        icon: IconCalendarEvent,
        text: "Lend a hand organising camps, drives and community events.",
        tasks: ["Help set up and run health camps", "Support registration and guidance", "Assist with distribution drives"],
    },
];
/* ===================================================================== */

export default function VolunteerRoles() {
    return (
        <section className="relative w-full bg-brand-light px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <span className="inline-block rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        {SECTION.eyebrow}
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                        {SECTION.title}
                    </h2>
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">{SECTION.intro}</p>
                </motion.div>

                <div className="mt-14 grid gap-6 md:grid-cols-2">
                    {ROLES.map(({ title, icon: Icon, text, tasks }, i) => (
                        <motion.article
                            key={title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.55, delay: (i % 2) * 0.08, ease: "easeOut" }}
                            className="group rounded-3xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                        >
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                <Icon size={28} aria-hidden />
                            </span>
                            <h3 className="mt-5 text-xl font-bold text-brand-dark">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{text}</p>
                            <ul className="mt-5 space-y-2.5">
                                {tasks.map((t) => (
                                    <li key={t} className="flex items-start gap-3 text-sm text-foreground/80">
                                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                            <IconCheck size={12} aria-hidden />
                                        </span>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
