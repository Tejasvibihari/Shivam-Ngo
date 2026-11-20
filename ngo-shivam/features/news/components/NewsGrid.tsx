"use client";

import { useState } from "react";
import Image from "next/image";
import { IconCalendar, IconNews, IconZoomIn } from "@tabler/icons-react";
import GalleryLightbox from "@/features/gallery/components/GalleryLightbox";
import { formatNewsDate, type NewsItem } from "@/lib/news";

/** Grid of newspaper cuttings. Click a cutting to read it full-size (Esc closes, arrow keys browse). */
export default function NewsGrid({ items }: { items: NewsItem[] }) {
    const [open, setOpen] = useState<number | null>(null);

    if (items.length === 0) {
        return (
            <section className="w-full bg-background px-6 py-24">
                <div className="mx-auto max-w-xl text-center">
                    <span className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-accent text-primary">
                        <IconNews size={32} aria-hidden />
                    </span>
                    <h2 className="mt-6 text-2xl font-bold text-brand-dark">News coverage coming soon</h2>
                    <p className="mt-3 text-muted-foreground">
                        We are putting together press coverage of our work. Please check back shortly.
                    </p>
                </div>
            </section>
        );
    }

    // the shared photo viewer expects gallery-shaped items
    const viewerItems = items.map((n) => ({
        id: n.id,
        src: n.image.src,
        alt: n.image.alt ?? `Newspaper cutting: ${n.title}`,
        caption: n.title,
        category: "community" as const,
    }));

    return (
        <section className="relative w-full bg-background px-6 py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((n, i) => {
                    const date = formatNewsDate(n.date);
                    return (
                        <article
                            key={n.id}
                            className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <button
                                type="button"
                                onClick={() => setOpen(i)}
                                aria-label={`Open the newspaper cutting: ${n.title}`}
                                className="group relative block aspect-[4/5] w-full overflow-hidden bg-muted"
                            >
                                <Image
                                    src={n.image.src}
                                    alt={n.image.alt ?? `Newspaper cutting: ${n.title}`}
                                    fill
                                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                                    className="object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
                                />
                                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-brand-dark/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                    <IconZoomIn size={14} aria-hidden />
                                    Read full cutting
                                </span>
                            </button>

                            <div className="flex flex-1 flex-col p-6">
                                {(n.publication || date) && (
                                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider text-primary">
                                        {n.publication && <span>{n.publication}</span>}
                                        {date && (
                                            <time dateTime={n.date} className="inline-flex items-center gap-1">
                                                <IconCalendar size={14} aria-hidden />
                                                {date}
                                            </time>
                                        )}
                                    </p>
                                )}
                                <h2 className="mt-2 text-lg font-bold leading-snug text-brand-dark">{n.title}</h2>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{n.summary}</p>
                            </div>
                        </article>
                    );
                })}
            </div>

            <GalleryLightbox
                items={viewerItems}
                index={open}
                onClose={() => setOpen(null)}
                onIndexChange={setOpen}
            />
        </section>
    );
}
