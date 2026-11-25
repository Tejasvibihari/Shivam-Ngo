import "server-only";
import { z } from "zod";

/**
 * Authentication settings. Everything comes from environment variables and is
 * read lazily, so a missing variable cannot break the public website build:
 * it only fails when admin code first needs it.
 */

export class AuthConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthConfigError";
    }
}

const PLACEHOLDERS = new Set(["put-a-long-random-secret-here", "changeme", "secret"]);

const secretSchema = z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 48")
    .refine((v) => !PLACEHOLDERS.has(v), "AUTH_SECRET is still the placeholder value.");

let cachedSecret: string | null = null;

/** Secret used to HMAC session tokens and rate-limit keys. Never logged, never sent to a client. */
export function getAuthSecret(): string {
    if (cachedSecret) return cachedSecret;
    const parsed = secretSchema.safeParse(process.env.AUTH_SECRET ?? "");
    if (!parsed.success) {
        throw new AuthConfigError(parsed.error.issues.map((i) => i.message).join(" "));
    }
    cachedSecret = parsed.data;
    return cachedSecret;
}

/** Session lifetime limits. */
export const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000; // hard limit from login
export const SESSION_IDLE_MS = 12 * 60 * 60 * 1000; // inactivity limit
export const SESSION_TOUCH_MS = 5 * 60 * 1000; // how often lastSeenAt is refreshed

/** Login throttling (see rate-limit.ts). */
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_MAX_PER_IP = 20;
export const LOGIN_MAX_PER_EMAIL = 10;

const isProd = process.env.NODE_ENV === "production";

/**
 * `__Host-` cookies must be Secure, Path=/ and have no Domain, which stops
 * sibling sub-domains from overwriting the session. They need HTTPS, so
 * development over http://localhost uses a plain name.
 */
export const SESSION_COOKIE_NAME = isProd ? "__Host-ngo_session" : "ngo_session";
export const SESSION_COOKIE_NAMES = ["__Host-ngo_session", "ngo_session"] as const;

/**
 * Set TRUST_PROXY=true only when the app runs behind a reverse proxy / CDN that
 * overwrites X-Forwarded-For (Hostinger, Vercel, Cloudflare, nginx...).
 * Otherwise those headers are client-controlled and are ignored.
 */
export function trustProxy(): boolean {
    return (process.env.TRUST_PROXY ?? "").trim().toLowerCase() === "true";
}
