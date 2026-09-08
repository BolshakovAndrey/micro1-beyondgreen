# BeyondGreen Architecture

## Why these components exist

| Component | Bottleneck addressed | Verification |
| --- | --- | --- |
| Static inventory and frozen manifests | Both arms must see identical immutable candidates | freeze self-test, manifest tests, before/after hashes |
| Status-quo arm | Fair simple baseline: compile + visible tests | baseline contract and 20 official records |
| BeyondGreen arm | Legacy tests omit migration-specific invariants | typed risk/probe schema, one Codex call, zero retries |
| Observer processes | Execute a decision without exposing verifier expectations | reciprocal capability-denial and duplicate-capture tests |
| Evaluator process | Compare post-decision evidence with hidden contracts | import-closure guards and verifier self-checks |
| Coordinator | Enforce ordering, `K=0`, immutability, and fail-closed behavior | synthetic 20/40/80/40 rehearsal and process tests |
| Offline replay | Let judges verify claims without credentials or a second model run | exact JSON/HTML/evidence-hash reproduction |
| Human gates and trajectories | Make irreversible runs, retries, and corrections auditable | session boundaries, reviewed traces, owner packets |

## End-to-end sequence

```text
frozen candidate + arm-visible contract
        │
        ├── status quo: compile + visible tests ──┐
        └── BeyondGreen: inventory → probes ─────┤  immutable decisions
                                                  │  (oracle still unavailable)
                                                  ▼
                              neutral scenario provider (post-decision)
                                                  │
                              two isolated observer captures per arm
                                                  │ exact digest equality
                                                  ▼
                              isolated evaluator + frozen oracle
                                                  │
                              40 records → aggregate → JSON/HTML → replay hash
```

The coordinator does not pass evaluator findings back to either arm. Candidate hashes
are checked before and after execution. A failed model transport becomes `abstain`; no
substitute model or retry is allowed. A capture mismatch, denied capability, schema
failure, or hash drift stops the run rather than weakening the boundary.

## Trust boundaries

- Arm-visible code cannot enumerate or read `evaluation/verifier-only/`.
- Evaluator code cannot read candidate source.
- The model sees only the candidate and public contract, never ground truth.
- Raw coding-agent traces stay outside the worktree; only reviewed, privacy-scanned
  projections enter `artifacts/trajectories/`.
- Owner approval gates official execution, post-decision unblinding, commits, and release.

The strongest tests are `tests/official/runtime/production-evaluator-import-isolation.test.ts`,
`tests/official/execution/production-composition.test.ts`,
`tests/official/process/`, `tests/d01-boundary.test.ts`, and
`tests/all-fixtures.integration.test.ts`.

## Agents and context

Codex Desktop/CLI authored implementation under repository-local session boundaries and
produced representative reviewed trajectories. Fixture work used isolated worktrees and
subagents with non-overlapping file ownership. Claude Opus is used only as an independent
read-only checkpoint; Codex verifies actionable findings before adoption. Repository
contracts (`AGENTS.md`, project/evaluation/clean-room/trace policies) are the durable
context rather than private chat history.

