import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PageHeader from "@/components/shared/PageHeader";
import GalleryGrid from "@/features/gallery/components/GalleryGrid";
import { GALLERY_ITEMS } from "@/lib/gallery";

export const metadata: Metadata = buildMetadata({
    title: "Photo Gallery – Health Camps & Awareness Drives",
    description:
        "Photos of health camps, sanitation drives, awareness campaigns and volunteers from our community work in Patna, Bihar.",
    path: "/gallery",
    keywords: ["NGO photo gallery Patna", "health camp photos Bihar", "sanitation drive photos", "volunteer photos Patna"],
});

export default function GalleryPage() {
    return (
        <>
            <PageHeader
                eyebrow="Gallery"
                title={
                    <>
                        Moments that <span className="text-primary">make a difference</span>
                    </>
                }
                description="A look at our health camps, awareness drives and the people who make them happen."
                breadcrumbs={[{ label: "Gallery" }]}
            />
            <GalleryGrid items={GALLERY_ITEMS} />
        </>
    );
}
