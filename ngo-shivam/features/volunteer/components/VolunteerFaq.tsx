import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import { CONTACT } from "@/lib/org";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "FAQ",
    title: "Volunteer questions answered",
};

/** Edit or add questions as needed. */
const FAQS: { q: string; a: React.ReactNode }[] = [
    {
        q: "Do I need any experience or special skills?",
        a: "No. There are roles for everyone, from joining a clean-up to helping run an event or sharing a skill you already have.",
    },
    {
        q: "How do I apply?",
        a: "Fill in the application form on this page. It opens your email app with your details ready to send to our team.",
    },
    {
        q: "What happens after I apply?",
        a: "Our team will get back to you to talk about how you can contribute and which activities suit you.",
    },
    {
        q: "Can I volunteer with friends or family?",
        a: "You are welcome to. Mention it in your message and we will take it into account when we get in touch.",
    },
    {
        q: "What if I cannot give my time right now?",
        a: (
            <>
                You can still help by supporting us with a{" "}
                <Link href="/#donate" className="font-semibold text-primary hover:underline">
                    donation
                </Link>{" "}
                or by sharing our work with others.
            </>
        ),
    },
    {
        q: "Who can I contact with more questions?",
        a: (
            <>
                Call us on {CONTACT.phones.map((p) => p.label).join(" or ")} or write to{" "}
                <a href={`mailto:${CONTACT.email}`} className="font-semibold text-primary hover:underline">
                    {CONTACT.email}
                </a>
                .
            </>
        ),
    },
];
/* ===================================================================== */

export default function VolunteerFaq() {
    return (
        <section className="relative w-full bg-brand-light px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-3xl">
                <div className="text-center">
                    <span className="inline-block rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        {SECTION.eyebrow}
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                        {SECTION.title}
                    </h2>
                </div>

                <div className="mt-12 space-y-4">
                    {FAQS.map(({ q, a }) => (
                        <details
                            key={q}
                            className="group rounded-2xl border border-border bg-card px-6 py-5 shadow-sm open:shadow-md"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-brand-dark [&::-webkit-details-marker]:hidden">
                                {q}
                                <IconChevronDown
                                    size={20}
                                    aria-hidden
                                    className="shrink-0 text-primary transition-transform duration-200 group-open:rotate-180"
                                />
                            </summary>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
