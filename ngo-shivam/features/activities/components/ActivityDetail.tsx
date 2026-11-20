import Link from "next/link";
import {
    IconArrowRight,
    IconCheck,
    IconChevronDown,
    IconHeartHandshake,
} from "@tabler/icons-react";
import PageHeader from "@/components/shared/PageHeader";
import AboutCta from "@/features/about/components/AboutCta";
import ActivityImage from "@/features/activities/components/ActivityImage";
import { ACTIVITY_ICONS } from "@/features/activities/components/activityIcons";
import { ACTIVITIES, type Activity, type ActivityBlock } from "@/features/activities/data/activities";
import { absoluteUrl, ORG_ID, WEBSITE_ID } from "@/lib/site";

function Block({ block }: { block: ActivityBlock }) {
    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">{block.heading}</h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {block.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                ))}
            </div>
        </div>
    );
}

/** Structured data (WebPage + FAQPage) so search engines understand the page. The BreadcrumbList is added by <Breadcrumbs>. */
function JsonLd({ activity }: { activity: Activity }) {
    const data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                name: activity.meta.title,
                url: absoluteUrl(`/activities/${activity.slug}`),
                description: activity.meta.description,
                inLanguage: "en-IN",
                about: activity.title,
                primaryImageOfPage: absoluteUrl(activity.image.src),
                isPartOf: { "@id": WEBSITE_ID },
                publisher: { "@type": "NGO", "@id": ORG_ID, name: "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra" },
            },
            {
                "@type": "FAQPage",
                mainEntity: activity.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
            },
        ],
    };
    return (
        <script
            type="application/ld+json"
            // "<" is escaped so the JSON can never close the script tag
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
    );
}

export default function ActivityDetail({ activity }: { activity: Activity }) {
    const Icon = ACTIVITY_ICONS[activity.icon];
    const related = ACTIVITIES.filter((a) => a.slug !== activity.slug);

    return (
        <>
            <JsonLd activity={activity} />

            <PageHeader
                eyebrow="Our Activities"
                title={activity.title}
                description={activity.tagline}
                breadcrumbs={[{ label: "Activities", href: "/activities" }, { label: activity.shortTitle }]}
            />

            <article>
                {/* Intro + photo */}
                <section className="relative w-full bg-background px-6 py-20 sm:py-24">
                    <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
                                <Icon size={28} aria-hidden />
                            </span>
                            <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                                {activity.introHeading}
                            </h2>
                            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                                {activity.intro.map((p) => (
                                    <p key={p}>{p}</p>
                                ))}
                            </div>
                        </div>
                        <ActivityImage src={activity.image.src} alt={activity.image.alt} priority />
                    </div>
                </section>

                {/* Why it matters + narrative blocks before the list */}
                <section className="relative w-full bg-brand-light px-6 py-20 sm:py-24">
                    <div className="mx-auto max-w-4xl space-y-14">
                        <Block block={{ heading: activity.whyHeading, paragraphs: activity.why }} />
                        {activity.before?.map((b) => <Block key={b.heading} block={b} />)}
                    </div>
                </section>

                {/* Numbered key areas */}
                <section className="relative w-full bg-background px-6 py-20 sm:py-24">
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                                {activity.itemsHeading}
                            </h2>
                            {activity.itemsIntro && (
                                <p className="mt-4 text-base text-muted-foreground sm:text-lg">{activity.itemsIntro}</p>
                            )}
                        </div>
                        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {activity.items.map((item, i) => (
                                <li
                                    key={item.title}
                                    className="rounded-3xl border border-border bg-card p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                                        {i + 1}
                                    </span>
                                    <h3 className="mt-4 text-lg font-bold text-brand-dark">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        {item.text}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Narrative blocks after the list */}
                {activity.after && activity.after.length > 0 && (
                    <section className="relative w-full bg-brand-light px-6 py-20 sm:py-24">
                        <div className="mx-auto max-w-4xl space-y-14">
                            {activity.after.map((b) => <Block key={b.heading} block={b} />)}
                        </div>
                    </section>
                )}

                {/* Ways to support (health page) */}
                {activity.support && (
                    <section className="relative w-full bg-background px-6 py-20 sm:py-24">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
                                {activity.support.heading}
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                                {activity.support.intro}
                            </p>
                            <ul className="mt-6 space-y-3">
                                {activity.support.items.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-base text-foreground/80">
                                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                            <IconCheck size={14} aria-hidden />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/#donate"
                                className="mt-8 inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-base font-bold text-cta-foreground shadow-lg shadow-cta/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                            >
                                <IconHeartHandshake size={20} aria-hidden />
                                Support this work
                            </Link>
                        </div>
                    </section>
                )}

                {/* Commitment + closing statement */}
                <section className="relative w-full bg-brand-light px-6 py-20 sm:py-24">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">Our Commitment</h2>
                        <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                            {activity.commitment.map((p) => (
                                <p key={p}>{p}</p>
                            ))}
                        </div>
                        <div className="mt-10 rounded-3xl border border-primary/30 bg-background p-8 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                                {activity.closing.label}
                            </p>
                            <p className="mt-3 text-xl font-semibold leading-snug text-brand-dark sm:text-2xl">
                                {activity.closing.text}
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQs */}
                <section className="relative w-full bg-background px-6 py-20 sm:py-24">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="text-center text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                            Frequently asked questions
                        </h2>
                        <div className="mt-10 space-y-3">
                            {activity.faqs.map((f) => (
                                <details
                                    key={f.q}
                                    className="group rounded-2xl border border-border bg-card px-6 py-4 shadow-sm open:shadow-md"
                                >
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-brand-dark [&::-webkit-details-marker]:hidden">
                                        {f.q}
                                        <IconChevronDown
                                            size={20}
                                            aria-hidden
                                            className="shrink-0 text-primary transition-transform duration-200 group-open:rotate-180"
                                        />
                                    </summary>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{f.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Other activities (internal links) */}
                <section className="relative w-full bg-brand-light px-6 py-16">
                    <div className="mx-auto max-w-6xl text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-brand-dark">Explore our other activities</h2>
                        <nav aria-label="Other activities" className="mt-8 flex flex-wrap justify-center gap-3">
                            {related.map((a) => {
                                const RelIcon = ACTIVITY_ICONS[a.icon];
                                return (
                                    <Link
                                        key={a.slug}
                                        href={`/activities/${a.slug}`}
                                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                                    >
                                        <RelIcon size={16} aria-hidden className="text-primary" />
                                        {a.shortTitle}
                                    </Link>
                                );
                            })}
                        </nav>
                        <Link
                            href="/activities"
                            className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                        >
                            View all activities
                            <IconArrowRight
                                size={16}
                                aria-hidden
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </section>
            </article>

            <AboutCta />
        </>
    );
}
