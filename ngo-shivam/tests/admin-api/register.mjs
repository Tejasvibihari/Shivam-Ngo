// Registers loader.mjs so plain Node can run the REAL admin route handlers against in-memory fakes.
// Used by `pnpm test:admin-api`:  node --import ./tests/admin-api/register.mjs --test <files>
import { register } from "node:module";

register("./loader.mjs", import.meta.url);
