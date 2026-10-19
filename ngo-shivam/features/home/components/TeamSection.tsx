"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

/* ============================== CONTENT ============================== */
type Member = {
    name: string;
    role: string;
    /** path from /public */
    photo: string;
    /** Optional. Only shown if you add it, so nothing is invented. */
    bio?: string;
};

const SECTION = {
    eyebrow: "Leadership & Our Team",
    title: "The people behind our work",
    intro: "Meet the office-bearers who guide the work of the organisation.",
};

/** Add more people (committee members, coordinators) by adding entries here. */
const MEMBERS: Member[] = [
    {
        name: "Raushan Kumar",
        role: "Chairman",
        photo: "/team/raushan-kumar.jpg",
    },
    {
        name: "Shambhu Prasad Singh",
        role: "Secretary",
        photo: "/team/shambhu-prasad-singh.jpg",
    },
    {
        name: "Durganand Thakur",
        role: "Treasurer",
        photo: "/team/durganand-thakur.jpg",
    },
];
/* ===================================================================== */

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

function MemberCard({ member, index }: { member: Member; index: number }) {
    // if the photo file is missing, show the person's initials instead
    const [photoFailed, setPhotoFailed] = useState(false);

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: index * 0.1, ease: "easeOut" }}
            className="group flex w-full max-w-xs flex-col items-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 sm:w-72"
        >
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-secondary/30 ring-4 ring-background transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-[1.03]">
                {photoFailed ? (
                    <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-primary/60">
                        {initials(member.name)}
                    </span>
                ) : (
                    <Image
                        src={member.photo}
                        alt={`${member.name}, ${member.role}`}
                        fill
                        sizes="(min-width: 640px) 260px, 90vw"
                        onError={() => setPhotoFailed(true)}
                        className="object-cover"
                    />
                )}
            </div>

            <h3 className="mt-6 text-lg font-bold text-brand-dark">{member.name}</h3>
            <span className="mt-2 inline-block rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                {member.role}
            </span>

            {member.bio && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                </p>
            )}
        </motion.article>
    );
}

export default function TeamSection() {
    return (
        <section
            id="team"
            className="relative w-full bg-background px-6 py-24 sm:py-28"
        >
            <div className="mx-auto max-w-5xl">
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
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                        {SECTION.intro}
                    </p>
                </motion.div>

                <div className="mt-14 flex flex-wrap justify-center gap-6">
                    {MEMBERS.map((member, i) => (
                        <MemberCard key={member.name} member={member} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}