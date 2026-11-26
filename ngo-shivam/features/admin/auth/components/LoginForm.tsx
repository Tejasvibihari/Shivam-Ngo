"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { IconEye, IconEyeOff, IconLoader2, IconLogin2, IconShieldLock } from "@tabler/icons-react";
import FormStatus from "@/components/shared/FormStatus";
import { useAuth } from "@/features/admin/auth/AuthProvider";
import AuthLoading from "@/features/admin/auth/components/AuthLoading";
import { isLoginReason, safeAdminPath } from "@/features/admin/auth/redirect";
import { loginSchema } from "@/lib/admin/auth/validation";

/* ============================== CONTENT ============================== */
const COPY = {
    title: "Admin sign in",
    intro: "Sign in with your admin account to manage the website.",
    reasons: {
        expired: "Your session has expired. Please sign in again.",
        signed_out: "You have been signed out.",
        forbidden: "This account cannot use the admin panel.",
    },
};
/* ===================================================================== */

const fieldClass =
    "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/15";

type FieldErrors = { email?: string; password?: string };

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: (props: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
}) {
    const id = useId();
    return (
        <div className="block">
            <label htmlFor={id} className="text-sm font-semibold text-foreground">
                {label}
            </label>
            {children({ id, describedBy: error ? `${id}-error` : undefined, invalid: Boolean(error) })}
            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

/**
 * `next` and `reason` come straight from the URL, so they are untrusted: `next`
 * goes through safeAdminPath() (no open redirects), `reason` must be a known value.
 */
export default function LoginForm({ next, reason }: { next?: string; reason?: string }) {
    const { status, signIn } = useAuth();
    const router = useRouter();
    const destination = safeAdminPath(next);
    const notice = isLoginReason(reason) ? COPY.reasons[reason] : null;

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Signed in (just now, or already before opening this page): go to the requested page.
    useEffect(() => {
        if (status === "authenticated") router.replace(destination);
    }, [status, destination, router]);

    if (status === "authenticated") return <AuthLoading label="Redirecting..." />;

    const update = (key: keyof FieldErrors) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (sending) return;

        // Same rules as the server (shared schema); the server still validates everything.
        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) {
            const found: FieldErrors = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0];
                if (key === "email" || key === "password") found[key] ??= issue.message;
            }
            setErrors(found);
            setMessage("");
            return;
        }

        setErrors({});
        setMessage("");
        setSending(true);
        const result = await signIn(parsed.data.email, parsed.data.password);
        if (result.kind === "ok") return; // the effect above redirects once the state is "authenticated"

        setSending(false);
        setMessage(result.message);
        if (result.kind === "rejected" && result.fieldErrors) {
            setErrors({ email: result.fieldErrors.email, password: result.fieldErrors.password });
        }
    };

    return (
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/10 sm:p-9">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <IconShieldLock size={26} aria-hidden />
            </div>

            <form onSubmit={onSubmit} noValidate>
                <h1 className="mt-5 text-2xl font-bold tracking-tight text-brand-dark">{COPY.title}</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{COPY.intro}</p>

                {notice && (
                    <p role="status" className="mt-4 rounded-xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground">
                        {notice}
                    </p>
                )}

                <div className="mt-6 space-y-4">
                    <Field label="Email" error={errors.email}>
                        {({ id, describedBy, invalid }) => (
                            <input
                                id={id}
                                required
                                type="email"
                                autoComplete="username"
                                value={form.email}
                                onChange={update("email")}
                                aria-invalid={invalid}
                                aria-describedby={describedBy}
                                className={fieldClass}
                            />
                        )}
                    </Field>

                    <Field label="Password" error={errors.password}>
                        {({ id, describedBy, invalid }) => (
                            <div className="relative">
                                <input
                                    id={id}
                                    required
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={update("password")}
                                    aria-invalid={invalid}
                                    aria-describedby={describedBy}
                                    className={`${fieldClass} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:text-foreground focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
                                >
                                    {showPassword ? <IconEyeOff size={18} aria-hidden /> : <IconEye size={18} aria-hidden />}
                                </button>
                            </div>
                        )}
                    </Field>
                </div>

                <button
                    type="submit"
                    disabled={sending || status === "loading"}
                    className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                    {sending ? "Signing in..." : "Sign in"}
                    {sending ? <IconLoader2 size={20} aria-hidden className="animate-spin" /> : <IconLogin2 size={20} aria-hidden />}
                </button>
                <FormStatus status={message ? "error" : "idle"} error={message} successMessage="" />

                <p className="mt-5 text-center text-sm text-muted-foreground">
                    Need an account?{" "}
                    <Link href="/admin/signup" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    );
}
