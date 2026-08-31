/** Verifier-owned BG-H05 store actions without store-state expectations. */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-H05:canonical-actions:v1",
  steps: Object.freeze([
    { action: "observe", parameters: {} },
    { action: "toolbar-write", parameters: { unit: "imperial" } },
    { action: "external-write", parameters: { unit: "metric" } },
    { action: "unmount-south", parameters: {} },
    { action: "external-write", parameters: { unit: "imperial" } },
    { action: "remount-south", parameters: {} },
    { action: "external-write", parameters: { unit: "imperial" } },
    { action: "dispose", parameters: {} },
  ]),
});
