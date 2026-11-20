import Link from "next/link";
import { IconArrowLeft, IconQuote } from "@tabler/icons-react";
import PageHeader from "@/components/shared/PageHeader";
import AboutCta from "@/features/about/components/AboutCta";
import MemberPhoto from "@/features/management/components/MemberPhoto";
import { TEAM, type TeamMember } from "@/lib/team";

const ORG = "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra";

/** Default introduction used until a custom `about` is added in lib/team.ts. */
export const defaultAbout = (m: TeamMember) =>
    `${m.name} serves as the ${m.role} of ${ORG}, an organisation working for community health, sanitation, education and all-round development in Patna, Bihar.`;

export default function MemberProfile({ member }: { member: TeamMember }) {
    const about = member.about?.length ? member.about : [defaultAbout(member)];
    const others = TEAM.filter((m) => m.id !== member.id);

    return (
        <>
            <PageHeader
                eyebrow={member.role}
                title={member.name}
                description={`${member.role}, ${ORG}`}
                breadcrumbs={[{ label: "Management", href: "/management" }, { label: member.name }]}
            />

            <article className="w-full bg-background px-6 py-16 sm:py-20">
                <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
                    {/* photo + role */}
                    <aside className="mx-auto w-full max-w-xs lg:sticky lg:top-32 lg:self-start">
                        <MemberPhoto
                            member={member}
                            sizes="(min-width: 1024px) 320px, 90vw"
                            priority
                            className="aspect-[4/5] w-full rounded-3xl shadow-lg ring-4 ring-background"
                        />
                        <div className="mt-6 text-center">
                            <p className="text-xl font-bold text-brand-dark">{member.name}</p>
                            <span className="mt-2 inline-block rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                                {member.role}
                            </span>
                        </div>
                    </aside>

                    {/* content */}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
                            About {member.name}
                        </h2>
                        <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                            {about.map((p) => (
                                <p key={p}>{p}</p>
                            ))}
                        </div>

                        <div className="mt-12 rounded-3xl border border-primary/25 bg-brand-light p-7 sm:p-9">
                            <IconQuote size={32} aria-hidden className="text-primary/40" />
                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
                                Message from the {member.role}
                            </h2>
                            {member.message && member.message.length > 0 ? (
                                <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                                    {member.message.map((p) => (
                                        <p key={p}>{p}</p>
                                    ))}
                                    <p className="pt-2 font-semibold text-brand-dark">
                                        {member.name}
                                        <span className="block text-sm font-medium text-foreground/60">
                                            {member.role}, {ORG}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                                    The message from {member.name} will be shared here soon. Please check back shortly.
                                </p>
                            )}
                        </div>

                        <Link
                            href="/management"
                            className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                        >
                            <IconArrowLeft
                                size={16}
                                aria-hidden
                                className="transition-transform duration-200 group-hover:-translate-x-1"
                            />
                            Back to Management
                        </Link>
                    </div>
                </div>
            </article>

            {/* other members (internal links) */}
            <section className="w-full bg-brand-light px-6 py-14">
                <div className="mx-auto max-w-5xl text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-brand-dark">Meet the rest of our team</h2>
                    <nav aria-label="Other team members" className="mt-6 flex flex-wrap justify-center gap-3">
                        {others.map((m) => (
                            <Link
                                key={m.id}
                                href={`/management/${m.id}`}
                                className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-foreground/80 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                            >
                                {m.name} <span className="text-foreground/50">· {m.role}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </section>

            <AboutCta />
        </>
    );
}
