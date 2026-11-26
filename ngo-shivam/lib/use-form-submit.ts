"use client";

import { useState } from "react";
import type { FormType } from "@/lib/forms";

export type SubmitStatus = "idle" | "sending" | "success" | "error";

/**
 * Posts a form to /api/forms (which stores it and emails the NGO) and tracks the status.
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

        const fields = new FormData(e.currentTarget);
        const website = (fields.get("website") as string | null) ?? "";

        setStatus("sending");
        setError("");
        try {
            let body: BodyInit;
            let headers: HeadersInit;
            if (type === "career") {
                const payload = new FormData();
                payload.set("type", type);
                payload.set("source", source);
                payload.set("data", JSON.stringify(data));
                payload.set("website", website);
                for (const key of ["photo", "resume"]) {
                    const file = fields.get(key);
                    if (file instanceof File && file.size > 0) payload.set(key, file);
                }
                body = payload;
                headers = {};
            } else {
                body = JSON.stringify({ type, source, data, website });
                headers = { "Content-Type": "application/json" };
            }
            const res = await fetch("/api/forms", {
                method: "POST",
                headers,
                body,
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
