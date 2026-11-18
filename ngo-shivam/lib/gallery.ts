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
    { id: "sanitation", label: "Sanitation" },
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
    // Toilet & Sanitation
    {
        id: "1",
        src: "/activity/1.webp",
        alt: "Public toilet facility",
        caption: "Improved Sanitation Facilities",
        category: "sanitation",
    },
    {
        id: "2",
        src: "/activity/02.webp",
        alt: "Community toilet entrance",
        caption: "Community Toilet Facility",
        category: "sanitation",
    },
    {
        id: "3",
        src: "/activity/2.webp",
        alt: "Toilet facility construction",
        caption: "Sanitation Infrastructure",
        category: "sanitation",
    },
    {
        id: "4",
        src: "/activity/3.webp",
        alt: "Clean toilet facility",
        caption: "Clean and Hygienic Toilets",
        category: "sanitation",
    },
    {
        id: "5",
        src: "/activity/4.webp",
        alt: "Community sanitation facility",
        caption: "Community Sanitation",
        category: "sanitation",
    },
    {
        id: "6",
        src: "/activity/4 (1).webp",
        alt: "Toilet and washroom facility",
        caption: "Sanitation Improvement",
        category: "sanitation",
    },
    {
        id: "7",
        src: "/activity/5.webp",
        alt: "Modern toilet facility",
        caption: "Improved Toilet Facilities",
        category: "sanitation",
    },
    {
        id: "8",
        src: "/activity/5 (1).webp",
        alt: "Washroom infrastructure",
        caption: "Hygiene and Sanitation",
        category: "sanitation",
    },
    {
        id: "9",
        src: "/activity/8.webp",
        alt: "Public washroom",
        caption: "Public Sanitation Facilities",
        category: "sanitation",
    },
    {
        id: "10",
        src: "/activity/deluxe-toilet-shivam-ngo.webp",
        alt: "Clean toilet facility",
        caption: "Improved Toilet Facilities",
        category: "sanitation",
    },

    // Health & Community


    // Housekeeping
    {
        id: "12",
        src: "/activity/house-keeping.webp",
        alt: "Housekeeping team members",
        caption: "Our Housekeeping Team",
        category: "volunteers",
    },
    {
        id: "13",
        src: "/activity/shivam-house-keeping-1.webp",
        alt: "Housekeeping volunteers",
        caption: "Community Cleanliness Initiative",
        category: "volunteers",
    },
    {
        id: "14",
        src: "/activity/shivam-house-keeping-2.webp",
        alt: "Housekeeping team outside a facility",
        caption: "Clean Environment Initiative",
        category: "volunteers",
    },
    {
        id: "15",
        src: "/activity/shivam-house-keeping-3.webp",
        alt: "Volunteer cleaning a corridor",
        caption: "Maintaining Clean Spaces",
        category: "volunteers",
    },
    {
        id: "16",
        src: "/activity/shivam-house-keeping-4.webp",
        alt: "Housekeeping volunteer cleaning a workspace",
        caption: "Workplace Cleanliness Drive",
        category: "volunteers",
    },

    // Sanitation Drives
    {
        id: "17",
        src: "/activity/sanitation-shivam-ngo.webp",
        alt: "Sanitation awareness activity",
        caption: "Sanitation Awareness Drive",
        category: "sanitation",
    },

    {
        id: "20",
        src: "/activity/shivam-ngo-sanitation-3.webp",
        alt: "Community sanitation outreach",
        caption: "Community Outreach Programme",
        category: "sanitation",
    },
    {
        id: "21",
        src: "/activity/shivam-ngo-sanitation-4.webp",
        alt: "Sanitation awareness programme",
        caption: "Sanitation Awareness Initiative",
        category: "sanitation",
    },
    {
        id: "22",
        src: "/activity/shivam-ngo-sanitation-4 (1).webp",
        alt: "NGO sanitation activity",
        caption: "Public Hygiene Initiative",
        category: "sanitation",
    },
    {
        id: "23",
        src: "/activity/shivam-ngo-sanitation-5.webp",
        alt: "Waste management activity",
        caption: "Waste Management Drive",
        category: "sanitation",
    },
    {
        id: "24",
        src: "/activity/shivam-ngo-sanitation-5 (1).webp",
        alt: "Community waste management work",
        caption: "Cleaner Community Initiative",
        category: "sanitation",
    },
    {
        id: "25",
        src: "/activity/shivam-ngo-sanitation-6.webp",
        alt: "Sanitation worker cleaning a drainage area",
        caption: "Drainage Cleaning Initiative",
        category: "sanitation",
    },
    {
        id: "26",
        src: "/activity/shivam-ngo-sanitation-7.webp",
        alt: "Sanitation awareness at a community facility",
        caption: "Village Sanitation Programme",
        category: "sanitation",
    },
    {
        id: "27",
        src: "/activity/shivam-ngo-sanitation-8.webp",
        alt: "Drainage maintenance activity",
        caption: "Drainage and Hygiene Improvement",
        category: "sanitation",
    },

    // Holi Celebrations
    {
        id: "28",
        src: "/activity/shivam-holi-1.webp",
        alt: "Holi celebration with community members",
        caption: "Celebrating Holi Together",
        category: "community",
    },
    {
        id: "29",
        src: "/activity/shivam-holi-2.webp",
        alt: "Women participating in Holi celebrations",
        caption: "Colours of Togetherness",
        category: "community",
    },
    {
        id: "30",
        src: "/activity/shivam-holi-3.webp",
        alt: "Holi celebration event",
        caption: "Community Holi Celebration",
        category: "community",
    },
    {
        id: "31",
        src: "/activity/shivam-holi-4.webp",
        alt: "Community members celebrating Holi",
        caption: "Festival of Colours",
        category: "community",
    },
    {
        id: "32",
        src: "/activity/shivam-holi-5.webp",
        alt: "Holi celebration with volunteers",
        caption: "Spreading Happiness Through Colours",
        category: "community",
    },
    {
        id: "33",
        src: "/activity/shivam-holi-6.webp",
        alt: "Holi celebration gathering",
        caption: "A Day of Joy and Togetherness",
        category: "community",
    },
    {
        id: "34",
        src: "/activity/shivam-holi-7.webp",
        alt: "Volunteers participating in community activities",
        caption: "Community Participation",
        category: "community",
    },
    {
        id: "35",
        src: "/activity/shivam-holi-8.webp",
        alt: "Volunteers helping during an event",
        caption: "Volunteers in Action",
        category: "volunteers",
    },
    {
        id: "36",
        src: "/activity/shivam-holi-9.webp",
        alt: "Holi celebration with community members",
        caption: "Sharing the Joy of Holi",
        category: "community",
    },
    {
        id: "37",
        src: "/activity/shivam-holi-10.webp",
        alt: "Community event and awareness programme",
        caption: "Community Awareness Programme",
        category: "awareness",
    },
    {
        id: "38",
        src: "/activity/shivam-holi-11.webp",
        alt: "Community members participating in an event",
        caption: "Building Stronger Communities",
        category: "community",
    },
    {
        id: "39",
        src: "/activity/shivam-holi-12.webp",
        alt: "Holi celebration and community engagement",
        caption: "Celebrating Community Spirit",
        category: "community",
    },
    {
        id: "40",
        src: "/activity/shivam-holi-13.webp",
        alt: "Community Holi celebration",
        caption: "Togetherness and Happiness",
        category: "community",
    },
    {
        id: "41",
        src: "/activity/shivam-holi-14.webp",
        alt: "Community member receiving recognition",
        caption: "Recognizing Community Participation",
        category: "community",
    },
    {
        id: "42",
        src: "/activity/shivam-holi-14 (1).webp",
        alt: "Community appreciation ceremony",
        caption: "Community Appreciation",
        category: "community",
    },
    {
        id: "43",
        src: "/activity/shivam-holi-15.webp",
        alt: "Community gathering during Holi",
        caption: "Community Celebration",
        category: "community",
    },
    {
        id: "44",
        src: "/activity/shivam-holi-16.webp",
        alt: "Women participating in a community programme",
        caption: "Empowering Women Through Community",
        category: "community",
    },
    {
        id: "45",
        src: "/activity/shivam-holi-17.webp",
        alt: "Community members at an NGO programme",
        caption: "Community Engagement Programme",
        category: "community",
    },
    {
        id: "46",
        src: "/activity/shivam-holi-18.webp",
        alt: "NGO volunteers at a community event",
        caption: "Together for Social Change",
        category: "volunteers",
    },
    {
        id: "47",
        src: "/activity/shivam-holi-19.webp",
        alt: "Women participating in a community initiative",
        caption: "Supporting Women and Communities",
        category: "community",
    },

    // Vocational Training
    {
        id: "48",
        src: "/activity/vocational-training.webp",
        alt: "Vocational training programme",
        caption: "Vocational Skills Development",
        category: "awareness",
    },
    {
        id: "49",
        src: "/activity/3 (1).webp",
        alt: "Community environmental activity",
        caption: "Environmental Protection Initiative",
        category: "sanitation",
    },
    {
        id: "50",
        src: "/activity/2 (1).webp",
        alt: "Students participating in educational activities",
        caption: "Educational Development Programme",
        category: "awareness",
    },
    {
        id: "51",
        src: "/activity/5 (2).webp",
        alt: "Children attending a community gathering",
        caption: "Community Education and Awareness",
        category: "awareness",
    },
    {
        id: "52",
        src: "/activity/4 (2).webp",
        alt: "Community outreach and awareness activity",
        caption: "Village Community Outreach",
        category: "community",
    },
];