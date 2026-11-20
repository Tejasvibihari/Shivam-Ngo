import type { Metadata } from "next";
import LegalPage from "@/features/legal/components/LegalPage";
import { getLegalDoc, ORG_NAME } from "@/lib/legal";

const doc = getLegalDoc("privacy-policy");

export const metadata: Metadata = {
    title: `${doc.title} | ${ORG_NAME}`,
    description: doc.description,
};

export default function PrivacyPolicyPage() {
    return <LegalPage doc={doc} />;
}
