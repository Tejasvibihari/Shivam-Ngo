"use client";

import Image from "next/image";
import { motion } from "motion/react";

/* ============================== CONTENT ============================== */
const ESTABLISHED = 2004;

const STORY = {
    eyebrow: "Our Story",
    title: "Working alongside communities since 2004",
    paragraphs: [
        "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra is a citizens' organisation, task-oriented and driven by people with a common interest. We carry out a variety of service and humanitarian work, bring citizen concerns to governments, advocate for and monitor policies, and encourage participation by sharing information on issues such as human rights, the environment and health.",
        "Our cities have grown fast, and the gap between the demand for essential services and their supply has widened. The result is poor sanitation, stress on the environment, high health costs and a lack of access to basic services such as water supply and housing. Better use of human and financial resources, together with awareness among people, can change this.",
        "That is why we believe progress needs everyone: the Central, State and Local governments, civic organisations, partners and the public. From our base in Patna, Bihar, we work on sanitation, sewerage, and solid and liquid waste management, with IEC (information, education and communication) strategies that encourage people to make full use of the services available to them.",
    ],
    photo: { src: "/about/about.jpg", alt: "Our team working with the community" },
};

/** Only facts the organisation can stand behind. Add more once they are verified. */
const FACTS = [
    { value: `${new Date().getFullYear() - ESTABLISHED}+`, label: "Years of service" },
    { value: "8", label: "Core objectives" },
    { value: String(ESTABLISHED), label: "Year established" },
];
/* ===================================================================== */

export default function AboutStory() {
    return (
        <section className="relative w-full overflow-hidden bg-background px-6 py-24 sm:py-28">
            <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
                <motion.div
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative mx-auto w-full max-w-md lg:max-w-none"
                >
                    <div aria-hidden className="absolute -inset-3 rotate-3 rounded-3xl bg-primary/15" />
                    <div className="group relative aspect-[4/5] -rotate-3 overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-secondary/30 shadow-2xl ring-4 ring-background transition-transform duration-500 hover:rotate-0">
                        <Image
                            src={STORY.photo.src}
                            alt={STORY.photo.alt}
                            fill
                            sizes="(min-width: 1024px) 480px, 90vw"
                            onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                            }}
                            className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-primary/10" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                >
                    <span className="inline-block rounded-full border border-primary/30 bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        {STORY.eyebrow}
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                        {STORY.title}
                    </h2>
                    {STORY.paragraphs.map((p, i) => (
                        <p
                            key={i}
                            className={
                                i === 0
                                    ? "mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg"
                                    : "mt-4 text-base leading-relaxed text-muted-foreground"
                            }
                        >
                            {p}
                        </p>
                    ))}

                    <dl className="mt-9 grid grid-cols-3 gap-3 sm:gap-4">
                        {FACTS.map((f) => (
                            <div
                                key={f.label}
                                className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm"
                            >
                                <dt className="sr-only">{f.label}</dt>
                                <dd className="text-2xl font-extrabold text-primary sm:text-3xl">{f.value}</dd>
                                <p aria-hidden className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                                    {f.label}
                                </p>
                            </div>
                        ))}
                    </dl>
                </motion.div>
            </div>
        </section>
    );
}
