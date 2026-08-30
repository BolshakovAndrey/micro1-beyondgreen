#!/usr/bin/env node
/** Reproduces submitted D01 JSON and HTML evidence through the offline replay path. */

import { readFileSync } from "node:fs";

import { executeFixtureEngineBinding } from "../src/d01/engine.ts";
import { D01_ENGINE } from "../src/d01/runtime.ts";
import { D01_FIXTURE } from "../src/d01/fixture.ts";

if (process.argv.length > 2) throw new Error("d01-replay does not accept arguments.");
const replay = readFileSync(D01_FIXTURE.artifacts.replayJsonl, "utf8");
const evidenceJson = readFileSync(D01_FIXTURE.artifacts.evidenceJson, "utf8");
const evidenceHtml = readFileSync(D01_FIXTURE.artifacts.evidenceHtml, "utf8");
process.stdout.write(`${JSON.stringify(executeFixtureEngineBinding(D01_ENGINE, {
  kind: "replay_evidence", evidenceJson, evidenceHtml, replayJsonl: replay,
}))}\n`);
