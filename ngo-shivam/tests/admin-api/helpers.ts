import "./env";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { hashPassword } from "@/lib/admin/auth/password";
import { hashPin } from "@/lib/admin/auth/signup-pin";
import type { Role, UserStatus } from "@/lib/admin/db/models";
import { resetDb, tables } from "./fakes/db-client";

export { resetDb, rows, tables } from "./fakes/db-client";

export const PASSWORD = "correct-horse-battery-9";
export const COOKIE_NAME = "ngo_session"; // non-production name, see SESSION_COOKIE_NAME

type Handler = (request: NextRequest, ctx?: unknown) => Promise<Response>;

export type Reply = { status: number; body: any; headers: Headers; cookie: string | null };

export type CallOptions = {
    method?: string;
    path?: string;
    body?: unknown;
    /** Raw body (for malformed JSON / oversize tests). */
    rawBody?: string;
    token?: string | null;
    cookie?: string;
    origin?: string | null;
    contentType?: string | null;
    ip?: string;
    headers?: Record<string, string>;
};

/** Invoke a real route handler exactly as Next.js would: Request in, Response out. */
export async function call(handler: Handler | undefined, options: CallOptions = {}): Promise<Reply> {
    if (!handler) throw new Error("handler is not exported by the route");
    const { method = "GET", path = "/api/admin/x", body, rawBody, token, origin = null, ip = "198.51.100.7" } = options;
    const headers: Record<string, string> = { host: "localhost:3000", "x-forwarded-for": ip, ...(options.headers ?? {}) };
    if (origin) headers.origin = origin;
    if (options.cookie) headers.cookie = options.cookie;
    else if (token) headers.cookie = `${COOKIE_NAME}=${token}`;
    let payload: string | undefined;
    if (rawBody !== undefined) payload = rawBody;
    else if (body !== undefined) payload = JSON.stringify(body);
    if (payload !== undefined && options.contentType !== null) headers["content-type"] = options.contentType ?? "application/json";
    const request = new NextRequest(`http://localhost:3000${path}`, { method, headers, body: payload });
    const res = await handler(request, {});
    const text = await res.text();
    let parsed: unknown = null;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch {
        parsed = text;
    }
    return { status: res.status, body: parsed, headers: res.headers, cookie: res.headers.get("set-cookie") };
}

/** Token value out of a Set-Cookie header. */
export function tokenFrom(reply: Reply): string {
    const match = new RegExp(`${COOKIE_NAME}=([^;]+)`).exec(reply.cookie ?? "");
    if (!match || !match[1]) throw new Error("no session cookie in the reply");
    return match[1];
}

let cachedHash: Promise<string> | null = null;
const passwordHash = () => (cachedHash ??= hashPassword(PASSWORD));

export type SeededUser = { id: ObjectId; email: string };

/** Insert a user straight into the fake database (the password is PASSWORD). */
export async function seedUser(role: Role, options: { email?: string; status?: UserStatus; name?: string } = {}): Promise<SeededUser> {
    const id = new ObjectId();
    const email = options.email ?? `${role}-${id.toHexString().slice(0, 6)}@example.org`;
    const now = new Date();
    await tables.users.insertOne({
        _id: id,
        name: options.name ?? `Test ${role}`,
        email,
        passwordHash: await passwordHash(),
        role,
        status: options.status ?? "active",
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
    });
    return { id, email };
}

/** Store a signup PIN the same way the app does (HMAC + scrypt). */
export async function seedPin(pin: string) {
    await tables.settings.insertOne({ _id: "signupPin", hash: await hashPin(pin), updatedAt: new Date(), updatedBy: null });
}

export function freshDb() {
    resetDb();
}
