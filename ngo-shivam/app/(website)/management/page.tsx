import type { Metadata } from "next";
import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import PageHeader from "@/components/shared/PageHeader";
import AboutCta from "@/features/about/components/AboutCta";
import TeamGrid from "@/features/management/components/TeamGrid";
import { CONTACT } from "@/lib/org";
import { TEAM } from "@/lib/team";

export const metadata: Metadata = {
    title: "Management & Leadership | Shivam Jan Swasthya Evem Sarwangin Vikash Kendra",
    description:
        "Meet the Chairman, Secretary and Treasurer who guide Shivam Jan Swasthya Evem Sarwangin Vikash Kendra, working for community health and development in Patna, Bihar.",
    keywords: [
        "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra management",
        "chairman message",
        "office bearers",
        "leadership team",
        "Patna community development",
    ],
};

export default function ManagementPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra",
        address: { "@type": "PostalAddress", streetAddress: CONTACT.registeredOffice, addressCountry: "IN" },
        member: TEAM.map((m) => ({
            "@type": "OrganizationRole",
            roleName: m.role,
            member: { "@type": "Person", name: m.name, jobTitle: m.role },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            <PageHeader
                eyebrow="Management"
                title={
                    <>
                        The people who <span className="text-primary">guide our work</span>
                    </>
                }
                description="Meet the office-bearers of Shivam Jan Swasthya Evem Sarwangin Vikash Kendra and read their messages."
                breadcrumbs={[{ label: "Management" }]}
            />

            {/* Team */}
            <section id="team" className="relative w-full bg-background px-6 py-20 sm:py-24">
                <div className="mx-auto max-w-5xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-block rounded-full border border-primary/30 bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                            Leadership &amp; Our Team
                        </span>
                        <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                            Our office-bearers
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                            Select a card to view each member's profile and message.
                        </p>
                    </div>
                    <div className="mt-14">
                        <TeamGrid members={TEAM} />
                    </div>
                </div>
            </section>

            {/* Reach the management */}
            <section className="relative w-full bg-brand-light px-6 py-16 sm:py-20">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-center text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
                        Write to the management
                    </h2>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <IconMapPin size={24} aria-hidden className="text-primary" />
                            <h3 className="mt-3 font-bold text-brand-dark">Registered office</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{CONTACT.registeredOffice}</p>
                        </div>
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <IconPhone size={24} aria-hidden className="text-primary" />
                            <h3 className="mt-3 font-bold text-brand-dark">Phone</h3>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                {CONTACT.phones.map((p) => (
                                    <li key={p.href}>
                                        <a href={p.href} className="transition hover:text-primary">{p.label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <IconMail size={24} aria-hidden className="text-primary" />
                            <h3 className="mt-3 font-bold text-brand-dark">Email</h3>
                            <p className="mt-2 break-all text-sm text-muted-foreground">
                                <a href={`mailto:${CONTACT.email}`} className="transition hover:text-primary">
                                    {CONTACT.email}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <AboutCta />
        </>
    );
}
