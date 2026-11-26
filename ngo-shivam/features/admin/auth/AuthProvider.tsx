"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { fetchCurrentUser, loginRequest, logoutRequest, type LoginResult } from "@/features/admin/auth/api";
import type { LoginReason } from "@/features/admin/auth/redirect";
import type { AuthUser } from "@/features/admin/auth/types";

/**
 * Authentication state for the whole admin area (mounted once in app/admin/layout.tsx).
 *
 * Source of truth: the server. The session is an HttpOnly cookie that scripts
 * cannot read, so on mount the provider asks GET /api/admin/auth/me who is
 * signed in. The result lives ONLY in memory (React state): nothing is written
 * to localStorage / sessionStorage / readable cookies, so there is no stale or
 * forgeable copy of "I am logged in" in the browser. A page reload simply
 * asks the server again.
 *
 * status:
 *   loading          first check in progress (nothing protected is rendered)
 *   authenticated    `user` is set
 *   unauthenticated  no valid session; `reason` says why when known
 *   error            the check could not be completed (server/network); the
 *                    session may be fine, so we do NOT treat it as signed out
 *
 * This is authentication only. Roles/permissions are not interpreted here (a
 * later task); the server still enforces access on every API call.
 */

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type State = {
    status: AuthStatus;
    user: AuthUser | null;
    /** Why we are unauthenticated, when we know. Shown on the login page. */
    reason: LoginReason | null;
    error: string | null;
};

type Action =
    | { type: "checking" }
    | { type: "authenticated"; user: AuthUser }
    | { type: "unauthenticated"; reason: LoginReason | null }
    | { type: "failed"; message: string };

const INITIAL: State = { status: "loading", user: null, reason: null, error: null };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "checking":
            return { ...INITIAL };
        case "authenticated":
            return { status: "authenticated", user: action.user, reason: null, error: null };
        case "unauthenticated":
            return { status: "unauthenticated", user: null, reason: action.reason, error: null };
        case "failed":
            return { status: "error", user: null, reason: null, error: action.message };
        default:
            return state;
    }
}

/** How soon after the last check a tab refocus may re-check the session. */
const REVALIDATE_MIN_INTERVAL_MS = 60_000;

export type SignOutResult = { ok: true } | { ok: false; message: string };

type AuthContextValue = State & {
    /** Re-run the check (used by the "Try again" button after a failed check). */
    refresh: () => Promise<void>;
    /** Sign in through the existing login API; on success the user is stored. */
    signIn: (email: string, password: string) => Promise<LoginResult>;
    /** Sign out through the existing logout API, then clear the local state. */
    signOut: () => Promise<SignOutResult>;
    /**
     * `fetch` for admin API calls: same-origin cookies, and a 401 anywhere
     * marks the session as expired so the user is sent to the login page.
     */
    authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, INITIAL);
    const lastCheckRef = useRef(0);
    const statusRef = useRef<AuthStatus>("loading");
    useEffect(() => {
        statusRef.current = state.status;
    }, [state.status]);

    /** Apply a check result. `silent` re-checks never flip the UI into "loading" or "error". */
    const check = useCallback(async (signal: AbortSignal | undefined, silent: boolean) => {
        let result;
        try {
            result = await fetchCurrentUser(signal);
        } catch {
            return; // aborted (unmount / strict-mode re-run)
        }
        lastCheckRef.current = Date.now();
        switch (result.kind) {
            case "ok":
                dispatch({ type: "authenticated", user: result.user });
                break;
            case "unauthenticated":
                // Had a session in this tab and it is gone now => it expired / was revoked.
                dispatch({ type: "unauthenticated", reason: silent ? "expired" : null });
                break;
            case "forbidden":
                dispatch({ type: "unauthenticated", reason: "forbidden" });
                break;
            case "error":
                // A transient failure must not sign the user out of a working session.
                if (!silent) dispatch({ type: "failed", message: result.message });
                break;
        }
    }, []);

    // First check when the admin area opens.
    useEffect(() => {
        const controller = new AbortController();
        void check(controller.signal, false);
        return () => controller.abort();
    }, [check]);

    // Idle sessions end on the server after hours; catch that when the person comes back to the tab.
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState !== "visible" || statusRef.current !== "authenticated") return;
            if (Date.now() - lastCheckRef.current < REVALIDATE_MIN_INTERVAL_MS) return;
            void check(undefined, true);
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [check]);

    const refresh = useCallback(async () => {
        dispatch({ type: "checking" });
        await check(undefined, false);
    }, [check]);

    const signIn = useCallback(async (email: string, password: string) => {
        const result = await loginRequest(email, password);
        if (result.kind === "ok") {
            lastCheckRef.current = Date.now();
            dispatch({ type: "authenticated", user: result.user });
        }
        return result;
    }, []);

    const signOut = useCallback(async (): Promise<SignOutResult> => {
        const done = await logoutRequest();
        // If the server could not be reached the cookie may still be valid: stay signed in and say so.
        if (!done) return { ok: false, message: "Could not sign out. Please check your connection and try again." };
        dispatch({ type: "unauthenticated", reason: "signed_out" });
        return { ok: true };
    }, []);

    const authFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
        const res = await fetch(input, { ...init, credentials: "same-origin" });
        if (res.status === 401 && statusRef.current === "authenticated") {
            dispatch({ type: "unauthenticated", reason: "expired" });
        }
        return res;
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ ...state, refresh, signIn, signOut, authFetch }),
        [state, refresh, signIn, signOut, authFetch],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider> (app/admin/layout.tsx).");
    return ctx;
}
