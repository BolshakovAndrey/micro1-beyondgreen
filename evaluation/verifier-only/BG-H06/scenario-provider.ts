/** Verifier-owned BG-H06 actions with rollback outcomes deliberately omitted. */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-H06:canonical-actions:v1",
  steps: Object.freeze([
    { action: "observe", parameters: {} },
    { action: "dispatch", parameters: { value: { type: "choose", theme: "dark" } } },
    { action: "dispatch", parameters: { value: { type: "choose", theme: "light" } } },
    { action: "dispatch", parameters: { value: { type: "reject" } } },
    { action: "dispatch", parameters: { value: { type: "dismiss-error" } } },
    { action: "dispatch", parameters: { value: { type: "choose", theme: "dark" } } },
    { action: "dispatch", parameters: { value: { type: "resolve" } } },
    { action: "dispatch", parameters: { value: { type: "choose", theme: "light" } } },
    { action: "dispatch", parameters: { value: { type: "reject" } } },
    { action: "dispatch", parameters: { value: { type: "reject" } } },
  ]),
});
