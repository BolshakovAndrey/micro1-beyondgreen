/** Runs only the bounded BG-D04 compilation, visible-gate, oracle, and isolation checks. */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);

function verifyManifest(relativePath, candidateManifest = false) {
  const manifest = JSON.parse(readFileSync(new URL(relativePath, root), "utf8"));
  const entries = candidateManifest
    ? Object.values(manifest.candidates).map(({ path, sha256 }) => [path, sha256])
    : Object.entries(manifest.files);
  for (const [path, expected] of entries) {
    const actual = createHash("sha256").update(readFileSync(new URL(path, root))).digest("hex");
    if (actual !== expected) throw new Error(`Immutable BG-D04 artifact mismatch: ${path}`);
  }
}

function verifyBehaviorFreeze() {
  const manifest = JSON.parse(readFileSync(new URL("evaluation/manifests/BG-D04/arm-visible.manifest.json", root), "utf8"));
  const freeze = readFileSync(new URL("evaluation/behavior-specs/BG-D04_FREEZE.yaml", root), "utf8");
  const frozenDigest = freeze.match(/^english_behavior_sha256: "([a-f0-9]{64})"$/m)?.[1];
  if (!frozenDigest || frozenDigest !== manifest.behavior_sha256) {
    throw new Error("BG-D04 behavior freeze and arm-visible manifest disagree.");
  }
  const actual = createHash("sha256")
    .update(readFileSync(new URL("evaluation/behavior-specs/BG-D04_BEHAVIOR.md", root)))
    .digest("hex");
  if (actual !== frozenDigest) throw new Error("Immutable BG-D04 behavior specification mismatch.");
}

// Verify bytes before executing any gate so fixture verification never masks drift.
verifyBehaviorFreeze();
verifyManifest("evaluation/manifests/BG-D04/arm-visible.manifest.json");
verifyManifest("evaluation/manifests/BG-D04/verifier-only.manifest.json");
verifyManifest("evaluation/manifests/BG-D04/candidates.manifest.json", true);

const typecheck = spawnSync("./node_modules/.bin/tsc", [
  "--noEmit", "--allowImportingTsExtensions", "--module", "NodeNext", "--moduleResolution", "NodeNext",
  "--target", "ES2024", "--lib", "ES2024,DOM", "--jsx", "react-jsx", "--strict", "--skipLibCheck", "--types", "node",
  "candidates/BG-D04/preserving/BulletinPanel.ts",
  "candidates/BG-D04/false-green/BulletinPanel.ts",
  "evaluation/arm-visible/BG-D04/contract.ts",
  "evaluation/arm-visible/BG-D04/harness.ts",
  "evaluation/arm-visible/BG-D04/visible-assertions.ts",
  "evaluation/arm-visible/BG-D04/visible.test.ts",
  "evaluation/verifier-only/BG-D04/canonical-driver.ts",
  "evaluation/verifier-only/BG-D04/self-check.test.ts",
  "tests/BG-D04-isolation.test.ts",
], { encoding: "utf8" });
process.stdout.write(typecheck.stdout);
process.stderr.write(typecheck.stderr);
if (typecheck.status !== 0) process.exit(typecheck.status ?? 1);

const tests = spawnSync(process.execPath, [
  "--test",
  "evaluation/arm-visible/BG-D04/visible.test.ts",
  "evaluation/verifier-only/BG-D04/self-check.test.ts",
  "tests/BG-D04-isolation.test.ts",
], { encoding: "utf8" });
process.stdout.write(tests.stdout);
process.stderr.write(tests.stderr);

// Repeat every digest check after execution to prove the fixture gates did not mutate frozen inputs.
verifyBehaviorFreeze();
verifyManifest("evaluation/manifests/BG-D04/arm-visible.manifest.json");
verifyManifest("evaluation/manifests/BG-D04/verifier-only.manifest.json");
verifyManifest("evaluation/manifests/BG-D04/candidates.manifest.json", true);
process.exit(tests.status ?? 1);
