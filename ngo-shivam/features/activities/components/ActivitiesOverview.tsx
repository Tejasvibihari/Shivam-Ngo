"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
    IconBook2,
    IconDroplet,
    IconHeartbeat,
    IconSparkles,
    IconTools,
    IconUsersGroup,
    IconCheck,
} from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
type Area = {
    id: string;
    title: string;
    description: string;
    /** what this area includes: keep to things the organisation really does */
    includes: string[];
    image: { src: string; alt: string };
    icon: React.ComponentType<{ size?: number; className?: string }>;
};

const SECTION = {
    eyebrow: "What We Do",
    title: "Six areas of work, one shared goal",
    intro:
        "Everything we do is built around the everyday needs of families. Pick an area to jump straight to it.",
};

const AREAS: Area[] = [
    {
        id: "sanitation",
        title: "Sanitation",
        description:
            "Safe sanitation is the base of a healthy home. We promote good hygiene practices and work to make clean, safe facilities available to families.",
        includes: [
            "Awareness on safe sanitation and hygiene",
            "Public toilet facilities for the community",
            "Support for families to adopt healthier habits",
        ],
        image: { src: "/activities/sanitation.jpg", alt: "Sanitation work in the community" },
        icon: IconDroplet,
    },
    {
        id: "cleanliness",
        title: "Cleanliness",
        description:
            "Clean neighbourhoods are healthier neighbourhoods. Our volunteers and community members come together to keep shared spaces clean.",
        includes: [
            "Volunteer-led community clean-up drives",
            "Care for streets and shared spaces",
            "Awareness on responsible waste collection and disposal",
        ],
        image: { src: "/activities/cleanliness.jpg", alt: "Community cleanliness drive" },
        icon: IconSparkles,
    },
    {
        id: "education",
        title: "Education",
        description:
            "Learning opens doors. We support education and awareness so that children and adults can build a better future.",
        includes: [
            "Learning support for children and adults",
            "Awareness sessions in the community",
            "Encouraging families to value education",
        ],
        image: { src: "/activities/education.jpg", alt: "Children learning at an awareness programme" },
        icon: IconBook2,
    },
    {
        id: "vocational-training",
        title: "Vocational Training",
        description:
            "Practical skills lead to a livelihood. Our training programmes help people learn skills they can use to earn and support their families.",
        includes: [
            "Practical skill-training programmes",
            "Guidance towards earning a livelihood",
            "Opportunities for women and youth to learn together",
        ],
        image: { src: "/activities/vocational-training.jpg", alt: "Vocational training session" },
        icon: IconTools,
    },
    {
        id: "health-awareness",
        title: "Health Awareness",
        description:
            "Informed families make better health choices. We run awareness drives and health camps that make everyday health matters easier to understand and act on.",
        includes: [
            "Health camps and medical check-ups",
            "Awareness drives and rallies",
            "Everyday health guidance for families",
        ],
        image: { src: "/activities/health-awareness.jpg", alt: "Health awareness camp" },
        icon: IconHeartbeat,
    },
    {
        id: "social-development",
        title: "Social Development",
        description:
            "Real progress reaches everyone when communities work together. We work alongside people so that no household is left behind.",
        includes: [
            "Women self-help groups",
            "Village outreach and community gatherings",
            "Working alongside local people to lead change",
        ],
        image: { src: "/activities/social-development.jpg", alt: "Community gathering" },
        icon: IconUsersGroup,
    },
];
/* ===================================================================== */

function AreaImage({ src, alt }: { src: string; alt: string }) {
    // if the photo file is missing, hide the broken icon and show the gradient
    const [failed, setFailed] = useState(false);
    return (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-secondary/30 shadow-xl ring-4 ring-background">
            {!failed && (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(min-width: 1024px) 520px, 90vw"
                    onError={() => setFailed(true)}
                    className="object-cover transition duration-700 hover:scale-105"
                />
            )}
        </div>
    );
}

export default function ActivitiesOverview() {
    return (
        <section id="what-we-do" className="relative w-full bg-background px-6 py-24 sm:py-28">
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
                    {AREAS.map(({ id, title, icon: Icon }) => (
                        <a
                            key={id}
                            href={`#${id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                        >
                            <Icon size={16} aria-hidden className="text-primary" />
                            {title}
                        </a>
                    ))}
                </nav>

                {/* Area detail rows (alternate image side on large screens) */}
                <div className="mt-20 space-y-24">
                    {AREAS.map((area, i) => {
                        const Icon = area.icon;
                        const flip = i % 2 === 1;
                        return (
                            <motion.article
                                key={area.id}
                                id={area.id}
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="grid scroll-mt-32 items-center gap-10 lg:grid-cols-2 lg:gap-16"
                            >
                                <div className={flip ? "lg:order-2" : undefined}>
                                    <AreaImage src={area.image.src} alt={area.image.alt} />
                                </div>

                                <div className={flip ? "lg:order-1" : undefined}>
                                    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
                                        <Icon size={28} aria-hidden />
                                    </span>
                                    <h3 className="mt-5 text-2xl font-bold text-brand-dark sm:text-3xl">{area.title}</h3>
                                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                        {area.description}
                                    </p>
                                    <ul className="mt-6 space-y-3">
                                        {area.includes.map((item) => (
                                            <li key={item} className="flex items-start gap-3 text-sm text-foreground/80 sm:text-base">
                                                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                                    <IconCheck size={14} aria-hidden />
                                                </span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
