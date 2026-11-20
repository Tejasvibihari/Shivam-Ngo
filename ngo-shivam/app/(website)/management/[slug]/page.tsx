import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberProfile, { defaultAbout } from "@/features/management/components/MemberProfile";
import { TEAM, getMember } from "@/lib/team";

type PageProps = { params: Promise<{ slug: string }> };

const ORG = "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra";

export function generateStaticParams() {
    return TEAM.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const member = getMember(slug);
    if (!member) return {};

    const description =
        member.metaDescription ??
        `${member.name}, ${member.role} of ${ORG}, Patna. Read the message and learn about the leadership behind our community work.`;

    return {
        title: `${member.name} – ${member.role} | ${ORG}`,
        description,
        keywords: [
            member.name,
            `${member.name} ${member.role}`,
            `${ORG} ${member.role}`,
            `${member.role} message`,
            "management team",
            "Patna",
        ],
        openGraph: {
            type: "profile",
            title: `${member.name} – ${member.role}`,
            description,
            images: [{ url: member.photo, alt: `${member.name}, ${member.role}` }],
        },
    };
}

export default async function MemberPage({ params }: PageProps) {
    const { slug } = await params;
    const member = getMember(slug);
    if (!member) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: member.name,
        jobTitle: member.role,
        description: member.about?.[0] ?? defaultAbout(member),
        image: member.photo,
        worksFor: { "@type": "Organization", name: ORG },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            <MemberProfile member={member} />
        </>
    );
}
