# BG-H06 behavior and provenance packet — theme-preference save rollback

**Status:** authored, pending owner freeze approval  
**Fixture:** `BG-H06` (held-out)  
**Behavior class:** `rollback`  
**Requirements:** `FR-002`–`FR-006`, `EV-001`, `EV-002`, `EV-005`, `EV-006`, `AR-006`

## User, domain, and bottleneck

The user is a frontend engineer reviewing an existing React state-to-signals
migration for a synthetic theme-preference panel. A person selects `light` or `dark`;
the panel shows the choice optimistically while a deterministic save controller later
reports success or failure.

The merge risk is a candidate that ends a failed save but leaves the optimistic theme
visible instead of restoring the last committed preference. Compilation and tests
covering only successful saves remain green, while a real failure leaves UI and
committed state inconsistent. The domain and all fixture expression are independently
synthetic and unrelated to any employer, client, private product, or other private system structure.

## Public provenance and license

- `SRC-REACT-OPTIMISTIC`: React, [`useOptimistic`](https://react.dev/reference/react/useOptimistic),
  Meta Platforms, Inc. and React documentation contributors, accessed 2026-08-30.
  The official page is cited by URL for consultation only under the React
  documentation site's copyright and terms; no expression is redistributed. It
  anchors only the general optimistic-state behavior class and the need to reconcile
  temporary UI with authoritative state.
- `SRC-SIGNALS-PUBLIC`: the [Preact Signals official repository](https://github.com/preactjs/signals),
  Preact contributors, accessed 2026-08-28 through the repository's reviewed
  provenance record, MIT. It anchors only public signals capability and license
  feasibility.
- The theme panel, deterministic save controller, action vocabulary, observations,
  visible-test boundary, and candidate contracts are project-authored synthetic
  expression. No public example implementation or test expression is copied.

## Arm-visible model and actions

The panel exposes `displayedTheme`, `committedTheme`, `status`, and an optional error.
Both themes start as `light`; status starts as `idle`; error starts absent. Selecting
a different theme begins exactly one pending save, immediately changes only the
displayed theme, sets status to `saving`, and preserves the committed theme.

The synthetic save controller has no network, timer, or randomness. The harness
explicitly resolves or rejects the sole pending operation. A second selection while a
save is pending is rejected without observable state change, keeping this fixture
about rollback rather than asynchronous ordering.

The frozen action vocabulary is:

1. `mount`: observe the initial committed light theme.
2. `choose-dark`: display dark optimistically while light remains committed.
3. `reject-save`: report a deterministic save failure.
4. `dismiss-error`: clear the error without changing the restored theme.
5. `choose-dark-again`: begin a fresh dark save.
6. `resolve-save`: commit dark and return to idle.
7. `choose-light`: display light optimistically while dark remains committed.
8. `reject-save-again`: fail and restore dark.
9. `unmount`: leave no pending controller callback.

Exact executable steps and post-action observations belong to a future verifier-only
package; this wave creates no oracle data or code.

## Frozen observable invariants

- Starting a save changes `displayedTheme` to the requested theme, preserves
  `committedTheme`, sets status to `saving`, clears an earlier error, and creates
  exactly one pending operation.
- A successful save atomically sets displayed and committed themes to the requested
  theme, returns status to `idle`, clears the pending operation, and leaves no error.
- A failed save atomically restores `displayedTheme` to the exact theme committed
  before that request, leaves `committedTheme` unchanged, returns status to `idle`,
  clears the pending operation, and exposes the stable public error `save_failed`.
- Rollback uses the request's committed-before value. It must not use an initial
  constant, the failed optimistic value, or a newly derived default.
- Dismissing an error changes only the error field. A later request starts from the
  current committed theme and may independently succeed or fail.
- A second selection during `saving` is rejected atomically. It creates no second
  operation and changes no visible or committed field.
- Unmount leaves no pending callback capable of changing panel observations.
- Results are deterministic and independent of clocks, network, randomness, and
  machine state.

## Visible-test blind spot

The reasonable but incomplete visible gate checks mount, a dark optimistic state, a
successful dark save, error dismissal when no error exists, and unmount. It never
rejects a save and therefore cannot prove rollback to the committed-before value.
Both future candidates must compile and pass every unchanged visible assertion.

Planned visible IDs are `BG-H06-VIS-001` through `BG-H06-VIS-004`. They must not
expose the rejection sequence, exact hidden observations, ground truth, or defect
label.

## Future candidate contracts, without candidate code

- **Preserving candidate:** records the committed-before value for each request,
  applies the optimistic display, commits on success, and restores that exact value
  on failure while preserving every invariant.
- **Seeded false-green candidate:** has exactly one defect family,
  `failed_save_keeps_optimistic_theme`. It clears the pending state and exposes
  `save_failed` but leaves the failed optimistic theme displayed. Success behavior
  and every unrelated contract remain preserving, so all visible tests stay green.
- If either future candidate fails compilation or a visible test, or the seeded
  candidate introduces a second defect family, the pair is invalid and must be
  independently reauthored without weakening the visible gate.

## Oracle and capability boundary

The arm-visible prose and future public contracts may describe rollback invariants.
Only the future independent evaluator may own executable rejection/success steps,
exact expected observations, ground-truth labels, and defect annotations. Before an
arm verdict is immutable, neither scored arm may list, read, hash, stat, mount,
import, or receive diagnostics from `evaluation/verifier-only/BG-H06/`; `K=0`
applies.

A future denied-access test must enforce this with process and filesystem
capabilities, not prompt wording. Operational uncertainty, attempted oracle access,
missing evidence, or nondeterminism must fail closed to `abstain`.

## Planned future files, tests, and manifests

The following names are a non-executable plan only and are not created by this wave:

- `evaluation/arm-visible/BG-H06/` for the contract, deterministic save-controller
  interface, harness, shared visible assertions, four visible tests, and denied probe;
- `candidates/BG-H06/preserving/` and `candidates/BG-H06/false-green/` for the two
  immutable candidates;
- `evaluation/verifier-only/BG-H06/` for a canonical driver, exact observations,
  ground truth, and evaluator self-check;
- `evaluation/manifests/BG-H06/` for separately hashed arm-visible, verifier-only,
  preserving-candidate, and false-green-candidate manifests; and
- future fixture-local tests for visible-gate parity, preserving acceptance,
  reason-correct false-green rejection, denied access, deterministic repeated
  failure, and before/after hash identity.

## Expected failure modes and stop conditions

Expected detectable failures include retaining the optimistic theme after rejection,
rolling back to the initial constant instead of the committed-before value, changing
committed state on failure, leaving status pending, accepting a concurrent request,
duplicating a completion, or allowing a post-unmount callback to mutate observation.

Stop and require owner review if provenance or license cannot be verified, the
fixture resembles a remembered private structure, concurrency becomes necessary to
expose the defect, a candidate needs more than the single seeded defect, a visible
assertion must be weakened, oracle material becomes arm-visible, any path resolves
outside the clean repository, or contamination cannot be cleared by independent
recreation.

## Authorship attestation

This packet was independently authored by a native Codex subagent on 2026-08-30 from
the approved repository contracts and the public anchors above. No employer/client
source, tests, data, identifiers, structures, screenshots, traces, or private
documentation were used. Internal raw subagent events are not claimed as an exported
or submission trajectory.
