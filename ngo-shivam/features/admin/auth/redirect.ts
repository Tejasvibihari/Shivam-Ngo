/**
 * Pure helpers for the admin sign-in redirect. No React, no browser APIs, so
 * they are unit-tested in tests/admin-client/redirect.test.ts.
 */

export const ADMIN_HOME = "/admin";
export const LOGIN_PATH = "/admin/login";

/** Why the user is being sent to the login page (shown as a short message there). */
export type LoginReason = "expired" | "signed_out" | "forbidden";

const LOGIN_REASONS: readonly LoginReason[] = ["expired", "signed_out", "forbidden"];
export const isLoginReason = (value: unknown): value is LoginReason =>
    typeof value === "string" && (LOGIN_REASONS as readonly string[]).includes(value);

/** Pages under /admin that must never be a post-login destination (they would loop or make no sense). */
const NOT_A_DESTINATION = new Set(["/admin/login", "/admin/signup", "/admin/setup"]);

/**
 * Turns the untrusted `?next=` value into a safe in-app admin path.
 * Only same-origin paths under /admin are accepted; anything else (other sites,
 * `//evil.com`, `/\evil.com`, `javascript:`, other site sections, the login and
 * signup pages themselves) falls back to the admin home. This prevents an
 * open redirect through the login page.
 */
export function safeAdminPath(raw: unknown): string {
    if (typeof raw !== "string" || raw.length === 0 || raw.length > 500) return ADMIN_HOME;
    if (!raw.startsWith("/") || raw.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(raw)) return ADMIN_HOME;

    let url: URL;
    try {
        url = new URL(raw, "http://admin.invalid");
    } catch {
        return ADMIN_HOME;
    }
    if (url.origin !== "http://admin.invalid") return ADMIN_HOME;

    const { pathname } = url;
    // percent-encoded backslashes / control characters (%5C, %0d ...) are refused too
    try {
        if (/[\\\u0000-\u001f\u007f]/.test(decodeURIComponent(pathname + url.search))) return ADMIN_HOME;
    } catch {
        return ADMIN_HOME;
    }
    const underAdmin = pathname === ADMIN_HOME || pathname.startsWith(`${ADMIN_HOME}/`);
    if (!underAdmin) return ADMIN_HOME;
    if (NOT_A_DESTINATION.has(pathname.replace(/\/+$/, ""))) return ADMIN_HOME;

    return pathname + url.search;
}

/** `/admin/login` with optional `next` (only kept when it is not just the admin home) and `reason`. */
export function buildLoginUrl(options: { next?: string; reason?: LoginReason } = {}): string {
    const params = new URLSearchParams();
    if (options.next) {
        const next = safeAdminPath(options.next);
        if (next !== ADMIN_HOME) params.set("next", next);
    }
    if (options.reason) params.set("reason", options.reason);
    const query = params.toString();
    return query ? `${LOGIN_PATH}?${query}` : LOGIN_PATH;
}
