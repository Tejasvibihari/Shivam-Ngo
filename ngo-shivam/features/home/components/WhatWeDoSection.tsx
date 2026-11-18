"use client";

import { motion } from "motion/react";
import {
    IconBuildingCommunity,
    IconHeartbeat,
    IconHeartHandshake,
    IconHomeHeart,
    IconLifebuoy,
    IconPlant2,
    IconSchool,
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
    title: "Eight objectives, one goal: self-reliant, healthier communities",
    intro:
        "Our work is built around the everyday needs of the community. These are the objectives that guide us.",
};

const AREAS: Area[] = [
    {
        title: "Support for People in Need",
        description:
            "Work to help those in need, irrespective of race, caste, sex, community or creed.",
        icon: IconHeartHandshake,
    },
    {
        title: "Strong Families",
        description:
            "Strengthening the family through family-life education, counselling and other support systems.",
        icon: IconHomeHeart,
    },
    {
        title: "Skills & Awareness",
        description:
            "Building people's competence through education, awareness generation and skill training so they can manage resources for self-advancement.",
        icon: IconSchool,
    },
    {
        title: "Community Infrastructure",
        description:
            "Developing housing, drinking water, electricity, pathways and community halls in partnership with stakeholders.",
        icon: IconBuildingCommunity,
    },
    {
        title: "Health & Sanitation",
        description:
            "Promoting personal hygiene and environmental sanitation through health education, behavioural change communication and immunisation.",
        icon: IconHeartbeat,
    },
    {
        title: "Self-Help Groups",
        description:
            "Forming self-help groups of men and women, engaged in creative activities that improve their living conditions.",
        icon: IconUsersGroup,
    },
    {
        title: "Agriculture & Livelihood",
        description:
            "Addressing low productivity, indebtedness and exploitation by traders, and promoting eco-friendly farming, value addition and better marketing.",
        icon: IconPlant2,
    },
    {
        title: "Disaster Relief",
        description:
            "Stepping in immediately in disaster-hit areas with relief and rehabilitation work, carried out in a participatory manner.",
        icon: IconLifebuoy,
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

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                                    delay: (i % 4) * 0.08,
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
