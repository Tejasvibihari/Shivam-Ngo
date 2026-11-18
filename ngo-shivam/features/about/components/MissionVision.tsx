"use client";

import { motion } from "motion/react";
import { IconEye, IconTargetArrow } from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Mission & Vision",
    title: "What drives us every day",
};

const CARDS = [
    {
        title: "Our Vision",
        icon: IconEye,
        text: "A growing resource centre, responsive to changes in the global scenario, promoting developmental initiatives among the deprived and the vulnerable, based on democratic values, human rights and humanitarianism.",
    },
    {
        title: "Our Mission",
        icon: IconTargetArrow,
        text: "To realise this vision through intensive community mobilisation, and to empower communities through social conscientisation, life skills and appropriate livelihood systems.",
    },
];
/* ===================================================================== */

export default function MissionVision() {
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
                </motion.div>

                <div className="mt-14 grid gap-6 md:grid-cols-2">
                    {CARDS.map(({ title, icon: Icon, text }, i) => (
                        <motion.article
                            key={title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" }}
                            className="rounded-3xl border border-border bg-card p-8 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                        >
                            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
                                <Icon size={30} aria-hidden />
                            </span>
                            <h3 className="mt-6 text-xl font-bold text-brand-dark">{title}</h3>
                            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{text}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
