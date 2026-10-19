"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { IconArrowRight, IconMapPin } from "@tabler/icons-react";

/* ============================== CONTENT ============================== */
type Status = "Ongoing" | "Completed" | "Planned";

type Project = {
    title: string;
    /** where the work is happening */
    location: string;
    description: string;
    image: { src: string; alt: string };
    /** Only set this when the status is verified. If omitted, no badge is shown. */
    status?: Status;
};

const SECTION = {
    eyebrow: "Our Projects & Initiatives",
    title: "Cleaner spaces, healthier communities",
    intro:
        "A look at some of the practical, on-the-ground work we do to improve sanitation and everyday living conditions.",
    cta: { label: "View All Projects", href: "/projects" },
};

/**
 * Replace the placeholder locations and photos with your real ones.
 * Add `status: "Ongoing" | "Completed" | "Planned"` to a project once it is verified.
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

export default function OurProject() {
    return (
        <section
            id="activities"
            className="relative w-full bg-brand-light px-6 py-24 sm:py-28"
        >
            <div className="mx-auto max-w-7xl">
                {/* Heading */}
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
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                        {SECTION.intro}
                    </p>
                </motion.div>

                {/* Project cards */}
                <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {PROJECTS.map((project, i) => (
                        <motion.article
                            key={project.title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.55, delay: i * 0.08, ease: "easeOut" }}
                            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-accent to-secondary/30">
                                <Image
                                    src={project.image.src}
                                    alt={project.image.alt}
                                    fill
                                    sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw"
                                    // if the file is missing, hide the broken icon and show the gradient
                                    onError={(e) => {
                                        e.currentTarget.style.visibility = "hidden";
                                    }}
                                    className="object-cover transition duration-700 group-hover:scale-105"
                                />
                                {project.status && (
                                    <span
                                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-md ${STATUS_STYLES[project.status]}`}
                                    >
                                        {project.status}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                    <IconMapPin size={15} aria-hidden />
                                    {project.location}
                                </p>
                                <h3 className="mt-2 text-lg font-bold text-brand-dark">
                                    {project.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {project.description}
                                </p>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* View all */}
                <div className="mt-14 flex justify-center">
                    <Link
                        href={SECTION.cta.href}
                        className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                    >
                        {SECTION.cta.label}
                        <IconArrowRight
                            size={20}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}