# BG-H01 behavior-first specification — planetarium display-card editor

**Status:** prose authored; pending coordinator hashing and repository-owner freeze approval  
**Fixture:** `BG-H01` (held-out)  
**Behavior class:** `prop_reset`  
**Challenging case:** no  
**Requirements:** `FR-002`–`FR-006`, `EV-001`, `EV-002`, `EV-005`, `EV-006`, `EV-010`, `AR-006`

This packet freezes only independently authored behavior and provenance intent. No
fixture implementation, candidate, test, executable manifest, oracle, or scored
artifact exists for BG-H01 at this checkpoint.

## User, domain, and bottleneck

The product user is a frontend engineer reviewing an existing React state-to-signals
migration. The synthetic component is an editor for display cards at a community
planetarium. An operator edits a local draft for the card selected by a parent
component. When the parent selects a different card, the editor must discard the old
local draft and initialize a new draft from the new card props.

The risk is a plausible false green: signals initialized from props only at mount can
retain the previous card's local draft after the prop identity changes. Compilation,
ordinary editing tests, and same-card rerenders can remain green while the operator
sees or saves content belonging to another card.

The planetarium, identifiers, text, action sequence, and all observables below are
project-authored synthetic expression. They do not model an employer, client, or
production workflow.

## Public anchor

`SRC-REACT-IDENTITY` is React's public “Preserving and Resetting State” documentation:
<https://react.dev/learn/preserving-and-resetting-state>. It was accessed on
2026-08-28 and is consulted only for the general principle that component identity
controls whether local state is preserved or reset. The React documentation remains
under the React documentation site's copyright and terms; this packet cites the URL
and redistributes none of its expression.

The selected future signals dependency is the already frozen
`@preact/signals-react@3.12.0`, licensed MIT. This prose does not reproduce package
source or prescribe candidate implementation syntax.

## Arm-visible model

The parent supplies an immutable card identity plus initial draft fields:

- `cardId`, a non-empty identifier;
- `initialTitle`, a non-empty string; and
- `initialTheme`, one of `blue`, `amber`, or `green`.

The editor exposes `cardId`, the current title draft, the current theme draft, a
`dirty` flag, and an ordered user-action log. A new `cardId` denotes a new editor
identity. Re-rendering with the same `cardId` denotes the same identity and must not
erase user edits. For a given identity, its initial fields are stable; changing
initial fields without changing `cardId` is invalid fixture input and fails closed.

Settled means the synchronous action and resulting React/signal work have completed
at the fixture's deterministic render boundary. Clocks, arbitrary delays, network,
randomness, and machine-specific data are outside the contract.

## Frozen observable scenario

1. `mount-card-01`: mount `CARD-01` with title `Moon map` and theme `blue`; the
   draft matches those values and `dirty` is false.
2. `edit-title-card-01`: set the title draft to `Lunar map`; theme stays `blue` and
   `dirty` becomes true.
3. `rerender-card-01`: rerender the same stable props; the edited title remains
   `Lunar map` and `dirty` remains true.
4. `switch-card-02`: replace props with `CARD-02`, title `Meteor guide`, and theme
   `amber`; both draft fields reset to those values and `dirty` becomes false.
5. `edit-theme-card-02`: change the theme draft to `green`; title stays
   `Meteor guide` and `dirty` becomes true.
6. `switch-card-01`: replace props with the original `CARD-01` inputs; the editor
   starts a fresh `Moon map` / `blue` draft and does not resurrect `Lunar map`.
7. `reset-current`: restore the current identity's initial fields and clear `dirty`.

The action log contains these labels in this exact order. Prop changes are recorded
once after their reset is observable; they are not treated as user edits.

## Frozen observable invariants

- The observable `cardId` always equals the parent-supplied identity.
- A change to `cardId` atomically replaces both draft fields with the new identity's
  initial values and sets `dirty` to false at the settled boundary.
- No draft value from the prior identity may be visible after that boundary.
- Re-rendering byte-equivalent props with the same `cardId` preserves the current
  draft, `dirty`, and action-log prefix.
