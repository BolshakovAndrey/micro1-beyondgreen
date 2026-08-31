/** Verifier-owned BG-H03 action sequence with no identity expectations attached. */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-H03:canonical-actions:v1",
  steps: Object.freeze([
    { action: "observe", parameters: {} },
    { action: "dispatch", parameters: { value: { type: "set-note", value: "spring" } } },
    { action: "dispatch", parameters: { value: { type: "set-note", value: "summer" } } },
    { action: "dispatch", parameters: { value: { type: "select", id: "flowers" } } },
    { action: "dispatch", parameters: { value: { type: "set-note", value: "autumn" } } },
    { action: "dispatch", parameters: { value: { type: "select", id: "flowers" } } },
    { action: "dispatch", parameters: { value: { type: "select", id: "herbs" } } },
    { action: "dispatch", parameters: { value: { type: "reset" } } },
  ]),
});
