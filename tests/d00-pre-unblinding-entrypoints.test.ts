/** Proves normative task names remain contract-only until the irreversible owner gate. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveTask } from "../scripts/tasks/registry.ts";
import {
  isSubmissionExcluded,
  loadSubmissionExclusions,
  partitionSubmissionPaths,
} from "../scripts/submission-membership.ts";

const exactVersionArguments = ["--evaluation-version", "eval-v1.1.0"] as const;
const taskNames = ["baseline:verify", "beyondgreen:verify", "evaluation:run", "replay"] as const;
const contractOnlyModes = ["baseline", "beyondgreen", "replay"] as const;

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
  for (const mode of contractOnlyModes) {
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

test("contract-only entrypoints contain no official runner or write primitive", () => {
  const source = readFileSync("scripts/d00-pre-unblinding-entrypoint.ts", "utf8");
  assert.doesNotMatch(source, /child_process|writeFile|appendFile|artifacts\/runs|unblindHeldOut|runOfficial/i);
  const tasks = readFileSync("scripts/tasks/pre-unblinding.ts", "utf8");
  assert.doesNotMatch(tasks, /chromium/i);
});

test("evaluation:run is registered to the gated production runner without executing it", () => {
  const task = resolveTask("evaluation:run", exactVersionArguments);
  assert.equal(task.steps.length, 1);
  assert.deepEqual(task.steps[0]?.arguments, [
    "scripts/d00-official-run.ts",
    "--evaluation-version",
    "eval-v1.1.0",
  ]);
  const source = readFileSync("scripts/d00-official-run.ts", "utf8");
  assert.match(source, /MICRO1_OFFICIAL_SESSION_BOUNDARY/);
  assert.match(source, /createOfficialProductionRoot/);
});

test("ZIP rehearsal is temporary, manifest-backed, and cannot execute an official run", () => {
  const source = readFileSync("scripts/d00-zip-rehearsal.ts", "utf8");
  assert.match(source, /mkdtempSync/);
  assert.match(source, /PRE_UNBLINDING_REHEARSAL_MANIFEST\.json/);
  assert.match(source, /loadSubmissionExclusions/);
  assert.match(source, /partitionSubmissionPaths/);
  assert.match(source, /RUN-BG-OFFICIAL-EVAL-V1\.1\.0-002\/observer-records/);
  assert.match(source, /sourceSha256/);
  assert.match(source, /rmSync\(temporaryRoot/);
  assert.doesNotMatch(source, /dist\/submission\.zip|finalSubmissionArchive:\s*true/);
  assert.doesNotMatch(source, /"evaluation:run"/);
  assert.equal(resolveTask("submission:rehearse", []).name, "submission:rehearse");
  assert.throws(() => resolveTask("submission:rehearse", ["--keep"]), /does not accept arguments/);
});

test("submission membership is derived from every configured file and directory exclusion", () => {
  const exclusions = loadSubmissionExclusions(process.cwd());
  const examples = [
    "README.md",
    "docs/CHALLENGE.md",
    "docs/HACKATHON_RULES.md",
    "docs/CONTROL_STATUS_RU.md",
    "docs/PREMORTEM_RU.md",
    "docs/evidence/timeline.png",
    "tmp/private-output.txt",
    "artifacts/trajectories/session-boundaries/SES-20260830-014.yaml",
  ] as const;
  const partition = partitionSubmissionPaths(examples, exclusions);
  assert.deepEqual(partition.included, ["README.md", "docs/CHALLENGE.md", "docs/HACKATHON_RULES.md"]);
  assert.deepEqual(partition.excluded, examples.filter((file) => isSubmissionExcluded(file, exclusions)).sort());
  for (const file of partition.included) assert.equal(isSubmissionExcluded(file, exclusions), false);
  for (const file of partition.excluded) assert.equal(isSubmissionExcluded(file, exclusions), true);

  const metadataSource = readFileSync("scripts/d00-submission-metadata.ts", "utf8");
  const rehearsalSource = readFileSync("scripts/d00-zip-rehearsal.ts", "utf8");
  for (const source of [metadataSource, rehearsalSource]) {
    assert.match(source, /loadSubmissionExclusions/);
    assert.match(source, /partitionSubmissionPaths/);
  }
  assert.doesNotMatch(metadataSource, /const EXCLUDED = new Set/);
  assert.doesNotMatch(rehearsalSource, /approvedExclusions/);
});
