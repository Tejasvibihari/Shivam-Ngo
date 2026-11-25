import type { MetadataRoute } from "next";
import { ACTIVITIES } from "@/features/activities/data/activities";
import { LEGAL_DOCS, LEGAL_LAST_UPDATED } from "@/lib/legal";
import { NEWS_ITEMS } from "@/lib/news";
import { absoluteUrl } from "@/lib/site";
import { TEAM } from "@/lib/team";

type Entry = MetadataRoute.Sitemap[number];

/** News dates may be "2025", "2025-03" or "2025-03-14": pad them to a full ISO date. */
function newsLastModified(date?: string): string | undefined {
    if (!date || !/^\d{4}(-\d{2}){0,2}$/.test(date)) return undefined;
    const [y, m = "01", d = "01"] = date.split("-");
    return `${y}-${m}-${d}`;
}

/** "20 November 2026" -> "2026-11-20" */
const legalLastModified = new Date(`${LEGAL_LAST_UPDATED} UTC`).toISOString().slice(0, 10);

/**
 * Served at /sitemap.xml. It is built from the same data files the pages use, so a new
 * activity, news article or team member appears here automatically.
 * `lastModified` is only set where we really know a date, because a wrong date is worse than none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const entry = (
        path: string,
        priority: number,
        changeFrequency: Entry["changeFrequency"],
        lastModified?: string,
    ): Entry => ({
        url: absoluteUrl(path),
        changeFrequency,
        priority,
        ...(lastModified ? { lastModified } : {}),
    });

    return [
        entry("/", 1, "weekly"),
        entry("/about", 0.8, "monthly"),
        entry("/activities", 0.9, "monthly"),
        ...ACTIVITIES.map((a) => entry(`/activities/${a.slug}`, 0.8, "monthly")),
        entry("/news", 0.7, "weekly"),
        ...NEWS_ITEMS.map((n) => entry(`/news/${n.slug}`, 0.6, "yearly", newsLastModified(n.date))),
        entry("/volunteer", 0.7, "monthly"),
        entry("/career", 0.6, "weekly"),
        entry("/contact", 0.7, "yearly"),
        entry("/gallery", 0.5, "monthly"),
        entry("/management", 0.5, "yearly"),
        ...TEAM.map((m) => entry(`/management/${m.id}`, 0.4, "yearly")),
        ...LEGAL_DOCS.map((d) => entry(`/${d.slug}`, 0.2, "yearly", legalLastModified)),
    ];
}
