import { nodeStep } from "./helpers.ts";
import type { TaskDefinition } from "./types.ts";

/**
 * Safe Phase 0.5 reproduction only. Historical live model, diagnostic, network,
 * and Chromium launch commands are intentionally not registered here.
 */
export const phase05Tasks: readonly TaskDefinition[] = [
  {
    name: "phase0.5:verify",
    description: "Run frozen Phase 0.5 audits and harness tests without live execution.",
    steps: [
      nodeStep(
        "license audit",
        "scripts/license-audit.ts",
        "--output",
        "artifacts/phase-0.5-license-audit.json",
        "--notices",
        "THIRD_PARTY_NOTICES.md",
      ),
      nodeStep("stack tests", "--test", "spikes/phase-0.5/stack-capabilities.test.ts"),
      nodeStep("model-adapter tests", "--test", "spikes/phase-0.5/model-probe.test.ts"),
      nodeStep("CLI diagnostic tests", "--test", "spikes/phase-0.5/cli-diagnostics.test.ts"),
      nodeStep("doctor diagnostic tests", "--test", "spikes/phase-0.5/doctor-diagnostic.test.ts"),
      nodeStep("network diagnostic tests", "--test", "spikes/phase-0.5/network-diagnostic.test.ts"),
      nodeStep("Chromium harness tests", "--test", "spikes/phase-0.5/chromium-runner.test.ts"),
    ],
  },
];
