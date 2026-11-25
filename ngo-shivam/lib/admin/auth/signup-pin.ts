import "server-only";
import type { Collection, ObjectId } from "mongodb";
import { getInitialSignupPin, signupKillSwitchOn } from "@/lib/admin/auth/config";
import { hmac } from "@/lib/admin/auth/crypto";
import { hashPassword, verifyPassword } from "@/lib/admin/auth/password";
import { settingsCollection, usersCollection } from "@/lib/admin/db/client";
import { isDuplicateKeyError } from "@/lib/admin/db/errors";
import { SETTING_IDS, type SignupPinSettingDoc } from "@/lib/admin/db/models";

/**
 * The signup PIN: one shared secret that lets someone create an (editor) account.
 *
 * - Stored ONLY as a hash in `settings` (`_id: "signupPin"`). The PIN itself is
 *   never stored, logged, audited or returned by any API.
 * - A PIN has little entropy (6 digits = 10^6 values), so a plain hash could be
 *   brute-forced offline in hours if the database leaked. The PIN is therefore
 *   first run through HMAC-SHA256 keyed with AUTH_SECRET (a "pepper" that is not
 *   in the database) and the result is hashed with scrypt, like passwords.
 *   Consequence: rotating AUTH_SECRET invalidates the stored PIN hash. Recovery
 *   is described in docs/signup-pin.md.
 * - Signup is OPEN only when all of these hold: the SIGNUP_ENABLED kill switch is
 *   not "false", a PIN is configured, and an active Super Admin exists.
 */

const pinCollection = async () => (await settingsCollection()) as unknown as Collection<SignupPinSettingDoc>;

/** scrypt(HMAC(AUTH_SECRET, pin)). Same `scrypt$N$r$p$salt$hash` format as passwords. */
export function hashPin(pin: string): Promise<string> {
    return hashPassword(hmac("signup-pin", pin));
}

/** Constant-time check. False (never throws) for a malformed stored hash. */
export function verifyPin(pin: string, storedHash: string): Promise<boolean> {
    return verifyPassword(hmac("signup-pin", pin), storedHash);
}

/**
 * The stored PIN hash, or null when no PIN is configured. If nothing is stored
 * yet and SIGNUP_PIN_INITIAL is set, that value is hashed and stored first (once);
 * after that the environment variable is ignored, so changing the PIN through the
 * API is never undone by a restart.
 */
export async function getSignupPinHash(): Promise<string | null> {
    const col = await pinCollection();
    const existing = await col.findOne({ _id: SETTING_IDS.signupPin });
    if (existing) return existing.hash;

    const initial = getInitialSignupPin();
    if (!initial) return null;

    const hash = await hashPin(initial);
    try {
        await col.updateOne(
            { _id: SETTING_IDS.signupPin },
            { $setOnInsert: { hash, updatedAt: new Date(), updatedBy: null } },
            { upsert: true },
        );
    } catch (err) {
        // Another instance seeded it at the same moment; use theirs.
        if (!isDuplicateKeyError(err)) throw err;
    }
    return (await col.findOne({ _id: SETTING_IDS.signupPin }))?.hash ?? null;
}

async function activeSuperAdminExists(): Promise<boolean> {
    const found = await (await usersCollection()).findOne(
        { role: "super_admin", status: "active" },
        { projection: { _id: 1 } },
    );
    return found !== null;
}

/** Whether the signup form / endpoint may be used right now. */
export async function isSignupOpen(): Promise<boolean> {
    if (signupKillSwitchOn()) return false;
    if ((await getSignupPinHash()) === null) return false;
    return activeSuperAdminExists();
}

/**
 * Store a new PIN hash. Compare-and-swap: when `previousHash` is given the update
 * only applies if the stored hash is still that value, so two Super Admins
 * changing the PIN at once cannot silently overwrite each other. Returns false on such a conflict.
 */
export async function saveSignupPin(newPin: string, updatedBy: ObjectId, previousHash: string | null): Promise<boolean> {
    const col = await pinCollection();
    const hash = await hashPin(newPin);
    const now = new Date();

    if (previousHash === null) {
        try {
            await col.insertOne({ _id: SETTING_IDS.signupPin, hash, updatedAt: now, updatedBy });
            return true;
        } catch (err) {
            if (isDuplicateKeyError(err)) return false;
            throw err;
        }
    }
    const result = await col.updateOne(
        { _id: SETTING_IDS.signupPin, hash: previousHash },
        { $set: { hash, updatedAt: now, updatedBy } },
    );
    return result.matchedCount === 1;
}
