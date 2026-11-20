/**
 * Text of the legal pages: /privacy-policy, /terms and /donation-policy.
 * Edit the wording here; the pages, the table of contents and the SEO tags follow.
 * Remember to update LEGAL_LAST_UPDATED whenever you change a policy.
 */

export const LEGAL_LAST_UPDATED = "20 November 2026";
export const ORG_NAME = "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra";

export type LegalSection = {
    id: string;
    heading: string;
    paragraphs?: string[];
    items?: string[];
    /** paragraphs shown after the bullet list */
    after?: string[];
};

export type LegalDoc = {
    slug: "privacy-policy" | "terms" | "donation-policy";
    title: string;
    shortTitle: string;
    description: string;
    lead: string;
    sections: LegalSection[];
};

/* ------------------------------ PRIVACY POLICY ------------------------------ */
const privacy: LegalDoc = {
    slug: "privacy-policy",
    title: "Privacy Policy",
    shortTitle: "Privacy Policy",
    description:
        "How Shivam Jan Swasthya Evem Sarwangin Vikash Kendra collects, uses and protects your personal information when you visit our website, contact us, volunteer or donate.",
    lead: `Your trust matters to us. This Privacy Policy explains what personal information ${ORG_NAME} ("we", "us", "our") collects, why we collect it, how we use it and the choices you have.`,
    sections: [
        {
            id: "scope",
            heading: "1. Scope of this policy",
            paragraphs: [
                "This policy applies to this website and to the information you share with us when you contact us, volunteer, support our work or take part in our programmes and events. By using the website you agree to the practices described here.",
            ],
        },
        {
            id: "information-we-collect",
            heading: "2. Information we collect",
            paragraphs: ["We collect only the information that is needed for the purposes described below."],
            items: [
                "Contact details you give us: your name, phone number and email address.",
                "Volunteer information: where you live, the area you would like to help with and anything you tell us about your skills or interests.",
                "Messages and correspondence: the content of your enquiries, emails, calls and messages.",
                "Donation-related details, if you contact us about a contribution: your name, contact details, amount and the details needed to acknowledge it.",
                "Technical information: basic details such as browser type, device and pages visited, which are usually recorded automatically by the website hosting service.",
            ],
        },
        {
            id: "how-forms-work",
            heading: "3. How the forms on this website work",
            paragraphs: [
                "The Contact form and the Volunteer form do not save your details on a database. When you submit a form, your own email application opens with a ready-to-send message addressed to us. Nothing is sent until you press send in your email application.",
                "This means the information you include is handled by your email provider as well as by us. Please do not include sensitive information such as bank passwords, OTPs or card details in any message to us.",
            ],
        },
        {
            id: "how-we-use",
            heading: "4. How we use your information",
            items: [
                "To reply to your questions and requests.",
                "To register, contact and coordinate volunteers.",
                "To acknowledge donations and, where applicable, issue receipts.",
                "To share updates about our programmes, if you have asked to receive them.",
                "To improve the website and our services.",
                "To meet legal, accounting and regulatory requirements.",
            ],
        },
        {
            id: "sharing",
            heading: "5. Sharing your information",
            paragraphs: ["We do not sell or rent your personal information. We may share it only:"],
            items: [
                "with service providers who help us run the website, email or programmes and who are required to keep it confidential;",
                "with partners or institutions involved in an activity you have chosen to take part in;",
                "with government authorities or courts when the law requires it; and",
                "with your consent, for any other purpose.",
            ],
        },
        {
            id: "photos",
            heading: "6. Photographs, videos and stories",
            paragraphs: [
                "We may publish photographs, videos and stories from our programmes, events and field work on this website and in our reports. We try to obtain consent where practicable, and we take particular care with images of children and vulnerable people. If you or your child appears in a photograph and you would like it removed, please contact us and we will act on your request promptly.",
            ],
        },
        {
            id: "cookies",
            heading: "7. Cookies and analytics",
            paragraphs: [
                "At the time of writing, we do not use advertising cookies or tools that track you across other websites. Your browser or our hosting provider may use technical cookies or logs that are necessary for the website to work. If we add analytics or similar tools in future, we will update this policy.",
            ],
        },
        {
            id: "retention-security",
            heading: "8. Retention and security",
            paragraphs: [
                "We keep personal information only for as long as it is needed for the purposes above or as required by law, and we then delete it or make it anonymous. We take reasonable steps to protect your information from loss, misuse and unauthorised access. However, no method of transmission over the internet or by email is completely secure, so we cannot guarantee absolute security.",
            ],
        },
        {
            id: "your-rights",
            heading: "9. Your choices and rights",
            paragraphs: ["In line with applicable Indian law, including the Digital Personal Data Protection Act, 2023, you may ask us to:"],
            items: [
                "tell you what personal information we hold about you;",
                "correct information that is wrong or out of date;",
                "delete your information, unless we need to keep it by law; and",
                "stop sending you updates or withdraw a consent you have given.",
            ],
            after: ["To make a request, use the contact details at the end of this page. We may need to confirm your identity first."],
        },
        {
            id: "children",
            heading: "10. Children's privacy",
            paragraphs: [
                "This website is meant for adults. We do not knowingly collect personal information from children without the consent of a parent or guardian. If you believe a child has shared information with us, please contact us and we will remove it.",
            ],
        },
        {
            id: "third-party-links",
            heading: "11. Links to other websites",
            paragraphs: [
                "Our website may link to other websites, including news publications and government portals. We are not responsible for their content or privacy practices, so please read their policies before sharing any information.",
            ],
        },
        {
            id: "changes",
            heading: "12. Changes to this policy",
            paragraphs: [
                "We may update this policy from time to time. The \"last updated\" date at the top of this page shows when it was last changed. Please check back regularly.",
            ],
        },
        {
            id: "contact",
            heading: "13. Questions and grievances",
            paragraphs: [
                "If you have a question, a complaint or a request about your personal information, please contact us using the details below.",
            ],
        },
    ],
};

