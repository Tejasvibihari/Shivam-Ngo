"use client";

import { usePathname } from "next/navigation";
import AccessDenied from "@/features/admin/access/components/AccessDenied";
import RoleGuard from "@/features/admin/access/components/RoleGuard";
import { findAdminRoute } from "@/features/admin/access/policy";

/**
 * Applies the page map (ADMIN_ROUTES in access/policy.ts) to the current URL, so
 * every page in the (panel) group is role-protected without repeating a guard in
 * each page. A page with no entry in the map is denied (fail closed).
 * The page is not rendered at all until access is confirmed.
 */
export default function PanelAccessGuard({ children }: { children: React.ReactNode }) {
    const route = findAdminRoute(usePathname());
    if (!route) return <AccessDenied />;
    return <RoleGuard requirement={route.requirement}>{children}</RoleGuard>;
}
