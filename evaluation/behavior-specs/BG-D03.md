# BG-D03 — Community Garden Tray Planner

Status: frozen behavior-first specification<br>
Fixture ID: `BG-D03`<br>
Behavior class: `derived state`<br>
Evaluation membership: development<br>
Authored: 2026-08-30<br>
Requirements: `FR-002`, `FR-004`, `FR-005`, `EV-001`, `EV-002`, `AR-006`

## Public anchors

1. React, “You Might Not Need an Effect — Updating state based on props or state”:
   <https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state>
   Accessed 2026-08-30. Public documentation used only for the general rule that
   values derivable from current state should be calculated from that state instead
   of being stored as separately synchronized state.
2. Preact, “Signals — Deriving state via computed signals”:
   <https://preactjs.com/guide/v10/signals/#deriving-state-via-computed-signals>
   Accessed 2026-08-30. Public documentation used only for the general capability of
   expressing derived values with computed signals.

The implementation expression, domain, action sequence, visible tests, and hidden
checks are independently authored for this fixture. No source example was copied.
The selected runtime package is the already frozen MIT-licensed
`@preact/signals-react@3.12.0`.

## Neutral domain

A volunteer plans seedling trays for a community garden. Each seed variety occupies
a fixed number of cells per packet. The volunteer chooses how many packets of each
variety to plant inside a tray with a fixed cell capacity. This synthetic planning
domain has no relationship to an employer, client, or production workflow.

## User actions

1. Open a planner with a positive tray capacity and a fixed catalog of seed
   varieties.
2. Add a variety to the plan with one packet selected by default.
3. Change the packet count for an already selected variety to a positive integer.
4. Remove a selected variety.
5. Reset the plan to its empty state.

Invalid capacities, unknown variety identifiers, duplicate catalog identifiers, and
non-positive or non-integer packet counts are rejected without changing observable
planner state.

## Observable outputs

After every successful action, an observer can read:

- the selected varieties and their current packet counts;
- `occupiedCells`, the sum of `cellsPerPacket * packetCount` for every selected
  variety;
- `remainingCells`, equal to `capacity - occupiedCells` and allowed to be negative;
- `overCapacity`, true exactly when `remainingCells < 0`; and
- a rendered React summary containing the same three derived values.

Selection order follows first successful addition. Changing a packet count does not
move the variety. Removing and later re-adding it places it at the end.

## Invariants

1. `occupiedCells` is derived only from the current selected varieties, their current
   packet counts, and immutable catalog weights.
2. `remainingCells` is always exactly `capacity - occupiedCells`.
3. `overCapacity` is always exactly `remainingCells < 0`.
4. A successful packet-count change updates all three derived outputs in the same
   observable state; no stale intermediate summary is allowed.
5. Rejected actions are atomic and preserve both source and derived observables.
6. Reset clears the selection and restores `occupiedCells = 0`,
   `remainingCells = capacity`, and `overCapacity = false`.

## Visible legacy-test boundary

The visible suite checks initial values, addition, selection data, removal, reset,
and validation. It intentionally observes that a packet count changes in source
state but does not assert the derived totals after that action. Both frozen
candidates must compile and pass every visible assertion.

## Seeded false-green failure

The false-green migration stores `occupiedCells` as a second writable signal and
manually synchronizes it for add, remove, and reset. Its packet-count action updates
the selected source record but omits the duplicate total update. The selection looks
correct and all visible tests remain green, while `occupiedCells`, `remainingCells`,
`overCapacity`, and the React summary become stale after that action.

The preserving migration computes all derived outputs from the current selection and
catalog, so every successful source-state action is reflected without a separate
synchronization path.

## Verifier-only behavioral sequence

The verifier begins from a fresh planner, adds a variety, changes its packet count,
then observes source and derived values together. It also crosses the tray-capacity
boundary through a packet-count change and checks the negative remainder and
`overCapacity` transition. Exact catalog values and expected observations belong to
the verifier-only package and are not part of the arm-visible task.

## Freeze declaration

This prose is the sole behavior-first source for BG-D03 implementation. Candidate
and oracle code may be authored only after its exact bytes receive a recorded
SHA-256 digest. Later prose edits require a new digest and explicit human review
before the fixture can become submission eligible.
