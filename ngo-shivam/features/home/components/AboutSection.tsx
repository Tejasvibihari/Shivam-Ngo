"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
const ABOUT = {
    eyebrow: "About the Organization",
    title: "Building healthier communities since 2004",
    intro:
        "Established in 2004, Shivam Jan Swasthya Evem Sarwangin Vikash Kendra is a citizens' organisation that carries out service and humanitarian work, brings community concerns to governments and encourages participation through information, on issues such as human rights, the environment and health.",
    mission:
        "Our vision is to be a growing resource centre that promotes development among the deprived and the vulnerable, based on democratic values, human rights and humanitarianism. We work towards it through intensive community mobilisation, life skills and appropriate livelihood systems.",
    focusAreas: [
        "Support for People in Need",
        "Strong Families",
        "Skills & Awareness",
        "Community Infrastructure",
        "Health & Sanitation",
        "Self-Help Groups",
        "Agriculture & Livelihood",
        "Disaster Relief",
    ],
    since: "2004",
    photo: { src: "/about/about.jpg", alt: "Our team working with the community" },
    cta: { label: "Read Our Story", href: "/about" },
};
/* ===================================================================== */

export default function AboutSection() {
    return (
        <section
            id="about"
            className="relative w-full overflow-hidden bg-background px-6 py-24 sm:py-28"
        >
            <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
                {/* Photograph */}
                <motion.div
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative mx-auto w-full max-w-md lg:max-w-none"
                >
                    {/* soft tilted block behind the photo */}
                    <div
                        aria-hidden
                        className="absolute -inset-3 rotate-3 rounded-3xl bg-primary/15"
                    />

                    <div className="group relative aspect-[4/5] -rotate-3 overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-secondary/30 shadow-2xl ring-4 ring-background transition-transform duration-500 hover:rotate-0">
                        <Image
                            src={ABOUT.photo.src}
                            alt={ABOUT.photo.alt}
                            fill
                            sizes="(min-width: 1024px) 480px, 90vw"
                            // if the file is missing, hide the broken icon and show the gradient
                            onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                            }}
                            className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-primary/10" />
                    </div>

                    {/* "Since" badge */}
                    <div className="absolute -bottom-5 -right-2 rotate-3 rounded-2xl bg-cta px-5 py-3 text-cta-foreground shadow-lg shadow-cta/30 sm:-right-6">
                        <p className="text-[10px] font-semibold uppercase tracking-widest">
                            Since
                        </p>
                        <p className="text-3xl font-extrabold leading-none">{ABOUT.since}</p>
                    </div>
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, x: 32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                >
                    <span className="inline-block rounded-full border border-primary/30 bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        {ABOUT.eyebrow}
                    </span>

                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                        {ABOUT.title}
                    </h2>

                    <p className="mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
                        {ABOUT.intro}
                    </p>

                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                        {ABOUT.mission}
                    </p>

                    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Focus areas">
                        {ABOUT.focusAreas.map((area) => (
                            <li
                                key={area}
                                className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-foreground"
                            >
                                {area}
                            </li>
                        ))}
                    </ul>

                    <Link
                        href={ABOUT.cta.href}
                        className="group mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                    >
                        {ABOUT.cta.label}
                        <IconArrowRight
                            size={20}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}