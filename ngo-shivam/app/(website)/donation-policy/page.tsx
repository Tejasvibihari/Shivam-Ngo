import type { Metadata } from "next";
import LegalPage from "@/features/legal/components/LegalPage";
import { getLegalDoc } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

const doc = getLegalDoc("donation-policy");

export const metadata: Metadata = buildMetadata({
    title: doc.title,
    description: doc.description,
    path: "/donation-policy",
});

export default function DonationPolicyPage() {
    return <LegalPage doc={doc} />;
}
