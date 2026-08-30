#!/usr/bin/env node
/** Reconciles frozen D01 manifest hashes without executing candidates or evaluation. */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { D01_FIXTURE } from "../src/d01/fixture.ts";

const manifestPaths = [
  D01_FIXTURE.armVisible.manifestPath,
  D01_FIXTURE.verifierOnly.manifestPath,
  ...D01_FIXTURE.candidateIds.map((candidateId) => D01_FIXTURE.candidates[candidateId].manifestPath),
];

const digest = createHash("sha256");
for (const manifestPath of manifestPaths) {
  digest.update(manifestPath);
  digest.update("\0");
  digest.update(readFileSync(manifestPath));
}
process.stdout.write(`${digest.digest("hex")}\n`);
