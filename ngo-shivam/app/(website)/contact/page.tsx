import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";
import ContactCards from "@/features/contact/components/ContactCards";
import ContactForm from "@/features/contact/components/ContactForm";
import OfficeMap from "@/features/contact/components/OfficeMap";
import AboutCta from "@/features/about/components/AboutCta";

export const metadata: Metadata = {
    title: "Contact Us | Shivam Jan Swasthya Evem Sarwangin Vikash Kendra",
    description:
        "Get in touch with Shivam Jan Swasthya Evem Sarwangin Vikash Kendra in Patna, Bihar. Call, email, send us a message or visit our offices.",
};

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
