import { nodeStep } from "./helpers.ts";
import type { TaskDefinition } from "./types.ts";

/** Register the bounded static preflight; it cannot execute an arm or candidate. */
export const officialTasks: readonly TaskDefinition[] = [{
  name: "official:preflight",
  description: "Validate the frozen 10x2 inventory and build a non-executable 20-slot/two-arm plan.",
  steps: [nodeStep("official static inventory and execution plan", "scripts/d00-official-preflight.ts")],
}];
