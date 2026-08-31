/** Neutral post-decision actions; evaluator outcomes remain verifier-private. */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-D01:canonical-neutral-v1",
  steps: Object.freeze([
    { action: "observe", parameters: {} },
    { action: "dispatch", parameters: { value: { type: "select-all" } } },
    { action: "dispatch", parameters: { value: { type: "allocate", multiplicity: 2 } } },
    { action: "dispatch", parameters: { value: { type: "set-step", value: 3 } } },
    { action: "dispatch", parameters: { value: { type: "allocate", multiplicity: 2 } } },
    { action: "dispatch", parameters: { value: { type: "select-every-third" } } },
    { action: "dispatch", parameters: { value: { type: "remove", multiplicity: 1 } } },
    { action: "dispatch", parameters: { value: { type: "reset" } } },
    { action: "dispose", parameters: {} },
  ]),
});
