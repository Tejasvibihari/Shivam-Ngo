import { NextResponse, type NextRequest } from "next/server";

/**
 * First, cheap gate in front of the admin area. It only checks that a session
 * cookie EXISTS; it cannot tell whether the session is still valid (that needs
 * the database). Every API route re-validates with `withAuth()` and every admin
 * page must re-validate with `getCurrentUser()`, so this file is an
 * optimisation and a redirect convenience, never the security boundary.
 */

// Keep in sync with SESSION_COOKIE_NAME in lib/admin/auth/config.ts
// (that file is server-only and reads env, so it is not imported here).
const COOKIE = process.env.NODE_ENV === "production" ? "__Host-ngo_session" : "ngo_session";

const PUBLIC_API = new Set(["/api/admin/auth/login", "/api/admin/auth/logout"]);
const PUBLIC_PAGES = new Set(["/admin/login", "/admin/signup", "/admin/setup"]);

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasCookie = Boolean(request.cookies.get(COOKIE)?.value);
    if (hasCookie) return NextResponse.next();

    if (pathname.startsWith("/api/admin/")) {
        if (PUBLIC_API.has(pathname)) return NextResponse.next();
        return NextResponse.json(
            { ok: false, code: "unauthenticated", error: "Authentication required." },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        if (PUBLIC_PAGES.has(pathname)) return NextResponse.next();
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.search = "";
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
