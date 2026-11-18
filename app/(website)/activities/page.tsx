import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";
import ActivitiesOverview from "@/features/activities/components/ActivitiesOverview";
import ProgrammeTypes from "@/features/activities/components/ProgrammeTypes";
import ProjectsShowcase from "@/features/activities/components/ProjectsShowcase";
import FieldGallery from "@/features/activities/components/FieldGallery";
import GetInvolved from "@/features/activities/components/GetInvolved";
import ActivitiesFaq from "@/features/activities/components/ActivitiesFaq";
import AboutCta from "@/features/about/components/AboutCta";

export const metadata: Metadata = {
    title: "Activities | Shivam Jan Swasthya Evem Sarwangin Vikash Kendra",
    description:
        "Explore our work in sanitation, cleanliness, education, vocational training, health awareness and social development, plus our projects, programmes and ways to get involved.",
};

export default function ActivitiesPage() {
    return (
        <>
            <PageHeader
                eyebrow="Our Activities"
                title={
                    <>
                        Work that reaches <span className="text-primary">every household</span>
                    </>
                }
                description="From clean-up drives to health camps and skill training, here is what we do on the ground and how you can be part of it."
                breadcrumbs={[{ label: "Activities" }]}
            />
            <ActivitiesOverview />
            <ProgrammeTypes />
            <ProjectsShowcase />
            <FieldGallery />
            <GetInvolved />
            <ActivitiesFaq />
            <AboutCta />
        </>
    );
}
