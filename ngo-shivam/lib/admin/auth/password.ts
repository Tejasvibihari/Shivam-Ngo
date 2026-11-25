import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";

/**
 * Password (and PIN) hashing with scrypt from node:crypto: memory-hard, no
 * native dependency. Stored format (one string, self-describing):
 *
 *   scrypt$<N>$<r>$<p>$<salt base64url>$<hash base64url>
 *
 * Parameters are stored with every hash, so they can be raised later and old
 * hashes keep verifying (see `needsRehash`). Plaintext is never stored or logged.
 */

const PARAMS = { N: 2 ** 15, r: 8, p: 3 } as const; // OWASP-listed scrypt setting (~32 MiB)
const KEY_LEN = 64;
const SALT_LEN = 16;
const MAX_MEM = 128 * 1024 * 1024;

type Parsed = { N: number; r: number; p: number; salt: Buffer; hash: Buffer };

function derive(secret: string, salt: Buffer, N: number, r: number, p: number, len: number) {
    return new Promise<Buffer>((resolve, reject) => {
        // NFKC so visually identical Unicode passwords hash the same on every device.
        scryptCb(secret.normalize("NFKC"), salt, len, { N, r, p, maxmem: MAX_MEM }, (err, key) =>
            err ? reject(err) : resolve(key),
        );
    });
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(SALT_LEN);
    const key = await derive(password, salt, PARAMS.N, PARAMS.r, PARAMS.p, KEY_LEN);
    return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

function parse(stored: string): Parsed | null {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return null;
    const N = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    // Bound the parameters so a tampered record cannot make the server burn CPU / memory.
    const powerOfTwo = Number.isInteger(N) && N >= 2 ** 14 && N <= 2 ** 18 && (N & (N - 1)) === 0;
    if (!powerOfTwo || !Number.isInteger(r) || r < 1 || r > 16 || !Number.isInteger(p) || p < 1 || p > 8) {
        return null;
    }
    const salt = Buffer.from(parts[4], "base64url");
    const hash = Buffer.from(parts[5], "base64url");
    if (salt.length < 8 || hash.length < 32) return null;
    return { N, r, p, salt, hash };
}

/** Constant-time check. Returns false (never throws) for malformed stored values. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const parsed = parse(stored);
    if (!parsed) return false;
    try {
        const key = await derive(password, parsed.salt, parsed.N, parsed.r, parsed.p, parsed.hash.length);
        return key.length === parsed.hash.length && timingSafeEqual(key, parsed.hash);
    } catch {
        return false;
    }
}

/** True when a stored hash uses weaker parameters than the current ones. */
export function needsRehash(stored: string): boolean {
    const parsed = parse(stored);
    if (!parsed) return true;
    return parsed.N < PARAMS.N || parsed.r < PARAMS.r || parsed.p < PARAMS.p || parsed.hash.length < KEY_LEN;
}

let dummyHash: Promise<string> | null = null;

/**
 * Spend the same time as a real check when the e-mail is unknown, so response
 * time does not reveal which e-mail addresses have accounts.
 */
export async function verifyAgainstDummy(password: string): Promise<void> {
    dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
    await verifyPassword(password, await dummyHash);
}
