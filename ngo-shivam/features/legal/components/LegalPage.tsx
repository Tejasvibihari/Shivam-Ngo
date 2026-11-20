import Link from "next/link";
import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import PageHeader from "@/components/shared/PageHeader";
import { CONTACT } from "@/lib/org";
import { LEGAL_DOCS, LEGAL_LAST_UPDATED, type LegalDoc } from "@/lib/legal";

/** Shared layout for the Privacy Policy, Terms of Service and Donation Policy pages. */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
    const others = LEGAL_DOCS.filter((d) => d.slug !== doc.slug);

    return (
        <>
            <PageHeader
                eyebrow="Legal"
                title={doc.title}
                description={doc.description}
                breadcrumbs={[{ label: doc.shortTitle }]}
            />

            <article className="w-full bg-background px-6 py-16 sm:py-20">
                <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
                    {/* table of contents */}
                    <aside className="lg:sticky lg:top-32 lg:self-start">
                        <nav aria-label="On this page" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-widest text-primary">On this page</p>
                            <ol className="mt-3 space-y-1.5 text-sm">
                                {doc.sections.map((s) => (
                                    <li key={s.id}>
                                        <a href={`#${s.id}`} className="block text-foreground/70 transition hover:text-primary">
                                            {s.heading.replace(/^\d+\.\s*/, "")}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </aside>

                    {/* body */}
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground/60">Last updated: {LEGAL_LAST_UPDATED}</p>
                        <p className="mt-4 text-lg leading-relaxed text-foreground/80">{doc.lead}</p>

                        <div className="mt-10 space-y-10">
                            {doc.sections.map((s) => (
                                <section key={s.id} id={s.id} className="scroll-mt-28">
                                    <h2 className="text-xl font-bold tracking-tight text-brand-dark sm:text-2xl">
                                        {s.heading}
                                    </h2>
                                    <div className="mt-3 space-y-4 text-base leading-relaxed text-muted-foreground">
                                        {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
                                        {s.items && (
                                            <ul className="list-disc space-y-2 pl-6 marker:text-primary">
                                                {s.items.map((i) => <li key={i}>{i}</li>)}
                                            </ul>
                                        )}
                                        {s.after?.map((p) => <p key={p}>{p}</p>)}
                                        {s.id === "contact" && (
                                            <div className="not-prose mt-2 grid gap-4 rounded-2xl border border-border bg-brand-light p-6 sm:grid-cols-1">
                                                <p className="font-semibold text-brand-dark">{CONTACT_NAME}</p>
                                                <p className="flex items-start gap-3">
                                                    <IconMapPin size={20} aria-hidden className="mt-0.5 shrink-0 text-primary" />
                                                    <span>Registered office: {CONTACT.registeredOffice}</span>
                                                </p>
                                                <p className="flex items-start gap-3">
                                                    <IconPhone size={20} aria-hidden className="mt-0.5 shrink-0 text-primary" />
                                                    <span>
                                                        {CONTACT.phones.map((p, i) => (
                                                            <span key={p.href}>
                                                                {i > 0 && ", "}
                                                                <a href={p.href} className="hover:text-primary">{p.label}</a>
                                                            </span>
                                                        ))}
                                                    </span>
                                                </p>
                                                <p className="flex items-start gap-3">
                                                    <IconMail size={20} aria-hidden className="mt-0.5 shrink-0 text-primary" />
                                                    <a href={`mailto:${CONTACT.email}`} className="break-all hover:text-primary">
                                                        {CONTACT.email}
                                                    </a>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            ))}
                        </div>

                        <nav aria-label="Other policies" className="mt-14 flex flex-wrap items-center gap-3 border-t border-border pt-8 text-sm">
                            <span className="font-semibold text-brand-dark">Also read:</span>
                            {others.map((d) => (
                                <Link
                                    key={d.slug}
                                    href={`/${d.slug}`}
                                    className="rounded-full border border-border bg-card px-4 py-2 font-medium text-foreground/80 transition hover:border-primary/40 hover:text-primary"
                                >
                                    {d.shortTitle}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </article>
        </>
    );
}

const CONTACT_NAME = "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra";
