#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { canonicalJson } from "../src/official/canonical-json.ts";
import {
  buildOfficialPostDecisionSourceManifest,
  OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
  OFFICIAL_POST_DECISION_SOURCE_ROOT,
} from "../src/official/execution/post-decision-recovery.ts";

/** Freeze or verify the exact 44-file RUN-002 source without modifying its bytes. */
export function main(arguments_: readonly string[] = process.argv.slice(2)): number {
  if (arguments_.length > 1 || (arguments_.length === 1 && arguments_[0] !== "--write")) {
    throw new Error("Source-manifest command accepts only an optional --write argument.");
  }
  const repositoryRoot = process.cwd();
  const manifest = buildOfficialPostDecisionSourceManifest(repositoryRoot, OFFICIAL_POST_DECISION_SOURCE_ROOT);
  const serialized = `${canonicalJson(manifest)}\n`;
  const outputPath = path.resolve(repositoryRoot, OFFICIAL_POST_DECISION_SOURCE_MANIFEST);
  if (arguments_[0] === "--write") {
    writeFileSync(outputPath, serialized, { encoding: "utf8", flag: "wx", mode: 0o600 });
    process.stdout.write(`POST_DECISION_SOURCE_MANIFEST_WRITTEN ${manifest.fileCount} ${manifest.bundleSha256}\n`);
    return 0;
  }
  if (!existsSync(outputPath) || readFileSync(outputPath, "utf8") !== serialized) {
    throw new Error("POST_DECISION_SOURCE_MANIFEST_MISMATCH");
  }
  process.stdout.write(`POST_DECISION_SOURCE_MANIFEST_VERIFIED ${manifest.fileCount} ${manifest.bundleSha256}\n`);
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
