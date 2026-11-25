/**
 * One error type for everything that can go wrong while talking to MongoDB.
 * Callers (API routes, server actions) switch on `code` and show `publicMessage`;
 * the raw driver error is kept in `cause` for server logs only and is never
 * sent to the browser (driver messages can contain host names).
 */

export type DatabaseErrorCode =
    | "config" // missing / invalid environment variables
    | "connection" // server unreachable, auth failed, timeout
    | "duplicate" // unique index violated (e.g. e-mail already used)
    | "validation" // document rejected by the collection schema validator
    | "unknown";

const PUBLIC_MESSAGES: Record<DatabaseErrorCode, string> = {
    config: "The database is not configured.",
    connection: "The database is temporarily unavailable. Please try again later.",
    duplicate: "That record already exists.",
    validation: "The data was rejected by the database.",
    unknown: "Something went wrong while accessing the database.",
};

export class DatabaseError extends Error {
    readonly code: DatabaseErrorCode;
    /** Safe to show to users. */
    readonly publicMessage: string;
    /** For `duplicate`: the index fields that collided, e.g. ["email"]. */
    readonly fields: string[];

    constructor(
        code: DatabaseErrorCode,
        message: string,
        options?: { cause?: unknown; fields?: string[] },
    ) {
        super(redact(message), options?.cause === undefined ? undefined : { cause: options.cause });
        this.name = "DatabaseError";
        this.code = code;
        this.publicMessage = PUBLIC_MESSAGES[code];
        this.fields = options?.fields ?? [];
    }
}

/** Remove connection strings (they may contain a password) from any text. */
export function redact(text: string): string {
    return text.replace(/mongodb(\+srv)?:\/\/[^\s'"]+/gi, "mongodb://<redacted>");
}

type DriverLikeError = {
    name?: string;
    code?: number | string;
    message?: string;
    keyPattern?: Record<string, unknown>;
};

const CONNECTION_ERROR_NAMES = new Set([
    "MongoServerSelectionError",
    "MongoNetworkError",
    "MongoNetworkTimeoutError",
    "MongoTopologyClosedError",
    "MongoNotConnectedError",
    "MongoPoolClearedError",
    "MongoPoolClosedError",
    "MongoParseError", // malformed connection string
    "MongoAPIError",
]);

/** Server error codes: 13 Unauthorized, 18 AuthenticationFailed, 8000 AtlasError. */
const AUTH_CODES = new Set([13, 18, 8000]);

/** Translate anything thrown by the driver into a DatabaseError. */
export function toDatabaseError(err: unknown): DatabaseError {
    if (err instanceof DatabaseError) return err;

    const e = (err ?? {}) as DriverLikeError;
    const message = typeof e.message === "string" ? e.message : "Unknown database error";

    if (e.code === 11000 || e.code === 11001) {
        return new DatabaseError("duplicate", message, {
            cause: err,
            fields: Object.keys(e.keyPattern ?? {}),
        });
    }
    if (e.code === 121) {
        return new DatabaseError("validation", message, { cause: err });
    }
    if (
        (typeof e.name === "string" && CONNECTION_ERROR_NAMES.has(e.name)) ||
        (typeof e.code === "number" && AUTH_CODES.has(e.code))
    ) {
        return new DatabaseError("connection", message, { cause: err });
    }
    return new DatabaseError("unknown", message, { cause: err });
}

export function isDuplicateKeyError(err: unknown, field?: string): boolean {
    const e = toDatabaseError(err);
    return e.code === "duplicate" && (field === undefined || e.fields.includes(field));
}
