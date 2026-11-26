// Same alias / TypeScript loader as tests/authz/loader.mjs, plus four substitutions so the
// admin route handlers run without MongoDB or a Next.js server:
//   "@/lib/admin/db/client" -> fakes/db-client.ts   (in-memory collections, same API surface used by the code)
//   "mongodb"               -> fakes/mongodb.ts     (ObjectId only)
//   "next/server"           -> fakes/next-server.ts (NextRequest / NextResponse on top of Node's Request / Response)
//   "next/headers"          -> fakes/next-headers.ts
// Everything else (auth, sessions, RBAC, PIN, validation, rate limiting, the route files themselves) is the real code.
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load as baseLoad, resolve as baseResolve } from "../authz/loader.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const fake = (name) => pathToFileURL(path.join(HERE, "fakes", name)).href;

const SUBSTITUTES = new Map([
    ["mongodb", fake("mongodb.ts")],
    ["next/server", fake("next-server.ts")],
    ["next/headers", fake("next-headers.ts")],
]);

export async function resolve(specifier, context, nextResolve) {
    if (SUBSTITUTES.has(specifier)) return { url: SUBSTITUTES.get(specifier), format: "module", shortCircuit: true };
    if (specifier === "@/lib/admin/db/client") return { url: fake("db-client.ts"), format: "module", shortCircuit: true };
    if (specifier.startsWith("@/")) {
        const base = path.join(ROOT, specifier.slice(2));
        const isFile = (p) => existsSync(p) && statSync(p).isFile();
        for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), base]) {
            if (isFile(candidate)) return nextResolve(pathToFileURL(candidate).href, context);
        }
    }
    // Relative imports inside the test folder may omit the ".ts" extension.
    if (specifier.startsWith(".") && !path.extname(specifier) && context.parentURL?.startsWith("file:")) {
        const candidate = path.resolve(path.dirname(fileURLToPath(context.parentURL)), `${specifier}.ts`);
        if (existsSync(candidate)) return nextResolve(pathToFileURL(candidate).href, context);
    }
    return baseResolve(specifier, context, nextResolve);
}

export const load = baseLoad;
