#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const manifestPath = "docs/CONTROL_PLANE_SHA256SUMS";
const excluded = new Set([
  manifestPath,
  "docs/CONTROL_STATUS_RU.md",
  "docs/PREMORTEM_RU.md",
]);

const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean)
  .filter((file) => !excluded.has(file))
  .sort();

const header = [
  "# Scope: owner-approved contracts plus the current bounded D01 implementation checkpoint.",
  "# Excludes this self-referential manifest and two local-only documents excluded",
  "# by the clean task boundary. Private denylist and raw traces are external and",
  "# intentionally absent. Pending implementation trace review is recorded by category.",
];
const entries = files.map((file) => {
  const digest = createHash("sha256").update(readFileSync(file)).digest("hex");
  return `${digest}  ./${file}`;
});
const expected = `${[...header, ...entries].join("\n")}\n`;

if (process.argv.includes("--write")) {
  writeFileSync(manifestPath, expected);
  process.stdout.write(`CONTROL_CHECKSUMS_WRITTEN ${files.length}\n`);
}
else if (readFileSync(manifestPath, "utf8") === expected) {
  process.stdout.write(`CONTROL_CHECKSUMS_VERIFIED ${files.length}\n`);
}
else {
  process.stderr.write("CONTROL_CHECKSUMS_MISMATCH\n");
  process.exitCode = 1;
}
