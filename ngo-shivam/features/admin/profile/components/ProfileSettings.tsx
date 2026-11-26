"use client";

import { useState } from "react";
import { IconDeviceFloppy, IconKey, IconLoader2 } from "@tabler/icons-react";
import { roleLabel } from "@/features/admin/access/policy";
import { apiRequest } from "@/features/admin/api/client";
import { useAuth } from "@/features/admin/auth/AuthProvider";
import type { AuthUser } from "@/features/admin/auth/types";
import FormStatus from "@/components/shared/FormStatus";
import { AdminField, SecretInput } from "@/features/admin/ui/AdminField";
import PageHeading from "@/features/admin/ui/PageHeading";
import { adminCardClass, adminFieldClass, adminPrimaryButtonClass } from "@/features/admin/ui/styles";
import { changePasswordSchema, updateProfileSchema } from "@/lib/admin/auth/validation";
import type { SubmitStatus } from "@/lib/use-form-submit";

const dateTime = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

type Errors = Record<string, string | undefined>;

/** First message per field from a Zod error (same rules as the server). */
function fieldErrorsOf(issues: { path: PropertyKey[]; message: string }[]): Errors {
    const found: Errors = {};
    for (const issue of issues) found[String(issue.path[0] ?? "form")] ??= issue.message;
    return found;
}

function NameForm({ user }: { user: AuthUser }) {
    const { authFetch, updateUser } = useAuth();
    const [name, setName] = useState(user.name);
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<SubmitStatus>("idle");
    const [message, setMessage] = useState("");

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === "sending") return;
        const parsed = updateProfileSchema.safeParse({ name });
        if (!parsed.success) {
            setErrors(fieldErrorsOf(parsed.error.issues));
            setStatus("idle");
            return;
        }
        setErrors({});
        setStatus("sending");
        const res = await apiRequest<{ user: AuthUser }>(authFetch, "/api/admin/auth/profile", { method: "PATCH", body: parsed.data });
        if (res.ok) {
            updateUser(res.data.user);
            setName(res.data.user.name);
            setMessage("Your name has been updated.");
            setStatus("success");
            return;
        }
        setErrors(res.fieldErrors);
        setMessage(res.message);
        setStatus("error");
    };

    return (
        <form onSubmit={onSubmit} noValidate className={adminCardClass}>
            <h2 className="text-lg font-bold text-brand-dark">Your details</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                    <dt className="text-xs text-muted-foreground">Email</dt>
                    <dd className="break-all font-semibold text-foreground">{user.email}</dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">Role</dt>
                    <dd className="font-semibold text-foreground">{roleLabel(user.role)}</dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">Last sign-in</dt>
                    <dd className="font-semibold text-foreground">{user.lastLoginAt ? dateTime.format(new Date(user.lastLoginAt)) : "Never"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">Member since</dt>
                    <dd className="font-semibold text-foreground">{dateTime.format(new Date(user.createdAt))}</dd>
                </div>
            </dl>

            <div className="mt-6 max-w-md">
                <AdminField label="Full name" error={errors.name}>
                    {({ id, describedBy, invalid }) => (
                        <input
                            id={id}
                            required
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors({});
                                setStatus("idle");
                            }}
                            aria-invalid={invalid}
                            aria-describedby={describedBy}
                            className={adminFieldClass}
                        />
                    )}
                </AdminField>
            </div>

            <button type="submit" disabled={status === "sending" || name.trim() === user.name} className={`${adminPrimaryButtonClass} mt-6`}>
                {status === "sending" ? <IconLoader2 size={18} aria-hidden className="animate-spin" /> : <IconDeviceFloppy size={18} aria-hidden />}
                {status === "sending" ? "Saving..." : "Save name"}
            </button>
            <FormStatus status={status} error={message} successMessage={message} />
        </form>
    );
}

const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordForm() {
    const { authFetch } = useAuth();
    const [form, setForm] = useState(EMPTY_PASSWORDS);
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<SubmitStatus>("idle");
    const [message, setMessage] = useState("");

    const update = (key: keyof typeof EMPTY_PASSWORDS) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === "sending") return;
        const parsed = changePasswordSchema.safeParse({ currentPassword: form.currentPassword, newPassword: form.newPassword });
        const found: Errors = parsed.success ? {} : fieldErrorsOf(parsed.error.issues);
        if (form.newPassword !== form.confirmPassword) found.confirmPassword ??= "Passwords do not match.";
        if (!parsed.success || Object.keys(found).length > 0) {
            setErrors(found);
            setStatus("idle");
            setMessage("");
            return;
        }
        setErrors({});
        setStatus("sending");
        const res = await apiRequest<{ message: string }>(authFetch, "/api/admin/auth/password", { method: "PUT", body: parsed.data });
        if (res.ok) {
            // the server ended every other session and started a new one for this browser
            setForm(EMPTY_PASSWORDS);
            setMessage("Password updated. You were signed out on all other devices.");
            setStatus("success");
            return;
        }
        setErrors(res.fieldErrors);
        setMessage(res.message);
        setStatus("error");
    };

    return (
        <form onSubmit={onSubmit} noValidate className={adminCardClass}>
            <h2 className="text-lg font-bold text-brand-dark">Change password</h2>
            <p className="mt-1 text-sm text-muted-foreground">Changing your password signs you out everywhere else.</p>

            <div className="mt-6 max-w-md space-y-4">
                <AdminField label="Current password" error={errors.currentPassword}>
                    {(p) => <SecretInput props={p} value={form.currentPassword} onChange={update("currentPassword")} autoComplete="current-password" />}
                </AdminField>
                <AdminField label="New password" error={errors.newPassword} hint="At least 12 characters.">
                    {(p) => <SecretInput props={p} value={form.newPassword} onChange={update("newPassword")} autoComplete="new-password" />}
                </AdminField>
                <AdminField label="Confirm new password" error={errors.confirmPassword}>
                    {(p) => <SecretInput props={p} value={form.confirmPassword} onChange={update("confirmPassword")} autoComplete="new-password" />}
                </AdminField>
            </div>

            <button type="submit" disabled={status === "sending"} className={`${adminPrimaryButtonClass} mt-6`}>
                {status === "sending" ? <IconLoader2 size={18} aria-hidden className="animate-spin" /> : <IconKey size={18} aria-hidden />}
                {status === "sending" ? "Updating..." : "Update password"}
            </button>
            <FormStatus status={status} error={message} successMessage={message} />
        </form>
    );
}

/** Profile settings: rename the account and change the password, through the profile / password APIs. */
export default function ProfileSettings() {
    const { user } = useAuth();
    if (!user) return null;
    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            <PageHeading title="Profile settings" description="Your name and password. Your email and role can only be changed by a Super Admin." />
            <NameForm key={user.id} user={user} />
            <PasswordForm />
        </div>
    );
}
