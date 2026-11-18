"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
    IconBuildingCommunity,
    IconCheck,
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
    title: "Eight areas of work, one shared goal",
    intro:
        "Everything we do is built around the everyday needs of families. Pick an area to jump straight to it.",
};

const AREAS: Area[] = [
    {
        id: "people-in-need",
        title: "Support for People in Need",
        description:
            "We work to help those in need, irrespective of race, caste, sex, community or creed.",
        includes: [
            "Help for people and families in need",
            "Equal respect for everyone we serve",
            "Working alongside local people",
        ],
        image: { src: "/activities/social-development.jpg", alt: "Community support work" },
        icon: IconHeartHandshake,
    },
    {
        id: "family-life",
        title: "Strong Families",
        description:
            "A strong family is the foundation of a strong community. We support families so that the tendency towards disintegration is effectively arrested.",
        includes: [
            "Family-life education",
            "Counselling",
            "Other support systems for families",
        ],
        image: { src: "/activities/family-life.jpg", alt: "Family-life education session" },
        icon: IconHomeHeart,
    },
    {
        id: "skills-awareness",
        title: "Skills & Awareness",
        description:
            "We build people's competence through education, awareness generation and skill training, so they can mobilise and manage resources for self-advancement.",
        includes: [
            "Education and learning support",
            "Awareness generation in the community",
            "Skill-training programmes",
        ],
        image: { src: "/activities/education.jpg", alt: "Children learning at an awareness programme" },
        icon: IconSchool,
    },
    {
        id: "infrastructure",
        title: "Community Infrastructure",
        description:
            "In partnership with stakeholders, we help develop the basic facilities that make everyday life safer and better.",
        includes: [
            "Housing and drinking water",
            "Electricity and pathways",
            "Community halls",
        ],
        image: { src: "/activities/sanitation.jpg", alt: "Community facilities" },
        icon: IconBuildingCommunity,
    },
    {
        id: "health-sanitation",
        title: "Health & Sanitation",
        description:
            "We focus on health-related matters and promote personal hygiene and environmental sanitation, so that families can understand and act on everyday health matters.",
        includes: [
            "Health education",
            "Behavioural change communication (BCC)",
            "Immunisation programmes",
        ],
        image: { src: "/activities/health-awareness.jpg", alt: "Health awareness camp" },
        icon: IconHeartbeat,
    },
    {
        id: "self-help-groups",
        title: "Self-Help Groups",
        description:
            "We establish self-help groups of men and women and engage them in creative activities, so they gain the information, know-how and resources to improve their living conditions.",
        includes: [
            "Self-help groups for men and women",
            "Creative, income-building activities",
            "Information and know-how for members",
        ],
        image: { src: "/activities/vocational-training.jpg", alt: "Self-help group members at a training session" },
        icon: IconUsersGroup,
    },
    {
        id: "agriculture",
        title: "Agriculture & Livelihood",
        description:
            "We address emerging issues in the farming sector, such as low productivity, indebtedness and exploitation by traders.",
        includes: [
            "Modern, eco-friendly farming practices",
            "Value addition to farm produce",
            "Better marketing to maximise incomes",
        ],
        image: { src: "/activities/agriculture.jpg", alt: "Farmers working in the field" },
        icon: IconPlant2,
    },
    {
        id: "disaster-relief",
        title: "Disaster Relief",
        description:
            "When disaster strikes, we step in immediately in the affected areas and carry out relief and rehabilitation work together with the community.",
        includes: [
            "Immediate response in disaster-hit areas",
            "Relief and rehabilitation work",
            "A participatory approach with local people",
        ],
        image: { src: "/activities/disaster-relief.jpg", alt: "Relief work in a disaster-hit area" },
        icon: IconLifebuoy,
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
