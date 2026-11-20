/**
 * Single source of truth for the /news page (newspaper cuttings).
 *
 * HOW TO ADD A NEWS CLIPPING
 *  1. Put the cutting image in /public/news/ (for example /public/news/health-camp.jpg).
 *  2. Add one object to NEWS_ITEMS below.
 *
 * RULES
 *  - `date` is OPTIONAL. Leave it out when the date is not known and nothing is shown on the page.
 *    Accepted formats: "2025-03-14" (full date), "2025-03" (month and year) or "2025" (year only).
 *  - `publication` (newspaper name) is OPTIONAL too and is shown only when set.
 *  - `summary` is the mid-length description (about 50-90 words) shown on the page and read by search engines.
 *    Write it in your own words, based on what the cutting says.
 */

export type NewsItem = {
    id: string;
    title: string;
    /** Newspaper name, e.g. "Dainik Jagran". Optional. */
    publication?: string;
    /** "YYYY-MM-DD", "YYYY-MM" or "YYYY". Leave out when unknown. */
    date?: string;
    image: { src: string; alt?: string };
    summary: string;
};

export const NEWS_ITEMS: NewsItem[] = [
    /* Example (delete this comment and add your own):
    {
        id: "health-camp-patna",
        title: "Free health camp organised in Patna",
        publication: "Dainik Jagran",
        date: "2025-03-14",
        image: { src: "/news/health-camp-patna.jpg", alt: "Newspaper cutting about the free health camp in Patna" },
        summary: "A short, mid-length description of what the news item reports ...",
    },
    */
];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/** Human-readable date, or null when the date is missing or invalid (so nothing is shown). */
export function formatNewsDate(date?: string): string | null {
    if (!date) return null;
    const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(date.trim());
    if (!m) return null;
    const year = m[1];
    const month = m[2] ? Number(m[2]) : null;
    const day = m[3] ? Number(m[3]) : null;
    if (month !== null && (month < 1 || month > 12)) return null;
    if (day !== null && (day < 1 || day > 31)) return null;
    if (month === null) return year;
    if (day === null) return `${MONTHS[month - 1]} ${year}`;
    return `${day} ${MONTHS[month - 1]} ${year}`;
}