/* ------------------------------ TERMS OF SERVICE ------------------------------ */
const terms: LegalDoc = {
    slug: "terms",
    title: "Terms of Service",
    shortTitle: "Terms of Service",
    description:
        "The terms for using the Shivam Jan Swasthya Evem Sarwangin Vikash Kendra website, volunteering with us and relying on the information we publish.",
    lead: `Please read these Terms of Service carefully before using this website. They set out the rules for using the website of ${ORG_NAME} ("we", "us", "our") and the information on it.`,
    sections: [
        {
            id: "acceptance",
            heading: "1. Acceptance of these terms",
            paragraphs: [
                "By accessing or using this website you agree to these terms and to our Privacy Policy and Donation Policy. If you do not agree, please do not use the website.",
            ],
        },
        {
            id: "about-website",
            heading: "2. About this website",
            paragraphs: [
                "This website shares information about our vision, activities, programmes, news and ways to get involved. It is provided for general information and may be updated, changed or removed at any time without notice.",
            ],
        },
        {
            id: "acceptable-use",
            heading: "3. Using the website",
            paragraphs: ["You agree to use the website lawfully and respectfully. You must not:"],
            items: [
                "use it in a way that is unlawful, harmful, misleading or offensive;",
                "try to gain unauthorised access to the website, its servers or other users' information;",
                "introduce viruses, scripts or any other harmful or disruptive material;",
                "copy or scrape the website in bulk without our written permission; or",
                "pretend to be us, or to act on our behalf, without authorisation.",
            ],
        },
        {
            id: "volunteering-enquiries",
            heading: "4. Volunteering and enquiries",
            paragraphs: [
                "Sending a volunteer or contact form does not create a contract, employment or any guaranteed role. We may accept, decline or end a volunteering arrangement at our discretion, and volunteers are expected to follow our guidance and treat the communities we work with with respect.",
            ],
        },
        {
            id: "services",
            heading: "5. Programmes and services",
            paragraphs: [
                "We carry out community programmes and also provide certain services, such as housekeeping and facility support, to institutions and other organisations. Services of this kind are provided under separate written agreements or work orders, which take priority over these terms for that work.",
            ],
        },
        {
            id: "donations",
            heading: "6. Donations",
            paragraphs: [
                "Donations are voluntary and are governed by our Donation Policy. Please read it before contributing.",
            ],
        },
        {
            id: "intellectual-property",
            heading: "7. Intellectual property",
            paragraphs: [
                "The text, logo, design and photographs on this website belong to us or are used with permission, and are protected by law. You may share links to our pages and quote short extracts with credit, but you may not copy, modify or reuse our content for commercial purposes without our written permission.",
                "Newspaper cuttings and news coverage shown on this website remain the property of the respective publishers and are displayed to document public coverage of our work.",
            ],
        },
        {
            id: "no-advice",
            heading: "8. Information, not professional advice",
            paragraphs: [
                "Pages on health, sanitation, education and other topics are meant to raise awareness. They are not medical, legal, financial or other professional advice. Please consult a qualified professional or the relevant authority before acting on any information.",
            ],
        },
        {
            id: "third-party-links",
            heading: "9. Third-party links",
            paragraphs: [
                "The website may contain links to external websites. We do not control them and are not responsible for their content, accuracy or practices. A link does not mean that we endorse the site.",
            ],
        },
        {
            id: "disclaimer",
            heading: "10. Disclaimer and limitation of liability",
            paragraphs: [
                "We try to keep the information accurate and up to date, but we do not promise that it is complete, current or error-free, or that the website will always be available or free from interruptions. The website is provided \"as is\".",
                "To the fullest extent permitted by law, we are not liable for any loss or damage that arises from your use of, or inability to use, the website or from relying on its content.",
            ],
        },
        {
            id: "governing-law",
            heading: "11. Governing law",
            paragraphs: [
                "These terms are governed by the laws of India. Any dispute relating to them will be subject to the jurisdiction of the courts at Patna, Bihar.",
            ],
        },
        {
            id: "changes",
            heading: "12. Changes to these terms",
            paragraphs: [
                "We may revise these terms from time to time. The updated version applies from the date it is posted on this page, and continuing to use the website means you accept the changes.",
            ],
        },
        {
            id: "contact",
            heading: "13. Contact us",
            paragraphs: ["If you have any questions about these terms, please contact us using the details below."],
        },
    ],
};

