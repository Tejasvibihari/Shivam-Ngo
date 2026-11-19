import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ActivityDetail from "@/features/activities/components/ActivityDetail";
import { ACTIVITIES, getActivity } from "@/features/activities/data/activities";

type PageProps = { params: Promise<{ slug: string }> };

/** Pre-build every activity page. */
export function generateStaticParams() {
    return ACTIVITIES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const activity = getActivity(slug);
    if (!activity) return {};

    return {
        title: `${activity.meta.title} | Shivam Jan Swasthya Evem Sarwangin Vikash Kendra`,
        description: activity.meta.description,
        keywords: activity.meta.keywords,
        openGraph: {
            type: "article",
            title: activity.meta.title,
            description: activity.meta.description,
        },
    };
}

export default async function ActivityPage({ params }: PageProps) {
    const { slug } = await params;
    const activity = getActivity(slug);
    if (!activity) notFound();
    return <ActivityDetail activity={activity} />;
}
