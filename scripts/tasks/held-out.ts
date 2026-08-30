/** Registers bounded, non-official verification for all six held-out fixtures. */
import { nodeStep } from "./helpers.ts";
import type { TaskDefinition } from "./types.ts";

const fixtureIds = ["BG-H01", "BG-H02", "BG-H03", "BG-H04", "BG-H05", "BG-H06"] as const;

const fixtureTasks = fixtureIds.map((fixtureId, index): TaskDefinition => ({
  name: `h0${index + 1}:verify`,
  description: `Run complete frozen ${fixtureId} visible, evaluator, isolation, and manifest verification.`,
  steps: [
    nodeStep(`${fixtureId} visible gate`, "--test", `evaluation/arm-visible/${fixtureId}/visible.test.ts`),
    nodeStep(`${fixtureId} evaluator self-check`, "--test", `evaluation/verifier-only/${fixtureId}/self-check.test.ts`),
    ...(index >= 4 ? [nodeStep(`${fixtureId} fixture isolation`, "--test", `evaluation/arm-visible/${fixtureId}/isolation.test.ts`)] : []),
    nodeStep(`${fixtureId} arm denial`, "--permission", `--allow-fs-read=evaluation/arm-visible/${fixtureId}`, `evaluation/arm-visible/${fixtureId}/denied-probe.mjs`),
    nodeStep(`${fixtureId} evaluator denial`, "--permission", `--allow-fs-read=evaluation/verifier-only/${fixtureId}`, `evaluation/verifier-only/${fixtureId}/evaluator-denied-probe.mjs`),
    nodeStep(`${fixtureId} manifests`, "scripts/held-out-manifests.ts", fixtureId),
  ],
}));

export const heldOutTasks: readonly TaskDefinition[] = [
  ...fixtureTasks,
  {
    name: "held-out:verify",
    description: "Run safe integrated H01-H06 fixture controls without official execution or unblinding.",
    steps: [
      ...fixtureTasks.flatMap(({ steps }) => steps),
      nodeStep("ten-fixture integration", "--test", "tests/all-fixtures.integration.test.ts"),
      nodeStep("held-out oracle leak scan", "scripts/held-out-leak-scan.ts"),
    ],
  },
];
