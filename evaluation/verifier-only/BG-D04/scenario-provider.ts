/** Verifier-owned BG-D04 action sequence with all evaluator-owned fields omitted. */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-D04:canonical-actions:v1",
  steps: Object.freeze([
    { action: "observe", parameters: {} },
    { action: "dispatch", parameters: { value: { type: "publish", channel: "harbor", value: 2 } } },
    { action: "dispatch", parameters: { value: { type: "switch", channel: "orchard" } } },
    { action: "dispatch", parameters: { value: { type: "publish", channel: "harbor", value: 5 } } },
    { action: "dispatch", parameters: { value: { type: "publish", channel: "orchard", value: 3 } } },
    { action: "dispatch", parameters: { value: { type: "reset" } } },
    { action: "dispose", parameters: {} },
  ]),
});
