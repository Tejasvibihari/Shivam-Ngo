"use client";

import { useMemo } from "react";
import { useAuth } from "@/features/admin/auth/AuthProvider";
import { canAccessPath, isAllowed, navItemsForRole, type AdminRoute } from "@/features/admin/access/policy";
import { permissionsForRole, type AccessRequirement, type Permission } from "@/lib/admin/auth/permissions";
import type { Role } from "@/lib/admin/db/models";

export type Access = {
    /** Role of the signed-in user (from the existing auth state), or null when nobody is signed in. */
    role: Role | null;
    /** Everything the role holds, from the shared matrix (the same list GET /api/admin/auth/me returns). */
    permissions: readonly Permission[];
    /** `can("users:read")` or `can({ minRole: "admin" })`. False when nobody is signed in. */
    can: (requirement: Permission | AccessRequirement) => boolean;
    canAccessPath: (pathname: string) => boolean;
    /** Menu entries for this user. */
    navItems: AdminRoute[];
};

/**
 * What the signed-in user may do. It reads the user from the EXISTING
 * AuthProvider (no second copy of the auth state) and derives permissions
 * from the role with the backend's own matrix, so the two cannot drift apart.
 */
export function useAccess(): Access {
    const { user } = useAuth();
    const role = user?.role ?? null;

    return useMemo<Access>(
        () => ({
            role,
            permissions: permissionsForRole(role),
            can: (requirement) => isAllowed(role, typeof requirement === "string" ? { permission: requirement } : requirement),
            canAccessPath: (pathname) => canAccessPath(role, pathname),
            navItems: navItemsForRole(role),
        }),
        [role],
    );
}
