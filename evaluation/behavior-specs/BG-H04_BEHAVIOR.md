# BG-H04 behavior-first specification — neighborhood astronomy checklist drawer

**Status:** authoring complete; pending coordinator digest and repository-owner freeze approval  
**Fixture:** `BG-H04` (held-out)  
**Behavior class:** conditional lifecycle  
**Requirements:** `FR-002`–`FR-006`, `EV-001`–`EV-006`, `EV-010`, `AR-006`  
**Boundary:** `SES-20260830-010`

This packet contains independently authored prose and provenance only. It creates no
fixture implementation, candidate, test, oracle, executable manifest, benchmark
record, model call, or Chromium artifact. The domain is synthetic and unrelated to
any private system.

## User, domain, and merge risk

The user is a frontend engineer reviewing an existing React state-to-signals
migration for a synthetic neighborhood astronomy checklist. A coordinator opens a
conditional “station notes” drawer only while a telescope station is active. The
drawer owns a draft initialized from the current station note and one lifecycle
registration used to count active drawers.

A migration can render the drawer permanently and merely hide it when inactive.
Visible text tests may still pass, but the child has not unmounted: its draft
survives, its lifecycle registration remains active, and reopening does not create a
fresh instance from the latest parent note.

## Public provenance and license

The anchors below are public repository-approved source classes and were not fetched
during this task:

- `SRC-REACT-IDENTITY`: React, “Preserving and Resetting State”,
  <https://react.dev/learn/preserving-and-resetting-state>, accessed `2026-08-30`.
  It supplies only the general fact that component position/identity governs state
  preservation and reset.
- `SRC-REACT-EFFECTS`: React, “Synchronizing with Effects”,
  <https://react.dev/learn/synchronizing-with-effects>, accessed `2026-08-30`. It
  supplies only the general public setup/cleanup lifecycle concept.
- `SRC-PREACT-SIGNALS-LICENSE`: <https://github.com/preactjs/signals/blob/main/LICENSE>,
  accessed `2026-08-30`, MIT.

React documentation is cited by URL for consultation only under the site's copyright
and terms; no documentation content is redistributed. No source example, prose,
code, DOM layout, or test expression is copied. The astronomy domain, identifiers,
notes, counters, actions, and candidate contracts are project-authored synthetic
expression under the repository project license, subject to final owner review.

## Arm-visible vocabulary and settlement

The parent has station ID `north-pad`, a source note, and an `active` flag. The
conditional drawer exists only when active. On mount it copies the current source
note into its local draft and establishes one lifecycle registration. It exposes a
monotonic instance generation, cumulative mount and cleanup counts, and current
active-registration count.

“Settled” means the action, conditional React commit, cleanup/setup work, and declared
microtask/render boundary have completed. Arbitrary sleeps, network, clocks,
randomness, and machine state are excluded.

## Canonical scenario

1. `mount-parent`: parent source note `align`, inactive; drawer absent; mounts `0`,
   cleanups `0`, active registrations `0`.
2. `activate`: drawer instance generation `1` appears with draft `align`; mounts `1`,
   cleanups `0`, active registrations `1`.
3. `edit-draft-check`: local draft becomes `check`; parent source note remains
   `align`; instance and lifecycle counts remain unchanged.
4. `deactivate`: drawer becomes absent, generation `1` is destroyed; mounts `1`,
   cleanups `1`, active registrations `0`.
5. `source-note-focus`: while inactive, parent source note becomes `focus`; no drawer
   exists and no mount or registration occurs.
6. `activate-again`: a fresh generation `2` appears with draft initialized to
   `focus`; mounts `2`, cleanups `1`, active registrations `1`.
7. `deactivate-again`: drawer becomes absent; mounts `2`, cleanups `2`, active
   registrations `0`.
8. `unmount-parent`: no drawer exists, counts remain `2/2/0`, and the deterministic
   action log is complete.

## Frozen observable invariants

