/** Proves that a restricted arm process cannot read the BG-D04 verifier-only package. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

test("BG-D04 arm permission profile denies verifier-only ground truth", () => {
  const root = process.cwd();
  const permitted = [
    path.join(root, "candidates/BG-D04"),
    path.join(root, "evaluation/arm-visible/BG-D04"),
  ].join(",");
  const blockedPath = path.join(root, "evaluation/verifier-only/BG-D04/ground-truth.json");
  const result = spawnSync(process.execPath, [
    "--permission",
    `--allow-fs-read=${permitted}`,
    "--input-type=module",
    "--eval",
    `import { readFile } from "node:fs/promises"; await readFile(${JSON.stringify(blockedPath)});`,
  ], { cwd: root, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /ERR_ACCESS_DENIED|Access to this API has been restricted/);
});
