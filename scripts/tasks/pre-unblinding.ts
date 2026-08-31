/** Registers bounded readiness controls that cannot perform official or scored execution. */
import { nodeStep } from "./helpers.ts";
import type { TaskDefinition } from "./types.ts";

const visibleTests = [
  "evaluation/arm-visible/BG-D01/visible.test.ts",
  "evaluation/arm-visible/BG-D02/BG-D02-visible.test.ts",
  "evaluation/arm-visible/BG-D03/visible.test.ts",
  "evaluation/arm-visible/BG-D04/visible.test.ts",
  "evaluation/arm-visible/BG-H01/visible.test.ts",
  "evaluation/arm-visible/BG-H02/visible.test.ts",
  "evaluation/arm-visible/BG-H03/visible.test.ts",
  "evaluation/arm-visible/BG-H04/visible.test.ts",
  "evaluation/arm-visible/BG-H05/visible.test.ts",
  "evaluation/arm-visible/BG-H06/visible.test.ts",
] as const;

const evaluatorTests = [
  "evaluation/verifier-only/BG-D01/self-check.test.ts",
  "evaluation/verifier-only/BG-D02/BG-D02-self-check.test.ts",
  "evaluation/verifier-only/BG-D03/self-check.test.ts",
  "evaluation/verifier-only/BG-D04/self-check.test.ts",
  "evaluation/verifier-only/BG-H01/self-check.test.ts",
  "evaluation/verifier-only/BG-H02/self-check.test.ts",
  "evaluation/verifier-only/BG-H03/self-check.test.ts",
  "evaluation/verifier-only/BG-H04/self-check.test.ts",
  "evaluation/verifier-only/BG-H05/self-check.test.ts",
  "evaluation/verifier-only/BG-H06/self-check.test.ts",
] as const;

export const preUnblindingTasks: readonly TaskDefinition[] = [
  {
    name: "freeze:self-test",
    description: "Verify all 20 frozen candidates, manifests, evaluator controls, and oracle boundaries without scoring.",
    steps: [
      nodeStep("frozen cardinality", "scripts/d00-freeze-cardinality.ts"),
      nodeStep("BG-D01 immutable manifests", "scripts/d01-manifests.ts"),
      nodeStep("D02-D04 immutable manifests", "scripts/development-manifests.ts"),
      nodeStep("H01-H06 immutable manifests", "scripts/held-out-manifests.ts"),
      nodeStep("repository compilation", "node_modules/typescript/bin/tsc", "-p", "tsconfig.json", "--noEmit"),
      nodeStep("20-candidate visible gates", "--test", ...visibleTests),
      nodeStep("10/10 evaluator ground truth", "--test", ...evaluatorTests),
      nodeStep("BG-D01 reciprocal oracle denial", "--test", "tests/d01-boundary.test.ts"),
      nodeStep("BG-D02 complete isolation control", "scripts/BG-D02-verify.mjs"),
      nodeStep("BG-D03/BG-D04 reciprocal oracle denial", "--test", "tests/development-fixture-isolation.test.ts"),
      nodeStep("H01-H06 reciprocal denial and cardinality", "--test", "tests/all-fixtures.integration.test.ts"),
      nodeStep("held-out oracle leak scan", "scripts/held-out-leak-scan.ts"),
      nodeStep("final frozen cardinality", "scripts/d00-freeze-cardinality.ts"),
    ],
  },
  {
    name: "baseline:verify",
    description: "Validate the frozen baseline command contract without executing an official arm run.",
    acceptedArguments: ["--evaluation-version", "eval-v1.1.0"],
    steps: [nodeStep(
      "baseline pre-unblinding contract",
      "scripts/d00-pre-unblinding-entrypoint.ts",
      "baseline",
      "--evaluation-version",
      "eval-v1.1.0",
    )],
  },
  {
    name: "beyondgreen:verify",
    description: "Validate the frozen BeyondGreen command contract without executing an official arm run.",
    acceptedArguments: ["--evaluation-version", "eval-v1.1.0"],
    steps: [nodeStep(
      "BeyondGreen pre-unblinding contract",
      "scripts/d00-pre-unblinding-entrypoint.ts",
      "beyondgreen",
      "--evaluation-version",
      "eval-v1.1.0",
    )],
  },
  {
    name: "evaluation:run",
    description: "Execute the one owner-approved official evaluation through the production isolation root.",
    acceptedArguments: ["--evaluation-version", "eval-v1.1.0"],
    steps: [nodeStep(
      "official evaluation execution",
      "scripts/d00-official-run.ts",
      "--evaluation-version",
      "eval-v1.1.0",
    )],
  },
  {
    name: "replay",
    description: "Validate the frozen offline replay contract and reproduce existing unscored D01 evidence.",
    acceptedArguments: ["--evaluation-version", "eval-v1.1.0"],
    steps: [
      nodeStep(
        "offline replay pre-unblinding contract",
        "scripts/d00-pre-unblinding-entrypoint.ts",
        "replay",
        "--evaluation-version",
        "eval-v1.1.0",
      ),
      nodeStep("existing unscored D01 offline replay", "scripts/d01-replay.ts"),
    ],
  },
  {
    name: "submission:rehearse",
    description: "Build, clean-extract, verify, and delete a temporary manifest-backed non-release ZIP.",
    steps: [nodeStep("temporary clean-extraction ZIP rehearsal", "scripts/d00-zip-rehearsal.ts")],
  },
];
