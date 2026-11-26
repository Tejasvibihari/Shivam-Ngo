// Must be the FIRST import of every test file: the auth code reads these variables lazily, but only once.
import { randomBytes } from "node:crypto";

process.env.NODE_ENV = "test";
process.env.AUTH_SECRET = randomBytes(36).toString("base64url");
process.env.SETUP_TOKEN = randomBytes(32).toString("hex");
process.env.TRUST_PROXY = "true"; // so the per-IP limits can be exercised with x-forwarded-for
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
delete process.env.SIGNUP_PIN_INITIAL;
delete process.env.SIGNUP_ENABLED;
