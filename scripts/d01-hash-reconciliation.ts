#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const manifestPaths = [
  "evaluation/manifests/BG-D01/arm-visible.manifest.json",
  "evaluation/manifests/BG-D01/verifier-only.manifest.json",
  "evaluation/manifests/BG-D01/candidate-a.manifest.json",
  "evaluation/manifests/BG-D01/candidate-b.manifest.json",
];

const digest = createHash("sha256");
for (const manifestPath of manifestPaths) {
  digest.update(manifestPath);
  digest.update("\0");
  digest.update(readFileSync(manifestPath));
}
process.stdout.write(`${digest.digest("hex")}\n`);
