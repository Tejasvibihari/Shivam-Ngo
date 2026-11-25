#!/usr/bin/env node
/**
 * DEVELOPMENT / TESTING ONLY. Inserts one user so the login API can be tested
 * before the one-time Super Admin setup (a later task) exists.
 *
 *   SEED_PASSWORD='a-long-test-password' node --env-file-if-exists=.env.local \
 *     scripts/dev-seed-user.mjs --email admin@example.com --name "Test Admin" --role super_admin
 *
 * Refuses to run when NODE_ENV=production. The password is read from the
 * SEED_PASSWORD environment variable (not argv, so it stays out of shell history
 * and process lists). The hash format matches lib/admin/auth/password.ts.
 */
import { randomBytes, scrypt } from "node:crypto";
import { parseArgs } from "node:util";
import { MongoClient } from "mongodb";

if (process.env.NODE_ENV === "production") {
    console.error("Refusing to seed users when NODE_ENV=production.");
    process.exit(1);
}

const { values } = parseArgs({
    options: {
        email: { type: "string" },
        name: { type: "string", default: "Test User" },
        role: { type: "string", default: "editor" },
        status: { type: "string", default: "active" },
    },
});

const password = process.env.SEED_PASSWORD ?? "";
if (!values.email || password.length < 12) {
    console.error("Usage: SEED_PASSWORD=<12+ chars> node scripts/dev-seed-user.mjs --email <email> [--name <n>] [--role super_admin|admin|editor] [--status active|disabled]");
    process.exit(1);
}
if (!["super_admin", "admin", "editor"].includes(values.role)) {
    console.error("Invalid --role");
    process.exit(1);
}
if (!["active", "disabled"].includes(values.status)) {
    console.error("Invalid --status");
    process.exit(1);
}

const N = 2 ** 15, r = 8, p = 3;
const salt = randomBytes(16);
const key = await new Promise((res, rej) =>
    scrypt(password.normalize("NFKC"), salt, 64, { N, r, p, maxmem: 128 * 1024 * 1024 }, (e, k) => (e ? rej(e) : res(k))),
);
const passwordHash = ["scrypt", N, r, p, salt.toString("base64url"), key.toString("base64url")].join("$");

const client = new MongoClient(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017");
try {
    await client.connect();
    const now = new Date();
    await client.db(process.env.MONGODB_DB ?? "ngo_shivam").collection("users").insertOne({
        name: values.name,
        email: values.email.trim().toLowerCase(),
        passwordHash,
        role: values.role,
        status: values.status,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
    });
    console.log(`Created ${values.role} ${values.email.toLowerCase()}`);
} catch (err) {
    console.error(err?.code === 11000 ? "A user with that email already exists." : `Failed: ${err?.message ?? err}`);
    process.exitCode = 1;
} finally {
    await client.close();
}
