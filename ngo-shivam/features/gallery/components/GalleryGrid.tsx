"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
    GALLERY_CATEGORIES,
    type GalleryCategoryId,
    type GalleryItem,
} from "@/lib/gallery";
import GalleryLightbox from "./GalleryLightbox";

type GalleryGridProps = {
    items: GalleryItem[];
    categories?: readonly { id: GalleryCategoryId; label: string }[];
};

/** Photos get a repeating shape so the columns feel varied without needing real image sizes. */
const SHAPES = ["aspect-[4/3]", "aspect-square", "aspect-[3/4]", "aspect-square", "aspect-[4/3]"];

type Filter = GalleryCategoryId | "all";

export default function GalleryGrid({ items, categories = GALLERY_CATEGORIES }: GalleryGridProps) {
    const [filter, setFilter] = useState<Filter>("all");
    const [active, setActive] = useState<number | null>(null);

    const visible = useMemo(
        () => (filter === "all" ? items : items.filter((it) => it.category === filter)),
        [items, filter],
    );

    // only offer tabs that actually have photos
    const tabs = useMemo(
        () => [
            { id: "all" as Filter, label: "All", count: items.length },
            ...categories
                .map((c) => ({ id: c.id as Filter, label: c.label, count: items.filter((it) => it.category === c.id).length }))
                .filter((t) => t.count > 0),
        ],
        [items, categories],
    );

    const close = useCallback(() => setActive(null), []);

    return (
        <section aria-label="Photo gallery" className="bg-background px-6 py-12 sm:py-16">
            <div className="mx-auto max-w-6xl">
                <div role="group" aria-label="Filter photos by category" className="flex flex-wrap gap-2">
                    {tabs.map((t) => {
                        const selected = filter === t.id;
                        return (
                            <button
                                key={t.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setFilter(t.id)}
                                className={cn(
                                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                                    selected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary",
                                )}
                            >
                                {t.label}
                                <span className={cn("ml-1.5 text-xs tabular-nums", selected ? "opacity-80" : "text-muted-foreground")}>
                                    {t.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <p className="sr-only" role="status" aria-live="polite">
                    Showing {visible.length} {visible.length === 1 ? "photo" : "photos"}
                </p>

                {visible.length === 0 ? (
                    <p className="mt-12 text-center text-muted-foreground">No photos in this category yet.</p>
                ) : (
                    <ul className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3">
                        {visible.map((item, i) => (
                            <motion.li
                                key={item.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: "easeOut" }}
                                className="mb-5 break-inside-avoid"
                            >
                                <button
                                    type="button"
                                    onClick={() => setActive(i)}
                                    aria-label={`Open photo: ${item.caption}`}
                                    className={cn(
                                        "group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-secondary/30 shadow-sm ring-1 ring-border",
                                        "transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10",
                                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                                        SHAPES[i % SHAPES.length],
                                    )}
                                >
                                    <Image
                                        src={item.src}
                                        alt={item.alt}
                                        fill
                                        sizes="(min-width: 1024px) 368px, (min-width: 640px) 45vw, 100vw"
                                        onError={(e) => {
                                            e.currentTarget.style.visibility = "hidden";
                                        }}
                                        className="object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark/80 to-transparent px-4 pb-3 pt-10 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                                        {item.caption}
                                    </span>
                                </button>
                            </motion.li>
                        ))}
                    </ul>
                )}
            </div>

            <GalleryLightbox items={visible} index={active} onClose={close} onIndexChange={setActive} />
        </section>
    );
}
