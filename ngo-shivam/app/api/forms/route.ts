import { NextResponse } from "next/server";
import { parseForm } from "@/lib/forms";
import { MailConfigError, sendFormEmail } from "@/lib/mail";

/* Simple per-IP rate limit (best effort: resets when the server restarts). */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
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
    return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > 20_000) return json({ ok: false, error: "Message is too large." }, 413);

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return json({ ok: false, error: "Invalid request." }, 400);
    }

    // Honeypot: real visitors never see or fill this hidden field, bots do.
    // Pretend it worked so bots do not retry.
    const honeypot = (body as { website?: unknown } | null)?.website;
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

    try {
        await sendFormEmail(parsed.data);
        return json({ ok: true });
    } catch (err) {
        if (err instanceof MailConfigError) {
            console.error("[forms] Email is not configured:", err.message);
        } else {
            console.error("[forms] Could not send email:", err);
        }
        return json(
            {
                ok: false,
                error:
                    "We could not send your message right now. Please call us or try again later.",
            },
            500,
        );
    }
}
