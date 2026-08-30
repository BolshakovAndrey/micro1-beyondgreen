# BG-H02 behavior-first specification — stargazing guide preview

**Status:** prose authored; pending coordinator hashing and repository-owner freeze approval  
**Fixture:** `BG-H02` (held-out)  
**Behavior class:** `async_ordering`  
**Challenging case:** **yes — predeclared before fixture code**  
**Requirements:** `FR-002`–`FR-006`, `EV-001`, `EV-002`, `EV-005`, `EV-006`, `EV-010`, `EV-013`, `AR-006`

This packet freezes only independently authored behavior and provenance intent. No
fixture implementation, candidate, test, executable manifest, oracle, or scored
artifact exists for BG-H02 at this checkpoint.

## User, domain, and bottleneck

The product user is a frontend engineer reviewing an existing React state-to-signals
migration. The synthetic component previews short stargazing guides selected for a
community astronomy evening. Guide content comes from a deterministic in-memory
deferred source controlled by the future fixture; there is no network or real clock.

The risk is completion-order inversion. An operator can select guide A and then
guide B before A finishes. If B completes first, a later completion from A must not
overwrite the preview for the newer selection. Single-request tests and sequential
requests that finish before the next selection can remain green while overlapping
out-of-order completion violates the user-visible contract.

The domain, guide identifiers, text, action sequence, and observables below are
project-authored synthetic expression unrelated to an employer, client, or
production workflow.

## Why BG-H02 is the predeclared challenging case

Correctness depends on logical request order rather than wall-clock order. The
scenario contains overlapping deferred work, a newer success that arrives first, an
older success that arrives later, and a reset while another request is pending. A
valid checker must bind each completion to the current selection epoch without
using sleeps, timing tolerances, network behavior, or evaluator feedback. This
combination is more demanding than a single settled synchronous transition and is
therefore frozen as the challenging case before any fixture code exists.

## Public anchors

- `SRC-REACT-EFFECTS`: React's public “Synchronizing with Effects” documentation,
  <https://react.dev/learn/synchronizing-with-effects>, accessed 2026-08-28. It
  contributes only the general synchronization/cleanup class for work associated
  with current React state.
- `SRC-REACT-SNAPSHOT`: React's public “State as a Snapshot” documentation,
  <https://react.dev/learn/state-as-a-snapshot>, accessed 2026-08-28. It contributes
  only the general fact that an asynchronous continuation can retain values from the
  render in which it was created.

Both sources remain under the React documentation site's copyright and terms. They
are cited for consultation only; no source expression, example, component structure,
or test is redistributed or copied.

The selected future signals dependency is the already frozen
`@preact/signals-react@3.12.0`, licensed MIT. This prose contains no package source
and does not prescribe implementation syntax.

## Arm-visible model

The preview exposes:

- `selectedGuideId`: `none`, `GUIDE-MOON`, `GUIDE-METEOR`, or `GUIDE-COMET`;
- `status`: `idle`, `loading`, or `ready`;
- `content`: `none` or the content associated with the latest selected guide; and
- an ordered user-action log.

Selecting a guide creates one future fixture-owned deferred request and immediately
sets `selectedGuideId` to that guide, `status` to `loading`, and `content` to `none`.
The source returns a request handle to the harness. The harness completes handles
explicitly, so completion order is deterministic and contains no timer.

Only completion associated with the current selection epoch may change the preview.
A stale completion is a successful no-op: it produces no transient render, log
entry, error, retry, or later mutation. `reset` creates a new empty epoch and returns
the preview to its initial values.

Settled means the explicit source completion and resulting React/signal work have
completed at the declared deterministic microtask/render boundary.

## Frozen observable scenario

The source mapping is synthetic and public to the behavior contract:

- `GUIDE-MOON` -> `Moon craters`;
- `GUIDE-METEOR` -> `Meteor paths`; and
- `GUIDE-COMET` -> `Comet tails`.

The canonical actions and results are:

1. `mount`: selection `none`, status `idle`, content `none`.
2. `select-moon`: selection `GUIDE-MOON`, status `loading`, content `none`; create
   request `R1`.
3. `select-meteor`: selection `GUIDE-METEOR`, status `loading`, content `none`;
   create request `R2` while `R1` remains pending.
4. `complete-R2`: selection remains `GUIDE-METEOR`, status becomes `ready`, content
   becomes `Meteor paths`.
5. `complete-R1`: every observable remains exactly as after `complete-R2`.
6. `select-comet`: selection `GUIDE-COMET`, status `loading`, content `none`; create
   request `R3`.
7. `reset`: selection `none`, status `idle`, content `none`.
8. `complete-R3`: every observable remains exactly as after `reset`.

