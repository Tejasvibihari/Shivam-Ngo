"use client";

import { motion } from "motion/react";
import {
    IconHeartHandshake,
    IconHomeHeart,
    IconScale,
    IconUsersGroup,
} from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Our Values",
    title: "The principles we work by",
    intro: "These values guide how we plan, act and treat the people we work with.",
};

const VALUES = [
    {
        title: "Humanitarianism",
        icon: IconHeartHandshake,
        text: "We serve people in need irrespective of race, caste, sex, community or creed.",
    },
    {
        title: "Human Rights",
        icon: IconScale,
        text: "Our work rests on democratic values and respect for the rights of every person.",
    },
    {
        title: "Partnership",
        icon: IconUsersGroup,
        text: "We build facilities and solutions together with the stakeholders and the community.",
    },
    {
        title: "Self-reliance",
        icon: IconHomeHeart,
        text: "We build skills, awareness and resources so people can advance on their own.",
    },
];
/* ===================================================================== */

export default function CoreValues() {
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

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {VALUES.map(({ title, icon: Icon, text }, i) => (
                        <motion.article
                            key={title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                            className="group rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                        >
                            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
