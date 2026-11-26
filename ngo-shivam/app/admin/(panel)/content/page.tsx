import type { Metadata } from "next";
import SectionPlaceholder from "@/features/admin/access/components/SectionPlaceholder";

export const metadata: Metadata = { title: "Content" };

// The panel renders its pages only after the client-side session check (ProtectedRoute), so they
// cannot be instant navigations. Opts out of Next.js's instant-navigation validation (dev warning).
export const instant = false;

export default function AdminContentPage() {
    return <SectionPlaceholder title="Content" description="News, activities, gallery and team pages." />;
}
