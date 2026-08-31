/** Verifier-owned BG-H04 lifecycle actions without lifecycle expectations. */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-H04:canonical-actions:v1",
  steps: Object.freeze([
    { action: "observe", parameters: {} },
    { action: "dispatch", parameters: { value: { type: "activate" } } },
    { action: "dispatch", parameters: { value: { type: "edit-draft", value: "check" } } },
    { action: "dispatch", parameters: { value: { type: "deactivate" } } },
    { action: "dispatch", parameters: { value: { type: "set-source-note", value: "focus" } } },
    { action: "dispatch", parameters: { value: { type: "activate" } } },
    { action: "dispatch", parameters: { value: { type: "deactivate" } } },
    { action: "dispose", parameters: {} },
  ]),
});
