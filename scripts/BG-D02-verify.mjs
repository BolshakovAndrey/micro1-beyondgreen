/** Runs only deterministic, fixture-scoped BG-D02 gates without official evaluation. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const outputRoot = mkdtempSync(path.join(os.tmpdir(), "BG-D02-verify-"));
// Node 18 determines module mode from the nearest package boundary. The temporary
// compiler output needs this local marker to preserve the repository's ESM contract.
writeFileSync(path.join(outputRoot, "package.json"), "{\"type\":\"module\"}\n");
// Dependencies remain the reviewed repository installation; this temporary link
// only makes Node's ESM package resolver reach that immutable local dependency tree.
symlinkSync(path.resolve("node_modules"), path.join(outputRoot, "node_modules"), "dir");
const run = (label, args) => {
  const result = spawnSync(args[0], args.slice(1), { cwd: process.cwd(), encoding: "utf8" });
  process.stdout.write(`BG-D02 ${label}\n${result.stdout}`);
  if (result.stderr) process.stderr.write(result.stderr);
  assert.equal(result.status, 0, `${label} exited unsuccessfully`);
  return result.stdout;
};
try {
  run("fixture compilation", [process.execPath, "node_modules/typescript/bin/tsc", "--outDir", outputRoot, "--rootDir", ".", "--target", "ES2024", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--jsx", "react-jsx", "--esModuleInterop", "--strict", "--skipLibCheck", "--rewriteRelativeImportExtensions", "true", "evaluation/arm-visible/BG-D02/BG-D02-visible.test.ts", "evaluation/arm-visible/BG-D02/BG-D02-unit-contract.test.ts", "evaluation/verifier-only/BG-D02/BG-D02-self-check.test.ts"]);
  run("visible gates", [process.execPath, "--test", path.join(outputRoot, "evaluation/arm-visible/BG-D02/BG-D02-visible.test.js"), path.join(outputRoot, "evaluation/arm-visible/BG-D02/BG-D02-unit-contract.test.js")]);
  run("evaluator self-check", [process.execPath, "--test", path.join(outputRoot, "evaluation/verifier-only/BG-D02/BG-D02-self-check.test.js")]);
  run("candidate hashes", [process.execPath, "scripts/BG-D02-manifests.mjs"]);
  const armProof = JSON.parse(run("arm oracle denial", [process.execPath, "--permission", "--allow-fs-read=evaluation/arm-visible/BG-D02", "evaluation/arm-visible/BG-D02/BG-D02-denied-probe.mjs"]));
  assert.deepEqual(armProof, { allDenied: true, errorProbeIndistinguishable: true, operationCount: 4 });
  const evaluatorProof = JSON.parse(run("evaluator candidate denial", [process.execPath, "--permission", "--allow-fs-read=evaluation/verifier-only/BG-D02", "evaluation/verifier-only/BG-D02/BG-D02-evaluator-denied-probe.mjs"]));
  assert.deepEqual(evaluatorProof, { allCandidateAccessDenied: true, operationCount: 3 });
  process.stdout.write("BG-D02_VERIFICATION_PASSED\n");
} finally { rmSync(outputRoot, { recursive: true, force: true }); }
