"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { IconLoader2, IconShieldCheck, IconShieldLock } from "@tabler/icons-react";
import FormStatus from "@/components/shared/FormStatus";
import { setupSchema } from "@/lib/admin/auth/validation";
import type { SubmitStatus } from "@/lib/use-form-submit";

/* ============================== CONTENT ============================== */
const COPY = {
    title: "Set up the Super Admin",
    intro: "Create the first Super Admin account. You need the SETUP_TOKEN from the server's environment variables. This page stops working as soon as the account exists.",
    closedTitle: "Setup is not available",
    closedText: "A Super Admin already exists, or setup has not been enabled on the server.",
    success: "The Super Admin account has been created. You can now sign in.",
};
/* ===================================================================== */

const LOGIN_PATH = "/admin/login";
const SETUP_API = "/api/admin/setup";

const fieldClass =
    "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/15";

type Availability = "checking" | "open" | "closed";
type FieldKey = "setupToken" | "name" | "email" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldKey, string>>;
type ApiResponse = { ok?: boolean; error?: string; code?: string; fieldErrors?: Record<string, string> };

const EMPTY = { setupToken: "", name: "", email: "", password: "", confirmPassword: "" };
const FIELD_KEYS: FieldKey[] = ["setupToken", "name", "email", "password", "confirmPassword"];
const isFieldKey = (key: string): key is FieldKey => (FIELD_KEYS as string[]).includes(key);

function Field({
    label,
    error,
    hint,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: (props: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
}) {
    const id = useId();
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
    return (
        <div className="block">
            <label htmlFor={id} className="text-sm font-semibold text-foreground">
                {label}
            </label>
            {children({ id, describedBy, invalid: Boolean(error) })}
            {error ? (
                <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-destructive">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

export default function SetupForm() {
    const [availability, setAvailability] = useState<Availability>("checking");
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [status, setStatus] = useState<SubmitStatus>("idle");
    const [message, setMessage] = useState("");

    // Ask the server whether setup is still open, so a closed setup shows a clear message.
    useEffect(() => {
        const controller = new AbortController();
        fetch(SETUP_API, { cache: "no-store", signal: controller.signal })
            .then((res) => res.json() as Promise<{ available?: boolean }>)
            .then((data) => setAvailability(data.available === true ? "open" : "closed"))
            .catch((err: unknown) => {
                if (!(err instanceof DOMException && err.name === "AbortError")) setAvailability("closed");
            });
        return () => controller.abort();
    }, []);

    const update = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === "sending") return;

        // Same rules as the server (shared schema).
        const parsed = setupSchema.safeParse({
            setupToken: form.setupToken,
            name: form.name,
            email: form.email,
            password: form.password,
        });
        const found: FieldErrors = {};
        if (!parsed.success) {
            for (const issue of parsed.error.issues) {
                const key = String(issue.path[0] ?? "");
                if (isFieldKey(key)) found[key] ??= issue.message;
            }
        }
        if (form.password !== form.confirmPassword) found.confirmPassword ??= "Passwords do not match.";
        if (!parsed.success || Object.keys(found).length > 0) {
            setErrors(found);
            setStatus("idle");
            setMessage("");
            return;
        }

        setErrors({});
        setStatus("sending");
        setMessage("");
        try {
            const res = await fetch(SETUP_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed.data),
            });
            const data = (await res.json().catch(() => null)) as ApiResponse | null;

            if (res.ok && data?.ok) {
                setForm(EMPTY); // the token and password never stay in the page
                setStatus("success");
                return;
            }
            if (data?.code === "setup_unavailable") {
                setAvailability("closed");
                return;
            }
            const serverErrors: FieldErrors = {};
            for (const [key, text] of Object.entries(data?.fieldErrors ?? {})) {
                if (isFieldKey(key)) serverErrors[key] = text;
            }
            setErrors(serverErrors);
            setForm((f) => ({ ...f, setupToken: "" })); // never keep a rejected token on screen
            setMessage(data?.error || "Something went wrong. Please try again.");
            setStatus("error");
        } catch {
            setMessage("Could not reach the server. Please check your connection and try again.");
            setStatus("error");
        }
    };

    const sending = status === "sending";

    return (
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/10 sm:p-9">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <IconShieldLock size={26} aria-hidden />
            </div>

            {availability === "checking" && (
                <p role="status" className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <IconLoader2 size={18} aria-hidden className="animate-spin" />
                    Checking setup availability...
                </p>
            )}

            {availability === "closed" && status !== "success" && (
                <>
                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-brand-dark">{COPY.closedTitle}</h1>
                    <p role="status" className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {COPY.closedText}
                    </p>
                    <Link href={LOGIN_PATH} className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
                        Go to sign in
                    </Link>
                </>
            )}

            {status === "success" && (
                <>
                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-brand-dark">Super Admin created</h1>
                    <FormStatus status="success" error="" successMessage={COPY.success} />
                    <Link
                        href={LOGIN_PATH}
                        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                    >
                        Go to sign in
                    </Link>
                </>
            )}

            {availability === "open" && status !== "success" && (
                <form onSubmit={onSubmit} noValidate>
                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-brand-dark">{COPY.title}</h1>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{COPY.intro}</p>

                    <div className="mt-6 space-y-4">
                        <Field label="Setup token" error={errors.setupToken} hint="The SETUP_TOKEN value from the server environment.">
                            {({ id, describedBy, invalid }) => (
                                <input
                                    id={id}
                                    required
                                    type="password"
                                    autoComplete="off"
                                    spellCheck={false}
                                    value={form.setupToken}
                                    onChange={update("setupToken")}
                                    aria-invalid={invalid}
                                    aria-describedby={describedBy}
                                    className={fieldClass}
                                />
                            )}
                        </Field>

                        <Field label="Full name" error={errors.name}>
                            {({ id, describedBy, invalid }) => (
                                <input
                                    id={id}
                                    required
                                    type="text"
                                    autoComplete="name"
                                    value={form.name}
                                    onChange={update("name")}
                                    aria-invalid={invalid}
                                    aria-describedby={describedBy}
                                    className={fieldClass}
                                />
                            )}
                        </Field>

                        <Field label="Email" error={errors.email}>
                            {({ id, describedBy, invalid }) => (
                                <input
                                    id={id}
                                    required
                                    type="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={update("email")}
                                    aria-invalid={invalid}
                                    aria-describedby={describedBy}
                                    className={fieldClass}
                                />
                            )}
                        </Field>

                        <Field label="Password" error={errors.password} hint="At least 12 characters.">
                            {({ id, describedBy, invalid }) => (
                                <input
                                    id={id}
                                    required
                                    type="password"
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={update("password")}
                                    aria-invalid={invalid}
                                    aria-describedby={describedBy}
                                    className={fieldClass}
                                />
                            )}
                        </Field>

                        <Field label="Confirm password" error={errors.confirmPassword}>
                            {({ id, describedBy, invalid }) => (
                                <input
                                    id={id}
                                    required
                                    type="password"
                                    autoComplete="new-password"
                                    value={form.confirmPassword}
                                    onChange={update("confirmPassword")}
                                    aria-invalid={invalid}
                                    aria-describedby={describedBy}
                                    className={fieldClass}
                                />
                            )}
                        </Field>
                    </div>

                    <button
                        type="submit"
                        disabled={sending}
                        className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {sending ? "Creating account..." : "Create Super Admin"}
                        {sending ? <IconLoader2 size={20} aria-hidden className="animate-spin" /> : <IconShieldCheck size={20} aria-hidden />}
                    </button>
                    <FormStatus status={status} error={message} successMessage="" />
                </form>
            )}
        </div>
    );
}
