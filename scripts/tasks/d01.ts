/** Registers bounded D01 verification, replay, manifest, and demonstration tasks. */
import { nodeStep } from "./helpers.ts";
import type { TaskDefinition } from "./types.ts";
import { D01_FIXTURE } from "../../src/d01/fixture.ts";

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
    description: "Compile and run the complete approved BG-D01 vertical-slice verification path.",
    steps: [
      nodeStep("compile", "node_modules/typescript/bin/tsc", "-p", "tsconfig.json", "--noEmit"),
      nodeStep("five visible tests", "--test", `${D01_FIXTURE.armVisible.rootPath}/visible.test.ts`),
      nodeStep("positive-step contract", "--test", `${D01_FIXTURE.armVisible.rootPath}/step-contract.test.ts`),
      nodeStep("canonical oracle", "--test", `${D01_FIXTURE.verifierOnly.rootPath}/self-check.test.ts`),
      nodeStep("physical oracle boundary", "--test", "tests/d01-boundary.test.ts"),
      nodeStep("vertical-slice contracts", "--test", "tests/d01-vertical-slice.test.ts"),
      nodeStep("unscored E2E check", "scripts/d01-demo.ts", "--check"),
      nodeStep("immutable manifests", "scripts/d01-manifests.ts"),
      nodeStep("vertical-slice manifest", "scripts/d01-vertical-manifest.ts"),
    ],
  },
  {
    name: "d01:demo",
    description: "Generate the unscored BG-D01 JSON and static HTML demonstration evidence.",
    steps: [nodeStep("unscored D01 demo", "scripts/d01-demo.ts")],
  },
  {
    name: "d01:replay",
    description: "Replay submitted BG-D01 evidence offline without subprocess or workspace writes.",
    steps: [nodeStep("offline D01 replay", "scripts/d01-replay.ts")],
  },
  {
    name: "d01:vertical:manifest:check",
    description: "Verify the immutable BG-D01 vertical-slice source manifest.",
    steps: [nodeStep("vertical-slice manifest", "scripts/d01-vertical-manifest.ts")],
  },
  {
    name: "d01:vertical:manifest:write",
    description: "Regenerate the immutable BG-D01 vertical-slice source manifest.",
    steps: [nodeStep("vertical-slice manifest", "scripts/d01-vertical-manifest.ts", "--write")],
  },
];
