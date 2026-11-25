import "server-only";
import { ObjectId } from "mongodb";
import { auditLogsCollection } from "@/lib/admin/db/client";
import type { AuditAction } from "@/lib/admin/db/models";

/**
 * Append a security event. Never put passwords, PINs, tokens or hashes in `meta`.
 * A logging failure must not break (or reveal anything about) the request, so it
 * is only written to the server log.
 */
export async function writeAudit(entry: {
    action: AuditAction;
    actorId?: ObjectId | null;
    targetId?: ObjectId | null;
    ip?: string | null;
    meta?: Record<string, string | number | boolean>;
}): Promise<void> {
    try {
        await (await auditLogsCollection()).insertOne({
            _id: new ObjectId(),
            action: entry.action,
            actorId: entry.actorId ?? null,
            targetId: entry.targetId ?? null,
            ip: entry.ip ?? null,
            meta: entry.meta ?? {},
            createdAt: new Date(),
        });
    } catch (err) {
        console.error("[audit] Could not write audit log:", err instanceof Error ? err.message : "unknown");
    }
}
