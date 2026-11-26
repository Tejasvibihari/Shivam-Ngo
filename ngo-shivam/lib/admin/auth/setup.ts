import "server-only";
import { timingSafeEqual } from "node:crypto";
import { ObjectId, type Collection } from "mongodb";
import { getSetupToken } from "@/lib/admin/auth/config";
import { hmac } from "@/lib/admin/auth/crypto";
import { hashPassword } from "@/lib/admin/auth/password";
import { settingsCollection, usersCollection } from "@/lib/admin/db/client";
import { isDuplicateKeyError } from "@/lib/admin/db/errors";
import { SETTING_IDS, type SetupSettingDoc, type UserDoc } from "@/lib/admin/db/models";

/**
 * One-time creation of the FIRST Super Admin.
 *
 * Setup is open only while ALL of these hold:
 *  - SETUP_TOKEN is configured (>= 32 characters, not the placeholder);
 *  - the `setup` marker document does not exist in `settings`;
 *  - no Super Admin exists (so an installation seeded another way can never be taken over).
 *
 * The caller must present SETUP_TOKEN. It is compared in constant time (both values are
 * HMAC-ed first, so the comparison length never depends on the secret).
 * The marker has a fixed `_id`, so two concurrent setups cannot both succeed: the second
 * insert hits a duplicate-key error. Once the marker exists, setup stays closed forever,
 * even if the Super Admin is later deleted by hand.
 */

const setupCollection = async () => (await settingsCollection()) as unknown as Collection<SetupSettingDoc>;

export function verifySetupToken(candidate: string): boolean {
    const expected = getSetupToken();
    if (expected === null) return false;
    const a = Buffer.from(hmac("setup-token", candidate), "hex");
    const b = Buffer.from(hmac("setup-token", expected), "hex");
    return a.length === b.length && timingSafeEqual(a, b);
}

/** Whether the setup form / endpoint may be used right now. */
export async function isSetupOpen(): Promise<boolean> {
    if (getSetupToken() === null) return false;
    if ((await (await setupCollection()).findOne({ _id: SETTING_IDS.setup })) !== null) return false;
    const existing = await (await usersCollection()).findOne({ role: "super_admin" }, { projection: { _id: 1 } });
    return existing === null;
}

export type SetupResult = { ok: true; user: UserDoc } | { ok: false; reason: "closed" | "email_taken" };

/** Create the Super Admin. Re-checks that setup is still open and claims the marker atomically. */
export async function createFirstSuperAdmin(input: { name: string; email: string; password: string }): Promise<SetupResult> {
    if (!(await isSetupOpen())) return { ok: false, reason: "closed" };

    const now = new Date();
    const user: UserDoc = {
        _id: new ObjectId(),
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: "super_admin",
        status: "active",
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
    };

    const marker = await setupCollection();
    try {
        // Claim the one-time slot first: only one request can ever insert this fixed _id.
        await marker.insertOne({ _id: SETTING_IDS.setup, completedAt: now, superAdminId: user._id });
    } catch (err) {
        if (isDuplicateKeyError(err)) return { ok: false, reason: "closed" };
        throw err;
    }

    try {
        await (await usersCollection()).insertOne(user);
    } catch (err) {
        // Give the slot back so the operator can retry (for example with another e-mail).
        await marker.deleteOne({ _id: SETTING_IDS.setup, superAdminId: user._id }).catch(() => undefined);
        if (isDuplicateKeyError(err, "email")) return { ok: false, reason: "email_taken" };
        throw err;
    }
    return { ok: true, user };
}
