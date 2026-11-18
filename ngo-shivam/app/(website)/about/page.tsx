import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";
import AboutStory from "@/features/about/components/AboutStory";
import MissionVision from "@/features/about/components/MissionVision";
import CoreValues from "@/features/about/components/CoreValues";
import HowWeWork from "@/features/about/components/HowWeWork";
import VisitUs from "@/features/about/components/VisitUs";
import AboutCta from "@/features/about/components/AboutCta";
import WhatWeDoSection from "@/features/home/components/WhatWeDoSection";
import TeamSection from "@/features/home/components/TeamSection";

export const metadata: Metadata = {
    title: "About Us | Shivam Jan Swasthya Evem Sarwangin Vikash Kendra",
    description:
        "Learn about our vision, mission, objectives and the people behind Shivam Jan Swasthya Evem Sarwangin Vikash Kendra, working for community health, sanitation and all-round development in Patna, Bihar since 2004.",
};

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
