# BG-D02 — Queued batched updates

**Fixture:** `BG-D02`
**Membership:** development
**Behavior class:** `queued_batched_updates`
**Domain:** synthetic community-library parcel dispatch board

## Public anchor and clean-room origin

`SRC-REACT-QUEUE` is the public React documentation, *Queueing a Series of State
Updates* (<https://react.dev/learn/queueing-a-series-of-state-updates>). It anchors
only the general requirement that sequential updates requested in one event must
accumulate in order. The parcel domain, identifiers, action vocabulary, observations,
and implementation are independently authored synthetic material.

## Observable model

The board has exactly six lanes in this fixed order: `PCL-01` through `PCL-06`.
Each lane has a non-negative integer `pending` count and a non-negative integer
`dispatched` count. The board also exposes a positive integer `unit`, an ascending
selection, and an ordered action log.

After the handler, its queued signal updates, and the declared microtask/render
boundary settle, an observer can read all five values. Timeouts, clocks, network,
randomness, and machine data are outside the contract.

Actions are:

1. `mount`: all counts are zero, `unit` is `1`, selection is empty, and the log is
   `[mount]`.
2. `select-all`: select every lane in canonical order.
3. `select-even`: replace the selection with `PCL-02`, `PCL-04`, `PCL-06`.
4. `set-unit`: replace `unit` with a positive integer without changing counts or
   selection.
5. `queue`: one event requests either one or two sequential queue entries. Each entry
   adds the current `unit` to `pending` for every selected lane.
6. `flush`: move every selected lane's complete pending count to `dispatched` and set
   its pending count to zero; unselected lanes are unchanged.
7. `reset`: restore counts, `unit`, and selection to mount values while retaining the
   full log through `reset`.

## Frozen canonical scenario

```text
[mount, select-all, queue-1x2, flush, unit-3, queue-3x2, select-even, flush, reset]
```

The required observables after each action are deterministic:

| Action | Pending PCL-01..06 | Dispatched PCL-01..06 | Selection | Unit |
| --- | --- | --- | --- | --- |
| mount | 0,0,0,0,0,0 | 0,0,0,0,0,0 | empty | 1 |
| select-all | 0,0,0,0,0,0 | 0,0,0,0,0,0 | all | 1 |
| queue-1x2 | 2,2,2,2,2,2 | 0,0,0,0,0,0 | all | 1 |
| flush | 0,0,0,0,0,0 | 2,2,2,2,2,2 | all | 1 |
| unit-3 | 0,0,0,0,0,0 | 2,2,2,2,2,2 | all | 3 |
| queue-3x2 | 6,6,6,6,6,6 | 2,2,2,2,2,2 | all | 3 |
| select-even | 6,6,6,6,6,6 | 2,2,2,2,2,2 | even | 3 |
| flush | 6,0,6,0,6,0 | 2,8,2,8,2,8 | even | 3 |
| reset | 0,0,0,0,0,0 | 0,0,0,0,0,0 | empty | 1 |

## Invariants

- Lane IDs and their order never change.
- Counts are integers and never negative.
- Selection replacement is de-duplicated and canonical-order sorted.
- A `queue` action with `entries: 2` accumulates both entries within the same event:
  each selected lane gains exactly `2 * unit` pending parcels.
- `flush` transfers the complete pending amount exactly once for selected lanes.
- `reset` is deterministic when repeated.

## Visible legacy gate

The shared visible gate intentionally checks mount, selection replacement, a single
queue entry, unit replacement, a single flush, and reset. It deliberately does not
call `queue` with two entries and therefore cannot prove queued accumulation. The
gate must not be weakened for either candidate.

## Candidate construction and oracle boundary

Candidate A preserves every invariant. Candidate B has one seeded false-green defect:
within a `queue` event with two entries it repeatedly derives from the same captured
pending snapshot, so only one entry remains queued. It otherwise preserves the public
contract and passes every visible legacy assertion.

The verifier-only package owns the canonical action sequence, exact expected
observations, ground truth, and defect label. It runs only after a candidate result is
immutable. Neither evaluation arm may list, read, hash, stat, or receive diagnostics
from `evaluation/verifier-only/` before its verdict; `K=0` applies.
