import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import { CONTACT } from "@/lib/org";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "FAQ",
    title: "Questions you may have",
};

/** Edit or add questions as needed. */
const FAQS: { q: string; a: React.ReactNode }[] = [
    {
        q: "How can I join an activity or become a volunteer?",
        a: (
            <>
                Fill in the volunteer form on our{" "}
                <Link href="/volunteer" className="font-semibold text-primary hover:underline">
                    home page
                </Link>{" "}
                and tell us how you would like to help. Our team will get back to you.
            </>
        ),
    },
    {
        q: "How can I find out about upcoming camps and drives?",
        a: (
            <>
                Call us on {CONTACT.phones.map((p) => p.label).join(" or ")} or write to{" "}
                <a href={`mailto:${CONTACT.email}`} className="font-semibold text-primary hover:underline">
                    {CONTACT.email}
                </a>{" "}
                and we will share the details.
            </>
        ),
    },
    {
        q: "Do I need any special skills to help?",
        a: "No. There are roles for everyone, from joining a clean-up to helping organise an event or sharing your knowledge in a training session.",
    },
    {
        q: "Can I support your work without volunteering?",
        a: (
            <>
                Yes. You can support our activities with a{" "}
                <Link href="/#donate" className="font-semibold text-primary hover:underline">
                    donation
                </Link>
                , or simply help by spreading the word about our work.
            </>
        ),
    },
    {
        q: "Where can I visit you?",
        a: `Our head office is at ${CONTACT.headOffice}. Our registered office is at ${CONTACT.registeredOffice}.`,
    },
];
/* ===================================================================== */

export default function ActivitiesFaq() {
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
