import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";
import GalleryGrid from "@/features/gallery/components/GalleryGrid";
import { GALLERY_ITEMS } from "@/lib/gallery";

export const metadata: Metadata = {
    title: "Gallery | Shivam Jan Swasthya Evem Sarwangin Vikash Kendra",
    description:
        "Photos from our health camps, awareness drives, community programmes and volunteers on the ground.",
};

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
