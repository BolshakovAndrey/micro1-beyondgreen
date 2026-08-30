# TRC-BG-D01-SCALE-003 — Reviewed implementation trajectory

## Source and review boundary

- Source: repository-owner-selected Codex Desktop `Copy as Markdown` export.
- Immutable external capture: 49,485 bytes, SHA-256
  `0fe4e5b8be4ffff71b849bda538e4ecc6d2d44b94a9dcfdf423b1209855d4400`.
- Capture receipt and the owner-supplied clipboard bytes matched exactly and passed a
  strict UTF-8 byte round-trip before semantic review.
- The raw scan found two absolute machine-path occurrences and no private-term,
  email, or secret-assignment matches. Machine paths are omitted categorically from
  this submission layer; no private path or raw content is disclosed.
- This is a chronological reviewed projection, not a claimed verbatim native layer.
  Hidden reasoning, internal Codex Desktop events, and complete shell stdout are not
  claimed.

## Authorization and bounded objective

The task created `SES-20260830-003` before product inspection. The repository owner
approved one eligible implementation trajectory limited to four confirmed D01
acceptance blockers: the generic engine path, falsifiable capability evidence,
recursive package binding, and current-state projection reconciliation. The approval
explicitly preserved `SCALE_READY=false` and prohibited official/scored execution,
live model calls, Claude, Chromium, BG-D02, evaluation-methodology or frozen-input
changes, commit, and push.

## Chronology, changes, and retained decisions

### Generic execution path

The real orchestrator, arm, observer, evaluator, replay, and report now traverse one
injected `FixtureEngineBindings` descriptor dispatcher. D01 remains the only real
data-only composition root. `BoardObservation` is explicitly injected outside the
generic schema layer. A `TEST-ONLY` descriptor traverses the real dispatcher and
proves invocation of injected schemas, checks, reasoning, evaluator selection,
replay, and report bindings without creating BG-D02 or another scored fixture.

### Falsifiable capability evidence

Launch and worker identity are digest-bound. Sandbox and allowed-path policies are
canonically recomputed. Role, profile, execution slot, and proof must form an exact
bijection. Each arm follows an exact event state machine, and evaluator events bind
to the immutable decision digest of their arm. Offline replay independently
recalculates `reasonCorrectReject` and `oracleAcceptedCandidate`. Missing, changed,
contradictory, reordered, or cross-process evidence fails closed.

### Recursive package binding

Normalized recursive comparison now accepts valid nested registered structures. A
direct negative test changes the bytes of an already registered nested source and
proves fail-closed rejection. Unlisted files, symlinks, escapes, duplicates, source
mismatch, and manifest tamper remain rejected.

### Projection reconciliation

Only current-state projections and append-only iteration records were reconciled.
The five visible assertions, D01 candidate bytes, behavior freeze, verifier oracle,
evaluation methodology, targets, and denominators were not changed.

## Failures, owner checkpoints, and retries

1. Initial compilation stopped with `TS2688` because unchanged lockfile dependencies
   were not installed. The owner authorized `npm ci` from the unchanged lockfile and
   exactly one compile retry. It installed 54 packages and reported zero
   vulnerabilities.
2. The retry stopped on five bounded TypeScript errors: three `executionSlot` errors
   and two cyclic `D01_ENGINE` inference errors. The owner authorized only those
   corrections and one compile retry; compilation passed.
3. The first test-output capture was incomplete. An unchanged authoritative rerun
   reported `51/55`, with four `Candidate observation evidence is invalid` failures.
4. Bounded diagnosis found that the observer used the first descriptor arm instead
   of the immutable decision arm. The owner authorized only that correction and one
   compile/test pair. Both passed. The vertical manifest was then mechanically
   regenerated before targeted verification.
5. Safe wrappers initially failed closed because the delegated worktree was not the
   authorized root. The owner authorized a handoff; the coordinator preserved the
   pre-handoff checkout in a named stash, corrected only the control-thread
   classification, and reran the approved wrappers in the authorized root.
6. The first clipboard comparison correctly rejected a changed 171-byte clipboard.
   The owner recopied the native task export without recapturing raw evidence. The
   second comparison matched the external receipt and passed strict UTF-8. The large
   verified payload exceeded the coordinator output window, so semantic review was
   completed against the original task transcript through the Codex app rather than
   storing another raw repository copy.

## Verification evidence

- `npm run compile`: passed.
- `npm test`: passed `55/55` with `TASK_PASSED test:all`.
- `npm run task -- d01:verify`: visible `5/5`, step `1/1`, oracle `3/3`, physical
  boundary `4/4`, vertical `19/19`, unscored E2E, immutable manifests, and the
  30-file vertical manifest passed.
- Vertical manifest SHA-256:
  `d6e199439b41b0edd5c842bcdcf7f8c386863b37cf0e00f737abfef62c3eae5b`.
- Evidence JSON SHA-256:
  `e68895a8ae55374173ab4dc7462bdffcf820abaa082f01efb0cb2c32cb9a7e70`.
- Static HTML SHA-256:
  `458e09c1589c013a5753c17e2a215b76b9a2b8aabb6e220bef39acd1a4e014ff`.
- Safe control preflight: `READY_FOR_CLEAN_BRANCH`.
- Safe implementation preflight: `READY_FOR_IMPLEMENTATION`, with only the expected
  dirty-worktree warning and four binary human-review notices.
- Control checksums before this reviewed layer: `196/196`; after reconciliation:
  `200/200`. `git diff --check` passed.
- Contamination findings: zero.

## Current disposition

The repository owner approved the technically reviewed, privacy-safe trajectory as
eligible implementation evidence, and it is indexed in `actual_traces`. Trajectory
eligibility is independent from the later Codex acceptance matrix.
`SCALE_READY=false`; no official/scored run, live model, Claude, Chromium, BG-D02,
frozen-input or methodology change, commit, or push occurred.
