# BeyondGreen held-out prose and provenance freeze

**Status:** prose and public provenance freeze approved by repository owner  
**Boundary:** `SES-20260830-010`  
**Current captured continuation:** `TRC-BG-HELDOUT-FREEZE-001-CONT-004`

This freeze binds prose and provenance only. It creates no fixture implementation,
candidate, test, oracle content, evaluator, benchmark result, or unblinding output.

## Frozen assignments

| Fixture | Membership | Behavior class | Neutral domain | Core invariant |
| --- | --- | --- | --- | --- |
| `BG-H01` | held-out | `prop_reset` | community planetarium display-card editor | A new `cardId` atomically replaces both draft fields and clears dirty state; same-ID rerenders preserve edits. |
| `BG-H02` | held-out | `async_ordering` | community stargazing-guide preview | Only the current logical request epoch may update the preview; stale and post-reset completions are no-ops. |
| `BG-H03` | held-out | `identity_stability` | community seed-library selection desk | Unrelated changes preserve the exact selection-handle reference; a real selection change replaces it once. |
| `BG-H04` | held-out | `conditional_lifecycle` | neighborhood astronomy checklist drawer | Inactive means unmounted with one cleanup; reactivation creates a fresh generation from current parent input. |
| `BG-H05` | held-out | `external_store` | community workshop unit-preference board | Every mounted consumer observes coherent shared-store snapshots and external writes; unmount removes its subscription. |
| `BG-H06` | held-out | `rollback` | synthetic theme-preference save controller | A rejected save restores the exact committed-before value and clears saving state without changing committed state. |

`BG-H02` is the sole predeclared challenging case. Its deterministic scenario must
reason about overlapping deferred work by logical epoch rather than completion time.

## Provenance and boundaries

All six packets attest independent synthetic authorship by three native Codex
subagents in isolated clean worktrees, one pair each: H01/H02, H03/H04, and H05/H06.
Their internal raw events are not claimed as exported traces. Public anchors are
React documentation cited by URL under site copyright/terms and the MIT-licensed
Preact Signals repository. Dates, owners/projects, permitted use, and clean-room
attestations are recorded in the bound packet files.

The future verifier-only packages are physical capability boundaries. Before an arm
decision is immutable, arms may not mount, enumerate, read, hash, import, stat, or
infer their contents. `K=0` means zero evaluator-derived feedback. No oracle code,
data, hidden expected values, or executable paths were created by this freeze.

The H03/H04 authoring pair reported one structural-validation retry: its Ruby/Psych
did not provide `safe_load_file`; `safe_load(File.read(...))` then parsed the same
files successfully without product-content changes. The pre-capture transport stop,
the original coordinator stop, and the `CONT-001` and `CONT-002` stops are preserved
as authorized service history. The owner-authorized main-root handoff removed the
target-identity ambiguity recorded by `CONT-002`.

Exact file membership and SHA-256 values are recorded in
`evaluation/held-out-prose-freeze.yaml`. The preserved stash
`bg-heldout-freeze-handoff` remains available and was not removed. The automatically
captured `CONT-003` stopped on a missing direct npm script; the root coordinator then
used the already owner-authorized registered task form for deterministic checksum
reconciliation. Owner-authorized `CONT-004` then independently recreated only the
four suppressed-category service lines, completed the structural and safe checks,
and was externally captured without automatic promotion. Repository-owner approval
was granted at `2026-08-30T17:09:30Z` for prose and public provenance only. Any
future implementation still requires a separate owner-approved neutral session and
task packet.
