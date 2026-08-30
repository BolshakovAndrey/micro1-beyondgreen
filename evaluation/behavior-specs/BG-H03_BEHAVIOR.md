# BG-H03 behavior-first specification — community seed-library selection desk

**Status:** authoring complete; pending coordinator digest and repository-owner freeze approval  
**Fixture:** `BG-H03` (held-out)  
**Behavior class:** identity stability  
**Requirements:** `FR-002`–`FR-006`, `EV-001`–`EV-006`, `EV-010`, `AR-006`  
**Boundary:** `SES-20260830-010`

This packet freezes only independently authored behavior and provenance. It creates
no fixture, candidate, test, oracle, executable manifest, benchmark result, or model
output. The neutral domain and all fixture-specific expression are synthetic and
unrelated to any employer, client, or private system.

## User, domain, and merge risk

The user is a frontend engineer reviewing an existing React state-to-signals
migration for a synthetic community seed-library selection desk. A volunteer selects
one collection and edits an unrelated public search note while a downstream preview
consumer observes a `SelectionHandle` object for the selected collection.

The public fields can remain correct while the migration recreates the handle on
every unrelated render. That reference-identity change is observable to consumers:
it restarts a dependency keyed by the handle and records a needless preview
attachment. Value-only legacy tests can stay green while the identity contract is
broken.

## Public provenance and license

The following public anchors were selected from repository-approved source classes
and were not fetched during this task:

- `SRC-REACT-IDENTITY`: React, “Preserving and Resetting State”,
  <https://react.dev/learn/preserving-and-resetting-state>, accessed `2026-08-30`.
  It supplies only the general public context that identity governs preservation;
  fixture-specific object-reference behavior remains project-authored.
- `SRC-PREACT-SIGNALS-LICENSE`: the public `preactjs/signals` repository license,
  <https://github.com/preactjs/signals/blob/main/LICENSE>, accessed `2026-08-30`,
  records the selected signals project as MIT-licensed.

React documentation is cited by URL for consultation only under the site's copyright
and terms; no documentation content is redistributed. No example code, prose,
component shape, DOM structure, or test expression is copied. The seed-library
domain, identifiers, values, actions, observations, and candidate contracts are
project-authored under the repository project license, subject to final owner review.

## Arm-visible vocabulary and settlement

Collections have stable IDs `herbs`, `flowers`, and `grains`. A `SelectionHandle`
is an immutable public object containing the selected collection ID and its fixed
display label. Its object reference is part of observable behavior.

The desk also exposes a search note string and an ordered event log. A preview
consumer attaches to the current handle by reference and exposes a cumulative
`previewAttachmentCount`. “Settled” means the synchronous action and the declared
React render/effect settlement boundary have completed. Time delays, network,
randomness, and machine state are not correctness inputs.

## Canonical scenario

1. `mount`: select `herbs`, expose one `SelectionHandle` for `herbs`, empty search
   note, attachment count `1`, and log `[mount]`.
2. `note-spring`: set the search note to `spring`; the selected ID, handle reference,
   and attachment count remain unchanged.
3. `note-summer`: set the note to `summer`; the same handle reference and attachment
   count remain unchanged again.
4. `select-flowers`: select `flowers`; expose a new handle reference containing
   `flowers`, increment attachment count exactly once to `2`, and preserve the note.
5. `note-autumn`: set the note to `autumn`; retain the exact flowers handle reference
   and attachment count `2`.
6. `select-flowers-again`: repeat the already-selected ID; this is an idempotent
   selection and must not replace the handle or increment the attachment count.
7. `select-herbs`: select `herbs`; expose a new handle reference relative to the
   flowers handle and increment attachment count exactly once to `3`.
8. `reset`: restore selected ID `herbs` and empty note. Because `herbs` is already
   selected, reset retains the current herbs handle reference and attachment count
   `3`; it appends `reset` to the log.

## Frozen observable invariants