- Editing one field preserves the other field and sets `dirty` true exactly when the
  current draft differs from the current identity's initial fields.
- `reset-current` affects only the current identity and is deterministic when
  repeated.
- Returning to a previously visited identity initializes from its supplied initial
  values; this fixture has no cross-identity draft cache.
- Invalid identity/initial-field input does not partially mutate observable state.
- Console errors, unhandled rejections, network, time, randomness, and machine state
  cannot affect the result.

## Visible legacy-test blind spot

The future visible gate must be reasonable and shared by both candidates. It may
check initial mount, editing each field, the `dirty` flag, same-identity rerender,
validation, and `reset-current`. It must not change `cardId` after a dirty edit,
return to a previously visited identity, inspect verifier-only paths, or encode a
candidate-specific defect.

This omission is the frozen blind spot: green visible tests do not establish prop
reset behavior across component identities.

## Future candidate contracts — no candidate code

The preserving candidate must compile, pass every frozen visible assertion, and
satisfy every invariant above. It must bind local draft lifetime to `cardId` while
preserving edits across same-identity rerenders.

The seeded false-green candidate must also compile and pass every visible assertion.
It may contain exactly one defect family: draft signals are initialized from the
first props but are not reset when `cardId` changes. It must preserve editing,
same-identity rerender, validation, reset of the currently captured draft, and all
unrelated behavior. No second defect may be introduced to make detection easier.

Candidate bytes, hashes, ground truth, and defect annotation will be frozen only in
a later separately approved implementation wave. Candidate source must remain
immutable during verification.

## Oracle and capability boundary — no oracle data or code

Both scored arms may receive this public behavior contract and future arm-visible
contracts. Only a later verifier-only package may own the executable canonical
driver, exact serialized post-action observations, ground-truth labels, oracle
digests, and defect annotation.

Before either arm's verdict is immutable, the arm must be physically unable to
mount, list, stat, read, hash, import, or obtain diagnostic distinctions from the
verifier-only package. The independent evaluator runs afterward. `K=0` permits no
expected value, failed step, category, diff, candidate label, or repair hint to flow
back to an arm. An access attempt, capability mismatch, missing evidence,
nondeterminism, or evaluator digest mismatch fails closed and blocks scoring.

## Planned future files and checks — not created by this wave

Subject to separate owner approval, a later wave may create:

- `candidates/BG-H01/preserving/DisplayCardEditor.ts`;
- `candidates/BG-H01/false-green/DisplayCardEditor.ts`;
- `evaluation/arm-visible/BG-H01/contract.ts`, `harness.ts`,
  `visible-assertions.ts`, and `visible.test.ts`;
- `evaluation/verifier-only/BG-H01/canonical-driver.ts`, `ground-truth.json`, and
  `self-check.test.ts`;
- separate candidate, arm-visible, verifier-only, and fixture freeze manifests; and
- fixture-local compile, visible-gate, evaluator self-check, denied-access,
  immutability, manifest, and deterministic replay checks.

These paths are a plan, not authorization and not evidence that the files exist.

## Expected failure modes

- The old draft survives a `cardId` change.
- Only one of the two draft fields resets, producing a mixed-identity observation.
- Reset happens after an observable stale render instead of atomically at settlement.
- Same-identity rerender incorrectly erases a user's draft.
- Returning to an earlier identity resurrects an undeclared cached draft.
- Candidate or manifest bytes change during verification.
- An arm can distinguish verifier-only path existence or obtain evaluator feedback.
- Nondeterministic timing is used in place of the declared settlement boundary.

## Stop conditions

Stop and request repository-owner review if provenance or licensing is uncertain; a
private or external path appears; the design resembles remembered non-public
structure; any candidate, test, oracle, executable manifest, benchmark result, model
call, or browser artifact appears in this freeze wave; held-out oracle content is
exposed; or a contamination finding cannot be cleared by independent recreation.

