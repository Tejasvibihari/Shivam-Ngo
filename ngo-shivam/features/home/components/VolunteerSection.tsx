"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
    IconSparkles,
    IconCalendarEvent,
    IconSchool,
    IconSend,
    IconSpeakerphone,
} from "@tabler/icons-react";
import { CONTACT } from "@/lib/org";

/* ============================== CONTENT ============================== */
const SECTION = {
    eyebrow: "Be a Volunteer",
    title: "Join hands with us on the ground",
    intro:
        "You do not need special skills to help. Tell us how you would like to contribute and our team will get back to you.",
};

const ROLES = [
    {
        title: "Cleanliness drives",
        description: "Join community clean-ups in neighbourhoods and shared spaces.",
        icon: IconSparkles,
    },
    {
        title: "Awareness campaigns",
        description: "Help spread messages on health, hygiene and sanitation.",
        icon: IconSpeakerphone,
    },
    {
        title: "Teaching & training",
        description: "Share your knowledge in education and skill-training programmes.",
        icon: IconSchool,
    },
    {
        title: "Event support",
        description: "Lend a hand organising camps, drives and community events.",
        icon: IconCalendarEvent,
    },
];

/** Options in the "I am interested in" dropdown. */
const INTERESTS = [...ROLES.map((r) => r.title), "Something else"];
/* ===================================================================== */

const fieldClass =
    "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

export default function VolunteerSection() {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        interest: INTERESTS[0],
        message: "",
    });

    const update =
        (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    // There is no backend yet, so the form opens the visitor's email app with the details filled in.
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = `Volunteer enquiry: ${form.interest}`;
        const body = [
            `Name: ${form.name}`,
            `Phone: ${form.phone}`,
            `Interested in: ${form.interest}`,
            "",
            form.message,
        ].join("\n");
        window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <section
            id="volunteer"
            className="relative w-full bg-brand-light px-6 py-24 sm:py-28"
        >
            <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:gap-20">
                <motion.div
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
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

                    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                        {ROLES.map((role) => {
                            const Icon = role.icon;
                            return (
                                <li
                                    key={role.title}
                                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                                >
                                    <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                                        <Icon size={22} aria-hidden />
                                    </span>
                                    <p className="mt-3 font-bold text-brand-dark">{role.title}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {role.description}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </motion.div>

                <motion.form
                    onSubmit={onSubmit}
                    initial={{ opacity: 0, x: 32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="self-start rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/10 sm:p-9"
                >
                    <h3 className="text-xl font-bold text-brand-dark">Volunteer with us</h3>

                    <label className="mt-6 block text-sm font-semibold text-foreground">
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

                    <label className="mt-4 block text-sm font-semibold text-foreground">
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

                    <label className="mt-4 block text-sm font-semibold text-foreground">
                        I am interested in
                        <select
                            value={form.interest}
                            onChange={update("interest")}
                            className={fieldClass}
                        >
                            {INTERESTS.map((i) => (
                                <option key={i} value={i}>
                                    {i}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="mt-4 block text-sm font-semibold text-foreground">
                        Message <span className="font-normal text-muted-foreground">(optional)</span>
                        <textarea
                            rows={4}
                            value={form.message}
                            onChange={update("message")}
                            placeholder="Tell us a little about yourself and when you are available"
                            className={fieldClass}
                        />
                    </label>

                    <button
                        type="submit"
                        className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                    >
                        Send my details
                        <IconSend
                            size={20}
                            aria-hidden
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        This opens your email app with your details ready to send.
                    </p>
                </motion.form>
            </div>
        </section>
    );
}
