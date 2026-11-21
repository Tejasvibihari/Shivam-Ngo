"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { IconCheck, IconSend } from "@tabler/icons-react";
import FormStatus, { HoneypotField } from "@/components/shared/FormStatus";
import { ACTIVITIES } from "@/features/activities/data/activities";
import { EXPERIENCE_LEVELS, GENERAL_APPLICATION, OPENINGS } from "@/features/career/data/careers";
import { useFormSubmit } from "@/lib/use-form-submit";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Apply Now",
    title: "Send us your application",
    intro:
        "Fill in the form and our team will review it. If your profile matches a role, we will contact you by phone or email.",
};

/** Open posts first, then the programme areas, then a general application. */
const POSITIONS = [
    ...OPENINGS.map((o) => o.title),
    ...ACTIVITIES.map((a) => `${a.shortTitle} (programme work)`),
    GENERAL_APPLICATION,
];

/** Shown beside the form. */
const GOOD_TO_KNOW = [
    "Applications are sent straight to our team by email",
    "Add a link to your CV (Google Drive, LinkedIn or similar) so we can see your experience",
    "If you use Google Drive, set the link to \"Anyone with the link can view\"",
    "Only shortlisted candidates will be contacted",
];
/* ===================================================================== */

const fieldClass =
    "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

const EMPTY_FORM = {
    name: "",
    phone: "",
    email: "",
    city: "",
    position: POSITIONS[0],
    qualification: "",
    experience: EXPERIENCE_LEVELS[0],
    resumeLink: "",
    message: "",
};

export default function CareerForm() {
    const [form, setForm] = useState(EMPTY_FORM);
    const { status, error, handleSubmit, sending } = useFormSubmit("career", "Career page");

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
                    <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{SECTION.intro}</p>

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
                    <h3 className="text-xl font-bold text-brand-dark">Job application</h3>

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
                            Email
                            <input
                                required
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
                            Position applying for
                            <select value={form.position} onChange={update("position")} className={fieldClass}>
                                {POSITIONS.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                            Experience
                            <select value={form.experience} onChange={update("experience")} className={fieldClass}>
                                {EXPERIENCE_LEVELS.map((x) => (
                                    <option key={x} value={x}>
                                        {x}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="mt-4 block text-sm font-semibold text-foreground">
                        Highest qualification
                        <input
                            required
                            type="text"
                            value={form.qualification}
                            onChange={update("qualification")}
                            placeholder="For example: B.A., MSW, Diploma in Nursing"
                            className={fieldClass}
                        />
                    </label>

                    <label className="mt-4 block text-sm font-semibold text-foreground">
                        Link to your CV / profile <span className="font-normal text-muted-foreground">(optional)</span>
                        <input
                            type="url"
                            inputMode="url"
                            value={form.resumeLink}
                            onChange={update("resumeLink")}
                            placeholder="https://drive.google.com/..."
                            className={fieldClass}
                        />
                    </label>

                    <label className="mt-4 block text-sm font-semibold text-foreground">
                        Why do you want to work with us? <span className="font-normal text-muted-foreground">(optional)</span>
                        <textarea
                            rows={4}
                            value={form.message}
                            onChange={update("message")}
                            placeholder="Tell us about your experience, skills and what motivates you"
                            className={fieldClass}
                        />
                    </label>

                    <HoneypotField />

                    <button
                        type="submit"
                        disabled={sending}
                        className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {sending ? "Sending..." : "Submit my application"}
                        <IconSend
                            size={20}
                            aria-hidden
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </button>
                    <FormStatus
                        status={status}
                        error={error}
                        successMessage="Thank you! Your application has been sent. Our team will review it and contact you if your profile matches."
                    />
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        Your application goes straight to our team.
                    </p>
                </motion.form>
            </div>
        </section>
    );
}
