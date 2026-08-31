/** Verifier-owned BG-H01 action sequence with no evaluator answers or diagnostics. */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-H01:canonical-actions:v1",
  steps: Object.freeze([
    { action: "mount", parameters: { card: { cardId: "CARD-01", initialTitle: "Moon map", initialTheme: "blue" } } },
    { action: "dispatch", parameters: { value: { type: "edit-title", value: "Lunar map" } } },
    { action: "rerender", parameters: { card: { cardId: "CARD-01", initialTitle: "Moon map", initialTheme: "blue" }, transitionLabel: "rerender-card-01" } },
    { action: "rerender", parameters: { card: { cardId: "CARD-02", initialTitle: "Meteor guide", initialTheme: "amber" }, transitionLabel: "switch-card-02" } },
    { action: "dispatch", parameters: { value: { type: "edit-theme", value: "green" } } },
    { action: "rerender", parameters: { card: { cardId: "CARD-01", initialTitle: "Moon map", initialTheme: "blue" }, transitionLabel: "switch-card-01" } },
    { action: "dispatch", parameters: { value: { type: "reset-current" } } },
  ]),
});
