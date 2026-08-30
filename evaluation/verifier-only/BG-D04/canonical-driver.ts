/** Implements the hidden BG-D04 canonical lifecycle oracle over settled observations. */
import assert from "node:assert/strict";
import type { ComponentType, Ref } from "react";

import type { BulletinAction, BulletinObservation, BulletinPanelHandle } from "../../arm-visible/BG-D04/contract.ts";
import { mountBulletinPanel } from "../../arm-visible/BG-D04/harness.ts";

type BulletinPanelComponent = ComponentType<{ ref?: Ref<BulletinPanelHandle> }>;

type CanonicalStep = Readonly<{
  action: BulletinAction | null;
  selectedChannel: "harbor" | "orchard";
  bulletin: string;
  subscribers: Readonly<{ harbor: number; orchard: number }>;
}>;

const STEPS: readonly CanonicalStep[] = Object.freeze([
  { action: null, selectedChannel: "harbor", bulletin: "none", subscribers: { harbor: 1, orchard: 0 } },
  { action: { type: "publish", channel: "harbor", value: 2 }, selectedChannel: "harbor", bulletin: "harbor:2", subscribers: { harbor: 1, orchard: 0 } },
  { action: { type: "switch", channel: "orchard" }, selectedChannel: "orchard", bulletin: "none", subscribers: { harbor: 0, orchard: 1 } },
  { action: { type: "publish", channel: "harbor", value: 5 }, selectedChannel: "orchard", bulletin: "none", subscribers: { harbor: 0, orchard: 1 } },
  { action: { type: "publish", channel: "orchard", value: 3 }, selectedChannel: "orchard", bulletin: "orchard:3", subscribers: { harbor: 0, orchard: 1 } },
  { action: { type: "reset" }, selectedChannel: "harbor", bulletin: "none", subscribers: { harbor: 1, orchard: 0 } },
]);

/** Reports the bounded post-decision ground-truth outcome for this behavior class. */
export type OracleResult = Readonly<{
  accepted: boolean;
  failedAction: string | null;
  behaviorClass: "subscription_cleanup";
}>;

/** Evaluates already captured observations, keeping candidate execution outside oracle ownership. */
export function evaluateCanonicalObservations(observations: readonly BulletinObservation[], unmountCounts: Readonly<{ harbor: number; orchard: number }>): OracleResult {
  if (observations.length !== STEPS.length) {
    return Object.freeze({ accepted: false, failedAction: "observation-count", behaviorClass: "subscription_cleanup" });
  }
  for (const [index, expected] of STEPS.entries()) {
    try {
      assert.deepEqual(observations[index], {
        selectedChannel: expected.selectedChannel,
        bulletin: expected.bulletin,
        subscribers: expected.subscribers,
      });
    }
    catch {
      return Object.freeze({ accepted: false, failedAction: `step-${index}`, behaviorClass: "subscription_cleanup" });
    }
  }
  if (unmountCounts.harbor !== 0 || unmountCounts.orchard !== 0) {
    return Object.freeze({ accepted: false, failedAction: "unmount", behaviorClass: "subscription_cleanup" });
  }
  return Object.freeze({ accepted: true, failedAction: null, behaviorClass: "subscription_cleanup" });
}

/** Executes the canonical scenario solely for verifier self-checks. */
export async function evaluateCanonicalScenario(Component: BulletinPanelComponent): Promise<OracleResult> {
  const panel = await mountBulletinPanel(Component);
  try {
    const observations: BulletinObservation[] = [panel.observe()];
    for (const step of STEPS.slice(1)) observations.push(await panel.dispatch(step.action!));
    const unmountCounts = await panel.dispose();
    return evaluateCanonicalObservations(observations, unmountCounts);
  }
  catch (error) {
    await panel.dispose();
    throw error;
  }
}
