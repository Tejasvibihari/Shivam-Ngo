"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { IconMapPin } from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
type Status = "Ongoing" | "Completed" | "Planned";

type Project = {
    title: string;
    location: string;
    description: string;
    image: { src: string; alt: string };
    /** Only set this when the status is verified. If omitted, no badge is shown. */
    status?: Status;
};

const SECTION = {
    eyebrow: "Projects & Initiatives",
    title: "Practical work, close to home",
    intro:
        "A look at some of the on-the-ground projects that improve sanitation and everyday living conditions.",
};

/**
 * Same projects as the home page. Replace the placeholder locations and photos with real ones,
 * and add `status` once it is verified.
 */
const PROJECTS: Project[] = [
    {
        title: "Sanitation Initiatives",
        location: "Location to be added",
        description:
            "Improving access to safe sanitation and hygiene for families through awareness and community support.",
        image: { src: "/projects/sanitation.jpg", alt: "Sanitation initiative" },
    },
    {
        title: "Community Cleanliness Drives",
        location: "Location to be added",
        description:
            "Volunteer-led clean-ups that keep streets, shared spaces and neighbourhoods clean and healthy.",
        image: { src: "/projects/cleanliness.jpg", alt: "Community cleanliness drive" },
    },
    {
        title: "Public Toilet Facilities",
        location: "Location to be added",
        description:
            "Building and maintaining public toilet facilities so that safe sanitation is available to everyone.",
        image: { src: "/projects/toilets.jpg", alt: "Public toilet facility" },
    },
    {
        title: "Waste-Management Activities",
        location: "Location to be added",
        description:
            "Encouraging responsible waste collection and disposal to reduce litter and protect community health.",
        image: { src: "/projects/waste-management.jpg", alt: "Waste-management activity" },
    },
];
/* ===================================================================== */

const STATUS_STYLES: Record<Status, string> = {
    Ongoing: "bg-cta text-cta-foreground",
    Completed: "bg-success text-success-foreground",
    Planned: "bg-brand-dark text-brand-dark-foreground",
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
    const [failed, setFailed] = useState(false);
    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: (index % 2) * 0.08, ease: "easeOut" }}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 sm:flex-row"
        >
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-accent to-secondary/30 sm:aspect-auto sm:w-2/5">
                {!failed && (
                    <Image
                        src={project.image.src}
                        alt={project.image.alt}
                        fill
                        sizes="(min-width: 1024px) 280px, (min-width: 640px) 40vw, 90vw"
                        onError={() => setFailed(true)}
                        className="object-cover transition duration-700 group-hover:scale-105"
                    />
                )}
                {project.status && (
                    <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-md ${STATUS_STYLES[project.status]}`}
                    >
                        {project.status}
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col justify-center p-6">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <IconMapPin size={15} aria-hidden />
                    {project.location}
                </p>
                <h3 className="mt-2 text-lg font-bold text-brand-dark">{project.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
            </div>
        </motion.article>
    );
}

export default function ProjectsShowcase() {
    return (
        <section id="projects" className="relative scroll-mt-28 w-full bg-background px-6 py-24 sm:py-28">
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

                <div className="mt-14 grid gap-6 lg:grid-cols-2">
                    {PROJECTS.map((project, i) => (
                        <ProjectCard key={project.title} project={project} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
