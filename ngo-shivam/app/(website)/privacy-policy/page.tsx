import type { Metadata } from "next";
import LegalPage from "@/features/legal/components/LegalPage";
import { getLegalDoc } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

const doc = getLegalDoc("privacy-policy");

export const metadata: Metadata = buildMetadata({
    title: doc.title,
    description: doc.description,
    path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
    return <LegalPage doc={doc} />;
}
