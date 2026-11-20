import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PageHeader from "@/components/shared/PageHeader";
import VolunteerIntro from "@/features/volunteer/components/VolunteerIntro";
import VolunteerRoles from "@/features/volunteer/components/VolunteerRoles";
import VolunteerSteps from "@/features/volunteer/components/VolunteerSteps";
import VolunteerForm from "@/features/volunteer/components/VolunteerForm";
import VolunteerMoments from "@/features/volunteer/components/VolunteerMoments";
import VolunteerFaq from "@/features/volunteer/components/VolunteerFaq";
import VolunteerContact from "@/features/volunteer/components/VolunteerContact";

export const metadata: Metadata = buildMetadata({
    title: "Volunteer with an NGO in Patna, Bihar",
    description:
        "Volunteer with Shivam Jan Swasthya Evem Sarwangin Vikash Kendra: join cleanliness drives, awareness campaigns, teaching and community events in Patna.",
    path: "/volunteer",
    keywords: ["volunteer in Patna", "NGO volunteer Bihar", "volunteer opportunities Patna", "social work volunteer", "join NGO Patna"],
});

export default function VolunteerPage() {
    return (
        <>
            <PageHeader
                eyebrow="Be a Volunteer"
                title={
                    <>
                        Give your time, <span className="text-primary">change lives</span>
                    </>
                }
                description="You do not need special skills to help. Tell us how you would like to contribute and join us on the ground."
                breadcrumbs={[{ label: "Be a Volunteer" }]}
            />
            <VolunteerIntro />
            <VolunteerRoles />
            <VolunteerSteps />
            <VolunteerForm />
            <VolunteerMoments />
            <VolunteerFaq />
            <VolunteerContact />
        </>
    );
}
