"use client";

import { motion } from "motion/react";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "How It Works",
    title: "Getting started is simple",
    intro: "Four easy steps from interest to impact.",
};

/** Edit these to describe your real onboarding. */
const STEPS = [
    { title: "Tell us about you", text: "Fill in the short form below with your details and what you would like to help with." },
    { title: "We get in touch", text: "Our team will get back to you to talk about how you can contribute." },
    { title: "Choose where to help", text: "Together we match you with a role and activity that suits your time and interests." },
    { title: "Join the work", text: "Take part in drives, camps and programmes, and see the difference on the ground." },
];
/* ===================================================================== */

export default function VolunteerSteps() {
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

                <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {STEPS.map((step, i) => (
                        <motion.li
                            key={step.title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                            className="relative rounded-3xl border border-border bg-card p-6 pt-10 shadow-sm"
                        >
                            <span
                                aria-hidden
                                className="absolute -top-5 left-6 flex size-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground ring-4 ring-background"
                            >
                                {i + 1}
                            </span>
                            <h3 className="text-lg font-bold text-brand-dark">{step.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                        </motion.li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