The user-action log is exactly `[mount, select-moon, select-meteor, select-comet,
reset]`. Source completions do not enter the user-action log.

## Frozen observable invariants

- Selection actions are ordered, and the last successful selection defines the only
  current request epoch.
- Selecting a guide clears prior content synchronously and exposes `loading` for the
  new guide.
- A current request completion atomically produces the selected guide's content and
  `ready` status.
- Completion of any older epoch, whether before or after a newer completion, cannot
  change selection, status, content, or user-action log.
- `reset` invalidates all pending request epochs and deterministically restores the
  initial observation.
- Completing an invalidated handle repeatedly is either rejected by the synthetic
  source or remains an observable no-op; it can never reapply content.
- Exactly one deferred request is created per successful guide selection. The
  component performs no automatic retry or speculative duplicate request.
- No transient stale content may be visible at the settled boundary or in the
  future verifier's render observation sequence.
- Network, clock, random input, arbitrary sleep, console errors, unhandled
  rejections, and machine data cannot affect the result.

## Visible legacy-test blind spot

The future shared visible gate may check mount, one guide selection, loading state,
one current completion, a fully settled request followed by a second selection, and
reset when no request is pending. It must not keep two requests pending, complete
them out of selection order, reset while a request is pending, inspect verifier-only
paths, or encode a candidate-specific defect.

This omission is the frozen blind spot: green visible tests prove ordinary loading
but not latest-selection-wins behavior under overlap.

## Future candidate contracts — no candidate code

The preserving candidate must compile, pass every visible assertion, and satisfy all
invariants above. It must bind every completion to the current logical epoch without
depending on elapsed time or completion order.

The seeded false-green candidate must also compile and pass every visible assertion.
It may contain exactly one defect family: every successful deferred completion writes
to the preview even when its request epoch is no longer current. The same missing
epoch guard may explain both the late `R1` overwrite and the post-reset `R3`
overwrite; no unrelated error, duplicate request, or nondeterminism may be seeded.

Candidate bytes, hashes, ground truth, and defect annotation will be frozen only in
a later separately approved wave and must remain immutable during verification.

## Oracle and capability boundary — no oracle data or code

Both scored arms may receive this behavior contract, the future deterministic source
interface, and arm-visible contracts. Only a later verifier-only package may own the
executable completion schedule, exact serialized render observations, ground-truth
labels, oracle digests, and defect annotation.

Before verdict immutability, each arm must be physically unable to mount, list, stat,
read, hash, import, or distinguish diagnostics from the verifier-only package. The
independent evaluator executes afterward. `K=0` prohibits expected values, failed
steps, category, schedule diagnostics, diffs, candidate labels, or repair hints from
flowing to an arm. Access attempts, missing capability proof, nondeterminism,
evaluator mismatch, or incomplete evidence fail closed and block scoring.

## Planned future files and checks — not created by this wave

Subject to separate owner approval, a later wave may create:

- `candidates/BG-H02/preserving/StargazingGuidePreview.ts`;
- `candidates/BG-H02/false-green/StargazingGuidePreview.ts`;
- `evaluation/arm-visible/BG-H02/contract.ts`, `deferred-source.ts`, `harness.ts`,
  `visible-assertions.ts`, and `visible.test.ts`;
- `evaluation/verifier-only/BG-H02/canonical-driver.ts`, `ground-truth.json`, and
  `self-check.test.ts`;
- separate candidate, arm-visible, verifier-only, challenging-case, and fixture
  freeze manifests; and
- fixture-local compile, visible-gate, evaluator self-check, denied-access,
  immutability, manifest, deterministic schedule, and replay checks.

These paths are plans only. They do not authorize or assert the existence of any
implementation, test, oracle, or executable manifest.

## Expected failure modes

- `R1` overwrites the already ready `R2` preview.
- A stale completion causes a transient wrong render even if a later render recovers.
- `R3` restores content after reset.
- The current completion is incorrectly ignored along with stale completions.
- Completion order is inferred with timers or sleeps and becomes nondeterministic.
- One selection creates duplicate requests or a hidden retry.
- Candidate or manifest bytes change during verification.
- An arm can infer verifier-only schedule, observations, labels, or path existence.

## Stop conditions

Stop and request repository-owner review if provenance or licensing is uncertain; a
private or external path appears; the design resembles remembered non-public
structure; any candidate, test, oracle, executable manifest, benchmark result, model
call, or browser artifact appears in this freeze wave; the predeclared challenging
label is lost; held-out oracle content is exposed; or a contamination finding cannot
be cleared by independent recreation.

