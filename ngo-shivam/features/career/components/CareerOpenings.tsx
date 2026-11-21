import Link from "next/link";
import { IconArrowRight, IconBriefcase, IconCheck, IconMapPin } from "@tabler/icons-react";
import { ACTIVITY_ICONS } from "@/features/activities/components/activityIcons";
import { ACTIVITIES } from "@/features/activities/data/activities";
import { OPENINGS } from "@/features/career/data/careers";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Current Openings",
    title: "Open positions",
    empty:
        "We have no vacancies listed right now, but we are always glad to hear from capable, caring people. Send a general application below and we will contact you when a suitable role opens.",
    areasEyebrow: "Where You Could Work",
    areasTitle: "Our areas of work",
    areasIntro: "Our teams work across these programmes. Mention the one that interests you in your application.",
};
/* ===================================================================== */

export default function CareerOpenings() {
    return (
        <>
            <section id="openings" className="relative w-full scroll-mt-24 bg-brand-light px-6 py-24 sm:py-28">
                <div className="mx-auto max-w-5xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-block rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                            {SECTION.eyebrow}
                        </span>
                        <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                            {SECTION.title}
                        </h2>
                    </div>

                    {OPENINGS.length === 0 ? (
                        <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
                            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
                                <IconBriefcase size={28} aria-hidden />
                            </span>
                            <p className="mt-5 text-base leading-relaxed text-muted-foreground">{SECTION.empty}</p>
                            <a
                                href="#apply"
                                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                            >
                                Send a general application
                                <IconArrowRight size={18} aria-hidden />
                            </a>
                        </div>
                    ) : (
                        <div className="mt-12 grid gap-6 md:grid-cols-2">
                            {OPENINGS.map((job) => (
                                <article
                                    key={job.title}
                                    className="rounded-3xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                                >
                                    <h3 className="text-xl font-bold text-brand-dark">{job.title}</h3>
                                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5">
                                            <IconBriefcase size={16} aria-hidden className="text-primary" />
                                            {job.type}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <IconMapPin size={16} aria-hidden className="text-primary" />
                                            {job.location}
                                        </span>
                                    </p>
                                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{job.summary}</p>
                                    <ul className="mt-5 space-y-2.5">
                                        {job.requirements.map((r) => (
                                            <li key={r} className="flex items-start gap-3 text-sm text-foreground/80">
                                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                                    <IconCheck size={12} aria-hidden />
                                                </span>
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href="#apply"
                                        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:gap-3"
                                    >
                                        Apply for this role
                                        <IconArrowRight size={18} aria-hidden />
                                    </a>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="relative w-full bg-background px-6 py-24 sm:py-28">
                <div className="mx-auto max-w-6xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-block rounded-full border border-primary/30 bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                            {SECTION.areasEyebrow}
                        </span>
                        <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                            {SECTION.areasTitle}
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground sm:text-lg">{SECTION.areasIntro}</p>
                    </div>
                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {ACTIVITIES.map((a) => {
                            const Icon = ACTIVITY_ICONS[a.icon];
                            return (
                                <Link
                                    key={a.slug}
                                    href={`/activities/${a.slug}`}
                                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                                >
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                        <Icon size={24} />
                                    </span>
                                    <span>
                                        <span className="block font-bold text-brand-dark">{a.shortTitle}</span>
                                        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{a.tagline}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}
