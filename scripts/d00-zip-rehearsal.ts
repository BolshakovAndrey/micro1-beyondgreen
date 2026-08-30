#!/usr/bin/env node
/** Builds and verifies a temporary manifest-backed ZIP without creating release artifacts. */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

type ManifestEntry = Readonly<{path: string; sha256: string}>;
type ManifestExclusion = Readonly<{path: string; sourceSha256: string; reason: string}>;

const repositoryRoot = process.cwd();
const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "beyondgreen-pre-unblinding-zip-"));
const stagingRoot = path.join(temporaryRoot, "staging");
const extractionRoot = path.join(temporaryRoot, "extracted");
const archivePath = path.join(temporaryRoot, "beyondgreen-pre-unblinding-rehearsal.zip");
const rehearsalManifestPath = "submission/PRE_UNBLINDING_REHEARSAL_MANIFEST.json";
const approvedControlPlaneExclusions = new Set([
  "artifacts/trajectories/session-boundaries/SES-20260830-014.yaml",
  "artifacts/trajectories/reviews/BG-CHROMIUM-TS2532-INTEGRATION-SESSION-BOUNDARY-CHECKPOINT_RU.md",
]);

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function run(
  executable: string,
  arguments_: readonly string[],
  cwd: string,
  label: string,
  echoOutput = true,
): string {
  const result = spawnSync(executable, [...arguments_], {
    cwd,
    encoding: "utf8",
    env: process.env,
    shell: false,
  });
  process.stdout.write(`REHEARSAL_STEP ${label}\n`);
  if (echoOutput && result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error || result.status !== 0) {
    throw new Error(`${label} failed with exit ${result.status ?? "null"}: ${result.error?.message ?? "process failure"}`);
  }
  return result.stdout;
}

function repositoryFiles(): Readonly<{included: readonly string[]; excluded: readonly ManifestExclusion[]}> {
  const output = run(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    repositoryRoot,
    "repository membership",
    false,
  );
  const allFiles = output.split("\0").filter(Boolean).sort();
  const files = allFiles.filter((file) => !approvedControlPlaneExclusions.has(file));
  const excluded = allFiles
    .filter((file) => approvedControlPlaneExclusions.has(file))
    .map((file): ManifestExclusion => ({
      path: file,
      sourceSha256: sha256(path.join(repositoryRoot, file)),
      reason: "Owner-approved exclusion of a non-indexed control-plane service record containing a machine-local control path.",
    }));
  if (excluded.length !== approvedControlPlaneExclusions.size) {
    throw new Error("The exact owner-approved control-plane exclusion set is not present.");
  }
  if (files.length === 0 || new Set(files).size !== files.length) {
    throw new Error("Rehearsal repository membership is empty or duplicated.");
  }
  for (const file of files) {
    if (path.isAbsolute(file) || file.split("/").includes("..")) throw new Error(`Unsafe archive path: ${file}`);
    if (/^(?:\.git|node_modules|dist|tmp|raw-traces|\.private)(?:\/|$)/.test(file)) {
      throw new Error(`Forbidden archive member: ${file}`);
    }
    const source = path.resolve(repositoryRoot, file);
    const relative = path.relative(repositoryRoot, source);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Archive path escaped root: ${file}`);
    if (!lstatSync(source).isFile()) throw new Error(`Archive member is not a regular file: ${file}`);
  }
  return { included: files, excluded };
}

function extractedFiles(root: string, relativeDirectory = ""): string[] {
  const output: string[] = [];
  for (const entry of readdirSync(path.join(root, relativeDirectory), { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Extracted symlink is forbidden: ${relativePath}`);
    if (entry.isDirectory()) output.push(...extractedFiles(root, relativePath));
    else if (entry.isFile()) output.push(relativePath);
    else throw new Error(`Unsupported extracted entry: ${relativePath}`);
  }
  return output;
}

mkdirSync(stagingRoot, { recursive: true });
mkdirSync(extractionRoot, { recursive: true });

try {
  const { included: files, excluded } = repositoryFiles();
  const entries: ManifestEntry[] = [];
  for (const file of files) {
    const source = path.join(repositoryRoot, file);
    const target = path.join(stagingRoot, file);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(source, target);
    entries.push({ path: file, sha256: sha256(target) });
  }

  const manifest = {
    schemaVersion: "beyondgreen-pre-unblinding-zip-rehearsal@1.0.0",
    classification: "temporary_non_release_rehearsal",
    officialOrScoredRun: false,
    unblindingPerformed: false,
    finalSubmissionArchive: false,
    hashAlgorithm: "SHA-256",
    fileCountExcludingManifest: entries.length,
    entries,
    excludedControlPlaneRecords: excluded,
  };
  const manifestTarget = path.join(stagingRoot, rehearsalManifestPath);
  mkdirSync(path.dirname(manifestTarget), { recursive: true });
  writeFileSync(manifestTarget, `${JSON.stringify(manifest, null, 2)}\n`);

  run("/usr/bin/zip", ["-q", "-X", "-r", archivePath, "."], stagingRoot, "ZIP creation");
  run("/usr/bin/unzip", ["-q", archivePath, "-d", extractionRoot], temporaryRoot, "clean extraction");

  const extractedManifest = JSON.parse(
    readFileSync(path.join(extractionRoot, rehearsalManifestPath), "utf8"),
  ) as typeof manifest;
  if (extractedManifest.fileCountExcludingManifest !== entries.length) {
    throw new Error("Extracted rehearsal manifest cardinality mismatch.");
  }
  if (extractedManifest.excludedControlPlaneRecords.length !== approvedControlPlaneExclusions.size ||
      extractedManifest.excludedControlPlaneRecords.some(({ path: excludedPath, sourceSha256 }) =>
        !approvedControlPlaneExclusions.has(excludedPath) ||
        sourceSha256 !== sha256(path.join(repositoryRoot, excludedPath)))) {
    throw new Error("Extracted rehearsal manifest exclusion evidence mismatch.");
  }
  for (const entry of extractedManifest.entries) {
    if (sha256(path.join(extractionRoot, entry.path)) !== entry.sha256) {
      throw new Error(`Extracted archive digest mismatch: ${entry.path}`);
    }
  }
  const actualFiles = extractedFiles(extractionRoot).sort();
  const expectedFiles = [...files, rehearsalManifestPath].sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error("Extracted archive membership differs from the rehearsal manifest.");
  }

  run("npm", ["ci", "--ignore-scripts"], extractionRoot, "judge setup npm ci --ignore-scripts");
  run("npm", ["run", "compile"], extractionRoot, "judge compile");
  run("npm", ["test"], extractionRoot, "judge ordinary tests");
  run("npm", ["run", "task", "--", "freeze:self-test"], extractionRoot, "judge freeze self-test");
  for (const task of ["baseline:verify", "beyondgreen:verify", "evaluation:run", "replay"] as const) {
    run(
      "npm",
      ["run", "task", "--", task, "--evaluation-version", "eval-v1.1.0"],
      extractionRoot,
      `judge ${task} contract`,
    );
  }
  run(process.execPath, ["scripts/license-audit.ts"], extractionRoot, "judge license audit");

  process.stdout.write(
    `PRE_UNBLINDING_ZIP_REHEARSAL_PASSED files=${entries.length + 1} ` +
    "clean_extraction=true official_or_scored=false unblinding=false final_archive=false\n",
  );
}
finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
