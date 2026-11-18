"use client";

import { motion } from "motion/react";
import { IconBuilding, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { CONTACT } from "@/lib/org";

/** Opens Google Maps directions to an address. */
const directions = (address: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

export default function ContactCards() {
    const cards = [
        {
            title: "Call us",
            icon: IconPhone,
            body: (
                <ul className="space-y-1">
                    {CONTACT.phones.map((p) => (
                        <li key={p.href}>
                            <a href={p.href} className="font-semibold text-foreground/80 transition-colors hover:text-primary">
                                {p.label}
                            </a>
                        </li>
                    ))}
                </ul>
            ),
            action: { label: "Call now", href: CONTACT.phones[0].href },
        },
        {
            title: "Email us",
            icon: IconMail,
            body: (
                <a
                    href={`mailto:${CONTACT.email}`}
                    className="break-all font-semibold text-foreground/80 transition-colors hover:text-primary"
                >
                    {CONTACT.email}
                </a>
            ),
            action: { label: "Write an email", href: `mailto:${CONTACT.email}` },
        },
        {
            title: "Head Office",
            icon: IconBuilding,
            body: <p>{CONTACT.headOffice}</p>,
            action: { label: "Get directions", href: directions(CONTACT.headOffice), external: true },
        },
        {
            title: "Registered Office",
            icon: IconMapPin,
            body: <p>{CONTACT.registeredOffice}</p>,
            action: { label: "Get directions", href: directions(CONTACT.registeredOffice), external: true },
        },
    ];

    return (
        <section className="relative w-full bg-background px-6 pb-8 pt-20 sm:pt-24">
            <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map(({ title, icon: Icon, body, action }, i) => (
                    <motion.article
                        key={title}
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                        className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                    >
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                            <Icon size={28} aria-hidden />
                        </span>
                        <h3 className="mt-5 text-lg font-bold text-brand-dark">{title}</h3>
                        <div className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</div>
                        <a
                            href={action.href}
                            {...("external" in action && action.external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                            className="mt-5 inline-flex items-center text-sm font-bold text-primary hover:underline"
                        >
                            {action.label} &rarr;
                        </a>
                    </motion.article>
                ))}
            </div>
        </section>
    );
}