- Inactive means the drawer is absent, not visually hidden while mounted.
- Every inactive-to-active transition creates exactly one fresh drawer generation.
- Every active-to-inactive transition destroys that generation and performs exactly
  one cleanup before settlement.
- Active-registration count is exactly `1` while active and `0` while inactive.
- A new drawer draft copies the parent source note at that mount; a destroyed local
  draft never survives reopening.
- Editing a local draft does not mutate the parent source note.
- Changing the source note while inactive creates no drawer and triggers no drawer
  lifecycle work.
- Mount and cleanup counts are monotonic, and cleanups never exceed mounts.
- Each user action contributes exactly one deterministic log label.
- Fresh executions reproduce the same values and lifecycle ordering without external
  input.

## Visible-test blind spot

The later visible gate may assert initial absence, first activation and initial
draft, draft editing, and absence after the first deactivation. It may assert that
no drawer text is visible while inactive. It must not distinguish DOM absence from a
hidden mounted subtree, inspect lifecycle counters, update the parent source while
inactive, or perform the second activation.

Both future candidates must compile and pass all unchanged visible assertions. The
blind spot must not be widened or narrowed in response to candidate behavior.

## Future candidate contracts — no candidate code in this wave

- The preserving candidate must conditionally mount and unmount the drawer, clean up
  each generation, and initialize every new draft from the current parent note.
- The seeded false-green candidate may contain exactly one defect family: it keeps
  the drawer generation mounted while inactive and hides its output, preserving the
  stale local draft and active registration across reopening.
- The false-green candidate must preserve all first-cycle visible values, displayed
  absence, action labels, compilation, and visible tests. It may not add a separate
  timing, value, subscription-source, or reset defect.
- Candidate bytes, hashes, and labels are future separately approved artifacts and
  must remain immutable during verification.

## Oracle and capability boundary

This behavior prose may be arm-visible. The future verifier-only package may own
exact generation tokens, lifecycle-count observations, canonical second-activation
expectations, ground-truth labels, and defect annotations. None exists now.

Before immutable arm decisions, both arms must be capability-denied any mount,
enumeration, read, hash, or error-based inference of that package. Under `K=0`, the
evaluator returns no expected lifecycle count, failed action, category, diff, label,
or repair hint. Any access attempt, missing evidence, nondeterministic settlement,
or evaluator hash mismatch blocks scoring.

## Planned future files, tests, and manifests

These paths describe later intent only:

- `evaluation/arm-visible/BG-H04/`: public contract, minimal lifecycle harness,
  visible assertions, and visible tests;
- `candidates/BG-H04/preserving/` and `candidates/BG-H04/false-green/`;
- `evaluation/verifier-only/BG-H04/`: canonical driver, lifecycle assertions,
  ground truth, and self-check;
- `evaluation/manifests/BG-H04/`: separate behavior, package, candidate, and oracle
  digests;
- future fixture-local checks for compilation, visible green status, evaluator
  acceptance/rejection, byte immutability, deterministic settlement, and physical
  access denial.

## Expected failure modes and stop conditions

Expected failures include a hidden-but-mounted drawer, retained stale draft,
registration count `1` while inactive, missing or duplicate cleanup, reused
generation on reopening, draft initialization from an obsolete note, duplicate
mounts, nondeterministic lifecycle order, and oracle access.

Stop for owner review if provenance/license is uncertain; the design resembles a
remembered private structure; an external/private path or hidden oracle appears; a
second defect is needed; either candidate cannot keep the visible gate green;
settlement cannot be deterministic; or implementation, test, oracle, benchmark,
model, Chromium, commit, or push work is proposed before separate approval.

## Current freeze gate

Automatically captured coordinator trajectory `TRC-BG-HELDOUT-FREEZE-001` must add
exact digests, validate the 4/6 membership and ten-class bijection, confirm BG-H02 as
the predeclared challenging case, validate EN/RU parity and provenance, and run both
authorized safe preflights. This packet remains pending separate owner freeze
approval and authorizes no product bytes.
