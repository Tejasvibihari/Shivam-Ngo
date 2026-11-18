"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { IconHeart, IconSend, IconUsersGroup } from "@tabler/icons-react";
import { CONTACT } from "@/lib/org";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Send a Message",
    title: "Tell us how we can help",
    intro:
        "Fill in the form and your email app will open with your message ready to send to our team.",
};

/** Options in the "Subject" dropdown. */
const SUBJECTS = [
    "General enquiry",
    "Volunteering",
    "Donation",
    "Partnership or collaboration",
    "Something else",
];

/** Quick links shown beside the form. */
const OTHER_WAYS = [
    {
        title: "Become a volunteer",
        text: "Join our drives, camps and training programmes.",
        href: "/volunteer",
        icon: IconUsersGroup,
    },
    {
        title: "Support our work",
        text: "Your donation helps us reach more families.",
        href: "/#donate",
        icon: IconHeart,
    },
];
/* ===================================================================== */

const fieldClass =
    "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

export default function ContactForm() {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        subject: SUBJECTS[0],
        message: "",
    });

    const update =
        (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    // There is no backend yet, so the form opens the visitor's email app with the details filled in.
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = `${form.subject}: message from ${form.name}`;
        const body = [
            `Name: ${form.name}`,
            `Phone: ${form.phone}`,
            form.email ? `Email: ${form.email}` : "",
            `Subject: ${form.subject}`,
            "",
            form.message,
        ]
            .filter((line, i) => line !== "" || i > 3)
            .join("\n");
        window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <section className="relative w-full bg-background px-6 py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5 lg:gap-16">
                {/* Left: intro + other ways */}
                <motion.div
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="lg:col-span-2"
                >
                    <span className="inline-block rounded-full border border-primary/30 bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        {SECTION.eyebrow}
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                        {SECTION.title}
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {SECTION.intro}
                    </p>

                    <ul className="mt-8 space-y-4">
                        {OTHER_WAYS.map(({ title, text, href, icon: Icon }) => (
                            <li key={title}>
                                <Link
                                    href={href}
                                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <Icon size={22} aria-hidden />
                                    </span>
                                    <span>
                                        <span className="block font-bold text-brand-dark">{title}</span>
                                        <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Right: form */}
                <motion.form
                    onSubmit={onSubmit}
                    initial={{ opacity: 0, x: 32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="self-start rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/10 sm:p-9 lg:col-span-3"
                >
                    <h3 className="text-xl font-bold text-brand-dark">Contact form</h3>

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
                            Subject
                            <select value={form.subject} onChange={update("subject")} className={fieldClass}>
                                {SUBJECTS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="mt-4 block text-sm font-semibold text-foreground">
                        Message
                        <textarea
                            required
                            rows={5}
                            value={form.message}
                            onChange={update("message")}
                            placeholder="How can we help you?"
                            className={fieldClass}
                        />
                    </label>

                    <button
                        type="submit"
                        className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                    >
                        Send message
                        <IconSend
                            size={20}
                            aria-hidden
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        This opens your email app with your message ready to send.
                    </p>
                </motion.form>
            </div>
        </section>
    );
}
