import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AboutCta from "@/features/about/components/AboutCta";
import NewsArticleView from "@/features/news/components/NewsArticleView";
import { NEWS_ITEMS, getNewsItem } from "@/lib/news";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return NEWS_ITEMS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const item = getNewsItem(slug);
    if (!item) return {};
    return buildMetadata({
        title: item.title.en,
        description: item.metaDescription,
        keywords: item.keywords,
        path: `/news/${slug}`,
        type: "article",
        publishedTime: item.date,
        image: { url: item.image, alt: item.imageAlt.en },
    });
}

export default async function NewsArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const item = getNewsItem(slug);
    if (!item) notFound();

    // structured data; the date is included only when the article has one
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: item.title.en,
        alternativeHeadline: item.title.hi,
        description: item.metaDescription,
        articleSection: item.category.en,
        keywords: item.keywords.join(", "),
        inLanguage: ["hi", "en"],
        url: absoluteUrl(`/news/${item.slug}`),
        mainEntityOfPage: absoluteUrl(`/news/${item.slug}`),
        image: absoluteUrl(item.image),
        ...(item.date ? { datePublished: item.date } : {}),
        ...(item.publication ? { publisher: { "@type": "Organization", name: item.publication } } : {}),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            <NewsArticleView item={item} />
            <AboutCta />
        </>
    );
}
