import { IconBuilding, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { CONTACT } from "@/lib/org";

/** Contact / office details, taken from lib/org.ts so there is one source of truth. */
export default function VisitUs() {
    const offices = [
        { title: "Head Office", address: CONTACT.headOffice, icon: IconBuilding },
        { title: "Registered Office", address: CONTACT.registeredOffice, icon: IconMapPin },
    ];

    return (
        <section className="relative w-full bg-background px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-block rounded-full border border-primary/30 bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        Find Us
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                        Visit or get in touch
                    </h2>
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                        We would love to hear from you. Reach out or drop by our offices in Patna.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {offices.map(({ title, address, icon: Icon }) => (
                        <article key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
                                <Icon size={24} aria-hidden />
                            </span>
                            <h3 className="mt-5 text-lg font-bold text-brand-dark">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{address}</p>
                        </article>
                    ))}

                    <article className="rounded-3xl border border-border bg-card p-6 shadow-sm md:col-span-2 lg:col-span-1">
                        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
                            <IconPhone size={24} aria-hidden />
                        </span>
                        <h3 className="mt-5 text-lg font-bold text-brand-dark">Call or email</h3>
                        <ul className="mt-2 space-y-1.5 text-sm">
                            {CONTACT.phones.map((p) => (
                                <li key={p.href}>
                                    <a href={p.href} className="text-muted-foreground transition-colors hover:text-primary">
                                        {p.label}
                                    </a>
                                </li>
                            ))}
                            <li className="flex items-center gap-2">
                                <IconMail size={16} aria-hidden className="text-primary" />
                                <a
                                    href={`mailto:${CONTACT.email}`}
                                    className="break-all text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {CONTACT.email}
                                </a>
                            </li>
                        </ul>
                    </article>
                </div>
            </div>
        </section>
    );
}
