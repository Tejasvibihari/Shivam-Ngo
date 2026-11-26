"use client";

import { useRef, useState } from "react";
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
    "Your application is saved for the hiring team to review",
    "Attach your resume as a PDF, DOC or DOCX file (up to 10 MB)",
    "Attach a JPG, PNG or WebP photo (up to 5 MB)",
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
    message: "",
};

export default function CareerForm() {
    const [form, setForm] = useState(EMPTY_FORM);
    const formRef = useRef<HTMLFormElement>(null);
    const { status, error, handleSubmit, sending } = useFormSubmit("career", "Career page");

    const update =
        (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) =>
        handleSubmit(e, form, () => {
            setForm(EMPTY_FORM);
            formRef.current?.reset();
        });

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
                    ref={formRef}
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

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-semibold text-foreground">
                            Resume <span className="text-destructive">*</span>
                            <input
                                required
                                type="file"
                                name="resume"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className={fieldClass}
                            />
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                PDF, DOC or DOCX. Max 10 MB.
                            </span>
                        </label>
                        <label className="block text-sm font-semibold text-foreground">
                            Photo <span className="text-destructive">*</span>
                            <input
                                required
                                type="file"
                                name="photo"
                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                className={fieldClass}
                            />
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                JPG, PNG or WebP. Max 5 MB.
                            </span>
                        </label>
                    </div>

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
                        Your details and files are securely stored for the hiring team.
                    </p>
                </motion.form>
            </div>
        </section>
    );
}
