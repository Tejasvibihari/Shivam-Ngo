import "server-only";
import { z } from "zod";
import { pinSchema, type Role } from "@/lib/admin/db/models";

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

/**
 * Signup (see signup-pin.ts). Every attempt counts, successful or not, so a valid
 * PIN cannot be used to mass-create accounts either.
 * - per IP: stops one machine guessing the PIN (needs TRUST_PROXY, see below);
 * - global: still protects the PIN when the client IP is unknown. 20 attempts an
 *   hour is ~480 guesses a day against a 10^6 (6-digit) minimum search space.
 */
export const SIGNUP_WINDOW_MS = 15 * 60 * 1000;
export const SIGNUP_MAX_PER_IP = 5;
export const SIGNUP_GLOBAL_WINDOW_MS = 60 * 60 * 1000;
export const SIGNUP_MAX_GLOBAL = 20;

/** Changing the PIN requires the current PIN, so a stolen Super Admin session cannot brute-force it. */
export const PIN_CHANGE_WINDOW_MS = 15 * 60 * 1000;
export const PIN_CHANGE_MAX_PER_USER = 5;

/** Changing the password requires the current one, so a stolen session cannot guess it. */
export const PASSWORD_CHANGE_WINDOW_MS = 15 * 60 * 1000;
export const PASSWORD_CHANGE_MAX_PER_USER = 5;

/**
 * One-time Super Admin setup (see setup.ts). Every attempt counts. The token is long
 * and random, so these limits only exist to stop noise and abuse, not to protect a weak secret.
 */
export const SETUP_WINDOW_MS = 60 * 60 * 1000;
export const SETUP_MAX_PER_IP = 10;
export const SETUP_MAX_GLOBAL = 30;
export const SETUP_TOKEN_MIN_LENGTH = 32;
const SETUP_TOKEN_PLACEHOLDERS = new Set(["put-a-one-time-setup-token-here", "changeme", "secret"]);

/**
 * SETUP_TOKEN from the environment, or null when it is unset, too short or still the
 * placeholder. A null token keeps the setup endpoint closed (fail closed).
 */
export function getSetupToken(): string | null {
    const raw = (process.env.SETUP_TOKEN ?? "").trim();
    if (raw.length < SETUP_TOKEN_MIN_LENGTH || SETUP_TOKEN_PLACEHOLDERS.has(raw)) return null;
    return raw;
}

/**
 * Role given to every account created through signup. It is a constant, never
 * taken from the request, and is deliberately NOT "super_admin": the only way
 * to become Super Admin is the one-time setup process.
 */
export const SIGNUP_DEFAULT_ROLE: Role = "editor";

/** SIGNUP_ENABLED=false closes signup completely (kill switch), whatever the PIN. */
export function signupKillSwitchOn(): boolean {
    return (process.env.SIGNUP_ENABLED ?? "").trim().toLowerCase() === "false";
}

let warnedBadInitialPin = false;

/** Optional first PIN from SIGNUP_PIN_INITIAL. Returns null when unset or invalid. */
export function getInitialSignupPin(): string | null {
    const raw = (process.env.SIGNUP_PIN_INITIAL ?? "").trim();
    if (!raw) return null;
    const parsed = pinSchema.safeParse(raw);
    if (!parsed.success) {
        if (!warnedBadInitialPin) {
            warnedBadInitialPin = true;
            console.error("[auth] SIGNUP_PIN_INITIAL is ignored: it must be 6 to 12 digits.");
        }
        return null;
    }
    return parsed.data;
}

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