- The selected ID is always one of the three declared collection IDs.
- A handle's ID and label agree with the selected collection and never mutate.
- Unrelated note changes preserve the exact current handle reference.
- Re-selecting the current collection preserves the exact handle reference.
- Selecting a different collection creates exactly one new handle reference.
- The preview consumer attaches once on mount and exactly once per real handle
  replacement; it does not attach for note edits or idempotent selections.
- Note edits never change the selected collection; selection edits never change the
  note.
- The ordered log records exactly one deterministic label per user action.
- Repeating any canonical run from a fresh mount produces the same values and
  equality relationships; no external input influences the result.

## Visible-test blind spot

The later visible gate may assert mount values, note editing, selection value
changes, labels, reset values, and ordered log labels. It must deliberately compare
serialized values only. It must not retain handle references across actions, inspect
`previewAttachmentCount` after unrelated changes, or assert idempotent re-selection.
This is a realistic incomplete value-oriented suite, not a trivial gate.

Both future candidates must compile and pass every visible assertion. Candidate
authors may not weaken this blind spot after seeing implementation behavior.

## Future candidate contracts — no candidate code in this wave

- The preserving candidate must keep one handle object while the selected ID is
  unchanged and replace it exactly once when the selected ID changes.
- The seeded false-green candidate may contain exactly one defect family: it creates
  a value-equivalent handle during an unrelated render or idempotent selection,
  causing an extra preview attachment.
- The false-green candidate must preserve selected values, labels, note values,
  action log, reset values, compilation, and all visible assertions.
- Neither candidate may contain a second seeded defect, candidate-specific test hook,
  oracle hint, nondeterministic input, or implementation copied from a public
  example. Candidate bytes and ground truth will freeze only in a later separately
  approved wave.

## Oracle and capability boundary

This prose may be arm-visible. A future verifier-only package may own reference
tokens, exact cross-step identity comparisons, attachment-count observations,
ground-truth labels, and defect annotations. None exists in this wave.

Both scored arms must be physically unable to mount, enumerate, read, hash, or infer
the future verifier-only package before their decisions are immutable. `K=0` permits
no expected identity, failed step, category, diff, label, or repair hint to return to
an arm. A denied-access attempt, missing evidence, nondeterminism, or evaluator hash
mismatch fails closed and blocks scoring.

## Planned future files, tests, and manifests

Names below are plans, not authorization and not executable manifests:

- `evaluation/arm-visible/BG-H03/`: public contract, minimal harness, visible
  assertions, and visible tests;
- `candidates/BG-H03/preserving/` and `candidates/BG-H03/false-green/`;
- `evaluation/verifier-only/BG-H03/`: canonical driver, identity assertions,
  ground truth, and evaluator self-check;
- `evaluation/manifests/BG-H03/`: separately hashed behavior, arm-visible,
  verifier-only, and candidate manifests;
- fixture-local future checks for compilation, all visible assertions, evaluator
  acceptance/rejection, candidate immutability, and physical access denial.

## Expected failure modes and stop conditions

Expected detectable failures include unnecessary handle recreation, attachment-count
inflation, stale handle values, mutation of a prior handle, missing replacement on a
real selection change, accidental note reset, nondeterministic effect settlement,
and oracle-boundary failure.

Stop and require owner review if a public license cannot be confirmed; a proposed
artifact resembles remembered private structure; any external/private path or hidden
oracle content appears; the false-green candidate would need a second defect; either
candidate cannot pass the unchanged visible gate; identity settlement is
nondeterministic; or any implementation, test, oracle, benchmark, model, Chromium,
commit, or push action is proposed before its separate approval.

## Current freeze gate

Coordinator capture `TRC-BG-HELDOUT-FREEZE-001` must add exact file digests, validate
the ten-class bijection and 4/6 split, run the two authorized safe preflights, and
present complete EN/RU owner materials. Until separate owner freeze approval, this
packet is an authored candidate only and authorizes no product bytes.
