/** Proves normative task names remain contract-only until the irreversible owner gate. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveTask } from "../scripts/tasks/registry.ts";

const exactVersionArguments = ["--evaluation-version", "eval-v1.1.0"] as const;
const taskNames = ["baseline:verify", "beyondgreen:verify", "evaluation:run", "replay"] as const;

test("normative entrypoints accept only the exact frozen evaluation version", () => {
  for (const name of taskNames) {
    assert.equal(resolveTask(name, exactVersionArguments).name, name);
    assert.throws(() => resolveTask(name, []), /accepts only/);
    assert.throws(
      () => resolveTask(name, ["--evaluation-version", "eval-v1.1.1"]),
      /eval-v1\.1\.0/,
    );
    assert.throws(() => resolveTask(name, [...exactVersionArguments, "--official"]), /accepts only/);
  }
});

test("contract entrypoint reports zero arm execution, scoring, unblinding, and model calls", () => {
  for (const mode of ["baseline", "beyondgreen", "evaluation", "replay"] as const) {
    const result = spawnSync(process.execPath, [
      "scripts/d00-pre-unblinding-entrypoint.ts",
      mode,
      ...exactVersionArguments,
    ], { cwd: process.cwd(), encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout) as Record<string, unknown>;
    assert.equal(report.executionClass, "contract_only_pre_unblinding");
    assert.equal(report.officialOrScoredRun, false);
    assert.equal(report.unblindingPerformed, false);
    assert.equal(report.armExecuted, false);
    assert.equal(report.runRecordCreated, false);
    assert.equal(report.liveModelCalls, 0);
    assert.equal(report.networkRequired, false);
  }
});

test("pre-unblinding implementation contains no official runner or write primitive", () => {
  const source = readFileSync("scripts/d00-pre-unblinding-entrypoint.ts", "utf8");
  assert.doesNotMatch(source, /child_process|writeFile|appendFile|artifacts\/runs|unblindHeldOut|runOfficial/i);
  const tasks = readFileSync("scripts/tasks/pre-unblinding.ts", "utf8");
  assert.doesNotMatch(tasks, /live model|chromium|official runner/i);
});

test("ZIP rehearsal is temporary, manifest-backed, and cannot create a final archive", () => {
  const source = readFileSync("scripts/d00-zip-rehearsal.ts", "utf8");
  assert.match(source, /mkdtempSync/);
  assert.match(source, /PRE_UNBLINDING_REHEARSAL_MANIFEST\.json/);
  assert.match(source, /SES-20260830-014\.yaml/);
  assert.match(source, /sourceSha256/);
  assert.match(source, /rmSync\(temporaryRoot/);
  assert.doesNotMatch(source, /dist\/submission\.zip|finalSubmissionArchive:\s*true/);
  assert.equal(resolveTask("submission:rehearse", []).name, "submission:rehearse");
  assert.throws(() => resolveTask("submission:rehearse", ["--keep"]), /does not accept arguments/);
});
