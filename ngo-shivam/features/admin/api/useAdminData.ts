"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/features/admin/api/client";
import { useAuth } from "@/features/admin/auth/AuthProvider";

export type AdminData<T> =
    | { state: "loading"; data: null; error: null; reload: () => void }
    | { state: "ready"; data: T; error: null; reload: () => void }
    | { state: "error"; data: null; error: string; reload: () => void };

/**
 * GETs `url` (an admin API route) and tracks loading / ready / error. Re-fetches when `url`
 * changes. Nothing is cached in the browser: every visit asks the server.
 */
export function useAdminData<T>(url: string): AdminData<T> {
    const { authFetch } = useAuth();
    const [result, setResult] = useState<{ url: string; data: T | null; error: string | null }>({ url: "", data: null, error: null });
    const [nonce, setNonce] = useState(0);
    const reload = useCallback(() => setNonce((n) => n + 1), []);
    const latest = useRef(0);

    useEffect(() => {
        const controller = new AbortController();
        const id = ++latest.current;
        apiRequest<T>(authFetch, url, { signal: controller.signal })
            .then((res) => {
                if (id !== latest.current) return;
                setResult(res.ok ? { url, data: res.data, error: null } : { url, data: null, error: res.message });
            })
            .catch(() => undefined); // aborted
        return () => controller.abort();
    }, [authFetch, url, nonce]);

    // Until the response for THIS url arrives, we are loading (also right after `url` changed).
    if (result.url !== url) return { state: "loading", data: null, error: null, reload };
    if (result.error !== null) return { state: "error", data: null, error: result.error, reload };
    return { state: "ready", data: result.data as T, error: null, reload };
}
