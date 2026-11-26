import "server-only";
import { MongoClient, type Collection, type Db } from "mongodb";
import { getMongoConfig } from "@/lib/admin/db/config";
import { DatabaseError, redact, toDatabaseError } from "@/lib/admin/db/errors";
import {
    COLLECTIONS,
    type AuditLogDoc,
    type FormSubmissionDoc,
    type RateLimitDoc,
    type SessionDoc,
    type SettingDoc,
    type UserDoc,
} from "@/lib/admin/db/models";
import { ensureSchema } from "@/lib/admin/db/schema";

/**
 * Reusable MongoDB connection.
 *
 * - Lazy: nothing connects (or reads env vars) until `getDb()` is first called.
 * - Shared: one MongoClient (and its connection pool) per server process. The
 *   instance is kept on `globalThis` so Next.js hot reloading in development and
 *   separate route bundles in production never open a second pool.
 * - Self-preparing: validators and indexes are applied once per process.
 * - Self-healing: if the first attempt fails, the next call tries again.
 */

type State = {
    client: MongoClient | null;
    ready: Promise<Db> | null;
};

const globalState = globalThis as typeof globalThis & { __ngoMongo?: State };
const state: State = (globalState.__ngoMongo ??= { client: null, ready: null });

async function connect(): Promise<Db> {
    const { uri, dbName } = getMongoConfig();

    const client = new MongoClient(uri, {
        appName: "ngo-shivam-admin",
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 60_000,
        connectTimeoutMS: 10_000,
        serverSelectionTimeoutMS: 8_000,
        socketTimeoutMS: 30_000,
        retryWrites: true,
    });
    state.client = client;

    await client.connect();
    const db = client.db(dbName);
    await ensureSchema(db);
    return db;
}

/** The connected database. Throws a `DatabaseError` on any failure. */
export function getDb(): Promise<Db> {
    if (!state.ready) {
        state.ready = connect().catch(async (err: unknown) => {
            const client = state.client;
            state.ready = null;
            state.client = null;
            await client?.close().catch(() => undefined);
            const dbError = toDatabaseError(err);
            console.error(`[db] Could not connect (${dbError.code}):`, redact(dbError.message));
            throw dbError;
        });
    }
    return state.ready;
}

/** Close the pool (scripts and tests; a web server never needs this). */
export async function closeDb(): Promise<void> {
    const client = state.client;
    state.ready = null;
    state.client = null;
    await client?.close();
}

/**
 * Run database work and always surface failures as `DatabaseError`:
 *
 *   const user = await withDb((db) => db.collection(...).findOne(...));
 */
export async function withDb<T>(work: (db: Db) => Promise<T>): Promise<T> {
    const db = await getDb();
    try {
        return await work(db);
    } catch (err) {
        if (err instanceof DatabaseError) throw err;
        const dbError = toDatabaseError(err);
        if (dbError.code !== "duplicate") {
            console.error(`[db] Operation failed (${dbError.code}):`, redact(dbError.message));
        }
        throw dbError;
    }
}

/* ------------------------------------------------- typed collection access */

export async function usersCollection(): Promise<Collection<UserDoc>> {
    return (await getDb()).collection<UserDoc>(COLLECTIONS.users);
}

export async function settingsCollection(): Promise<Collection<SettingDoc>> {
    return (await getDb()).collection<SettingDoc>(COLLECTIONS.settings);
}

export async function rateLimitsCollection(): Promise<Collection<RateLimitDoc>> {
    return (await getDb()).collection<RateLimitDoc>(COLLECTIONS.rateLimits);
}

export async function sessionsCollection(): Promise<Collection<SessionDoc>> {
    return (await getDb()).collection<SessionDoc>(COLLECTIONS.sessions);
}

export async function auditLogsCollection(): Promise<Collection<AuditLogDoc>> {
    return (await getDb()).collection<AuditLogDoc>(COLLECTIONS.auditLogs);
}

export async function formSubmissionsCollection(): Promise<Collection<FormSubmissionDoc>> {
    return (await getDb()).collection<FormSubmissionDoc>(COLLECTIONS.formSubmissions);
}
