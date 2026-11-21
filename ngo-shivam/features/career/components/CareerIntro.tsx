"use client";

import { motion } from "motion/react";
import { IconHeartHandshake, IconSchool, IconUsersGroup, IconWorld } from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Work With Us",
    title: "Build a career that helps communities",
    intro:
        "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra has worked for community health, sanitation and development in Patna, Bihar since 2004. If you want your work to matter to real families, we would like to hear from you.",
    cta: { label: "Apply now", href: "#apply" },
};

const BENEFITS = [
    {
        title: "Work that matters",
        icon: IconHeartHandshake,
        text: "Your effort goes directly into programmes that improve health and living conditions for families.",
    },
    {
        title: "Learn on the ground",
        icon: IconSchool,
        text: "Gain practical experience in health, sanitation, education and community development.",
    },
    {
        title: "A supportive team",
        icon: IconUsersGroup,
        text: "Work alongside committed colleagues, volunteers and local people who share the same goals.",
    },
    {
        title: "Rooted in Bihar",
        icon: IconWorld,
        text: "Be part of lasting change in the neighbourhoods and cities where we work.",
    },
];
/* ===================================================================== */

export default function CareerIntro() {
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
                    <a
                        href={SECTION.cta.href}
                        className="mt-8 inline-flex items-center justify-center rounded-full bg-cta px-8 py-3.5 text-base font-bold text-cta-foreground shadow-lg shadow-cta/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                    >
                        {SECTION.cta.label}
                    </a>
                </motion.div>

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {BENEFITS.map(({ title, icon: Icon, text }, i) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.55, delay: i * 0.08, ease: "easeOut" }}
                            className="group rounded-3xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                        >
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                <Icon size={28} aria-hidden />
                            </span>
                            <h3 className="mt-5 text-lg font-bold text-brand-dark">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
