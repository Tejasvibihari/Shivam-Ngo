import "server-only";
import { rateLimitsCollection } from "@/lib/admin/db/client";
import { isDuplicateKeyError } from "@/lib/admin/db/errors";
import { hmac } from "@/lib/admin/auth/crypto";

/**
 * Fixed-window counters stored in MongoDB (collection `rate_limits`, TTL index
 * on `expiresAt`). Because they live in the database they are shared by every
 * server instance and survive restarts, unlike an in-memory Map.
 */

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

/** Count one attempt against `key`. Atomic: concurrent requests cannot slip past the limit. */
export async function consume(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
    const col = await rateLimitsCollection();
    const now = new Date();

    // The TTL sweeper runs about once a minute, so drop an already-expired window ourselves.
    await col.deleteOne({ _id: key, expiresAt: { $lte: now } });

    for (let attempt = 0; ; attempt++) {
        try {
            const doc = await col.findOneAndUpdate(
                { _id: key },
                {
                    $inc: { count: 1 },
                    $setOnInsert: { windowStart: now, expiresAt: new Date(now.getTime() + windowMs) },
                },
                { upsert: true, returnDocument: "after" },
            );
            if (!doc) return { allowed: true, retryAfterSeconds: 0 };
            const retryAfterSeconds = Math.max(1, Math.ceil((doc.expiresAt.getTime() - now.getTime()) / 1000));
            return { allowed: doc.count <= max, retryAfterSeconds };
        } catch (err) {
            // Two first requests raced to create the counter; the loser simply retries once.
            if (attempt === 0 && isDuplicateKeyError(err)) continue;
            throw err;
        }
    }
}

export async function resetLimit(key: string): Promise<void> {
    await (await rateLimitsCollection()).deleteOne({ _id: key });
}

/** Keys. The e-mail is HMAC-ed so the collection never holds addresses. */
export const loginIpKey = (ip: string) => `login:ip:${ip}`;
export const signupIpKey = (ip: string) => `signup:ip:${ip}`;
export const SIGNUP_GLOBAL_KEY = "signup:global";
export const pinChangeUserKey = (userId: string) => `pin-change:user:${userId}`;
export const passwordChangeUserKey = (userId: string) => `password-change:user:${userId}`;
export const loginEmailKey = (email: string) => `login:email:${hmac("rate-limit-email", email)}`;
