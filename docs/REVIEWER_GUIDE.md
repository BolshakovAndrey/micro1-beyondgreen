# Reviewer guide — task catalog and what each command proves

This document holds the engineering detail that used to open the README. The README now
introduces the product and the result; this file is for a reviewer who wants to run
everything and understand what each command actually verifies.

## Why one task runner

The project uses a single Node/TypeScript task runner instead of adding a new
`package.json` script for every evaluation fixture or phase. Public entry points stay
stable while every supported task remains discoverable and reviewable. The catalog is
implemented in [`scripts/tasks/`](../scripts/tasks/); a new fixture adds a small typed
task module there rather than expanding `package.json`.

```bash
npm run task -- list
```

## From a clean checkout

Node `22.22.3` (see `.node-version`).

```bash
npm ci
npm test
npm run task -- d01:verify
npm run task -- d01:demo
npm run task -- d01:replay
npm run task -- d02:verify
npm run task -- d03:verify
npm run task -- d04:verify
npm run task -- development:verify
npm run task -- held-out:verify
npm run task -- freeze:self-test
npm run task -- official:preflight
npm run task -- replay --evaluation-version eval-v1.1.0
```

Expected success markers:

```text
TASK_PASSED test:all
TASK_PASSED d01:verify
TASK_PASSED d01:demo
TASK_PASSED d01:replay
TASK_PASSED d02:verify
TASK_PASSED d03:verify
TASK_PASSED d04:verify
TASK_PASSED development:verify
TASK_PASSED held-out:verify
TASK_PASSED freeze:self-test
TASK_PASSED official:preflight
TASK_PASSED replay
```

## What each command proves

| Command | What it verifies |
|---|---|
| `test:all` | Every ordinary test under the approved public roots, discovered deterministically. |
| `d01:verify` | The complete BG-D01 verification path, plus the deliberately separated verifier-only oracle self-check and the physical access-boundary test. |
| `d01:demo` | One full unscored verification, writing validated JSON and static HTML to `artifacts/evaluation/`. |
| `d01:replay` | Deterministic offline replay: rebuilds both representations in memory, performs no network call, subprocess launch, or workspace write, and rejects report tampering. |
| `d02:verify` … `d04:verify` | Visible behavior, evaluator conclusions, immutable manifests, and physical oracle isolation per development fixture. |
| `development:verify` | The exact D01–D04 fixture/task bijection, preservation of the TypeScript `ParcelDispatchBoard` family, absence of the discarded MJS prototype, and deterministic D01 replay. |
| `held-out:verify` | Integrated H01–H06 controls — visible gates, evaluator self-checks, reciprocal denial probes, and the oracle-leak scan — without official execution or unblinding. |
| `freeze:self-test` | All 20 frozen candidates, their manifests, evaluator controls, and oracle boundaries, without scoring. |
| `official:preflight` | The frozen 10×2 inventory and a non-executable 20-slot, two-arm execution plan. |
| `replay --evaluation-version eval-v1.1.0` | Exact offline verification of the committed `POSTDECISION-004` official evidence; no arm, model, network, or candidate execution. |

## Isolation boundary

The isolation runner requires macOS `/usr/bin/sandbox-exec` to deny network egress in
addition to Node's filesystem permission model. It **fails closed** on other platforms; no
permissive cross-platform fallback is registered, because a weaker sandbox that still
reported success would invalidate the isolation claim. Deterministic replay
(`d01:replay`) is platform-independent.

## Owner-gated and maintainer-only commands

The catalog exposes the historical `evaluation:run` entrypoint for provenance, but it is
create-once, requires an explicit approved session boundary, and is not a judge
reproduction command. The official run is complete and must not be executed again.
Reviewers use `make eval` or `npm run task -- replay --evaluation-version eval-v1.1.0`.
Network-diagnostic and Chromium-launch commands are not part of the ordinary judge path.

Tasks ending in `:write` are maintainer-only reconciliation commands for immutable
manifests or checksum projections. Reviewers normally use `test:all`, the `*:verify`
family, `d01:demo`, `d01:replay`, `freeze:self-test`, and the official offline replay.

## Fixture membership

| Membership | Fixtures | Role |
|---|---|---|
| Development | `BG-D01`–`BG-D04` | Visible during development; used to tune the solution. |
| Held out | `BG-H01`–`BG-H06` | Unblinded once, at the official run. `BG-H02` is the predeclared challenging case. |

Behavior classes are a frozen bijection: `BG-D01` stale snapshots, `BG-D02` queued/batched
updates, `BG-D03` derived state, `BG-D04` subscription cleanup, `BG-H01` prop reset,
`BG-H02` async ordering, `BG-H03` identity stability, `BG-H04` conditional lifecycle,
`BG-H05` external store, `BG-H06` rollback.

## Independent review

An independent Claude Opus reviewer is available through the project skill
`.agents/skills/claude`. It is read-only; every actionable finding is verified before
adoption.

## Related contracts

- [`PROJECT_SPEC.md`](PROJECT_SPEC.md) — normative product-semantics contract
- [`EVALUATION.md`](EVALUATION.md) — evaluation methodology, metrics, targets
- [`D01_REPRODUCTION.md`](D01_REPRODUCTION.md) — evidence paths, expected verdicts, limitations
- [`CLEAN_ROOM_POLICY.md`](CLEAN_ROOM_POLICY.md), [`TRACE_POLICY.md`](TRACE_POLICY.md), [`PROVENANCE.md`](PROVENANCE.md)
- [`CHALLENGE.md`](CHALLENGE.md), [`HACKATHON_RULES.md`](HACKATHON_RULES.md)
