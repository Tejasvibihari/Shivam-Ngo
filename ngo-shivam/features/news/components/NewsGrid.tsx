import Link from "next/link";
import { IconArrowRight, IconCalendar, IconNews } from "@tabler/icons-react";
import NewsImage from "@/features/news/components/NewsImage";
import { formatNewsDate, type NewsItem } from "@/lib/news";

/** Grid of news cards. Each card opens the full article (Hindi by default, English available). */
export default function NewsGrid({ items }: { items: NewsItem[] }) {
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

    return (
        <section className="relative w-full bg-background px-6 py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((n) => {
                    const date = formatNewsDate(n.date);
                    const href = `/news/${n.slug}`;
                    return (
                        <article
                            key={n.slug}
                            className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <Link
                                href={href}
                                tabIndex={-1}
                                aria-hidden
                                className="group relative block aspect-[4/3] w-full overflow-hidden bg-muted"
                            >
                                <NewsImage
                                    src={n.image}
                                    alt={n.imageAlt.hi}
                                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                />
                            </Link>

                            <div className="flex flex-1 flex-col p-6">
                                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider text-primary">
                                    <span lang="hi">{n.category.hi}</span>
                                    {n.publication && <span>{n.publication}</span>}
                                    {date && (
                                        <time dateTime={n.date} className="inline-flex items-center gap-1">
                                            <IconCalendar size={14} aria-hidden />
                                            {date}
                                        </time>
                                    )}
                                </p>
                                <h2 lang="hi" className="mt-2 text-lg font-bold leading-snug text-brand-dark">
                                    {n.title.hi}
                                </h2>
                                <p lang="en" className="mt-1 text-sm font-medium text-foreground/70">
                                    {n.title.en}
                                </p>
                                <p lang="hi" className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                    {n.summary.hi}
                                </p>
                                <Link
                                    href={href}
                                    aria-label={`Read more: ${n.title.en}`}
                                    className="group/link mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                                >
                                    Read more
                                    <IconArrowRight
                                        size={16}
                                        aria-hidden
                                        className="transition-transform duration-200 group-hover/link:translate-x-1"
                                    />
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
