# BG-H05 behavior and provenance packet — shared unit-preference store

**Status:** authored, pending owner freeze approval  
**Fixture:** `BG-H05` (held-out)  
**Behavior class:** `external_store`  
**Requirements:** `FR-002`–`FR-006`, `EV-001`, `EV-002`, `EV-005`, `EV-006`, `AR-006`

## User, domain, and bottleneck

The user is a frontend engineer reviewing an existing React state-to-signals
migration for a synthetic community workshop measurement board. Two independently
mounted readouts share one unit-preference store whose value is either `metric` or
`imperial`. A toolbar can write the store, and a separate calibration control can
write it outside either readout.

The merge risk is a migration that copies the initial store snapshot into component
state and keeps only its own toolbar writes synchronized. Local interactions look
correct, while a write made by another producer leaves one or more mounted consumers
stale. This fixture is independently synthetic and is unrelated to any employer,
client, private product, or other private system structure.

## Public provenance and license

- `SRC-REACT-STORE`: React, [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore),
  Meta Platforms, Inc. and React documentation contributors, accessed 2026-08-28
  through the repository's reviewed provenance record. It is cited by URL for
  consultation only under the React documentation site's copyright and terms; no
  documentation expression is redistributed. It anchors only the general external
  subscription and snapshot behavior class.
- `SRC-SIGNALS-PUBLIC`: the [Preact Signals official repository](https://github.com/preactjs/signals),
  Preact contributors, accessed 2026-08-28 through the reviewed repository record,
  MIT. It anchors only public signals capability and license feasibility.
- The workshop domain, identifiers, actions, observations, visible-test boundary,
  and candidate contracts below are project-authored synthetic expression. No
  public example implementation or test expression is copied.

## Arm-visible model and actions

The store exposes a current unit and a monotonically increasing revision. A genuine
value change increments the revision once and synchronously notifies every current
subscriber once. Writing the current value is a no-op. `getSnapshot` returns the
same immutable snapshot object until a genuine value change creates the next one.

Each readout displays the unit and revision from the store snapshot. Settled means
the synchronous store notification, resulting React work, and the declared
microtask/render boundary have completed. Network, clocks, randomness, and machine
state are outside the contract.

The frozen action vocabulary is:

1. `mount-pair`: mount readouts `north` and `south` against the initial metric store.
2. `toolbar-imperial`: the north toolbar writes `imperial` to the shared store.
3. `external-metric`: the independent calibration control writes `metric` directly.
4. `unmount-south`: remove only the south consumer and its subscription.
5. `external-imperial`: the calibration control writes `imperial` directly.
6. `remount-south`: mount a fresh south consumer, which must read the current store
   snapshot rather than a historical default.
7. `repeat-imperial`: write the already-current value.
8. `unmount-all`: remove both consumers and every remaining subscription.

Exact executable steps and post-action observations belong to a future verifier-only
package; this wave creates no oracle data or code.

## Frozen observable invariants

- At every settled observation, every mounted readout shows the store's current unit
  and revision from one coherent snapshot.
- A toolbar write and an external write have identical store semantics. The producer
  of a write cannot determine which consumers update.
- One genuine value change advances the revision exactly once and notifies each
  subscriber that was active at notification time exactly once.
- A repeated write of the current value preserves unit, revision, snapshot identity,
  rendered output, and notification counts.
- Unmount removes exactly that consumer's subscription. Later writes cannot notify
  it or change its retained final observation.
- A remounted consumer reads the current snapshot on mount and does not resurrect the
  initial unit or an earlier revision.
- Mounting or unmounting a consumer does not itself change the store value or
  revision. After `unmount-all`, the subscriber count is zero.
- The observable result is deterministic and has no console-error input.

## Visible-test blind spot

The reasonable but incomplete visible gate checks one mounted readout, its initial
metric snapshot, a toolbar change to imperial, a repeated imperial write, and clean
unmount. It does not mount a second consumer, perform a direct external write, or
remount after another producer changes the store. Both future candidates must
compile and pass every unchanged visible assertion.

Planned visible IDs are `BG-H05-VIS-001` through `BG-H05-VIS-004`. Their future
assertions may cover only the boundary above; they must not expose the canonical
verifier sequence, exact hidden observations, ground truth, or defect label.

## Future candidate contracts, without candidate code

- **Preserving candidate:** subscribes each mounted consumer to the shared store,
  reads coherent snapshots, observes toolbar and external writes identically,
  removes subscriptions on unmount, and satisfies every frozen invariant.
- **Seeded false-green candidate:** has exactly one defect family,
  `consumer_mirrors_only_own_writes`. It reads the initial snapshot and mirrors
  toolbar writes into its local signal but does not remain subscribed to external
  store changes. It must otherwise preserve the contract and pass all visible tests.
- If either future candidate fails compilation or any visible test, or if the seeded
  candidate introduces a second defect family, the pair is invalid and must be
  independently reauthored without weakening the visible gate.

## Oracle and capability boundary

The arm-visible prose and future public contracts may describe the invariants. Only
the future independent evaluator may own executable canonical steps, exact expected
observations, ground-truth labels, and defect annotations. Before an arm verdict is
immutable, neither scored arm may list, read, hash, stat, mount, import, or receive
diagnostics from `evaluation/verifier-only/BG-H05/`; `K=0` applies.

A future denied-access test must enforce this with process and filesystem
capabilities, not prompt wording. Operational uncertainty, attempted oracle access,
missing evidence, or nondeterminism must fail closed to `abstain`.

## Planned future files, tests, and manifests

The following names are a non-executable plan only and are not created by this wave:

- `evaluation/arm-visible/BG-H05/` for the contract, harness, shared visible
  assertions, four visible tests, and denied-access probe;
- `candidates/BG-H05/preserving/` and `candidates/BG-H05/false-green/` for the two
  immutable candidates;
- `evaluation/verifier-only/BG-H05/` for a canonical driver, exact observations,
  ground truth, and evaluator self-check;
- `evaluation/manifests/BG-H05/` for separately hashed arm-visible, verifier-only,
  preserving-candidate, and false-green-candidate manifests; and
- future fixture-local tests for visible-gate parity, preserving acceptance,
  reason-correct false-green rejection, denied access, and before/after hash identity.

## Expected failure modes and stop conditions

Expected detectable failures include a stale consumer after an external write,
duplicate notifications, revision drift, a changed snapshot on a no-op write, a
leaked subscription after unmount, and a remount that reads a historical default.

Stop and require owner review if provenance or license cannot be verified, the
fixture resembles a remembered private structure, a candidate needs more than the
single seeded defect, a visible assertion must be weakened, oracle material becomes
arm-visible, any path resolves outside the clean repository, or a contamination
finding cannot be cleared by independent recreation.

## Authorship attestation

This packet was independently authored by a native Codex subagent on 2026-08-30 from
the approved repository contracts and the recorded public anchors above. No
employer/client source, tests, data, identifiers, structures, screenshots, traces,
or private documentation were used. Internal raw subagent events are not claimed as
an exported or submission trajectory.
