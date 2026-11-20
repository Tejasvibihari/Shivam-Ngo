"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconCalendar } from "@tabler/icons-react";
import PageHeader from "@/components/shared/PageHeader";
import NewsImage from "@/features/news/components/NewsImage";
import { formatNewsDate, type Lang, type NewsBlock, type NewsItem } from "@/lib/news";

const LANGS: { id: Lang; label: string }[] = [
    { id: "hi", label: "हिन्दी" },
    { id: "en", label: "English" },
];

function Blocks({ blocks }: { blocks: NewsBlock[] }) {
    return (
        <>
            {blocks.map((b, i) => {
                switch (b.type) {
                    case "h2":
                        return (
                            <h2 key={i} className="mt-10 text-2xl font-bold tracking-tight text-brand-dark">
                                {b.text}
                            </h2>
                        );
                    case "p":
                        return <p key={i}>{b.text}</p>;
                    case "ul":
                        return (
                            <ul key={i} className="list-disc space-y-1.5 pl-6 marker:text-primary">
                                {b.items.map((t) => <li key={t}>{t}</li>)}
                            </ul>
                        );
                    case "ol":
                        return (
                            <ol key={i} className="list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-primary">
                                {b.items.map((t) => <li key={t}>{t}</li>)}
                            </ol>
                        );
                }
            })}
        </>
    );
}

/**
 * Full article. Hindi is shown first; the reader can switch to English.
 * Both versions are in the page HTML (the inactive one is just hidden), so search engines can read both.
 */
export default function NewsArticleView({ item }: { item: NewsItem }) {
    const [lang, setLang] = useState<Lang>("hi");
    const date = formatNewsDate(item.date);

    return (
        <>
            <PageHeader
                eyebrow={item.category[lang]}
                title={
                    <>
                        <span lang="hi" hidden={lang !== "hi"}>{item.title.hi}</span>
                        <span lang="en" hidden={lang !== "en"}>{item.title.en}</span>
                    </>
                }
                breadcrumbs={[{ label: "News & Events", href: "/news" }, { label: item.title.en }]}
            />

            <article className="w-full bg-background px-6 py-14 sm:py-20">
                <div className="mx-auto max-w-3xl">
                    {/* language switch */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div role="group" aria-label="Choose language" className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
                            {LANGS.map((l) => (
                                <button
                                    key={l.id}
                                    type="button"
                                    lang={l.id}
                                    aria-pressed={lang === l.id}
                                    onClick={() => setLang(l.id)}
                                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                                        lang === l.id
                                            ? "bg-primary text-primary-foreground shadow"
                                            : "text-foreground/70 hover:text-primary"
                                    }`}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>

                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider text-primary">
                            <span>{item.subcategory[lang]}</span>
                            {item.publication && <span>{item.publication}</span>}
                            {date && (
                                <time dateTime={item.date} className="inline-flex items-center gap-1">
                                    <IconCalendar size={14} aria-hidden />
                                    {date}
                                </time>
                            )}
                        </p>
                    </div>

                    {/* image */}
                    <figure className="mt-8">
                        <a
                            href={item.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open the image full size"
                            className="relative block aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted shadow-lg ring-4 ring-background"
                        >
                            <NewsImage
                                src={item.image}
                                alt={item.imageAlt[lang]}
                                sizes="(min-width: 768px) 768px, 95vw"
                                priority
                                className="object-contain"
                            />
                        </a>
                    </figure>

                    {/* content: both languages rendered, one visible */}
                    {LANGS.map(({ id }) => (
                        <div key={id} lang={id} hidden={lang !== id}>
                            <p className="mt-8 text-lg font-medium leading-relaxed text-foreground/80">
                                {item.subtitle[id]}
                            </p>
                            <div className={`mt-6 space-y-5 text-base text-muted-foreground sm:text-lg ${id === "hi" ? "leading-loose" : "leading-relaxed"}`}>
                                <Blocks blocks={item.body[id]} />
                            </div>
                            {item.closing?.[id] && (
                                <div className="mt-10 rounded-3xl border border-primary/30 bg-brand-light p-8">
                                    <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                                        {item.closing[id]!.label}
                                    </p>
                                    <p className="mt-3 text-lg font-semibold leading-relaxed text-brand-dark">
                                        {item.closing[id]!.text}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    <Link
                        href="/news"
                        className="group mt-12 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                        <IconArrowLeft size={16} aria-hidden className="transition-transform duration-200 group-hover:-translate-x-1" />
                        Back to News &amp; Events
                    </Link>
                </div>
            </article>
        </>
    );
}
