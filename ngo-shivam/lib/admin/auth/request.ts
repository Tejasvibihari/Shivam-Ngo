import "server-only";
import { isIP } from "node:net";
import { NextResponse, type NextRequest } from "next/server";
import { AuthConfigError, trustProxy } from "@/lib/admin/auth/config";
import { DatabaseError } from "@/lib/admin/db/errors";

/** Small helpers shared by every admin API route. */

const NO_STORE = { "Cache-Control": "no-store" };

export type ApiError = {
    ok: false;
    error: string;
    code: string;
    fieldErrors?: Record<string, string>;
};

/** JSON response that browsers and proxies must never cache (it may hold user data). */
export function json<T extends object>(body: T, status = 200, headers: Record<string, string> = {}) {
    return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

export function fail(
    status: number,
    code: string,
    error: string,
    extra: { fieldErrors?: Record<string, string>; headers?: Record<string, string> } = {},
) {
    const body: ApiError = { ok: false, error, code };
    if (extra.fieldErrors) body.fieldErrors = extra.fieldErrors;
    return json(body, status, extra.headers);
}

/** Turn anything thrown inside a route into a safe response (details go to the server log only). */
export function handleError(err: unknown) {
    if (err instanceof AuthConfigError) {
        console.error("[auth] Misconfiguration:", err.message);
        return fail(503, "not_configured", "Authentication is not configured on the server.");
    }
    if (err instanceof DatabaseError) {
        return fail(503, "database_unavailable", err.publicMessage);
    }
    console.error("[auth] Unexpected error:", err instanceof Error ? err.message : "unknown");
    return fail(500, "internal_error", "Something went wrong. Please try again.");
}

/**
 * Client IP, or null when it cannot be trusted. Forwarding headers are only
 * used when TRUST_PROXY=true, because otherwise any client can forge them.
 */
export function clientIp(request: NextRequest): string | null {
    if (!trustProxy()) return null;
    const candidates = [
        request.headers.get("x-real-ip"),
        // The LAST entry is the one added by our own proxy; earlier ones are client-supplied.
        request.headers.get("x-forwarded-for")?.split(",").at(-1),
    ];
    for (const raw of candidates) {
        const value = raw?.trim();
        if (value && isIP(value)) return value;
    }
    return null;
}

/**
 * CSRF defence for requests that change state: the browser-supplied Origin
 * must be this site. (The session cookie is also SameSite=Lax.) Requests with
 * no Origin and no Sec-Fetch-Site come from non-browser clients such as curl,
 * which are not CSRF vectors, and are allowed.
 */
export function isSameOrigin(request: NextRequest): boolean {
    const allowedHosts = new Set<string>();
    const host = request.headers.get("host");
    if (host) allowedHosts.add(host.toLowerCase());
    if (trustProxy()) {
        const forwarded = request.headers.get("x-forwarded-host")?.split(",").at(-1)?.trim();
        if (forwarded) allowedHosts.add(forwarded.toLowerCase());
    }
    try {
        const site = process.env.NEXT_PUBLIC_SITE_URL;
        if (site) allowedHosts.add(new URL(site).host.toLowerCase());
    } catch {
        /* ignore a malformed NEXT_PUBLIC_SITE_URL */
    }

    const origin = request.headers.get("origin");
    if (origin) {
        try {
            return allowedHosts.has(new URL(origin).host.toLowerCase());
        } catch {
            return false;
        }
    }
    const fetchSite = request.headers.get("sec-fetch-site");
    return !fetchSite || fetchSite === "same-origin" || fetchSite === "none";
}

export const isUnsafeMethod = (method: string) => !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());

/** Read and parse a small JSON body. Returns an error response instead of throwing. */
export async function readJson(
    request: NextRequest,
    maxBytes = 4_096,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
    if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
        return { ok: false, response: fail(415, "unsupported_media_type", "Content-Type must be application/json.") };
    }
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > maxBytes) {
        return { ok: false, response: fail(413, "payload_too_large", "Request body is too large.") };
    }
    let text: string;
    try {
        text = await request.text();
    } catch {
        return { ok: false, response: fail(400, "invalid_json", "Invalid request.") };
    }
    if (text.length > maxBytes) {
        return { ok: false, response: fail(413, "payload_too_large", "Request body is too large.") };
    }
    try {
        return { ok: true, data: JSON.parse(text) };
    } catch {
        return { ok: false, response: fail(400, "invalid_json", "Request body is not valid JSON.") };
    }
}
