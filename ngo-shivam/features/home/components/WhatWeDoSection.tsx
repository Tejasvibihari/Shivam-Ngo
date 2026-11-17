"use client";

import { motion } from "motion/react";
import {
    IconBook2,
    IconSparkles,
    IconDroplet,
    IconHeartbeat,
    IconTools,
    IconUsersGroup,
} from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
type Area = {
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
};

const SECTION = {
    eyebrow: "What We Do",
    title: "Six areas, one goal: healthier, self-reliant families",
    intro:
        "Our work is built around the everyday needs of the community. These are the areas we focus on.",
};

const AREAS: Area[] = [
    {
        title: "Sanitation",
        description:
            "Promoting safe sanitation and hygiene practices so every family has a healthier home.",
        icon: IconDroplet,
    },
    {
        title: "Cleanliness",
        description:
            "Community clean-ups and awareness that keep neighbourhoods and shared spaces clean.",
        icon: IconSparkles,
    },
    {
        title: "Education",
        description:
            "Supporting learning and awareness so that children and adults can build a better future.",
        icon: IconBook2,
    },
    {
        title: "Vocational Training",
        description:
            "Training programmes that help people learn practical skills and earn a livelihood.",
        icon: IconTools,
    },
    {
        title: "Health Awareness",
        description:
            "Awareness drives that help families understand and act on everyday health matters.",
        icon: IconHeartbeat,
    },
    {
        title: "Social Development",
        description:
            "Working alongside communities so that progress reaches every household.",
        icon: IconUsersGroup,
    },
];
/* ===================================================================== */

export default function WhatWeDoSection() {
    return (
        <section
            id="what-we-do"
            className="relative w-full bg-brand-light px-6 py-24 sm:py-28"
        >
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
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                        {SECTION.intro}
                    </p>
                </motion.div>

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {AREAS.map((area, i) => {
                        const Icon = area.icon;
                        return (
                            <motion.article
                                key={area.title}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{
                                    duration: 0.55,
                                    delay: (i % 3) * 0.08,
                                    ease: "easeOut",
                                }}
                                className="group rounded-3xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                            >
                                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon size={28} aria-hidden />
                                </span>
                                <h3 className="mt-5 text-lg font-bold text-brand-dark">
                                    {area.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {area.description}
                                </p>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
