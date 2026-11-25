import "server-only";
import { z } from "zod";
import { DatabaseError } from "@/lib/admin/db/errors";

/**
 * MongoDB settings, read from environment variables only (see `.env.example`).
 * Nothing here is hardcoded and nothing is read at import time, so a missing
 * variable cannot break the build of the public website: it only fails when
 * the admin code first asks for the database.
 */

const configSchema = z.object({
    MONGODB_URI: z
        .string()
        .trim()
        .min(1, "MONGODB_URI is not set.")
        .regex(
            /^mongodb(\+srv)?:\/\/\S+$/,
            "MONGODB_URI must start with mongodb:// or mongodb+srv://",
        ),
    MONGODB_DB: z
        .string()
        .trim()
        .min(1, "MONGODB_DB is not set.")
        .regex(
            /^[A-Za-z0-9_-]{1,38}$/,
            "MONGODB_DB may only contain letters, digits, '_' and '-' (max 38 characters).",
        ),
});

export type MongoConfig = { uri: string; dbName: string };

export function parseMongoConfig(env: Record<string, string | undefined>): MongoConfig {
    const parsed = configSchema.safeParse({
        MONGODB_URI: env.MONGODB_URI ?? "",
        MONGODB_DB: env.MONGODB_DB ?? "",
    });
    if (!parsed.success) {
        // Only the variable names / rules are reported, never the values.
        const problems = parsed.error.issues.map((i) => i.message).join(" ");
        throw new DatabaseError("config", `Invalid MongoDB configuration. ${problems}`);
    }
    return { uri: parsed.data.MONGODB_URI, dbName: parsed.data.MONGODB_DB };
}

export function getMongoConfig(): MongoConfig {
    return parseMongoConfig(process.env);
}
