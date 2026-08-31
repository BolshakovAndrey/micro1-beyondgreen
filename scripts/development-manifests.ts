/** Verifies frozen source hashes for the heterogeneous D02-D04 fixture manifests. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const requested = process.argv[2];
const allowed = new Set(["BG-D02", "BG-D03", "BG-D04"]);
if (requested && !allowed.has(requested)) throw new Error(`Unknown development fixture: ${requested}`);

function verifyJson(path: string): void {
  const value = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  const entries = Array.isArray(value.source_files)
    ? (value.source_files as Array<{path: string; sha256: string}>).map(({ path, sha256 }) => [path, sha256] as const)
    : value.files && typeof value.files === "object"
      ? Object.entries(value.files as Record<string, string>)
      : value.candidates && typeof value.candidates === "object"
        ? Object.values(value.candidates as Record<string, {path: string; sha256: string}>).map(({ path, sha256 }) => [path, sha256] as const)
        : [];
  if (entries.length === 0) throw new Error(`Manifest has no source entries: ${path}`);
  for (const [sourcePath, expected] of entries) {
    if (sha256(sourcePath) !== expected) throw new Error(`Immutable source mismatch: ${sourcePath}`);
  }
}

function verifyD03(): void {
  const manifest = readFileSync("evaluation/manifests/BG-D03/package-manifest.yaml", "utf8");
  const matches = [...manifest.matchAll(/^\s+-?\s*path: "([^"]+)"\n\s*sha256: "([a-f0-9]{64})"$/gm)];
  if (matches.length !== 11) throw new Error("BG-D03 manifest must bind exactly eleven source files.");
  for (const match of matches) if (sha256(match[1]!) !== match[2]) throw new Error(`Immutable source mismatch: ${match[1]}`);
}

if (!requested || requested === "BG-D02") {
  for (const name of ["arm-visible", "verifier-only", "candidate-a", "candidate-b"])
    verifyJson(`evaluation/manifests/BG-D02/${name}.manifest.json`);
}
if (!requested || requested === "BG-D03") verifyD03();
if (!requested || requested === "BG-D04") {
  for (const name of ["arm-visible", "verifier-only", "candidates"])
    verifyJson(`evaluation/manifests/BG-D04/${name}.manifest.json`);
}
process.stdout.write(`${requested ?? "D01-D04"}_MANIFESTS_VERIFIED\n`);
