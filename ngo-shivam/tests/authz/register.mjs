// Registers loader.mjs so plain Node can run this project's TypeScript with the "@/..." alias.
// Used by `pnpm test:authz`:  node --import ./tests/authz/register.mjs --test <files>
import { register } from "node:module";

register("./loader.mjs", import.meta.url);
