/**
 * Test double for next/server, built on Node's own Request / Response. It implements the small part the
 * admin routes use: request.cookies.get, request.nextUrl, NextResponse.json and response.cookies.set.
 */
type CookieOptions = {
    name: string;
    value: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    expires?: Date;
    maxAge?: number;
};

export class NextRequest extends Request {
    readonly nextUrl: URL & { clone(): URL };
    readonly cookies: { get(name: string): { name: string; value: string } | undefined };

    constructor(input: string | URL, init?: RequestInit) {
        super(input, init);
        this.nextUrl = Object.assign(new URL(typeof input === "string" ? input : input.toString()), {
            clone() {
                return new URL(this.href);
            },
        });
        const jar = new Map<string, string>();
        for (const part of (this.headers.get("cookie") ?? "").split(";")) {
            const index = part.indexOf("=");
            if (index > 0) jar.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
        }
        this.cookies = { get: (name) => (jar.has(name) ? { name, value: jar.get(name) as string } : undefined) };
    }
}

export class NextResponse extends Response {
    readonly cookies = {
        set: (options: CookieOptions) => {
            const parts = [`${options.name}=${options.value}`];
            if (options.path) parts.push(`Path=${options.path}`);
            if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
            if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
            if (options.httpOnly) parts.push("HttpOnly");
            if (options.secure) parts.push("Secure");
            if (options.sameSite) parts.push(`SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`);
            this.headers.append("set-cookie", parts.join("; "));
        },
    };

    static json(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
        return new NextResponse(JSON.stringify(body), {
            status: init.status ?? 200,
            headers: { "content-type": "application/json", ...(init.headers ?? {}) },
        });
    }

    static redirect(url: string | URL, status = 307) {
        return new NextResponse(null, { status, headers: { location: String(url) } });
    }

    static next() {
        return new NextResponse(null, { status: 200 });
    }
}
