import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PageHeader from "@/components/shared/PageHeader";
import AboutStory from "@/features/about/components/AboutStory";
import MissionVision from "@/features/about/components/MissionVision";
import CoreValues from "@/features/about/components/CoreValues";
import HowWeWork from "@/features/about/components/HowWeWork";
import VisitUs from "@/features/about/components/VisitUs";
import AboutCta from "@/features/about/components/AboutCta";
import WhatWeDoSection from "@/features/home/components/WhatWeDoSection";
import TeamSection from "@/features/home/components/TeamSection";

export const metadata: Metadata = buildMetadata({
    title: "About Us – Community Health NGO in Patna",
    description:
        "Our vision, mission and eight objectives: Shivam Jan Swasthya Evem Sarwangin Vikash Kendra, a Patna NGO for health and sanitation since 2004.",
    path: "/about",
    keywords: ["about Shivam NGO", "NGO vision and mission", "community health NGO Patna", "NGO objectives Bihar", "NGO since 2004"],
});

export default function AboutPage() {
    return (
        <>
            <PageHeader
                eyebrow="About Us"
                title={
                    <>
                        Building healthier communities, <span className="text-primary">together</span>
                    </>
                }
                description="Who we are, our vision and mission, the eight objectives that guide our work and the people who make it possible."
                breadcrumbs={[{ label: "About Us" }]}
            />
            <AboutStory />
            <MissionVision />
            <WhatWeDoSection />
            <CoreValues />
            <HowWeWork />
            <TeamSection />
            <VisitUs />
            <AboutCta />
        </>
    );
}
