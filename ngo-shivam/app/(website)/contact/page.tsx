import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PageHeader from "@/components/shared/PageHeader";
import ContactCards from "@/features/contact/components/ContactCards";
import ContactForm from "@/features/contact/components/ContactForm";
import OfficeMap from "@/features/contact/components/OfficeMap";
import AboutCta from "@/features/about/components/AboutCta";

export const metadata: Metadata = buildMetadata({
    title: "Contact Us – NGO Office in Patna, Bihar",
    description:
        "Call, email or visit Shivam Jan Swasthya Evem Sarwangin Vikash Kendra in Patna, Bihar. Find our head office, registered office, phone numbers and email.",
    path: "/contact",
    keywords: ["contact NGO Patna", "NGO office Boring Road Patna", "Shivam NGO contact number", "NGO address Keshari Nagar Patna"],
});

export default function ContactPage() {
    return (
        <>
            <PageHeader
                eyebrow="Contact Us"
                title={
                    <>
                        We would love to <span className="text-primary">hear from you</span>
                    </>
                }
                description="Questions, ideas or want to work with us? Reach out by phone or email, send us a message, or visit our offices in Patna."
                breadcrumbs={[{ label: "Contact Us" }]}
            />
            <ContactCards />
            <ContactForm />
            <OfficeMap />
            <AboutCta />
        </>
    );
}
