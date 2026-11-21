/**
 * Single source of truth for the /career page.
 *
 * HOW TO ADD A JOB OPENING
 *  Add one object to OPENINGS. It appears as a card on the Career page and in the
 *  "Position" list of the application form. Remove it when the post is filled.
 *  While OPENINGS is empty, the page shows a friendly "no vacancies right now, send a general application" note.
 */

export type Opening = {
    /** shown on the card and in the form's Position list */
    title: string;
    /** e.g. "Full-time", "Part-time", "Contract", "Internship" */
    type: string;
    location: string;
    summary: string;
    requirements: string[];
};

export const OPENINGS: Opening[] = [
    // {
    //     title: "Field Coordinator",
    //     type: "Full-time",
    //     location: "Patna, Bihar",
    //     summary: "Coordinate community health and sanitation programmes on the ground.",
    //     requirements: ["Graduate in any stream", "Good communication in Hindi", "Willing to travel locally"],
    // },
];

export const GENERAL_APPLICATION = "General application (no specific opening)";

export const EXPERIENCE_LEVELS = ["Fresher (0 to 1 year)", "1 to 3 years", "3 to 5 years", "5+ years"];
