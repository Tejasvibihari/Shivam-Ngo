import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PageHeader from "@/components/shared/PageHeader";
import ActivitiesOverview from "@/features/activities/components/ActivitiesOverview";
import ProgrammeTypes from "@/features/activities/components/ProgrammeTypes";
import ProjectsShowcase from "@/features/activities/components/ProjectsShowcase";
import FieldGallery from "@/features/activities/components/FieldGallery";
import GetInvolved from "@/features/activities/components/GetInvolved";
import ActivitiesFaq from "@/features/activities/components/ActivitiesFaq";
import AboutCta from "@/features/about/components/AboutCta";

export const metadata: Metadata = buildMetadata({
    title: "Activities: Sanitation, Health & Skill Training",
    description:
        "Sanitation, housekeeping services, household toilets, vocational training, education, health programmes and social reforms by our NGO in Patna, Bihar.",
    path: "/activities",
    keywords: [
        "NGO activities Patna",
        "sanitation NGO Bihar",
        "household toilet construction Bihar",
        "vocational training Patna",
        "health programmes Bihar",
        "housekeeping services Patna",
        "social reforms NGO",
    ],
});

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
