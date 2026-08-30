#!/usr/bin/env node
/** Checks code-owned D01 package manifests and immutable candidate source digests. */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { D01_FIXTURE } from "../src/d01/fixture.ts";

type PackageDefinition = Readonly<{
  id: string;
  kind: "arm_visible" | "verifier_only" | "candidate";
  output: string;
  files: readonly string[];
}>;

const definitions: readonly PackageDefinition[] = [
  {
    id: D01_FIXTURE.armVisible.packageId,
    kind: "arm_visible",
    output: D01_FIXTURE.armVisible.manifestPath,
    files: D01_FIXTURE.armVisible.sourcePaths,
  },
  {
    id: D01_FIXTURE.verifierOnly.packageId,
    kind: "verifier_only",
    output: D01_FIXTURE.verifierOnly.manifestPath,
    files: D01_FIXTURE.verifierOnly.sourcePaths,
  },
  ...D01_FIXTURE.candidateIds.map((candidateId): PackageDefinition => ({
    id: D01_FIXTURE.candidates[candidateId].packageId,
    kind: "candidate",
    output: D01_FIXTURE.candidates[candidateId].manifestPath,
    files: [D01_FIXTURE.candidates[candidateId].sourcePath],
  })),
];

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function buildManifest(definition: PackageDefinition) {
  const sourceFiles = definition.files.map((file) => ({
    path: file,
    sha256: sha256(readFileSync(path.resolve(file))),
  }));
  const packageSha256 = sha256(sourceFiles.map((file) => `${file.path}\0${file.sha256}\n`).join(""));
  return {
    schema_version: "1.0",
    fixture_id: D01_FIXTURE.fixtureId,
    package_id: definition.id,
    package_kind: definition.kind,
    immutable: true,
    hash_algorithm: "SHA-256",
    source_files: sourceFiles,
    package_sha256: packageSha256,
  };
}

const write = process.argv.includes("--write");
let valid = true;
for (const definition of definitions) {
  const serialized = `${JSON.stringify(buildManifest(definition), null, 2)}\n`;
  if (write) {
    writeFileSync(path.resolve(definition.output), serialized);
    process.stdout.write(`WROTE ${definition.output}\n`);
    continue;
  }
  let existing = "";
  try {
    existing = readFileSync(path.resolve(definition.output), "utf8");
  }
  catch {
    valid = false;
  }
  if (existing !== serialized) {
    valid = false;
    process.stderr.write(`MISMATCH ${definition.output}\n`);
  }
}

if (!write && valid) process.stdout.write("BG-D01_MANIFESTS_VERIFIED\n");
if (!valid) process.exitCode = 1;
