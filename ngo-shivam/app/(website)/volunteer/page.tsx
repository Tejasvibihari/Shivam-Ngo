import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";
import VolunteerIntro from "@/features/volunteer/components/VolunteerIntro";
import VolunteerRoles from "@/features/volunteer/components/VolunteerRoles";
import VolunteerSteps from "@/features/volunteer/components/VolunteerSteps";
import VolunteerForm from "@/features/volunteer/components/VolunteerForm";
import VolunteerMoments from "@/features/volunteer/components/VolunteerMoments";
import VolunteerFaq from "@/features/volunteer/components/VolunteerFaq";
import VolunteerContact from "@/features/volunteer/components/VolunteerContact";

export const metadata: Metadata = {
    title: "Be a Volunteer | Shivam Jan Swasthya Evem Sarwangin Vikash Kendra",
    description:
        "Join hands with Shivam Jan Swasthya Evem Sarwangin Vikash Kendra. Help with cleanliness drives, awareness campaigns, teaching and training, and community events in Patna, Bihar.",
};

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
