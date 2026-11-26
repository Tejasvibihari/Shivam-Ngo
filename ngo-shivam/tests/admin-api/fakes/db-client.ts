import { ObjectId } from "mongodb";

/**
 * In-memory stand-in for lib/admin/db/client.ts. It supports exactly the query / update operators the admin
 * code uses ($or, $lte, $gt, $ne, regex, $set, $inc, $setOnInsert, upsert, unique indexes) and raises the same
 * duplicate-key error shape (code 11000 + keyPattern) as the MongoDB driver. Every operation runs synchronously
 * inside its async wrapper, so it is atomic, like a single MongoDB operation.
 *
 * It does NOT emulate the $jsonSchema validators or TTL indexes; those are MongoDB features (see docs).
 */

type Doc = Record<string, unknown>;

const keyOf = (value: unknown) => (value instanceof ObjectId ? `oid:${value.toHexString()}` : value);
const same = (a: unknown, b: unknown) =>
    a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : keyOf(a) === keyOf(b);

function matchesValue(actual: unknown, condition: unknown): boolean {
    if (condition instanceof RegExp) return typeof actual === "string" && condition.test(actual);
    if (condition && typeof condition === "object" && !(condition instanceof ObjectId) && !(condition instanceof Date)) {
        return Object.entries(condition as Doc).every(([op, operand]) => {
            const a = actual instanceof Date ? actual.getTime() : actual;
            const b = operand instanceof Date ? operand.getTime() : operand;
            switch (op) {
                case "$lte": return (a as number) <= (b as number);
                case "$lt": return (a as number) < (b as number);
                case "$gt": return (a as number) > (b as number);
                case "$gte": return (a as number) >= (b as number);
                case "$ne": return !same(actual, operand);
                default: throw new Error(`fake db: unsupported operator ${op}`);
            }
        });
    }
    return same(actual, condition);
}

function matches(doc: Doc, filter: Doc): boolean {
    return Object.entries(filter).every(([key, condition]) => {
        if (key === "$or") return (condition as Doc[]).some((f) => matches(doc, f));
        return matchesValue(doc[key], condition);
    });
}

class DuplicateKey extends Error {
    code = 11000;
    keyPattern: Record<string, number>;
    constructor(field: string) {
        super(`E11000 duplicate key error (${field})`);
        this.name = "MongoServerError";
        this.keyPattern = { [field]: 1 };
    }
}

class FakeCollection {
    readonly docs = new Map<string, Doc>();
    constructor(private readonly uniqueFields: string[] = []) {}

    private checkUnique(doc: Doc, ignoreId?: unknown) {
        for (const field of ["_id", ...this.uniqueFields]) {
            for (const other of this.docs.values()) {
                if (ignoreId !== undefined && same(other._id, ignoreId)) continue;
                if (same(other[field], doc[field])) throw new DuplicateKey(field);
            }
        }
    }

    async insertOne(doc: Doc) {
        this.checkUnique(doc);
        this.docs.set(String(keyOf(doc._id)), { ...doc });
        return { acknowledged: true, insertedId: doc._id };
    }

    async findOne(filter: Doc = {}) {
        for (const doc of this.docs.values()) if (matches(doc, filter)) return { ...doc };
        return null;
    }

    find(filter: Doc = {}) {
        let sort: Record<string, 1 | -1> = {};
        let skipN = 0;
        let limitN = Infinity;
        const cursor = {
            sort: (s: Record<string, 1 | -1>) => ((sort = s), cursor),
            skip: (n: number) => ((skipN = n), cursor),
            limit: (n: number) => ((limitN = n), cursor),
            toArray: async () => {
                const rows = [...this.docs.values()].filter((d) => matches(d, filter)).map((d) => ({ ...d }));
                const order = Object.entries(sort);
                rows.sort((x, y) => {
                    for (const [field, dir] of order) {
                        const a = keyOf(x[field] instanceof Date ? (x[field] as Date).getTime() : x[field]) as number;
                        const b = keyOf(y[field] instanceof Date ? (y[field] as Date).getTime() : y[field]) as number;
                        if (a < b) return -dir;
                        if (a > b) return dir;
                    }
                    return 0;
                });
                return rows.slice(skipN, skipN + limitN);
            },
        };
        return cursor;
    }

