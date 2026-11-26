"use client";

import { isAllowed } from "@/features/admin/access/policy";
import AccessDenied from "@/features/admin/access/components/AccessDenied";
import { useAuth } from "@/features/admin/auth/AuthProvider";
import type { AccessRequirement } from "@/lib/admin/auth/permissions";

/**
 * Renders `children` only when the signed-in user satisfies `requirement`, the
 * same shape the backend takes in `withAuth()`:
 *
 *   <RoleGuard requirement={{ permission: "users:read" }}>...</RoleGuard>
 *   <RoleGuard requirement={{ minRole: "admin" }}>...</RoleGuard>
 *   // hide a part of a page instead of showing "Access denied":
 *   <RoleGuard requirement={{ permission: "settings:update_sensitive" }} fallback={null}>...</RoleGuard>
 *
 * It reads the user from the existing AuthProvider and does not fetch anything.
 * Fails closed: with no signed-in user, an unknown role or an empty requirement
 * the children are not rendered. Put it inside <ProtectedRoute> (the whole
 * (panel) group already is) so "not signed in" is handled by the redirect.
 *
 * This is a UX layer. The server enforces every API call.
 */
export default function RoleGuard({
    requirement,
    children,
    fallback = <AccessDenied />,
}: {
    requirement: AccessRequirement;
    children: React.ReactNode;
    /** Shown when access is denied. Defaults to the access-denied view; pass `null` to render nothing. */
    fallback?: React.ReactNode;
}) {
    const { status, user } = useAuth();
    if (status !== "authenticated" || !user) return null;
    return isAllowed(user.role, requirement) ? <>{children}</> : <>{fallback}</>;
}
