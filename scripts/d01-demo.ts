#!/usr/bin/env node
/** Runs the approved unscored D01 demonstration and emits its validated report paths. */

import { writeFileSync } from "node:fs";
import path from "node:path";

import { runD01VerticalSlice } from "../src/d01/orchestrator.ts";
import { executeFixtureEngineBinding } from "../src/d01/engine.ts";
import { D01_ENGINE } from "../src/d01/runtime.ts";
import type { buildReportArtifacts } from "../src/d01/report.ts";
import { D01_FIXTURE } from "../src/d01/fixture.ts";

const checkOnly = process.argv.slice(2).length === 1 && process.argv[2] === "--check";
if (process.argv.length > 2 && !checkOnly) throw new Error("d01-demo accepts only the optional --check flag.");

const artifacts = executeFixtureEngineBinding(D01_ENGINE, {
  kind: "build_report",
  value: runD01VerticalSlice(process.cwd(), D01_FIXTURE.candidateIds[1]),
}) as ReturnType<typeof buildReportArtifacts>;
if (!checkOnly) {
  writeFileSync(path.resolve(D01_FIXTURE.artifacts.evidenceJson), artifacts.json);
  writeFileSync(path.resolve(D01_FIXTURE.artifacts.evidenceHtml), artifacts.html);
  if (!artifacts.evidence.offlineReplayJsonl) throw new Error("D01 demo has no valid offline reasoning replay.");
  writeFileSync(path.resolve(D01_FIXTURE.artifacts.replayJsonl), artifacts.evidence.offlineReplayJsonl);
}
process.stdout.write(`BG-D01_VERTICAL_SLICE_PASSED json=${artifacts.canonicalJsonSha256} html=${artifacts.htmlSha256} mode=${checkOnly ? "check" : "write"}\n`);
