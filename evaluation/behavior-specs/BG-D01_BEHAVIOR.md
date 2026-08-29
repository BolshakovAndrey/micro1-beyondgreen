# BG-D01 behavior-first specification — museum visit group allocation board

**Status:** frozen; repository-owner approved at `2026-08-29T14:50:15Z`  
**Fixture:** `BG-D01` (development)  
**Behavior class:** stale snapshots  
**Requirements:** `FR-003`–`FR-006`, `EV-002`, `EV-005`, `EV-006`, `EV-012`, `AR-004`, `AR-006`  
**Boundary:** `SES-20260829-003`

This document freezes behavior and provenance before any fixture, candidate, or
oracle implementation exists. It is independently authored from the repository's
approved public React documentation anchors and neutral Phase 0.5 assignment. It
contains no employer/client source, test, name, structure, layout, or data.

## User and problem

The user is a frontend engineer reviewing an already-existing state-to-signals
migration for a museum visitor-services board. A coordinator uses the board to
select visit groups and adjust the number of visitors allocated to each group.

The merge risk is a lost update: a single user action may request two consecutive
adjustments, yet an implementation that reads the same stale state snapshot twice
can apply only one of them. Compilation and ordinary single-adjustment legacy tests
can remain green even though the coordinator sees the wrong totals.

The fixture is synthetic. The museum domain, identifiers, actions, values, and
ordering below were independently designed for BeyondGreen and do not model a real
organization or system.

## Public provenance

- `SRC-REACT-SNAPSHOT`: React's public “State as a Snapshot” documentation supplies
  only the general fact that a render observes a state snapshot.
- `SRC-REACT-QUEUE`: React's public “Queueing a Series of State Updates”
  documentation supplies only the general queued-update and functional-update
  behavior class.
- The museum visit group domain and every fixture-specific observable below are
  project-authored synthetic expression. No source example, code, DOM structure, or
  test expression is copied.

## Arm-visible state and actions

The board contains exactly 300 cards in ascending identifier order, `MVG-001`
through `MVG-300`. Each card exposes a non-negative integer allocation and a
selected/unselected state. The board exposes a positive integer bulk step and an
ordered action log.

Settled means all synchronous handlers and queued state work from the action have
completed, followed by the fixture's declared microtask and render-settlement
boundary. A future implementation must make that boundary deterministic; timing
delays are not part of correctness.

The canonical scenario is:

1. `mount`: create 300 ordered cards, every allocation `0`, step `1`, empty selection.
2. `select-all`: replace the selection with all 300 identifiers in ascending order.
3. `allocate-1x2`: one user action requests two consecutive `+step` adjustments for
   every selected card. When settled, all allocations are `2`.
4. `step-3`: set the visible bulk step to `3`; allocations and selection do not change.
5. `allocate-3x2`: one user action again requests two consecutive `+step`
   adjustments. When settled, all allocations are `8`.
6. `select-every-third`: replace the selection with exactly `MVG-003`, `MVG-006`,
   …, `MVG-300` in ascending order; allocations and step do not change.
7. `remove-3x1`: subtract the current step once from each selected card. When
   settled, the selected 100 cards are `5`; the other 200 remain `8`.
8. `reset`: restore every allocation to `0`, step to `1`, selection to empty, while
   retaining the complete canonical action log through `reset`.

The canonical ordered action log is exactly:

```text
[mount, select-all, allocate-1x2, step-3, allocate-3x2, select-every-third, remove-3x1, reset]
```

### Arm-visible action vocabulary

`allocate once` and `remove once` are permitted single-adjustment test actions. They
apply `+step` and `-step` respectively to selected cards. `allocate twice` is the
permitted double-adjustment action and requests two consecutive `+step` updates in
one user event. The canonical scenario uses the parameterized log labels
`allocate-1x2`, `allocate-3x2`, and `remove-3x1`, where the number before `x` is the
current step and the number after `x` is the requested multiplicity. Action-log
labels are deterministic: a given action, step, and multiplicity always emits the
same label. Single-adjustment test actions do not add new canonical-scenario steps.

## Observable invariants

- Card count, identifiers, and ascending presentation order never change.
- Allocation values are integers and never fall below zero; subtraction clamps at
  zero if a future arm-visible action would otherwise make a value negative.
- A bulk action changes selected cards only. Unselected cards preserve their prior
  allocations.
- A selection action replaces the selection; it does not append duplicates.
- The selection is unique and observable in ascending card order.
- Changing the step changes no allocation and no selection.
- One `allocate twice` event has the atomic observable effect `old + 2 * step` on
  each selected card. Both requested updates must accumulate from the latest logical
  value; reading the same stale snapshot twice must not lose an update.
- After each settled action, the visible values, selection, step, and ordered action
  log agree with the canonical scenario.
- Reset restores user-visible state exactly and is deterministic when repeated.
- No console error, unhandled rejection, external network dependency, clock input,
  random input, or machine-specific input may affect the result.

## Visible legacy-test contract

The visible gate is intentionally reasonable but incomplete. Candidate authors may
not weaken or rewrite it. Every future preserving and seeded false-green candidate
must compile and pass all visible tests.

