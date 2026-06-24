import { mkdir, writeFile } from "node:fs/promises";

await mkdir("node_modules/server-only", { recursive: true });
await writeFile("node_modules/server-only/index.js", "", "utf8");
