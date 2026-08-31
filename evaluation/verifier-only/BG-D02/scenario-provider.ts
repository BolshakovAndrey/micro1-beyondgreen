/**
 * Verifier-owned BG-D02 actions released only after every arm decision is immutable.
 * The export intentionally contains no evaluator outcome or diagnostic fields.
 */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-D02:canonical-actions:v1",
  steps: Object.freeze([
    { action: "observe", parameters: {} },
    { action: "dispatch", parameters: { value: { type: "select-all" } } },
    { action: "dispatch", parameters: { value: { type: "queue", entries: 2 } } },
    { action: "dispatch", parameters: { value: { type: "flush" } } },
    { action: "dispatch", parameters: { value: { type: "set-unit", value: 3 } } },
    { action: "dispatch", parameters: { value: { type: "queue", entries: 2 } } },
    { action: "dispatch", parameters: { value: { type: "select-even" } } },
    { action: "dispatch", parameters: { value: { type: "flush" } } },
    { action: "dispatch", parameters: { value: { type: "reset" } } },
    { action: "dispatch", parameters: { value: { type: "reset" } } },
  ]),
});
