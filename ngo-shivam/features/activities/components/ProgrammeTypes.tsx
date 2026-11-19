"use client";

import { motion } from "motion/react";
import {
    IconHeartbeat,
    IconHeartHandshake,
    IconSpeakerphone,
    IconUsersGroup,
} from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Programmes & Events",
    title: "The ways we show up in the community",
    intro: "Our work takes a few regular forms. Contact us to find out what is coming up next.",
};

/** These mirror the categories used in the Gallery page. */
const PROGRAMMES = [
    {
        title: "Health Camps",
        icon: IconHeartbeat,
        text: "Community camps with medical check-ups and health guidance, brought close to people's homes.",
    },
    {
        title: "Awareness Drives",
        icon: IconSpeakerphone,
        text: "Rallies and sessions that spread simple, useful messages on health, hygiene and sanitation.",
    },
    {
        title: "Community Programmes",
        icon: IconUsersGroup,
        text: "Self-help groups, village outreach and gatherings that keep us close to the people we serve.",
    },
    {
        title: "Volunteer Drives",
        icon: IconHeartHandshake,
        text: "Clean-ups and distribution drives powered by volunteers giving their time on the ground.",
    },
];
/* ===================================================================== */

export default function ProgrammeTypes() {
    return (
        <section id="programmes" className="relative scroll-mt-28 w-full bg-brand-light px-6 py-24 sm:py-28">
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

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {PROGRAMMES.map(({ title, icon: Icon, text }, i) => (
                        <motion.article
                            key={title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                            className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                        >
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                <Icon size={28} aria-hidden />
                            </span>
                            <h3 className="mt-5 text-lg font-bold text-brand-dark">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
