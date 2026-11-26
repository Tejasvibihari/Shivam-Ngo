import { writeAudit } from "@/lib/admin/auth/audit";
import { withAuth } from "@/lib/admin/auth/guard";
import { clientIp, fail, json, readJson, validationFail } from "@/lib/admin/auth/request";
import { updateProfileSchema } from "@/lib/admin/auth/validation";
import { usersCollection } from "@/lib/admin/db/client";
import { toPublicUser } from "@/lib/admin/db/models";

/**
 * PATCH /api/admin/auth/profile   { "name": "..." }
 * Any signed-in role may rename THEIR OWN account. The target is always the session's
 * user (never an id from the request), and only `name` can change.
 */
export const PATCH = withAuth(
    async (request, auth) => {
        const body = await readJson(request);
        if (!body.ok) return body.response;
        const parsed = updateProfileSchema.safeParse(body.data);
        if (!parsed.success) return validationFail(parsed.error);

        const users = await usersCollection();
        const updated = await users.findOneAndUpdate(
            { _id: auth.userId },
            { $set: { name: parsed.data.name, updatedAt: new Date() } },
            { returnDocument: "after" },
        );
        if (!updated) return fail(404, "not_found", "Account not found.");

        await writeAudit({ action: "auth.profile_updated", actorId: auth.userId, targetId: auth.userId, ip: clientIp(request) });
        return json({ ok: true as const, user: toPublicUser(updated) });
    },
    { permission: "admin:access" },
);
