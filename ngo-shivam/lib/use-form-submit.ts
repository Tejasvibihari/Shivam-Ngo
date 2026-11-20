"use client";

import { useState } from "react";
import type { FormType } from "@/lib/forms";

export type SubmitStatus = "idle" | "sending" | "success" | "error";

/**
 * Posts a form to /api/forms (which emails the NGO) and tracks the status.
 * Usage:  <form onSubmit={(e) => handleSubmit(e, values, () => reset())}>
 */
export function useFormSubmit(type: FormType, source: string) {
    const [status, setStatus] = useState<SubmitStatus>("idle");
    const [error, setError] = useState("");

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
        data: Record<string, string>,
        onSuccess?: () => void,
    ) => {
        e.preventDefault();
        if (status === "sending") return;

        // Hidden anti-spam field (see <HoneypotField />).
        const website = (new FormData(e.currentTarget).get("website") as string | null) ?? "";

        setStatus("sending");
        setError("");
        try {
            const res = await fetch("/api/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, source, data, website }),
            });
            const json = (await res.json().catch(() => null)) as
                | { ok?: boolean; error?: string }
                | null;
            if (!res.ok || !json?.ok) {
                throw new Error(json?.error || "Something went wrong. Please try again.");
            }
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setStatus("error");
            setError(
                err instanceof Error && err.message
                    ? err.message
                    : "Could not send your message. Please check your connection and try again.",
            );
        }
    };

    return { status, error, handleSubmit, sending: status === "sending" };
}