| Visible test ID | Required visible assertion |
| --- | --- |
| `BG-D01-VIS-001` | Mount exposes 300 ordered IDs, allocations `0`, step `1`, and empty selection. |
| `BG-D01-VIS-002` | `select-all` selects all 300 IDs once and in ascending order. |
| `BG-D01-VIS-003` | A **single** `allocate once` action increases selected cards by the current step and leaves unselected cards unchanged. |
| `BG-D01-VIS-004` | Changing step to `3` changes no allocation; one `remove once` changes selected cards only and never produces a negative value. |
| `BG-D01-VIS-005` | `reset` restores allocations `0`, step `1`, and empty selection. |

The visible suite must not execute `allocate twice`, assert accumulation of two
queued adjustments, inspect verifier-only manifests, or encode a candidate-specific
defect. This omission creates the intended false-green opportunity without making
the visible gate trivial.

## Verifier-only oracle boundary

The public behavior contract above may be available to both scored arms. The future
verifier-only package alone owns the executable canonical driver, exact serialized
post-action observations, oracle hashes, ground-truth candidate labels, and any
defect-location annotation. Those artifacts do not exist at this checkpoint.

Neither scored arm may mount, enumerate, read, hash, infer from errors, or receive
output from `evaluation/verifier-only/` before its verdict is immutable. The
evaluator runs afterward in a separate capability boundary. `K=0` means it returns
no expected value, failed action, category, diff, label, or repair hint to an arm.
Denied access, missing evidence, nondeterminism, or evaluator version/hash mismatch
blocks scoring and cannot be converted into an arm-level `accept` or proven `reject`.

## Future candidate-construction rules

No candidate is constructed by this packet.

- The preserving candidate must be freshly and independently authored from this
  frozen prose, compile, pass every visible test, and satisfy every observable and
  future verifier-only check.
- The seeded false-green candidate must also compile and pass every visible test.
  It may seed exactly one minimal stale-snapshot defect family: the two adjustments
  requested by one `allocate twice` event do not both accumulate. It must preserve
  unrelated behavior so the result tests the declared class rather than general bad
  quality.
- Candidate identifiers, hashes, ground truth, defect annotation, arm-visible
  manifest, and verifier-only manifest freeze before either scored arm runs.
- Candidate source is immutable during verification. BeyondGreen may inspect it but
  may not edit, regenerate, repair, or request a second candidate.
- If either candidate fails compilation or any visible test, the pair is invalid and
  must be independently reauthored before benchmark freeze; the visible test is not
  weakened to accommodate it.
- Candidate authors must not consult a private artifact or implement from a
  remembered private structure. Any resemblance concern stops the task for owner
  review and independent recreation.

## Correctness acceptance criteria

The later D01 implementation checkpoint can pass only when:

1. EN/RU behavior prose and their hashes are frozen and owner-approved.
2. The arm-visible and verifier-only packages are separately hashed.
3. A capability test proves both arms are denied verifier-only access.
4. Both candidates compile and pass `BG-D01-VIS-001` through `005`.
5. The independent evaluator accepts the preserving candidate and rejects the
   false-green candidate for the frozen stale-snapshot invariant.
6. Candidate hashes are unchanged before and after each run.
7. Failures, abstentions, retries, and missing observations are preserved honestly.
8. Structural and real scanner-only contamination checks pass, followed by owner
   privacy/provenance review.

These criteria validate only this synthetic fixture and do not establish general or
production migration correctness.

## Relationship to synthetic render measurement

The frozen Phase 0.5 museum-board spike showed that identical synthetic behavior can
be instrumented and that one advanced implementation produced fewer card-render
calls in that scenario: 1900 versus 2400 per sample. Its mean CDP `TaskDuration` was
5.0037 ms versus 4.7071 ms for baseline, so it did **not** demonstrate CPU
improvement. That spike did not implement this fixture, candidates, legacy tests, or
oracle and is not an official benchmark result.

Future D01 render evidence is secondary and correctness-gated. Equal behavior must
be proved first. Render counts can describe only the fixed synthetic scenario; they
cannot prove lower production CPU use, user-perceived latency, statistical
significance, or general React performance.

## Cost and run accounting

The optional Codex CLI path uses a fixed-price subscription. Do not calculate,
estimate, cap, or optimize a per-run dollar cost. Reproducibility evidence records
the fixed-subscription billing mode, monetary-cost applicability/status, model/mode,
invocation count, timeout, retry policy, and other technical limits. Tokens are
recorded only if the CLI reports them explicitly and stably. Monetary cost is
`not_applicable` or `not_measured`, never zero or an estimate.

## Freeze and next gate

The repository owner confirmed `«Подтверждаю BG-D01 freeze»` at
`2026-08-29T14:50:15Z`. This English document, its full Russian companion, the
machine freeze record, provenance record, and Russian owner card are therefore the
frozen behavior/provenance source for future independently authored D01 work.
Approval permits only a request for a separate implementation checkpoint. It does
not authorize React/signals code, fixture/candidate/oracle implementation, model or
Chromium calls, an official or scored benchmark, commit, or push.
