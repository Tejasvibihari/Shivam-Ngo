"use client";

import { useId, useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { adminFieldClass } from "@/features/admin/ui/styles";

type RenderProps = { id: string; describedBy?: string; invalid: boolean };

/** Label + control + error / hint, wired with aria-describedby (same pattern as the login form). */
export function AdminField({
    label,
    error,
    hint,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: (props: RenderProps) => React.ReactNode;
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

/** A secret input with a show / hide toggle. */
export function SecretInput({
    props,
    value,
    onChange,
    autoComplete,
    inputMode,
    maxLength,
    required = true,
}: {
    props: RenderProps;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoComplete: string;
    inputMode?: "numeric";
    maxLength?: number;
    required?: boolean;
}) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input
                id={props.id}
                required={required}
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                inputMode={inputMode}
                maxLength={maxLength}
                value={value}
                onChange={onChange}
                aria-invalid={props.invalid}
                aria-describedby={props.describedBy}
                className={`${adminFieldClass} pr-12`}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide value" : "Show value"}
                aria-pressed={visible}
                className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:text-foreground focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
            >
                {visible ? <IconEyeOff size={18} aria-hidden /> : <IconEye size={18} aria-hidden />}
            </button>
        </div>
    );
}
