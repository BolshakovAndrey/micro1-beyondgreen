/** Proves reciprocal arm/oracle filesystem denial for D03 and D04 candidates. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

for (const fixtureId of ["BG-D03", "BG-D04"] as const) {
  test(`${fixtureId} both arms deny verifier-only access`, () => {
    for (const candidate of fixtureId === "BG-D03" ? ["candidate-a", "candidate-b"] : ["preserving", "false-green"]) {
      const allowed = [path.resolve(`candidates/${fixtureId}/${candidate}`), path.resolve(`evaluation/arm-visible/${fixtureId}`)].join(",");
      const blocked = path.resolve(`evaluation/verifier-only/${fixtureId}/ground-truth.json`);
      const result = spawnSync(process.execPath, ["--permission", `--allow-fs-read=${allowed}`, "--input-type=module", "--eval", `import { readFileSync } from "node:fs"; readFileSync(${JSON.stringify(blocked)});`], { encoding: "utf8" });
      assert.notEqual(result.status, 0, `${fixtureId}/${candidate} unexpectedly read its oracle`);
    }
  });

  test(`${fixtureId} evaluator denies both candidate directories`, () => {
    const candidateRoots = fixtureId === "BG-D03" ? ["candidate-a", "candidate-b"] : ["preserving", "false-green"];
    for (const candidate of candidateRoots) {
      const allowed = path.resolve(`evaluation/verifier-only/${fixtureId}`);
      const blocked = path.resolve(`candidates/${fixtureId}/${candidate}`);
      const result = spawnSync(process.execPath, ["--permission", `--allow-fs-read=${allowed}`, "--input-type=module", "--eval", `import { readdirSync } from "node:fs"; readdirSync(${JSON.stringify(blocked)});`], { encoding: "utf8" });
      assert.notEqual(result.status, 0, `${fixtureId} evaluator unexpectedly read ${candidate}`);
    }
  });
}
