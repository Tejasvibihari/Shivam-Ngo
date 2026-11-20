"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";
import MemberPhoto from "@/features/management/components/MemberPhoto";
import type { TeamMember } from "@/lib/team";

/** Team cards. Each card links to that person's own page: /management/<id>. */
export default function TeamGrid({ members }: { members: TeamMember[] }) {
    return (
        <div className="flex flex-wrap justify-center gap-6">
            {members.map((member, index) => (
                <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, delay: index * 0.1, ease: "easeOut" }}
                    className="w-full max-w-xs sm:w-72"
                >
                    <Link
                        href={`/management/${member.id}`}
                        aria-label={`View the profile and message of ${member.name}, ${member.role}`}
                        className="group flex w-full flex-col items-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                    >
                        <MemberPhoto
                            member={member}
                            sizes="(min-width: 640px) 260px, 90vw"
                            className="aspect-square w-full rounded-2xl ring-4 ring-background transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-[1.03]"
                        />
                        <span className="mt-6 text-lg font-bold text-brand-dark">{member.name}</span>
                        <span className="mt-2 inline-block rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                            {member.role}
                        </span>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                            View profile
                            <IconArrowRight
                                size={16}
                                aria-hidden
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </span>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
