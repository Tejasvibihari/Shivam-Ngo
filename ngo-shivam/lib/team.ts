/**
 * Single source of truth for the management team.
 * Used by: the /management page, the team section on the home page and the About page.
 *
 * Every member gets their own SEO page at /management/<id>.
 *
 * HOW TO ADD CONTENT TO A MEMBER'S PAGE
 *  - `message`: the person's own words, one string per paragraph (shown under "Message from the ...").
 *  - `about`: a short introduction, one string per paragraph (a simple default is shown until you add it).
 *  - `metaDescription`: optional search-engine description (about 150 characters).
 *  Until a `message` is added, the page shows a friendly "message coming soon" note, so nothing is invented.
 *
 * HOW TO ADD A PERSON
 *  Add another object below and put the photo in /public/management/.
 */

export type TeamMember = {
    /** the page address: /management/<id> */
    id: string;
    name: string;
    role: string;
    /** path from /public */
    photo: string;
    /** The person's own words, one string per paragraph. Optional. */
    message?: string[];
    /** Short introduction, one string per paragraph. Optional. */
    about?: string[];
    /** Search-engine description. Optional. */
    metaDescription?: string;
};

export const TEAM: TeamMember[] = [
    {
        id: "raushan-kumar",
        name: "Raushan Kumar",
        role: "Chairman",
        photo: "/management/raushan.webp",
        // message: ["Write the Chairman's message here, one paragraph per line.", "..."],
    },
    {
        id: "shambhu-prasad-singh",
        name: "Shambhu Prasad Singh",
        role: "Secretary",
        photo: "/management/shambhu.webp",
        // message: ["..."],
    },
    {
        id: "durganand-thakur",
        name: "Durganand Thakur",
        role: "Treasurer",
        photo: "/management/durganand.webp",
        // message: ["..."],
    },
];

export function getMember(id: string): TeamMember | undefined {
    return TEAM.find((m) => m.id === id);
}
