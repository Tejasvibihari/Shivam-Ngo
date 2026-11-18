import Link from "next/link";
import { IconPhone } from "@tabler/icons-react";
import { CONTACT } from "@/lib/org";

/** Closing band: prefer to talk first? */
export default function VolunteerContact() {
    return (
        <section className="relative w-full bg-background px-6 py-20 sm:py-24">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-primary px-8 py-14 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:px-14">
                <div aria-hidden className="absolute -left-16 -top-16 size-56 rounded-full bg-background/10 blur-2xl" />
                <div aria-hidden className="absolute -bottom-16 -right-16 size-64 rounded-full bg-cta/30 blur-3xl" />

                <div className="relative">
                    <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                        Prefer to talk first?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
                        Call or write to us and we will be happy to answer your questions about volunteering.
                    </p>
                    <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <a
                            href={CONTACT.phones[0].href}
                            className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-base font-bold text-cta-foreground shadow-lg shadow-cta/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                        >
                            <IconPhone size={20} aria-hidden />
                            {CONTACT.phones[0].label}
                        </a>
                        <Link
                            href="/contact"
                            className="inline-flex items-center rounded-full border border-primary-foreground/40 px-7 py-3.5 text-base font-bold text-primary-foreground transition duration-200 hover:bg-primary-foreground/10"
                        >
                            Contact us
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
