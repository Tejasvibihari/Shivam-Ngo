"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { IconBuilding, IconExternalLink, IconMapPin } from "@tabler/icons-react";
import { CONTACT } from "@/lib/org";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Find Us",
    title: "Visit our offices in Patna",
    intro: "Choose an office to see it on the map and get directions.",
};

const OFFICES = [
    { id: "head", label: "Head Office", address: CONTACT.headOffice, icon: IconBuilding },
    { id: "registered", label: "Registered Office", address: CONTACT.registeredOffice, icon: IconMapPin },
];
/* ===================================================================== */

export default function OfficeMap() {
    const [activeId, setActiveId] = useState(OFFICES[0].id);
    const office = OFFICES.find((o) => o.id === activeId) ?? OFFICES[0];

    return (
        <section className="relative w-full bg-brand-light px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-6xl">
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
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">{SECTION.intro}</p>
                </motion.div>

                <div className="mt-14 grid gap-6 lg:grid-cols-5">
                    {/* Office selector */}
                    <div className="space-y-4 lg:col-span-2" role="tablist" aria-label="Offices">
                        {OFFICES.map(({ id, label, address, icon: Icon }) => {
                            const active = id === activeId;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setActiveId(id)}
                                    className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left shadow-sm transition duration-300 ${
                                        active
                                            ? "border-primary bg-card ring-4 ring-primary/15"
                                            : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40"
                                    }`}
                                >
                                    <span
                                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                            active ? "bg-primary text-primary-foreground" : "bg-accent text-primary"
                                        }`}
                                    >
                                        <Icon size={22} aria-hidden />
                                    </span>
                                    <span>
                                        <span className="block text-base font-bold text-brand-dark">{label}</span>
                                        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                                            {address}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}

                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(office.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cta px-7 py-3.5 text-base font-bold text-cta-foreground shadow-lg shadow-cta/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                        >
                            Get directions
                            <IconExternalLink size={18} aria-hidden />
                        </a>
                    </div>

                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 32 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="min-h-96 overflow-hidden rounded-3xl border border-border bg-muted shadow-sm lg:col-span-3"
                    >
                        <iframe
                            key={office.id}
                            title={`Map showing our ${office.label.toLowerCase()} in Patna`}
                            src={`https://www.google.com/maps?q=${encodeURIComponent(office.address)}&output=embed`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="size-full min-h-96 border-0"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
