// Minimal ESM loader for the authorization tests (no extra dependencies):
//  - "@/x"        -> <project root>/x(.ts|.tsx|/index.ts)   (same alias as tsconfig.json)
//  - "server-only" -> empty module (Next.js replaces it at build time; plain Node would throw)
//  - "next/server" -> "next/server.js" (Next has no "exports" map, so ESM needs the extension)
//  - .ts / .tsx   -> transpiled with the project's own TypeScript (types are not checked here;
//                    `tsc --noEmit` does that)
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const isFile = (p) => existsSync(p) && statSync(p).isFile();

export async function resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
        return { url: "data:text/javascript,export{}", format: "module", shortCircuit: true };
    }
    if (specifier.startsWith("@/")) {
        const base = path.join(ROOT, specifier.slice(2));
        for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), base]) {
            if (isFile(candidate)) return nextResolve(pathToFileURL(candidate).href, context);
        }
    }
    if (/^next\/[\w-]+(\/[\w-]+)*$/.test(specifier)) return nextResolve(`${specifier}.js`, context);
    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
    if (url.startsWith("file:") && /\.tsx?$/.test(url) && !url.includes("/node_modules/")) {
        const source = readFileSync(fileURLToPath(url), "utf8");
        const { outputText } = ts.transpileModule(source, {
            fileName: fileURLToPath(url),
            compilerOptions: {
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ES2022,
                jsx: ts.JsxEmit.ReactJSX,
                esModuleInterop: true,
            },
        });
        return { format: "module", source: outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
}