/* ------------------------------ DONATION POLICY ------------------------------ */
const donation: LegalDoc = {
    slug: "donation-policy",
    title: "Donation Policy",
    shortTitle: "Donation Policy",
    description:
        "How Shivam Jan Swasthya Evem Sarwangin Vikash Kendra receives and uses donations, issues acknowledgements, handles refunds and helps you avoid donation fraud.",
    lead: `Thank you for thinking of supporting ${ORG_NAME}. This Donation Policy explains how we receive, use and account for contributions so that you can give with confidence.`,
    sections: [
        {
            id: "voluntary",
            heading: "1. Donations are voluntary",
            paragraphs: [
                "Every contribution is made willingly and without any expectation of goods or services in return. A donation does not give the donor any ownership, membership or control over the organisation unless we have agreed this separately in writing.",
            ],
        },
        {
            id: "how-to-donate",
            heading: "2. How to donate safely",
            paragraphs: [
                "Please donate only through the payment details published on this website or confirmed by us on the phone numbers and email address listed on our Contact page. If you are unsure, call us before you pay.",
            ],
            items: [
                "We will never ask you for your OTP, card PIN, CVV or online banking password.",
                "We will never ask you to pay to a personal account that has not been confirmed by our office.",
                "If you receive a suspicious message or call asking for money in our name, please do not pay and report it to us.",
            ],
        },
        {
            id: "how-used",
            heading: "3. How donations are used",
            paragraphs: [
                "Donations support our work in health, sanitation, education, vocational training, community development and social awareness, as well as the running costs needed to carry out these programmes responsibly.",
                "If you would like your donation to go to a particular cause, please tell us when you give. We will try to follow your wishes. If a cause is fully funded or can no longer be carried out, we will use the donation for the closest similar purpose.",
            ],
        },
        {
            id: "acknowledgement",
            heading: "4. Acknowledgement and receipts",
            paragraphs: [
                "We are happy to acknowledge your contribution. Please contact us with your name, contact details, amount and the payment reference so that we can match your payment and send an acknowledgement. We may ask for details such as your address or PAN where the law requires them.",
            ],
        },
        {
            id: "tax",
            heading: "5. Tax benefits",
            paragraphs: [
                "Whether a donation qualifies for any tax deduction depends on our registration status and on the law that applies to you. Please contact us before donating if you need to know whether your contribution is eligible, and consult your tax adviser.",
            ],
        },
        {
            id: "refunds",
            heading: "6. Refunds",
            paragraphs: [
                "Because donations are used for programmes soon after they are received, they are generally not refundable. If you have paid by mistake, paid twice or paid an incorrect amount, please contact us as soon as possible, ideally within 7 days, with the payment details. We will review the request and, where the error is confirmed, return the amount. Time taken to credit a refund also depends on your bank or payment provider.",
            ],
        },
        {
            id: "privacy",
            heading: "7. Donor privacy",
            paragraphs: [
                "We respect donor privacy. We do not sell or rent donor details, and we publish a donor's name only with their permission. You may donate anonymously if you prefer. Please read our Privacy Policy for more information.",
            ],
        },
        {
            id: "in-kind",
            heading: "8. Donations of goods and time",
            paragraphs: [
                "If you wish to donate goods, equipment or services, or give your time as a volunteer, please contact us first so that we can make sure the offer meets a real need and reaches the people who need it.",
            ],
        },
        {
            id: "foreign",
            heading: "9. Contributions from outside India and institutional partners",
            paragraphs: [
                "Contributions from foreign sources are subject to Indian law. Please contact us before sending any such contribution. Companies, trusts and institutions interested in supporting our work or partnering with us are welcome to write to us to discuss the details.",
            ],
        },
        {
            id: "accountability",
            heading: "10. Accountability",
            paragraphs: [
                "We aim to use donations responsibly and to maintain proper records of what we receive and spend. If you have a question about how your contribution has been used, please ask and we will do our best to answer.",
            ],
        },
        {
            id: "changes",
            heading: "11. Changes to this policy",
            paragraphs: [
                "We may update this policy from time to time. The \"last updated\" date at the top of this page shows when it was last changed.",
            ],
        },
        {
            id: "contact",
            heading: "12. Contact us",
            paragraphs: ["For any question about donations, please contact us using the details below."],
        },
    ],
};

export const LEGAL_DOCS: LegalDoc[] = [privacy, terms, donation];

export function getLegalDoc(slug: LegalDoc["slug"]): LegalDoc {
    return LEGAL_DOCS.find((d) => d.slug === slug)!;
}
