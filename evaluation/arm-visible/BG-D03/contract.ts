/** Public behavior contract shared with a candidate evaluator. */
export const BG_D03_VISIBLE_CONTRACT = {
  fixtureId: "BG-D03",
  behaviorClass: "derived_state",
  guarantees: [
    "Selection actions preserve insertion order.",
    "Invalid actions preserve observable planner state.",
    "A reset restores an empty selection.",
  ],
  intentionallyUnobserved: [
    "Derived totals immediately after a packet-count change.",
  ],
} as const;
