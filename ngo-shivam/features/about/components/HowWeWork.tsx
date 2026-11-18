"use client";

import { motion } from "motion/react";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "How We Work",
    title: "From mobilising to lasting change",
    intro: "A simple approach that keeps our work close to the community.",
};

const STEPS = [
    {
        title: "Mobilise",
        text: "We start with intensive community mobilisation, listening to the everyday needs of families.",
    },
    {
        title: "Empower",
        text: "We build competence through education, awareness generation, life skills and skill training.",
    },
    {
        title: "Partner",
        text: "We work with stakeholders and self-help groups to create facilities and livelihood systems.",
    },
    {
        title: "Respond and follow through",
        text: "We step in quickly when disaster strikes, work in a participatory manner and keep learning from the results.",
    },
];
/* ===================================================================== */

export default function HowWeWork() {
    return (
        <section className="relative w-full bg-brand-light px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-5xl">
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

                <ol className="relative mt-14 space-y-6 border-l-2 border-primary/25 pl-8 sm:pl-10">
                    {STEPS.map((step, i) => (
                        <motion.li
                            key={step.title}
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                            className="relative rounded-2xl border border-border bg-card p-6 shadow-sm"
                        >
                            <span
                                aria-hidden
                                className="absolute -left-[3.15rem] top-5 flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground ring-4 ring-brand-light sm:-left-[3.4rem]"
                            >
                                {i + 1}
                            </span>
                            <h3 className="text-lg font-bold text-brand-dark">{step.title}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {step.text}
                            </p>
                        </motion.li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
