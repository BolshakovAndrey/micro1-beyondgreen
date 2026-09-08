#!/usr/bin/env node
/** Generates or verifies the manifest and complete submission-candidate checksums. */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  loadSubmissionExclusions,
  partitionSubmissionPaths,
} from "./submission-membership.ts";
const REQUIRED = [
  ["README.md", "Project entry point, problem, result, and fastest reproduction", "Problem & User Value; Measured Improvement"],
  ["Makefile", "Stable judge command surface", "Reproducibility"],
  ["docs/SUBMISSION_REPORT.md", "Evidence-first judging report", "All criteria"],
  ["docs/ARCHITECTURE.md", "Agents, boundaries, sequence, and failure handling", "Agent Solution & Engineering"],
  ["docs/EVALUATION.md", "Frozen evaluation contract and final metrics", "Measured Improvement"],
  ["docs/IMPROVEMENT_CHANGELOG.md", "Evidence-linked iteration history", "Measured Improvement; Hot Take / Insights"],
  ["docs/REPRODUCTION.md", "Clean-environment reproduction guide", "Reproducibility"],
  ["docs/DISCLOSURES.md", "Provenance, safety, licenses, and limitations", "Qualification gate"],
  ["docs/VIDEO_SCRIPT.md", "Under-five-minute demo narrative", "End-to-End Quality"],
  ["docs/VIDEO_LINK.md", "Public video reference and access check", "End-to-End Quality"],
  ["artifacts/claims.yaml", "Machine-checkable claims ledger", "Measured Improvement"],
  ["artifacts/trajectories/index.yaml", "Representative coding-agent trace index", "Agent Solution & Engineering"],
  ["submission/CHECKLIST.md", "Qualification and rubric release gate", "Qualification gate"],
] as const;

const root = process.cwd();
const configuredExclusions = loadSubmissionExclusions(root);
const manifestPath = path.join(root, "submission/MANIFEST.yaml");
const checksumsPath = path.join(root, "submission/SHA256SUMS");
const sha256 = (filePath: string): string => createHash("sha256").update(readFileSync(filePath)).digest("hex");

const repositoryFiles = (): readonly string[] => {
  const result = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: root, encoding: "utf8", shell: false,
  });
  if (result.status !== 0) throw new Error("Cannot enumerate repository files.");
  return partitionSubmissionPaths(
    result.stdout.split("\0").filter(Boolean),
    configuredExclusions,
  ).included;
};

const yamlQuote = (value: string): string => JSON.stringify(value);

/** Compute stable manifest and checksum bytes without mutating source evidence. */
export const buildSubmissionMetadata = (): Readonly<{manifest: string; checksums: string}> => {
  const files = repositoryFiles();
  for (const [file] of REQUIRED) if (!files.includes(file)) throw new Error(`Missing required artifact: ${file}`);
  if (readFileSync(path.join(root, "docs/VIDEO_LINK.md"), "utf8").includes("PENDING_OWNER_PUBLIC_URL")) {
    throw new Error("Public video URL and signed-out access check are still pending.");
  }
  if (readFileSync(path.join(root, "submission/CHECKLIST.md"), "utf8").includes("- [ ]")) {
    throw new Error("Submission qualification checklist still contains blocking items.");
  }
  const artifacts = REQUIRED.map(([file, purpose, rubric]) => [
    `  - path: ${yamlQuote(file)}`,
    `    purpose: ${yamlQuote(purpose)}`,
    `    rubric_criteria: ${yamlQuote(rubric)}`,
    "    inclusion_status: \"included\"",
    `    sha256: \"${sha256(path.join(root, file))}\"`,
  ].join("\n"));
  const manifest = [
    "schema_version: \"1.0\"",
    "status: \"submission_candidate_pending_final_owner_gate\"",
    `file_count_excluding_sha256sums: ${files.filter((file) => file !== "submission/SHA256SUMS").length}`,
    "configured_submission_exclusions:",
    ...configuredExclusions.map((file) => `  - ${yamlQuote(file)}`),
    "artifacts:",
    ...artifacts,
    "",
  ].join("\n");
  const digests = files
    .filter((file) => file !== "submission/SHA256SUMS")
    .map((file) => `${sha256(path.join(root, file))}  ${file}`);
  return Object.freeze({ manifest, checksums: `${digests.join("\n")}\n` });
};

const expectedBeforeManifestWrite = buildSubmissionMetadata();
if (process.argv.includes("--write")) {
  writeFileSync(manifestPath, expectedBeforeManifestWrite.manifest);
  const expectedAfterManifestWrite = buildSubmissionMetadata();
  writeFileSync(checksumsPath, expectedAfterManifestWrite.checksums);
  process.stdout.write(`SUBMISSION_METADATA_WRITTEN files=${expectedAfterManifestWrite.checksums.trim().split("\n").length}\n`);
} else {
  const expected = buildSubmissionMetadata();
  if (readFileSync(manifestPath, "utf8") !== expected.manifest
    || readFileSync(checksumsPath, "utf8") !== expected.checksums) {
    throw new Error("Submission manifest or SHA256SUMS is stale.");
  }
  process.stdout.write(`SUBMISSION_METADATA_VERIFIED files=${expected.checksums.trim().split("\n").length}\n`);
}
