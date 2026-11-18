"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";
import { GALLERY_ITEMS, type GalleryItem } from "@/lib/gallery";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "From the Field",
    title: "Our activities in pictures",
    intro: "A few moments from our camps, drives and community programmes.",
    cta: { label: "View Full Gallery", href: "/gallery" },
};

/** How many photos to show (taken from the start of GALLERY_ITEMS). */
const COUNT = 6;
/* ===================================================================== */

function Tile({ item, index }: { item: GalleryItem; index: number }) {
    const [failed, setFailed] = useState(false);
    return (
        <motion.figure
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: "easeOut" }}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-secondary/30 shadow-sm"
        >
            {!failed && (
                <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                    onError={() => setFailed(true)}
                    className="object-cover transition duration-700 group-hover:scale-105"
                />
            )}
            <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-black/55 px-4 py-2.5 text-sm font-medium text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {item.caption}
            </figcaption>
        </motion.figure>
    );
}

export default function FieldGallery() {
    const items = GALLERY_ITEMS.slice(0, COUNT);

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

                <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, i) => (
                        <Tile key={item.id} item={item} index={i} />
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <Link
                        href={SECTION.cta.href}
                        className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                    >
                        {SECTION.cta.label}
                        <IconArrowRight
                            size={20}
                            aria-hidden
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}
