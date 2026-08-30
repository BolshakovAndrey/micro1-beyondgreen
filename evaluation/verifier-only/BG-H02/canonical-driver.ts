/** Implements the verifier-only BG-H02 deterministic completion-order oracle. */
import assert from "node:assert/strict";

import type { GuidePreviewObservation, StargazingGuideComponent } from "../../arm-visible/BG-H02/contract.ts";
import { mountStargazingGuidePreview } from "../../arm-visible/BG-H02/harness.ts";

type Expected = Readonly<{ label: string; selectedGuideId: string; status: string; content: string; log: readonly string[]; requests: readonly string[] }>;
const expected: readonly Expected[] = [
  { label: "mount", selectedGuideId: "none", status: "idle", content: "none", log: ["mount"], requests: [] },
  { label: "select-moon", selectedGuideId: "GUIDE-MOON", status: "loading", content: "none", log: ["mount", "select-moon"], requests: ["R1"] },
  { label: "select-meteor", selectedGuideId: "GUIDE-METEOR", status: "loading", content: "none", log: ["mount", "select-moon", "select-meteor"], requests: ["R1", "R2"] },
  { label: "complete-R2", selectedGuideId: "GUIDE-METEOR", status: "ready", content: "Meteor paths", log: ["mount", "select-moon", "select-meteor"], requests: ["R1", "R2"] },
  { label: "complete-R1", selectedGuideId: "GUIDE-METEOR", status: "ready", content: "Meteor paths", log: ["mount", "select-moon", "select-meteor"], requests: ["R1", "R2"] },
  { label: "select-comet", selectedGuideId: "GUIDE-COMET", status: "loading", content: "none", log: ["mount", "select-moon", "select-meteor", "select-comet"], requests: ["R1", "R2", "R3"] },
  { label: "reset", selectedGuideId: "none", status: "idle", content: "none", log: ["mount", "select-moon", "select-meteor", "select-comet", "reset"], requests: ["R1", "R2", "R3"] },
  { label: "complete-R3", selectedGuideId: "none", status: "idle", content: "none", log: ["mount", "select-moon", "select-meteor", "select-comet", "reset"], requests: ["R1", "R2", "R3"] },
];
function assertObservation(actual: GuidePreviewObservation, value: Expected): void { assert.equal(actual.selectedGuideId, value.selectedGuideId); assert.equal(actual.status, value.status); assert.equal(actual.content, value.content); assert.deepEqual(actual.actionLog, value.log); assert.deepEqual(actual.createdRequestIds, value.requests); }

/** Is the bounded result returned only to verifier self-checks. */
export type OracleResult = Readonly<{ accepted: boolean; failedAction: string | null; behaviorClass: "async_ordering" }>;

/** Evaluates captured observations without exposing schedule expectations to arms. */
export function evaluateCanonicalObservations(observations: readonly GuidePreviewObservation[]): OracleResult {
  if (observations.length !== expected.length) return Object.freeze({ accepted: false, failedAction: "observation-count", behaviorClass: "async_ordering" });
  for (const [index, value] of expected.entries()) { try { assertObservation(observations[index]!, value); } catch { return Object.freeze({ accepted: false, failedAction: value.label, behaviorClass: "async_ordering" }); } }
  return Object.freeze({ accepted: true, failedAction: null, behaviorClass: "async_ordering" });
}

/** Runs the canonical reverse-completion scenario only in verifier self-checks. */
export async function evaluateCanonicalScenario(Component: StargazingGuideComponent): Promise<OracleResult> {
  const preview = await mountStargazingGuidePreview(Component);
  try {
    const observations = [preview.observe()];
    const moon = await preview.select("GUIDE-MOON", "select-moon"); observations.push(moon.observation);
    const meteor = await preview.select("GUIDE-METEOR", "select-meteor"); observations.push(meteor.observation);
    observations.push(await preview.complete(meteor.handle));
    observations.push(await preview.complete(moon.handle));
    const comet = await preview.select("GUIDE-COMET", "select-comet"); observations.push(comet.observation);
    observations.push(await preview.reset());
    observations.push(await preview.complete(comet.handle));
    return evaluateCanonicalObservations(observations);
  } finally { await preview.dispose(); }
}
