/** Verifies every immutable file binding in the heterogeneous H01-H06 manifests. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const sha256 = (filePath: string) => createHash("sha256").update(readFileSync(filePath)).digest("hex");
const requested = process.argv[2];
const fixtureIds = ["BG-H01", "BG-H02", "BG-H03", "BG-H04", "BG-H05", "BG-H06"] as const;
if (requested && !fixtureIds.includes(requested as typeof fixtureIds[number])) throw new Error(`Unknown held-out fixture: ${requested}`);

function collectBindings(value: unknown, manifestDir: string): Array<readonly [string, string]> {
  if (Array.isArray(value)) return value.flatMap((item) => collectBindings(item, manifestDir));
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const bindings: Array<readonly [string, string]> = [];
  if (typeof record.path === "string" && typeof record.sha256 === "string") bindings.push([record.path, record.sha256]);
  for (const [key, child] of Object.entries(record)) {
    if (/^(?:evaluation|candidates)\//.test(key) && typeof child === "string" && /^[a-f0-9]{64}$/.test(child)) bindings.push([key, child]);
    else if (/\.(?:json|md)$/.test(key) && typeof child === "string" && /^[a-f0-9]{64}$/.test(child)) bindings.push([path.join(manifestDir, key), child]);
    else bindings.push(...collectBindings(child, manifestDir));
  }
  return bindings;
}

function verifyManifest(manifestPath: string): number {
  const value = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;
  const bindings = collectBindings(value, path.dirname(manifestPath));
  if (bindings.length === 0) throw new Error(`Manifest has no immutable file bindings: ${manifestPath}`);
  for (const [filePath, expected] of bindings) if (sha256(filePath) !== expected) throw new Error(`Immutable source mismatch: ${filePath}`);
  return bindings.length;
}

let bindingCount = 0;
for (const fixtureId of fixtureIds) {
  if (requested && requested !== fixtureId) continue;
  const names = fixtureId === "BG-H03" || fixtureId === "BG-H04"
    ? ["implementation"]
    : ["arm-visible", "verifier-only", "candidate-a", "candidate-b", fixtureId === "BG-H01" || fixtureId === "BG-H02" ? "fixture-implementation" : "implementation"];
  for (const name of names) bindingCount += verifyManifest(`evaluation/manifests/${fixtureId}/${name}.manifest.json`);
}
process.stdout.write(`${requested ?? "H01-H06"}_MANIFESTS_VERIFIED bindings=${bindingCount}\n`);
