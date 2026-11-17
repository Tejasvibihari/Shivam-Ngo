"use client";

import { motion } from "motion/react";
import { IconBuilding, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { CONTACT } from "@/lib/org";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Contact Us",
    title: "We would love to hear from you",
    intro:
        "Questions, ideas, or want to work with us? Reach out by phone or email, or visit our office in Patna.",
};

/** Used for the embedded map. Change it if you want the pin somewhere else. */
const MAP_QUERY = CONTACT.registeredOffice;
/* ===================================================================== */

export default function ContactSection() {
    const cards = [
        {
            title: "Head Office",
            icon: IconBuilding,
            content: <p>{CONTACT.headOffice}</p>,
        },
        {
            title: "Registered Office",
            icon: IconMapPin,
            content: <p>{CONTACT.registeredOffice}</p>,
        },
        {
            title: "Phone",
            icon: IconPhone,
            content: (
                <ul className="space-y-1">
                    {CONTACT.phones.map((p) => (
                        <li key={p.href}>
                            <a href={p.href} className="font-semibold text-primary hover:underline">
                                {p.label}
                            </a>
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            title: "Email",
            icon: IconMail,
            content: (
                <a
                    href={`mailto:${CONTACT.email}`}
                    className="break-all font-semibold text-primary hover:underline"
                >
                    {CONTACT.email}
                </a>
            ),
        },
    ];

    return (
        <section
            id="contact"
            className="relative w-full bg-background px-6 py-24 sm:py-28"
        >
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
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                        {SECTION.intro}
                    </p>
                </motion.div>

                <div className="mt-14 grid gap-6 lg:grid-cols-5">
                    <div className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
                        {cards.map((card, i) => {
                            const Icon = card.icon;
                            return (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                                    className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                                        <Icon size={22} aria-hidden />
                                    </span>
                                    <div className="min-w-0 text-sm leading-relaxed text-muted-foreground">
                                        <h3 className="mb-1 text-base font-bold text-brand-dark">
                                            {card.title}
                                        </h3>
                                        {card.content}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 32 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="min-h-80 overflow-hidden rounded-3xl border border-border bg-muted shadow-sm lg:col-span-3"
                    >
                        <iframe
                            title="Map showing our registered office in Patna"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="size-full min-h-80 border-0"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
