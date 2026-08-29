import { nodeStep } from "./helpers.ts";
import type { TaskDefinition } from "./types.ts";

/** BG-D01-only orchestration, including its explicitly separated oracle self-check. */
export const d01Tasks: readonly TaskDefinition[] = [
  {
    name: "d01:hash",
    description: "Print the combined BG-D01 manifest digest.",
    steps: [nodeStep("BG-D01 hash reconciliation", "scripts/d01-hash-reconciliation.ts")],
  },
  {
    name: "d01:manifests:check",
    description: "Verify all four immutable BG-D01 manifests.",
    steps: [nodeStep("BG-D01 manifests", "scripts/d01-manifests.ts")],
  },
  {
    name: "d01:manifests:write",
    description: "Regenerate all four immutable BG-D01 manifests.",
    steps: [nodeStep("BG-D01 manifests", "scripts/d01-manifests.ts", "--write")],
  },
  {
    name: "d01:verify",
    description: "Compile and run the complete bounded BG-D01 verification path.",
    steps: [
      nodeStep("compile", "node_modules/typescript/bin/tsc", "-p", "tsconfig.json", "--noEmit"),
      nodeStep("five visible tests", "--test", "evaluation/arm-visible/BG-D01/visible.test.ts"),
      nodeStep("positive-step contract", "--test", "evaluation/arm-visible/BG-D01/step-contract.test.ts"),
      nodeStep("canonical oracle", "--test", "evaluation/verifier-only/BG-D01/self-check.test.ts"),
      nodeStep("physical oracle boundary", "--test", "tests/d01-boundary.test.ts"),
      nodeStep("immutable manifests", "scripts/d01-manifests.ts"),
    ],
  },
];
