/** Registers bounded verification for the integrated D02-D04 fixtures and D01-D04 regression. */
import { nodeStep } from "./helpers.ts";
import type { TaskDefinition } from "./types.ts";

export const developmentTasks: readonly TaskDefinition[] = [
  {
    name: "d02:verify",
    description: "Run the complete frozen BG-D02 fixture verification.",
    steps: [nodeStep("BG-D02 verification", "scripts/BG-D02-verify.mjs")],
  },
  {
    name: "d03:verify",
    description: "Run BG-D03 visible, evaluator, isolation, and manifest verification.",
    steps: [
      nodeStep("BG-D03 visible gate", "--test", "evaluation/arm-visible/BG-D03/visible.test.ts"),
      nodeStep("BG-D03 evaluator self-check", "--test", "evaluation/verifier-only/BG-D03/self-check.test.ts"),
      nodeStep("BG-D03 isolation", "--test", "tests/development-fixture-isolation.test.ts"),
      nodeStep("BG-D03 manifest", "scripts/development-manifests.ts", "BG-D03"),
    ],
  },
  {
    name: "d04:verify",
    description: "Run the complete frozen BG-D04 fixture verification.",
    steps: [nodeStep("BG-D04 verification", "scripts/BG-D04-verify.mjs")],
  },
  {
    name: "development:verify",
    description: "Run integrated descriptor, manifest, isolation, and cross-fixture D01-D04 regression checks.",
    steps: [
      nodeStep("development manifests", "scripts/development-manifests.ts"),
      nodeStep("development integration", "--test", "tests/development-fixtures.integration.test.ts"),
      nodeStep("development isolation", "--test", "tests/development-fixture-isolation.test.ts"),
      nodeStep("deterministic D01 replay", "scripts/d01-replay.ts"),
    ],
  },
];

