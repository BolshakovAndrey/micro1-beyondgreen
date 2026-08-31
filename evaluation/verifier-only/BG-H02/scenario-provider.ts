/** Verifier-owned BG-H02 scheduling actions with opaque request aliases only. */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-H02:canonical-actions:v1",
  steps: Object.freeze([
    { action: "observe", parameters: {} },
    { action: "select", parameters: { guideId: "GUIDE-MOON", handleAlias: "first", label: "select-moon" } },
    { action: "select", parameters: { guideId: "GUIDE-METEOR", handleAlias: "second", label: "select-meteor" } },
    { action: "complete", parameters: { handleAlias: "second" } },
    { action: "complete", parameters: { handleAlias: "first" } },
    { action: "select", parameters: { guideId: "GUIDE-COMET", handleAlias: "third", label: "select-comet" } },
    { action: "reset", parameters: {} },
    { action: "complete", parameters: { handleAlias: "third" } },
  ]),
});
