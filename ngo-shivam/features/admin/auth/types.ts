import type { Role } from "@/lib/admin/db/models";

/**
 * The signed-in user as the browser receives it from GET /api/admin/auth/me and
 * POST /api/admin/auth/login (the server's `PublicUser`, after JSON: dates are
 * ISO strings). It never contains a password hash.
 */
export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: "active" | "disabled";
    lastLoginAt: string | null;
    createdAt: string;
};
