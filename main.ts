// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The entry is the X post itself: the house reads the post from X (its
// first picture and its text) and hands that to the judge. This program
// only hands the post's address over: it copies POST.json from the
// repository root into /output, where the gate reads it.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function dirFromEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

const sourceRoot = dirFromEnv("MAKEFUN_BOT_DIR", "/bot");
const targetRoot = dirFromEnv("MAKEFUN_OUTPUT_DIR", "/output");

const sourcePath = join(sourceRoot, "POST.json");
const targetPath = join(targetRoot, "POST.json");

let payload: string;
try {
  payload = readFileSync(sourcePath, "utf8");
} catch (err) {
  console.error(`cannot read ${sourcePath}: ${(err as Error).message}`);
  process.exit(1);
}

// The gate wants a JSON object naming an X post, so refuse to hand over
// anything that is not even parseable JSON: a broken POST.json fails
// loudly here instead of silently passing through. It must also be an
// object with a string url: a bare string or number would parse fine
// but the gate would still refuse it, so catch that here too.
let parsed: unknown;
try {
  parsed = JSON.parse(payload);
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)
    || typeof (parsed as { url?: unknown }).url !== "string") {
  console.error("POST.json must be an object with a string url");
  process.exit(1);
}

mkdirSync(targetRoot, { recursive: true });
writeFileSync(targetPath, payload);
