import type { AuthUser } from "@/features/admin/auth/types";

/**
 * Thin client for the EXISTING backend auth routes (nothing new on the server):
 *   GET  /api/admin/auth/me      current user
 *   POST /api/admin/auth/login   sign in (sets the HttpOnly session cookie)
 *   POST /api/admin/auth/logout  sign out
 * The session lives in an HttpOnly cookie, so the browser sends it by itself and
 * no token is ever readable by (or stored in) JavaScript.
 */

const ME_API = "/api/admin/auth/me";
const LOGIN_API = "/api/admin/auth/login";
const LOGOUT_API = "/api/admin/auth/logout";

type ApiBody = {
    ok?: boolean;
    user?: AuthUser;
    error?: string;
    code?: string;
    fieldErrors?: Record<string, string>;
};

const readBody = (res: Response) => res.json().catch(() => null) as Promise<ApiBody | null>;

export const NETWORK_ERROR = "Could not reach the server. Please check your connection and try again.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

export type CurrentUserResult =
    | { kind: "ok"; user: AuthUser }
    /** 401: no session, or it expired / was revoked. */
    | { kind: "unauthenticated" }
    /** 403: signed in, but the account may not use the admin API. */
    | { kind: "forbidden" }
    /** Anything else (server down, 5xx, bad response). The session may still be fine. */
    | { kind: "error"; message: string };

/** Asks the server who is signed in. Throws only when `signal` aborts the request. */
export async function fetchCurrentUser(signal?: AbortSignal): Promise<CurrentUserResult> {
    try {
        const res = await fetch(ME_API, {
            cache: "no-store",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
            signal,
        });
        if (res.status === 401) return { kind: "unauthenticated" };
        if (res.status === 403) return { kind: "forbidden" };
        const data = await readBody(res);
        if (res.ok && data?.ok && data.user) return { kind: "ok", user: data.user };
        return { kind: "error", message: data?.error || GENERIC_ERROR };
    } catch (err) {
        if (signal?.aborted) throw err;
        return { kind: "error", message: NETWORK_ERROR };
    }
}

export type LoginResult =
    | { kind: "ok"; user: AuthUser }
    | { kind: "rejected"; message: string; code?: string; fieldErrors?: Record<string, string> }
    | { kind: "error"; message: string };

export async function loginRequest(email: string, password: string): Promise<LoginResult> {
    try {
        const res = await fetch(LOGIN_API, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await readBody(res);
        if (res.ok && data?.ok && data.user) return { kind: "ok", user: data.user };
        if (res.status >= 500) return { kind: "error", message: data?.error || GENERIC_ERROR };
        return {
            kind: "rejected",
            message: data?.error || GENERIC_ERROR,
            code: data?.code,
            fieldErrors: data?.fieldErrors,
        };
    } catch {
        return { kind: "error", message: NETWORK_ERROR };
    }
}

/** True when the server confirmed the session is gone (logout is idempotent on the server). */
export async function logoutRequest(): Promise<boolean> {
    try {
        const res = await fetch(LOGOUT_API, {
            method: "POST",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
        });
        return res.ok;
    } catch {
        return false;
    }
}
