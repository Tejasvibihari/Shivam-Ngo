"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowLeft, IconLoader2, IconLockCheck } from "@tabler/icons-react";
import FormStatus from "@/components/shared/FormStatus";
import { apiRequest } from "@/features/admin/api/client";
import { useAuth } from "@/features/admin/auth/AuthProvider";
import { AdminField, SecretInput } from "@/features/admin/ui/AdminField";
import PageHeading from "@/features/admin/ui/PageHeading";
import { adminCardClass, adminPrimaryButtonClass } from "@/features/admin/ui/styles";
import { pinSchema } from "@/lib/admin/db/models";
import type { SubmitStatus } from "@/lib/use-form-submit";

const EMPTY = { currentPin: "", newPin: "", confirmPin: "" };
type Key = keyof typeof EMPTY;
type Errors = Partial<Record<Key, string>>;
const isKey = (k: string): k is Key => k in EMPTY;

/**
 * Super Admin page that calls PUT /api/admin/settings/signup-pin. The PIN is never displayed or
 * stored in the browser: the inputs are cleared after every attempt that is accepted, and the
 * server only ever keeps a hash. Access is enforced twice: this page by the role policy, the API by withAuth().
 */
export default function SignupPinSettings() {
    const { authFetch } = useAuth();
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<SubmitStatus>("idle");
    const [message, setMessage] = useState("");

    const update = (key: Key) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === "sending") return;

        const found: Errors = {};
        const newPin = pinSchema.safeParse(form.newPin);
        if (!newPin.success) found.newPin = newPin.error.issues[0]?.message;
        if (form.currentPin) {
            const current = pinSchema.safeParse(form.currentPin);
            if (!current.success) found.currentPin = current.error.issues[0]?.message;
            else if (current.data === form.newPin) found.newPin ??= "New PIN must be different from the current PIN.";
        }
        if (form.confirmPin !== form.newPin) found.confirmPin = "PINs do not match.";
        if (Object.keys(found).length > 0) {
            setErrors(found);
            setStatus("idle");
            setMessage("");
            return;
        }

        setErrors({});
        setStatus("sending");
        setMessage("");
        const body = form.currentPin ? { currentPin: form.currentPin, newPin: form.newPin } : { newPin: form.newPin };
        const res = await apiRequest<{ message: string }>(authFetch, "/api/admin/settings/signup-pin", { method: "PUT", body });
        if (res.ok) {
            setForm(EMPTY);
            setMessage("The signup PIN has been updated. Tell the new PIN only to people who should be able to sign up.");
            setStatus("success");
            return;
        }
        const server: Errors = {};
        for (const [k, text] of Object.entries(res.fieldErrors)) if (isKey(k)) server[k] = text;
        setErrors(server);
        setForm((f) => ({ ...f, currentPin: "" })); // never keep a rejected PIN on screen
        setMessage(res.message);
        setStatus("error");
    };

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                <IconArrowLeft size={16} aria-hidden /> Back to settings
            </Link>
            <PageHeading
                title="Signup PIN"
                description="People need this PIN to create an account on the signup page. New accounts always start as Editors. Only a Super Admin can change it, and it is stored only as a hash: it cannot be shown again."
            />

            <form onSubmit={onSubmit} noValidate className={adminCardClass}>
                <div className="max-w-md space-y-4">
                    <AdminField label="Current PIN" error={errors.currentPin} hint="Leave empty only if no signup PIN has been set yet.">
                        {(p) => <SecretInput props={p} value={form.currentPin} onChange={update("currentPin")} autoComplete="off" inputMode="numeric" maxLength={12} required={false} />}
                    </AdminField>
                    <AdminField label="New PIN" error={errors.newPin} hint="6 to 12 digits.">
                        {(p) => <SecretInput props={p} value={form.newPin} onChange={update("newPin")} autoComplete="off" inputMode="numeric" maxLength={12} />}
                    </AdminField>
                    <AdminField label="Confirm new PIN" error={errors.confirmPin}>
                        {(p) => <SecretInput props={p} value={form.confirmPin} onChange={update("confirmPin")} autoComplete="off" inputMode="numeric" maxLength={12} />}
                    </AdminField>
                </div>

                <button type="submit" disabled={status === "sending"} className={`${adminPrimaryButtonClass} mt-6`}>
                    {status === "sending" ? <IconLoader2 size={18} aria-hidden className="animate-spin" /> : <IconLockCheck size={18} aria-hidden />}
                    {status === "sending" ? "Updating..." : "Update signup PIN"}
                </button>
                <FormStatus status={status} error={message} successMessage={message} />
            </form>
        </div>
    );
}
