/**
 * Verifier-owned BG-D03 actions released only after every arm decision is immutable.
 * The export contains inputs and observation requests, never evaluator conclusions.
 */
export const NEUTRAL_SCENARIO_PROVIDER_EXPORT = Object.freeze({
  scenarioId: "BG-D03:canonical-actions:v1",
  steps: Object.freeze([
    { action: "construct", parameters: { capacity: 8, varieties: [{ id: "radish", label: "Radish", cellsPerPacket: 3 }] } },
    { action: "add", parameters: { varietyId: "radish" } },
    { action: "set-packet-count", parameters: { varietyId: "radish", packetCount: 3 } },
    { action: "observe", parameters: {} },
    { action: "render-summary", parameters: {} },
  ]),
});
