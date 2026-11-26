/**
 * Small typed helpers for calling the admin API from the panel UI. Pass the
 * `authFetch` from useAuth(): it sends the session cookie and turns a 401 anywhere
 * into "session expired" (the user is sent to the login page).
 */

export const NETWORK_ERROR = "Could not reach the server. Please check your connection and try again.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

export type AuthFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type ErrorBody = { error?: string; code?: string; fieldErrors?: Record<string, string> };

export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; status: number; message: string; code?: string; fieldErrors: Record<string, string> };

const failure = (status: number, message: string, body?: ErrorBody | null): ApiResult<never> => ({
    ok: false,
    status,
    message,
    code: body?.code,
    fieldErrors: body?.fieldErrors ?? {},
});

/** Runs one request and never throws (except when `signal` aborts it). */
export async function apiRequest<T>(
    authFetch: AuthFetch,
    url: string,
    options: { method?: "GET" | "PUT" | "PATCH" | "POST" | "DELETE"; body?: unknown; signal?: AbortSignal } = {},
): Promise<ApiResult<T>> {
    const { method = "GET", body, signal } = options;
    try {
        const res = await authFetch(url, {
            method,
            cache: "no-store",
            signal,
            headers: {
                Accept: "application/json",
                ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const data = (await res.json().catch(() => null)) as (T & ErrorBody & { ok?: boolean }) | null;
        if (res.ok && data?.ok) return { ok: true, data: data as T };
        if (res.status === 429) {
            const wait = Number(res.headers.get("Retry-After"));
            const minutes = Number.isFinite(wait) && wait > 0 ? Math.ceil(wait / 60) : 0;
            return failure(res.status, minutes ? `Too many attempts. Please try again in about ${minutes} minute(s).` : data?.error || GENERIC_ERROR, data);
        }
        return failure(res.status, data?.error || GENERIC_ERROR, data);
    } catch (err) {
        if (signal?.aborted) throw err;
        return failure(0, NETWORK_ERROR);
    }
}
