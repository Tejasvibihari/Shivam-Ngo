import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";
import CareerForm from "@/features/career/components/CareerForm";
import CareerIntro from "@/features/career/components/CareerIntro";
import CareerOpenings from "@/features/career/components/CareerOpenings";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "Careers – Jobs at an NGO in Patna, Bihar",
    description:
        "Build a career in community health and sanitation. See openings at Shivam Jan Swasthya Evem Sarwangin Vikash Kendra, Patna, and apply online.",
    path: "/career",
    keywords: ["NGO jobs in Patna", "NGO career Bihar", "jobs in social sector Patna", "apply for NGO job", "health NGO vacancies Bihar"],
});

export default function CareerPage() {
    return (
        <>
            <PageHeader
                eyebrow="Careers"
                title={
                    <>
                        Join our team, <span className="text-primary">grow with purpose</span>
                    </>
                }
                description="Work with an NGO that has served families in Patna and across Bihar since 2004. See our openings and send your application online."
                breadcrumbs={[{ label: "Career" }]}
            />
            <CareerIntro />
            <CareerOpenings />
            <CareerForm />
        </>
    );
}
