"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { IconCheck, IconSend } from "@tabler/icons-react";
import FormStatus, { HoneypotField } from "@/components/shared/FormStatus";
import { useFormSubmit } from "@/lib/use-form-submit";
import { ROLES } from "@/features/volunteer/components/VolunteerRoles";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Apply Now",
    title: "Join our volunteer team",
    intro:
        "Tell us a little about yourself. We will get back to you to talk about how you can help.",
};

const INTERESTS = [...ROLES.map((r) => r.title), "Something else"];

const AVAILABILITY = ["Weekdays", "Weekends", "Both weekdays and weekends", "Flexible"];

/** Shown beside the form. */
const GOOD_TO_KNOW = [
    "No special skills are needed",
    "You can choose the kind of work you enjoy",
    "Tell us when you are available and we will plan around it",
    "Volunteering with friends or family is welcome. Mention it in your message",
];
/* ===================================================================== */

const fieldClass =
    "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

const EMPTY_FORM = {
    name: "",
    phone: "",
    email: "",
    city: "",
    interest: INTERESTS[0],
    availability: AVAILABILITY[0],
    message: "",
};

export default function VolunteerForm() {
    const [form, setForm] = useState(EMPTY_FORM);
    const { status, error, handleSubmit, sending } = useFormSubmit("volunteer", "Volunteer page");

    const update =
        (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    // Sends the form to /api/forms, which emails it to the NGO inbox.
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) =>
        handleSubmit(e, form, () => setForm(EMPTY_FORM));

    return (
        <section id="apply" className="relative w-full scroll-mt-24 bg-brand-light px-6 py-24 sm:py-28">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5 lg:gap-16">
                <motion.div
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="lg:col-span-2"
                >
                    <span className="inline-block rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        {SECTION.eyebrow}
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                        {SECTION.title}
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {SECTION.intro}
                    </p>

                    <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-brand-dark">Good to know</h3>
                        <ul className="mt-4 space-y-3">
                            {GOOD_TO_KNOW.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                        <IconCheck size={12} aria-hidden />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                <motion.form
                    onSubmit={onSubmit}
                    initial={{ opacity: 0, x: 32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="self-start rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/10 sm:p-9 lg:col-span-3"
                >
                    <h3 className="text-xl font-bold text-brand-dark">Volunteer application</h3>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-semibold text-foreground">
                            Full name
                            <input
                                required
                                type="text"
                                autoComplete="name"
                                value={form.name}
                                onChange={update("name")}
                                placeholder="Your name"
                                className={fieldClass}
                            />
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                            Phone number
                            <input
                                required
                                type="tel"
                                autoComplete="tel"
                                inputMode="tel"
                                value={form.phone}
                                onChange={update("phone")}
                                placeholder="Your phone number"
                                className={fieldClass}
                            />
                        </label>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-semibold text-foreground">
                            Email <span className="font-normal text-muted-foreground">(optional)</span>
                            <input
                                type="email"
                                autoComplete="email"
                                value={form.email}
                                onChange={update("email")}
                                placeholder="you@example.com"
                                className={fieldClass}
                            />
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                            Area / city <span className="font-normal text-muted-foreground">(optional)</span>
                            <input
                                type="text"
                                autoComplete="address-level2"
                                value={form.city}
                                onChange={update("city")}
                                placeholder="Where you live"
                                className={fieldClass}
                            />
                        </label>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-semibold text-foreground">
                            I am interested in
                            <select value={form.interest} onChange={update("interest")} className={fieldClass}>
                                {INTERESTS.map((i) => (
                                    <option key={i} value={i}>
                                        {i}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                            Availability
                            <select value={form.availability} onChange={update("availability")} className={fieldClass}>
                                {AVAILABILITY.map((a) => (
                                    <option key={a} value={a}>
                                        {a}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="mt-4 block text-sm font-semibold text-foreground">
                        Message <span className="font-normal text-muted-foreground">(optional)</span>
                        <textarea
                            rows={4}
                            value={form.message}
                            onChange={update("message")}
                            placeholder="Tell us a little about yourself and any skills you would like to share"
                            className={fieldClass}
                        />
                    </label>

                    <HoneypotField />

                    <button
                        type="submit"
                        disabled={sending}
                        className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {sending ? "Sending..." : "Send my application"}
                        <IconSend
                            size={20}
                            aria-hidden
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </button>
                    <FormStatus
                        status={status}
                        error={error}
                        successMessage="Thank you! Your application has been sent. Our team will get back to you soon."
                    />
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        Your message goes straight to our team.
                    </p>
                </motion.form>
            </div>
        </section>
    );
}
