/** Builds or verifies immutable package manifests for the self-contained BG-D02 fixture. */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const definitions = [
  { id: "BG-D02-arm-visible", kind: "arm_visible", output: "evaluation/manifests/BG-D02/arm-visible.manifest.json", files: ["evaluation/arm-visible/BG-D02/contract.ts", "evaluation/arm-visible/BG-D02/render.ts", "evaluation/arm-visible/BG-D02/harness.ts", "evaluation/arm-visible/BG-D02/visible-assertions.ts", "evaluation/arm-visible/BG-D02/BG-D02-visible.test.ts", "evaluation/arm-visible/BG-D02/BG-D02-unit-contract.test.ts", "evaluation/arm-visible/BG-D02/BG-D02-denied-probe.mjs"] },
  { id: "BG-D02-verifier-only", kind: "verifier_only", output: "evaluation/manifests/BG-D02/verifier-only.manifest.json", files: ["evaluation/verifier-only/BG-D02/canonical-driver.ts", "evaluation/verifier-only/BG-D02/ground-truth.json", "evaluation/verifier-only/BG-D02/BG-D02-self-check.test.ts", "evaluation/verifier-only/BG-D02/BG-D02-evaluator-denied-probe.mjs", "evaluation/verifier-only/BG-D02/scenario-provider.ts", "evaluation/verifier-only/BG-D02/scenario-provider.manifest.json"] },
  { id: "BG-D02-candidate-a", kind: "candidate", output: "evaluation/manifests/BG-D02/candidate-a.manifest.json", files: ["candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts"] },
  { id: "BG-D02-candidate-b", kind: "candidate", output: "evaluation/manifests/BG-D02/candidate-b.manifest.json", files: ["candidates/BG-D02/candidate-b/ParcelDispatchBoard.ts"] },
];
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const buildManifest = (definition) => {
  const sourceFiles = definition.files.map((file) => ({ path: file, sha256: sha256(readFileSync(path.resolve(file))) }));
  return { schema_version: "1.0", fixture_id: "BG-D02", package_id: definition.id, package_kind: definition.kind, immutable: true, hash_algorithm: "SHA-256", source_files: sourceFiles, package_sha256: sha256(sourceFiles.map((file) => `${file.path}\0${file.sha256}\n`).join("")) };
};
const write = process.argv.includes("--write");
let valid = true;
for (const definition of definitions) {
  const serialized = `${JSON.stringify(buildManifest(definition), null, 2)}\n`;
  if (write) { writeFileSync(path.resolve(definition.output), serialized); process.stdout.write(`WROTE ${definition.output}\n`); continue; }
  try { if (readFileSync(path.resolve(definition.output), "utf8") !== serialized) throw new Error("mismatch"); }
  catch { valid = false; process.stderr.write(`MISMATCH ${definition.output}\n`); }
}
if (valid && !write) process.stdout.write("BG-D02_MANIFESTS_VERIFIED\n");
if (!valid) process.exitCode = 1;
