#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type PackageDefinition = Readonly<{
  id: string;
  kind: "arm_visible" | "verifier_only" | "candidate";
  output: string;
  files: readonly string[];
}>;

const definitions: readonly PackageDefinition[] = [
  {
    id: "BG-D01-arm-visible",
    kind: "arm_visible",
    output: "evaluation/manifests/BG-D01/arm-visible.manifest.json",
    files: [
      "evaluation/arm-visible/BG-D01/LegacyMuseumBoard.ts",
      "evaluation/arm-visible/BG-D01/contract.ts",
      "evaluation/arm-visible/BG-D01/denied-probe.mjs",
      "evaluation/arm-visible/BG-D01/harness.ts",
      "evaluation/arm-visible/BG-D01/render.ts",
      "evaluation/arm-visible/BG-D01/step-contract.test.ts",
      "evaluation/arm-visible/BG-D01/visible.test.ts",
    ],
  },
  {
    id: "BG-D01-verifier-only",
    kind: "verifier_only",
    output: "evaluation/manifests/BG-D01/verifier-only.manifest.json",
    files: [
      "evaluation/verifier-only/BG-D01/canonical-driver.ts",
      "evaluation/verifier-only/BG-D01/ground-truth.json",
      "evaluation/verifier-only/BG-D01/self-check.test.ts",
    ],
  },
  {
    id: "BG-D01-candidate-a",
    kind: "candidate",
    output: "evaluation/manifests/BG-D01/candidate-a.manifest.json",
    files: ["candidates/BG-D01/candidate-a/MuseumBoard.ts"],
  },
  {
    id: "BG-D01-candidate-b",
    kind: "candidate",
    output: "evaluation/manifests/BG-D01/candidate-b.manifest.json",
    files: ["candidates/BG-D01/candidate-b/MuseumBoard.ts"],
  },
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
    fixture_id: "BG-D01",
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
