import type { Metadata } from "next";
import { OG_IMAGE, SITE_NAME, SITE_SHORT_NAME } from "@/lib/site";

type MetadataOptions = {
    /** Page title WITHOUT the site name: the root layout adds " | Shivam NGO Patna". */
    title: string;
    /** 120-155 characters works best in search results. */
    description: string;
    /** Path of this page, e.g. "/about". Becomes the canonical URL. */
    path: string;
    keywords?: string[];
    /** Social-share image. Defaults to the generated brand image (/og). */
    image?: { url: string; alt: string; width?: number; height?: number };
    type?: "website" | "article" | "profile";
    /** ISO date, only for articles. */
    publishedTime?: string;
    /** Use `title` exactly as written (home page). */
    absoluteTitle?: boolean;
};

const CORE_KEYWORDS = ["NGO in Patna", "NGO in Bihar", SITE_NAME];

/**
 * One place that builds a page's full metadata: title, description, keywords, canonical URL,
 * Open Graph and Twitter cards. Next.js replaces (not merges) a parent's `openGraph` when a page
 * defines its own, so every page uses this helper to keep the tags complete and consistent.
 */
export function buildMetadata(o: MetadataOptions): Metadata {
    const socialTitle = o.absoluteTitle ? o.title : `${o.title} | ${SITE_SHORT_NAME}`;
    const image = o.image ?? OG_IMAGE;

    const openGraph = {
        type: o.type ?? "website",
        url: o.path,
        siteName: SITE_NAME,
        locale: "en_IN",
        title: socialTitle,
        description: o.description,
        images: [image],
        ...(o.type === "article" && o.publishedTime ? { publishedTime: o.publishedTime } : {}),
    } as Metadata["openGraph"];

    return {
        title: o.absoluteTitle ? { absolute: o.title } : o.title,
        description: o.description,
        keywords: Array.from(new Set([...(o.keywords ?? []), ...CORE_KEYWORDS])),
        alternates: { canonical: o.path },
        openGraph,
        twitter: {
            card: "summary_large_image",
            title: socialTitle,
            description: o.description,
            images: [image.url],
        },
    };
}
