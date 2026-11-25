import "server-only";
import type { CreateIndexesOptions, Db, Document, IndexSpecification } from "mongodb";
import { AUDIT_ACTIONS, COLLECTIONS, ROLES, SETTING_IDS, USER_STATUSES } from "@/lib/admin/db/models";

/**
 * MongoDB-side validation and indexes. `ensureSchema(db)` is idempotent and is
 * run once per server process by `getDb()` (see client.ts), so there is no
 * manual migration step. It is safe to run on an empty or an existing database.
 *
 * The $jsonSchema validators are a second line of defence: they reject a
 * malformed document even if application validation is bypassed or buggy.
 * They allow extra fields so later tasks can add fields without a migration.
 */

type IndexDef = { key: IndexSpecification; options: CreateIndexesOptions };

const date = { bsonType: "date" };
const nullableDate = { bsonType: ["date", "null"] };

const VALIDATORS: Record<string, Document> = {
    [COLLECTIONS.users]: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "passwordHash", "role", "status", "createdAt", "updatedAt"],
            properties: {
                name: { bsonType: "string", minLength: 2, maxLength: 100 },
                email: { bsonType: "string", maxLength: 254, pattern: "^[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+$" },
                passwordHash: { bsonType: "string", minLength: 20, maxLength: 512 },
                role: { enum: [...ROLES] },
                status: { enum: [...USER_STATUSES] },
                lastLoginAt: nullableDate,
                createdAt: date,
                updatedAt: date,
            },
        },
    },
    [COLLECTIONS.settings]: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id"],
            properties: {
                _id: { enum: Object.values(SETTING_IDS) },
                hash: { bsonType: "string", minLength: 20, maxLength: 512 },
                updatedAt: date,
                updatedBy: { bsonType: ["objectId", "null"] },
                completedAt: date,
                superAdminId: { bsonType: "objectId" },
            },
        },
    },
    [COLLECTIONS.rateLimits]: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "count", "windowStart", "expiresAt"],
            properties: {
                _id: { bsonType: "string", maxLength: 200 },
                count: { bsonType: ["int", "long", "double"], minimum: 0 },
                windowStart: date,
                expiresAt: date,
            },
        },
    },
    [COLLECTIONS.sessions]: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "userId", "createdAt", "lastSeenAt", "expiresAt"],
            properties: {
                _id: { bsonType: "string", minLength: 32, maxLength: 128 },
                userId: { bsonType: "objectId" },
                createdAt: date,
                lastSeenAt: date,
                expiresAt: date,
                ip: { bsonType: ["string", "null"], maxLength: 64 },
                userAgent: { bsonType: ["string", "null"], maxLength: 256 },
            },
        },
    },
    [COLLECTIONS.auditLogs]: {
        $jsonSchema: {
            bsonType: "object",
            required: ["action", "createdAt"],
            properties: {
                action: { enum: [...AUDIT_ACTIONS] },
                actorId: { bsonType: ["objectId", "null"] },
                targetId: { bsonType: ["objectId", "null"] },
                ip: { bsonType: ["string", "null"], maxLength: 64 },
                meta: { bsonType: "object" },
                createdAt: date,
            },
        },
    },
};

const INDEXES: Record<string, IndexDef[]> = {
    [COLLECTIONS.users]: [
        // One account per e-mail (addresses are stored lower-case).
        { key: { email: 1 }, options: { name: "email_unique", unique: true } },
        { key: { role: 1, status: 1 }, options: { name: "role_status" } },
        { key: { createdAt: -1 }, options: { name: "createdAt_desc" } },
    ],
    [COLLECTIONS.settings]: [],
    [COLLECTIONS.rateLimits]: [
        // MongoDB removes the document once `expiresAt` has passed.
        { key: { expiresAt: 1 }, options: { name: "expiresAt_ttl", expireAfterSeconds: 0 } },
    ],
    [COLLECTIONS.sessions]: [
        { key: { expiresAt: 1 }, options: { name: "expiresAt_ttl", expireAfterSeconds: 0 } },
        { key: { userId: 1 }, options: { name: "userId" } },
    ],
    [COLLECTIONS.auditLogs]: [
        { key: { createdAt: -1 }, options: { name: "createdAt_desc" } },
        { key: { actorId: 1, createdAt: -1 }, options: { name: "actor_createdAt" } },
        { key: { action: 1, createdAt: -1 }, options: { name: "action_createdAt" } },
    ],
};

export async function ensureSchema(db: Db): Promise<void> {
    const existing = new Set(
        (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name),
    );

    for (const name of Object.values(COLLECTIONS)) {
        const validator = VALIDATORS[name];
        if (!existing.has(name)) {
            try {
                await db.createCollection(name, {
                    validator,
                    validationLevel: "strict",
                    validationAction: "error",
                });
            } catch (err) {
                // Another server instance created it at the same moment (code 48 NamespaceExists).
                if ((err as { code?: number }).code !== 48) throw err;
            }
        } else {
            // Keep validators up to date on collections that already exist.
            await db.command({
                collMod: name,
                validator,
                validationLevel: "strict",
                validationAction: "error",
            });
        }

        for (const { key, options } of INDEXES[name] ?? []) {
            await db.collection(name).createIndex(key, options);
        }
    }
}
