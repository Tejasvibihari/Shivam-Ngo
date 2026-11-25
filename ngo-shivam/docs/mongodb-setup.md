# MongoDB setup (admin panel)

The admin panel stores users, settings, login rate-limit counters and audit logs
in MongoDB using the official `mongodb` driver. The public website does not need
a database and keeps working without these variables.

## 1. Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | Connection string, `mongodb://...` or `mongodb+srv://...`. Contains the DB user's password: keep it secret. |
| `MONGODB_DB` | yes | Database name (letters, digits, `_`, `-`; max 38 chars), e.g. `ngo_shivam`. |

Put them in `.env.local` for development and in your hosting panel's
Environment Variables for production. Never commit them. `.env.example` lists
the names with placeholder values. (`AUTH_SECRET`, `SETUP_TOKEN` and
`SIGNUP_PIN_INITIAL` in that file are used by later tasks.)

## 2. Create the database and a least-privilege user

MongoDB Atlas (recommended) or any MongoDB 6+ server:

1. Create a cluster (Atlas free tier is enough).
2. Create a database user whose role is **readWrite on the `MONGODB_DB` database only**
   (not an admin / atlasAdmin user). `readWrite` includes the permissions the app
   needs to create collections, indexes and validators on first start.
3. Network access: allow your server's outbound IP address (avoid `0.0.0.0/0` in production).
4. Copy the connection string and put the password in `MONGODB_URI`.
   URL-encode special characters in the password (`@` -> `%40`, `:` -> `%3A`, `/` -> `%2F`).

Local development without Atlas:

```bash
docker run -d --name ngo-mongo -p 27017:27017 mongo:7
# .env.local
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=ngo_shivam
```

## 3. First start (no migration step)

The first time admin code calls `getDb()`, the app connects and runs
`ensureSchema()` once per server process. It is idempotent and creates:

| Collection | Purpose | Indexes |
|---|---|---|
| `users` | admin accounts | unique `email`, `role+status`, `createdAt` |
| `settings` | signup-PIN hash, one-time-setup marker | `_id` only |
| `rate_limits` | login / PIN attempt counters | TTL on `expiresAt` (auto-delete) |
| `audit_logs` | security events | `createdAt`, `actorId+createdAt`, `action+createdAt` |

Every collection also gets a `$jsonSchema` validator (`validationLevel: strict`,
`validationAction: error`), so malformed documents are rejected by MongoDB even
if application validation is bypassed.

## 4. Using it in code

```ts
import { withDb, usersCollection } from "@/lib/admin/db/client";
import { DatabaseError, isDuplicateKeyError } from "@/lib/admin/db/errors";

try {
    await withDb(async () => (await usersCollection()).insertOne(doc));
} catch (err) {
    if (isDuplicateKeyError(err, "email")) { /* "email already used" */ }
    else if (err instanceof DatabaseError) { /* err.code, err.publicMessage */ }
}
```

`DatabaseError.code` is one of `config`, `connection`, `duplicate`, `validation`,
`unknown`. Show `publicMessage` to users; the raw driver error stays in server logs
with connection strings redacted.

## 5. Troubleshooting

| Symptom (server log) | Likely cause |
|---|---|
| `Invalid MongoDB configuration` | `MONGODB_URI` / `MONGODB_DB` missing or malformed |
| `Could not connect (connection)` | wrong password, IP not allow-listed, cluster paused, DNS (`+srv`) blocked |
| `Could not connect (unknown)` mentioning `collMod` / `createIndexes` | DB user lacks `readWrite` on that database |
| `Index ... already exists with different options` | someone created an index with the same name manually; drop it and restart |
