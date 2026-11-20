import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberProfile, { defaultAbout } from "@/features/management/components/MemberProfile";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, ORG_ID } from "@/lib/site";
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

    return buildMetadata({
        title: `${member.name} – ${member.role}`,
        description,
        path: `/management/${member.id}`,
        type: "profile",
        image: { url: member.photo, alt: `${member.name}, ${member.role}` },
        keywords: [
            member.name,
            `${member.name} ${member.role}`,
            `${ORG} ${member.role}`,
            `${member.role} message`,
            "management team",
            "Patna",
        ],
    });
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
        url: absoluteUrl(`/management/${member.id}`),
        image: absoluteUrl(member.photo),
        worksFor: { "@type": "Organization", "@id": ORG_ID, name: ORG },
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
