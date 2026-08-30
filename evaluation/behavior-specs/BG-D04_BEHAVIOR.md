# BG-D04 behavior-first specification — harbor bulletin subscription panel

**Status:** authored for implementation freeze<br>
**Fixture:** `BG-D04` (development)<br>
**Behavior class:** subscription cleanup<br>
**Requirements:** `FR-003`–`FR-006`, `EV-002`, `EV-005`, `EV-006`, `AR-004`, `AR-006`

## User and problem

The user is a frontend engineer reviewing an existing migration of a small harbor
bulletin panel. An operator switches between the `harbor` and `orchard` bulletin
channels and must see messages from the currently selected channel only.

The merge risk is an obsolete subscription that remains live after a channel switch.
An old channel can then overwrite the selected channel's displayed bulletin.
Compilation and ordinary tests that publish only to the currently selected channel
can remain green even though the operator is shown a message from the wrong channel.

The fixture is synthetic. Its domain, identifiers, messages, source behavior, and
action sequence are project-authored and do not model a real organization or system.

## Public provenance

- `SRC-REACT-USEEFFECT-CLEANUP`: React's public [`useEffect` reference](https://react.dev/reference/react/useEffect)
  documents that an Effect may return a cleanup function and that React runs cleanup
  before rerunning an Effect with changed dependencies and after unmount.
- `SRC-REACT-SYNCHRONIZING-EFFECTS`: React's public [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
  guide supplies the general setup/cleanup failure class for external subscriptions.
- The harbor bulletin domain and every fixture-specific action and observable below
  are independently authored synthetic expression; no source example, component
  structure, or test expression is copied.

## Arm-visible state and actions

The panel has one selected channel, initially `harbor`, and one displayed bulletin,
initially `none`. The arm-visible synthetic source can publish an integer bulletin
value to either channel. A delivered bulletin is rendered as `<channel>:<value>`.

Settled means the synchronous action, resulting subscription callback, React state
work, and the fixture's microtask/render-settlement boundary have completed. Timing
delays are not correctness inputs.

The canonical scenario is:

1. `mount`: select `harbor`, display `none`, and establish exactly one harbor subscription.
2. `publish-harbor-2`: display `harbor:2`.
3. `switch-orchard`: select `orchard`, restore display `none`, remove the harbor
   subscription, and establish exactly one orchard subscription.
4. `publish-harbor-5`: preserve display `none`; a bulletin from the no-longer-selected
   harbor channel must be ignored.
5. `publish-orchard-3`: display `orchard:3`.
6. `reset`: restore the initial visible state and exactly one harbor subscription;
   no orchard subscription remains.
7. `unmount`: remove every remaining subscription.

## Observable invariants

- The selected channel is always exactly `harbor` or `orchard`.
- A newly selected channel starts with displayed bulletin `none`; switching does not
  retain a prior channel's bulletin.
- While mounted, exactly one active source subscription exists for the selected
  channel and zero exist for the other channel.
- A bulletin can change displayed output only when its channel is selected at its
  delivery time.
- Switching channels removes the obsolete subscription before the replacement may
  deliver output. Repeating reset does not accumulate subscriptions.
- Unmount removes all subscriptions. A later source publication has no mounted panel
  callback to notify.
- Results have no network, clock, random, console-error, or machine-specific input.

## Visible legacy-test contract

The visible gate is intentionally reasonable but incomplete. Candidate authors may
not weaken or rewrite it. Every candidate must compile and pass all visible tests.

| Visible test ID | Required visible assertion |
| --- | --- |
| `BG-D04-VIS-001` | Mount selects `harbor`, displays `none`, and has one harbor subscriber. |
| `BG-D04-VIS-002` | A harbor publication while harbor is selected displays its value. |
| `BG-D04-VIS-003` | Switching to orchard displays `none`, then an orchard publication displays its value. |
| `BG-D04-VIS-004` | Reset returns to the initial visible state and a newly published harbor bulletin is displayed. |

The visible suite must not publish to a previously selected channel after a switch,
assert the removed channel's subscription count, or inspect verifier-only files.
That omission creates the intended false-green opportunity without making the gate
trivial.

## Verifier-only oracle boundary

The public behavior contract may be available to either scored arm. The
verifier-only package alone owns the executable canonical driver, exact post-action
observations, ground-truth labels, and defect annotation. Arm-visible code has no
import path to that package.

An isolation probe runs an arm process under Node's filesystem permission model with
only the candidate and arm-visible package paths readable. Reading the verifier-only
ground-truth path must fail. The evaluator runs only after an arm decision is
immutable. Under `K=0`, it provides no expected value, failed action, category,
label, diff, or repair hint to either arm before that point.

## Candidate construction rules

- The preserving candidate is independently authored from this frozen prose and
  satisfies every invariant.
- The seeded false-green candidate has exactly one defect family: it does not clean
  up an obsolete channel subscription on channel change or reset. It preserves the
  rest of the public behavior and passes every visible gate.
- Candidate source and all package manifests are immutable after their digests are
  recorded. Verification never edits, regenerates, or repairs a candidate.
- If either candidate fails compilation or a visible test, the pair is invalid; the
  visible suite must not be weakened to accommodate it.

## Freeze digest

The machine freeze record gives the SHA-256 digest of this exact English behavior
specification and the separately hashed packages. Any later byte change requires a
new behavior-first authorization and freeze; it is not an implementation correction.