    async countDocuments(filter: Doc = {}) {
        return [...this.docs.values()].filter((d) => matches(d, filter)).length;
    }

    private apply(doc: Doc, update: Doc) {
        for (const [k, v] of Object.entries((update.$set as Doc) ?? {})) doc[k] = v;
        for (const [k, v] of Object.entries((update.$inc as Doc) ?? {})) doc[k] = ((doc[k] as number) ?? 0) + (v as number);
    }

    async updateOne(filter: Doc, update: Doc, options: { upsert?: boolean } = {}) {
        for (const [id, doc] of this.docs) {
            if (!matches(doc, filter)) continue;
            const next = { ...doc };
            this.apply(next, update);
            this.checkUnique(next, doc._id);
            this.docs.set(id, next);
            return { matchedCount: 1, modifiedCount: 1 };
        }
        if (options.upsert) {
            const doc: Doc = { ...Object.fromEntries(Object.entries(filter).filter(([k]) => !k.startsWith("$"))), ...((update.$setOnInsert as Doc) ?? {}) };
            this.apply(doc, update);
            await this.insertOne(doc);
            return { matchedCount: 0, modifiedCount: 0 };
        }
        return { matchedCount: 0, modifiedCount: 0 };
    }

    async findOneAndUpdate(filter: Doc, update: Doc, options: { upsert?: boolean; returnDocument?: "after" | "before" } = {}) {
        for (const [id, doc] of this.docs) {
            if (!matches(doc, filter)) continue;
            const next = { ...doc };
            this.apply(next, update);
            this.docs.set(id, next);
            return { ...(options.returnDocument === "after" ? next : doc) };
        }
        if (!options.upsert) return null;
        const doc: Doc = { ...Object.fromEntries(Object.entries(filter).filter(([k]) => !k.startsWith("$"))), ...((update.$setOnInsert as Doc) ?? {}) };
        this.apply(doc, update);
        await this.insertOne(doc);
        return { ...doc };
    }

    async deleteOne(filter: Doc) {
        for (const [id, doc] of this.docs) {
            if (matches(doc, filter)) {
                this.docs.delete(id);
                return { deletedCount: 1 };
            }
        }
        return { deletedCount: 0 };
    }

    async deleteMany(filter: Doc = {}) {
        let n = 0;
        for (const [id, doc] of [...this.docs]) {
            if (matches(doc, filter)) {
                this.docs.delete(id);
                n++;
            }
        }
        return { deletedCount: n };
    }
}

/* ------------------------------------------------------------ test hooks */

export const tables = {
    users: new FakeCollection(["email"]),
    settings: new FakeCollection(),
    rate_limits: new FakeCollection(),
    sessions: new FakeCollection(),
    audit_logs: new FakeCollection(),
};

/** Empty every collection (call in beforeEach). */
export function resetDb() {
    for (const t of Object.values(tables)) t.docs.clear();
}

export const rows = (name: keyof typeof tables) => [...tables[name].docs.values()];

/* ------------------------------------------------ same exports as the real client */

export async function getDb() {
    throw new Error("fake db: getDb() is not used by the admin code under test");
}
export async function closeDb() {}
export async function withDb<T>(work: (db: unknown) => Promise<T>): Promise<T> {
    return work({});
}
export const usersCollection = async () => tables.users as never;
export const settingsCollection = async () => tables.settings as never;
export const rateLimitsCollection = async () => tables.rate_limits as never;
export const sessionsCollection = async () => tables.sessions as never;
export const auditLogsCollection = async () => tables.audit_logs as never;
