import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";
import AboutCta from "@/features/about/components/AboutCta";
import NewsGrid from "@/features/news/components/NewsGrid";
import { NEWS_ITEMS } from "@/lib/news";

export const metadata: Metadata = {
    title: "News & Media Coverage | Shivam Jan Swasthya Evem Sarwangin Vikash Kendra",
    description:
        "Newspaper coverage of the health, sanitation, education and community development work of Shivam Jan Swasthya Evem Sarwangin Vikash Kendra in Patna, Bihar.",
    keywords: [
        "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra news",
        "Patna community development news",
        "health camp news Bihar",
        "sanitation awareness news Patna",
        "newspaper coverage",
    ],
};

export default function NewsPage() {
    // structured data: the date is included only for items that have one
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "News & Media Coverage",
        inLanguage: "en-IN",
        mainEntity: {
            "@type": "ItemList",
            itemListElement: NEWS_ITEMS.map((n, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                    "@type": "NewsArticle",
                    headline: n.title,
                    description: n.summary,
                    ...(n.date ? { datePublished: n.date } : {}),
                    ...(n.publication ? { publisher: { "@type": "Organization", name: n.publication } } : {}),
                    image: n.image.src,
                },
            })),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            <PageHeader
                eyebrow="News & Events"
                title={
                    <>
                        Our work, <span className="text-primary">in the news</span>
                    </>
                }
                description="Newspaper coverage of our health camps, sanitation drives, education and community programmes."
                breadcrumbs={[{ label: "News & Events" }]}
            />
            <NewsGrid items={NEWS_ITEMS} />
            <AboutCta />
        </>
    );
}
