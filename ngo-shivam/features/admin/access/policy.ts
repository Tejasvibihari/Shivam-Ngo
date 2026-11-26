import {
    evaluateAccess,
    isRole,
    type AccessRequirement,
} from "@/lib/admin/auth/permissions";
import type { Role } from "@/lib/admin/db/models";

/**
 * Role-based access policy for the admin FRONTEND. Pure (no React, no browser
 * APIs), so it is unit-tested in tests/admin-client/access.test.ts.
 *
 * It does not invent rules: every decision goes through `evaluateAccess()` from
 * lib/admin/auth/permissions.ts, the same function and the same role ->
 * permission matrix the backend uses in `withAuth()`. This file only says which
 * permission each admin PAGE needs.
 *
 * Hiding a page or a menu item is a convenience. The server still enforces
 * access on every API call, and nothing sensitive may be rendered by a page
 * itself: it must come from a guarded API.
 */

/* ------------------------------------------------------------------ roles */

export const ROLE_LABELS: Record<Role, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    editor: "Editor",
};

/** Display name of a role; an unknown value never throws and never looks like a real role. */
export function roleLabel(role: unknown): string {
    return isRole(role) ? ROLE_LABELS[role] : "Unknown role";
}

/* ----------------------------------------------------------------- routes */

export type NavIcon = "dashboard" | "content" | "media" | "submissions" | "users" | "audit" | "settings";

export type AdminRoute = {
    /** Path under /admin. It also covers every sub-path unless a longer entry exists. */
    href: string;
    label: string;
    description: string;
    /** Same shape the backend uses: a permission (or a list: ALL needed) and/or a minimum role. */
    requirement: AccessRequirement;
    /** Set to show the page in the menu; leave out for pages that are reachable but not listed. */
    icon?: NavIcon;
};

export const ADMIN_HOME_PATH = "/admin";
export const PROFILE_PATH = "/admin/profile";
export const SIGNUP_PIN_PATH = "/admin/settings/signup-pin";
export const ACCESS_DENIED_PATH = "/admin/access-denied";

/**
 * THE PAGE MAP. Order is the order of the menu.
 *
 * Every page under app/admin/(panel) MUST have an entry here. A page that is not
 * listed is treated as forbidden (fail closed), so forgetting an entry shows
 * "Access denied" instead of silently exposing a page to every role.
 * An entry covers its sub-paths (`/admin/users/123` uses `/admin/users`); give a
 * sub-page that needs more privilege its own, longer entry.
 */
export const ADMIN_ROUTES: readonly AdminRoute[] = Object.freeze([
    {
        href: ADMIN_HOME_PATH,
        label: "Dashboard",
        description: "Overview of your account and the tools you can use.",
        requirement: { permission: "admin:access" },
        icon: "dashboard",
    },
    {
        href: "/admin/content",
        label: "Content",
        description: "News, activities, gallery and team pages.",
        requirement: { permission: "content:read" },
        icon: "content",
    },
    {
        href: "/admin/media",
        label: "Media",
        description: "Uploaded images and files.",
        requirement: { permission: "media:read" },
        icon: "media",
    },
    {
        href: "/admin/submissions",
        label: "Submissions",
        description: "Contact, volunteer, career and donation enquiry submissions.",
        requirement: { permission: "submissions:read" },
        icon: "submissions",
    },
    {
        href: "/admin/users",
        label: "Users",
        description: "Admin accounts and their roles.",
        requirement: { permission: "users:read" },
        icon: "users",
    },
    {
        href: "/admin/audit",
        label: "Audit log",
        description: "Security events: sign-ins, denied requests and changes.",
        requirement: { permission: "audit:read" },
        icon: "audit",
    },
    {
        href: "/admin/settings",
        label: "Settings",
        description: "Site settings and your account security.",
        requirement: { permission: "settings:read" },
        icon: "settings",
    },
    {
        // longer than "/admin/settings", so it has its own, stricter rule: Super Admin only
        href: SIGNUP_PIN_PATH,
        label: "Signup PIN",
        description: "Change the PIN that people need to create an account.",
        requirement: { permission: "settings:update_sensitive" },
    },
    {
        href: PROFILE_PATH,
        label: "Profile",
        description: "Your name and password.",
        requirement: { permission: "admin:access" },
    },
    {
        href: ACCESS_DENIED_PATH,
        label: "Access denied",
        description: "Shown when a page needs a permission the account does not have.",
        requirement: { permission: "admin:access" },
    },
]);

/** Is `role` allowed to satisfy `requirement`? Unknown or missing roles are denied. */
export function isAllowed(role: unknown, requirement: AccessRequirement): boolean {
    return evaluateAccess(role, requirement).allowed;
}

/**
 * Turns whatever the router gives us into a plain `/admin...` path, or null when
 * it is not one we are willing to reason about (other sections, `//`, `..`, `\`, control characters).
 */
function normalizeAdminPath(pathname: unknown): string | null {
    if (typeof pathname !== "string") return null;
    const raw = pathname.split(/[?#]/, 1)[0];
    if (/\/\/|\\|\/\.\.?(\/|$)|[\u0000-\u001f\u007f]/.test(raw)) return null;
    const path = raw.replace(/\/+$/, "") || "/";
    return path === ADMIN_HOME_PATH || path.startsWith(`${ADMIN_HOME_PATH}/`) ? path : null;
}

/** The most specific entry that covers `pathname`, or null when no entry does. */
export function findAdminRoute(pathname: unknown): AdminRoute | null {
    const path = normalizeAdminPath(pathname);
    if (!path) return null;
    let best: AdminRoute | null = null;
    for (const route of ADMIN_ROUTES) {
        // "/admin" covers only itself: as a prefix it would cover every admin page.
        const covers = path === route.href || (route.href !== ADMIN_HOME_PATH && path.startsWith(`${route.href}/`));
        if (covers && (!best || route.href.length > best.href.length)) best = route;
    }
    return best;
}

/** May `role` open `pathname`? A path with no entry is denied. */
export function canAccessPath(role: unknown, pathname: unknown): boolean {
    const route = findAdminRoute(pathname);
    return route !== null && isAllowed(role, route.requirement);
}

/** The menu for `role`: only the pages it may open, in menu order. */
export function navItemsForRole(role: unknown): AdminRoute[] {
    return ADMIN_ROUTES.filter((route) => route.icon !== undefined && isAllowed(role, route.requirement));
}
