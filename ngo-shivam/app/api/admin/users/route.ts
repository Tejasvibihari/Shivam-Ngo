import type { Filter } from "mongodb";
import { withAuth } from "@/lib/admin/auth/guard";
import { fail, json } from "@/lib/admin/auth/request";
import { usersCollection } from "@/lib/admin/db/client";
import { USER_STATUSES, isRoleValue, toPublicUser, type UserDoc } from "@/lib/admin/db/models";

/**
 * GET /api/admin/users?page=1&pageSize=20&q=text&role=editor&status=active
 *
 * Read-only list of admin accounts (permission `users:read`: Admin and Super Admin).
 * Returns `PublicUser` objects only, never the password hash. Every filter is validated
 * against a fixed list or escaped, so nothing from the query string reaches MongoDB as an operator.
 */
const MAX_PAGE_SIZE = 50;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function intParam(value: string | null, fallback: number, min: number, max: number): number {
    // A missing or empty parameter must use the default: Number(null) and Number("") are 0, which would be clamped to `min`.
    if (value === null || value.trim() === "") return fallback;
    const n = Number(value);
    return Number.isInteger(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export const GET = withAuth(
    async (request) => {
        const params = request.nextUrl.searchParams;
        const page = intParam(params.get("page"), 1, 1, 100_000);
        const pageSize = intParam(params.get("pageSize"), 20, 1, MAX_PAGE_SIZE);

        const filter: Filter<UserDoc> = {};
        const role = params.get("role");
        if (role) {
            if (!isRoleValue(role)) return fail(400, "validation_error", "Unknown role filter.");
            filter.role = role;
        }
        const status = params.get("status");
        if (status) {
            if (!(USER_STATUSES as readonly string[]).includes(status)) {
                return fail(400, "validation_error", "Unknown status filter.");
            }
            filter.status = status as UserDoc["status"];
        }
        const q = (params.get("q") ?? "").trim().slice(0, 100);
        if (q) {
            const rx = new RegExp(escapeRegex(q), "i");
            filter.$or = [{ name: rx }, { email: rx }];
        }

        const users = await usersCollection();
        const [total, docs] = await Promise.all([
            users.countDocuments(filter),
            users
                .find(filter)
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .toArray(),
        ]);
        return json({ ok: true as const, users: docs.map(toPublicUser), total, page, pageSize });
    },
    { permission: "users:read" },
);
