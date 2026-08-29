import { discoverAllTests } from "./discovery.ts";
import { nodeStep } from "./helpers.ts";
import type { TaskDefinition } from "./types.ts";

/** Stable repository-wide tasks with no fixture-specific package.json entries. */
export const commonTasks: readonly TaskDefinition[] = [
  {
    name: "checksums:check",
    description: "Verify the repository control checksum projection.",
    steps: [nodeStep("control checksums", "scripts/reconcile-control-checksums.ts")],
  },
  {
    name: "checksums:write",
    description: "Regenerate the repository control checksum projection.",
    steps: [nodeStep("control checksums", "scripts/reconcile-control-checksums.ts", "--write")],
  },
  {
    name: "test:all",
    description: "Run every ordinary test discovered inside the bounded public roots.",
    steps: [nodeStep("bounded ordinary tests", "--test", ...discoverAllTests())],
  },
];
