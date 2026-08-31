import { nodeStep } from "./helpers.ts";
import type { TaskDefinition } from "./types.ts";

/** Register official controls separately from the explicitly owner-gated execution. */
export const officialTasks: readonly TaskDefinition[] = [
  {
    name: "official:preflight",
    description: "Validate the frozen 10x2 inventory and build a non-executable 20-slot/two-arm plan.",
    steps: [nodeStep("official static inventory and execution plan", "scripts/d00-official-preflight.ts")],
  },
  {
    name: "transport:canary",
    description: "Run one public non-scored production-transport health check without evaluation data.",
    steps: [nodeStep("public production transport canary", "scripts/d00-transport-canary.ts")],
  },
];
