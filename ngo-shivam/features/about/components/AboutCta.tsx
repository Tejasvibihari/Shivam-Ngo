import Link from "next/link";
import { IconArrowRight, IconHeart } from "@tabler/icons-react";

/** Closing call-to-action band for the About page. */
export default function AboutCta() {
    return (
        <section className="relative w-full bg-brand-light px-6 py-20 sm:py-24">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-primary px-8 py-14 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:px-14">
                <div aria-hidden className="absolute -left-16 -top-16 size-56 rounded-full bg-background/10 blur-2xl" />
                <div aria-hidden className="absolute -bottom-16 -right-16 size-64 rounded-full bg-cta/30 blur-3xl" />

                <div className="relative">
                    <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                        Be part of the change
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
                        Your time or your support helps us reach more families with sanitation, education and health awareness.
                    </p>
                    <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/#donate"
                            className="group inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-base font-bold text-cta-foreground shadow-lg shadow-cta/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                        >
                            <IconHeart size={20} aria-hidden />
                            Donate
                        </Link>
                        <Link
                            href="/volunteer"
                            className="group inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-7 py-3.5 text-base font-bold text-primary-foreground transition duration-200 hover:bg-primary-foreground/10"
                        >
                            Become a volunteer
                            <IconArrowRight
                                size={20}
                                aria-hidden
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
