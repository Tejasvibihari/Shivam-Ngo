import { NextResponse } from "next/server";
import { parseForm, type FormFileKind } from "@/lib/forms";
import { MailConfigError, sendFormEmail } from "@/lib/mail";
import { saveFormSubmission, FormUploadError } from "@/lib/forms/storage";
import { MAX_PHOTO_BYTES, MAX_RESUME_BYTES, validateCareerUploads } from "@/lib/forms/upload-validation";

/* Simple per-IP rate limit (best effort: resets when the server restarts). */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_JSON_BYTES = 20_000;
const MAX_MULTIPART_BYTES = 16 * 1024 * 1024;
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) {
        hits.set(ip, recent);
        return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) {
        for (const [key, times] of hits) {
            if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
        }
    }
    return false;
}

function json(body: { ok: boolean; error?: string }, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: { "Cache-Control": "no-store" },
    });
}

function uploadFrom(formData: FormData, kind: FormFileKind): File | null | false {
    const value = formData.get(kind);
    if (value === null) return null;
    if (typeof value === "string") return false;
    if (value.size === 0 && value.name === "") return null;
    return value;
}

export async function POST(request: Request) {
    const length = Number(request.headers.get("content-length") ?? 0);
    const multipart = request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data") ?? false;
    if (length > (multipart ? MAX_MULTIPART_BYTES : MAX_JSON_BYTES)) {
        return json({ ok: false, error: "Submission is too large." }, 413);
    }

    let body: unknown;
    let honeypot: unknown;
    const uploads: Partial<Record<FormFileKind, File>> = {};
    if (multipart) {
        let formData: FormData;
        try {
            formData = await request.formData();
        } catch {
            return json({ ok: false, error: "Invalid request." }, 400);
        }

        const rawData = formData.get("data");
        if (typeof rawData !== "string") return json({ ok: false, error: "Invalid request." }, 400);
        if (rawData.length > MAX_JSON_BYTES) {
            return json({ ok: false, error: "Submission is too large." }, 413);
        }
        let data: unknown;
        try {
            data = JSON.parse(rawData);
        } catch {
            return json({ ok: false, error: "Invalid request." }, 400);
        }
        body = {
            type: formData.get("type"),
            source: formData.get("source"),
            data,
        };
        honeypot = formData.get("website");
        for (const kind of ["photo", "resume"] as const) {
            const upload = uploadFrom(formData, kind);
            if (upload === false) return json({ ok: false, error: "Invalid file upload." }, 400);
            if (upload) uploads[kind] = upload;
        }
        const totalFileBytes = Object.values(uploads).reduce((total, file) => total + (file?.size ?? 0), 0);
        if (
            (uploads.photo && uploads.photo.size > MAX_PHOTO_BYTES) ||
            (uploads.resume && uploads.resume.size > MAX_RESUME_BYTES) ||
            totalFileBytes > MAX_PHOTO_BYTES + MAX_RESUME_BYTES
        ) {
            return json({ ok: false, error: "One or more files are too large." }, 413);
        }
    } else {
        try {
            body = await request.json();
        } catch {
            return json({ ok: false, error: "Invalid request." }, 400);
        }
        honeypot = (body as { website?: unknown } | null)?.website;
    }

    // Honeypot: real visitors never see or fill this hidden field, bots do.
    // Pretend it worked so bots do not retry.
    if (typeof honeypot === "string" && honeypot.trim() !== "") {
        return json({ ok: true });
    }

    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
    if (tooMany(ip)) {
        return json(
            { ok: false, error: "Too many messages sent. Please try again in a few minutes." },
            429,
        );
    }

    const parsed = parseForm(body);
    if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

    if (parsed.data.type === "career") {
        const validation = await validateCareerUploads(uploads);
        if (!validation.ok) return json({ ok: false, error: validation.error }, 400);
    } else if (uploads.photo || uploads.resume) {
        return json({ ok: false, error: "File uploads are only accepted with career applications." }, 400);
    }

    try {
        await saveFormSubmission(parsed.data, uploads);
    } catch (err) {
        if (err instanceof FormUploadError) {
            return json({ ok: false, error: err.message }, 400);
        }
        console.error("[forms] Could not store submission:", err);
        return json(
            { ok: false, error: "We could not save your submission right now. Please try again later." },
            500,
        );
    }

    try {
        await sendFormEmail(parsed.data);
    } catch (err) {
        if (err instanceof MailConfigError) {
            console.error("[forms] Email is not configured:", err.message);
        } else {
            console.error("[forms] Could not send email:", err);
        }
    }
    return json({ ok: true });
}
