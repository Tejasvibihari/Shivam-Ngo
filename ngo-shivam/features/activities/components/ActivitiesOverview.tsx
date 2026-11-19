"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import ActivityImage from "@/features/activities/components/ActivityImage";
import { ACTIVITY_ICONS } from "@/features/activities/components/activityIcons";
import { ACTIVITIES } from "@/features/activities/data/activities";

/* ============================== CONTENT ============================== */
/** The areas come from features/activities/data/activities.ts (one page per area). */
const SECTION = {
    eyebrow: "What We Do",
    title: "Seven areas of work, one shared goal",
    intro:
        "Everything we do is built around the everyday needs of families. Pick an area to jump straight to it, or read more to see the full programme.",
};
/* ===================================================================== */

export default function ActivitiesOverview() {
    return (
        <section id="what-we-do" className="relative scroll-mt-28 w-full bg-background px-6 py-24 sm:py-28">
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

                {/* Jump links */}
                <nav aria-label="Areas of work" className="mt-10 flex flex-wrap justify-center gap-2.5">
                    {ACTIVITIES.map(({ slug: id, shortTitle: title, icon }) => {
                        const Icon = ACTIVITY_ICONS[icon];
                        return (
                        <a
                            key={id}
                            href={`#${id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                        >
                            <Icon size={16} aria-hidden className="text-primary" />
                            {title}
                        </a>
                        );
                    })}
                </nav>

                {/* Area detail rows (alternate image side on large screens) */}
                <div className="mt-20 space-y-24">
                    {ACTIVITIES.map((area, i) => {
                        const Icon = ACTIVITY_ICONS[area.icon];
                        const flip = i % 2 === 1;
                        return (
                            <motion.article
                                key={area.slug}
                                id={area.slug}
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="grid scroll-mt-32 items-center gap-10 lg:grid-cols-2 lg:gap-16"
                            >
                                <div className={flip ? "lg:order-2" : undefined}>
                                    <ActivityImage src={area.image.src} alt={area.image.alt} />
                                </div>

                                <div className={flip ? "lg:order-1" : undefined}>
                                    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
                                        <Icon size={28} aria-hidden />
                                    </span>
                                    <h3 className="mt-5 text-2xl font-bold text-brand-dark sm:text-3xl">{area.shortTitle}</h3>
                                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                        {area.summary}
                                    </p>
                                    <ul className="mt-6 space-y-3">
                                        {area.highlights.map((item) => (
                                            <li key={item} className="flex items-start gap-3 text-sm text-foreground/80 sm:text-base">
                                                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                                    <IconCheck size={14} aria-hidden />
                                                </span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={`/activities/${area.slug}`}
                                        aria-label={`Read more about ${area.shortTitle}`}
                                        className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                                    >
                                        Read more
                                        <IconArrowRight
                                            size={18}
                                            aria-hidden
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </Link>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
