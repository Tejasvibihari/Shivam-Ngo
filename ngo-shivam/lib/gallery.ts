/**
 * Single source of truth for the /gallery page.
 * Add a photo = add one line to GALLERY_ITEMS (put the file in /public/hero/ or any /public path).
 * Add a filter tab = add one entry to GALLERY_CATEGORIES and use its `id` on the photos.
 */

export const GALLERY_CATEGORIES = [
    { id: "health", label: "Health Camps" },
    { id: "awareness", label: "Awareness" },
    { id: "community", label: "Community" },
    { id: "volunteers", label: "Volunteers" },
] as const;

export type GalleryCategoryId = (typeof GALLERY_CATEGORIES)[number]["id"];

export type GalleryItem = {
    id: string;
    src: string;
    alt: string;
    /** short line shown on hover and in the lightbox */
    caption: string;
    category: GalleryCategoryId;
};

export const GALLERY_ITEMS: GalleryItem[] = [
    { id: "1", src: "/hero/1.jpg", alt: "Community health camp", caption: "Community health camp", category: "health" },
    { id: "2", src: "/hero/2.jpg", alt: "Volunteers helping villagers", caption: "Volunteers helping villagers", category: "volunteers" },
    { id: "3", src: "/hero/3.jpg", alt: "Children at an awareness programme", caption: "Children at an awareness programme", category: "awareness" },
    { id: "4", src: "/hero/4.jpg", alt: "Medical check-up", caption: "Medical check-up", category: "health" },
    { id: "5", src: "/hero/5.jpg", alt: "Women self-help group", caption: "Women self-help group", category: "community" },
    { id: "6", src: "/hero/6.jpg", alt: "Health awareness rally", caption: "Health awareness rally", category: "awareness" },
    { id: "7", src: "/hero/7.jpg", alt: "Distribution drive", caption: "Distribution drive", category: "volunteers" },
    { id: "8", src: "/hero/8.jpg", alt: "Volunteers at work", caption: "Volunteers at work", category: "volunteers" },
    { id: "9", src: "/hero/9.jpg", alt: "Village outreach", caption: "Village outreach", category: "community" },
    { id: "10", src: "/hero/10.jpg", alt: "Community gathering", caption: "Community gathering", category: "community" },
];
