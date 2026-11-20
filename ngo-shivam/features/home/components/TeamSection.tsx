"use client";

import { motion } from "motion/react";
import TeamGrid from "@/features/management/components/TeamGrid";
import { TEAM } from "@/lib/team";

/* ============================== CONTENT ============================== */
/** The people come from lib/team.ts (shared with the Management page). */
const SECTION = {
    eyebrow: "Leadership & Our Team",
    title: "The people behind our work",
    intro: "Meet the office-bearers who guide the work of the organisation. Select a card to view their profile and message.",
};
/* ===================================================================== */

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

                <div className="mt-14">
                    <TeamGrid members={TEAM} />
                </div>
            </div>
        </section>
    );
}
