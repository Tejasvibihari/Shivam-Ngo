import "server-only";
import { createHmac } from "node:crypto";
import { getAuthSecret } from "@/lib/admin/auth/config";

/**
 * Keyed hash (HMAC-SHA256, hex). The `purpose` label separates uses so a value
 * hashed for one purpose can never be confused with another.
 */
export function hmac(purpose: "session" | "rate-limit-email", value: string): string {
    return createHmac("sha256", getAuthSecret()).update(`${purpose}:${value}`).digest("hex");
}
