import type { Metadata } from "next";
import LegalPage from "@/features/legal/components/LegalPage";
import { getLegalDoc } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

const doc = getLegalDoc("terms");

export const metadata: Metadata = buildMetadata({
    title: doc.title,
    description: doc.description,
    path: "/terms",
});

export default function TermsPage() {
    return <LegalPage doc={doc} />;
}
