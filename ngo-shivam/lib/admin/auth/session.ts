import "server-only";
import { randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { ObjectId } from "mongodb";
import {
    SESSION_ABSOLUTE_MS,
    SESSION_COOKIE_NAME,
    SESSION_IDLE_MS,
    SESSION_TOUCH_MS,
} from "@/lib/admin/auth/config";
import { hmac } from "@/lib/admin/auth/crypto";
import { sessionsCollection, usersCollection } from "@/lib/admin/db/client";
import type { UserDoc } from "@/lib/admin/db/models";

/**
 * Server-side sessions with an opaque cookie.
 *
 * - The cookie holds 256 random bits. MongoDB stores only an HMAC of it, so
 *   neither a database leak nor an AUTH_SECRET-less attacker can forge cookies.
 * - Logout and "disable user" take effect immediately (the session row is
 *   deleted / the user is re-checked on every request), which a stateless JWT
 *   cannot do.
 * - A new token is issued at every login (no session fixation).
 */

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const isProd = process.env.NODE_ENV === "production";

export type CreatedSession = { token: string; expiresAt: Date };

export async function createSession(
    userId: ObjectId,
    meta: { ip: string | null; userAgent: string | null },
): Promise<CreatedSession> {
    const token = randomBytes(32).toString("base64url");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_ABSOLUTE_MS);
    await (await sessionsCollection()).insertOne({
        _id: hmac("session", token),
        userId,
        createdAt: now,
        lastSeenAt: now,
        expiresAt,
        ip: meta.ip,
        userAgent: meta.userAgent ? meta.userAgent.slice(0, 256) : null,
    });
    return { token, expiresAt };
}

export type ActiveSession = { sessionId: string; user: UserDoc };

/** Resolve a cookie token to a live session and an active user, or null. */
export async function resolveSession(token: string | undefined | null): Promise<ActiveSession | null> {
    if (!token || !TOKEN_PATTERN.test(token)) return null;

    const sessionId = hmac("session", token);
    const sessions = await sessionsCollection();
    const session = await sessions.findOne({ _id: sessionId });
    if (!session) return null;

    const now = Date.now();
    if (session.expiresAt.getTime() <= now || now - session.lastSeenAt.getTime() > SESSION_IDLE_MS) {
        await sessions.deleteOne({ _id: sessionId });
        return null;
    }

    const user = await (await usersCollection()).findOne({ _id: session.userId });
    if (!user || user.status !== "active") {
        await sessions.deleteOne({ _id: sessionId });
        return null;
    }

    if (now - session.lastSeenAt.getTime() > SESSION_TOUCH_MS) {
        await sessions.updateOne({ _id: sessionId }, { $set: { lastSeenAt: new Date(now) } });
    }
    return { sessionId, user };
}

export async function destroySession(token: string | undefined | null): Promise<boolean> {
    if (!token || !TOKEN_PATTERN.test(token)) return false;
    const res = await (await sessionsCollection()).deleteOne({ _id: hmac("session", token) });
    return res.deletedCount > 0;
}

/** For password changes, role changes and "disable user" (later tasks). */
export async function destroyAllUserSessions(userId: ObjectId): Promise<void> {
    await (await sessionsCollection()).deleteMany({ userId });
}

/* ----------------------------------------------------------------- cookie */

export function readSessionToken(request: NextRequest): string | undefined {
    return request.cookies.get(SESSION_COOKIE_NAME)?.value;
}

const cookieBase = {
    httpOnly: true, // not readable by JavaScript, so XSS cannot steal it
    secure: isProd, // HTTPS only in production
    sameSite: "lax" as const, // not sent on cross-site POSTs (CSRF); origin is also checked
    path: "/",
};

export function setSessionCookie(response: NextResponse, session: CreatedSession): void {
    response.cookies.set({ name: SESSION_COOKIE_NAME, value: session.token, ...cookieBase, expires: session.expiresAt });
}

export function clearSessionCookie(response: NextResponse): void {
    response.cookies.set({ name: SESSION_COOKIE_NAME, value: "", ...cookieBase, maxAge: 0 });
}
