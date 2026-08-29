# Clean-Room Preflight Checklist

**Current scanner state:** `BLOCKED_FOR_IMPLEMENTATION`.
**Product work state:** normative `docs/PROJECT_SPEC.md@1.1.0` is human-approved, but
the current branch is `impl/beyondgreen` at checkpoint
`4af117762fa15b02d81b75e23d9b22113caf48ea`. The approved implementation boundary
and real scanner-only contamination preflight remove those two earlier blockers.
The eligible trace-first gate has now passed. Implementation remains blocked only on
Phase 0.5 decision resolution/freeze; neither trace approval nor scanner output is a
claim of implementation readiness.

## Phase 1 — Control plane

- [x] Official challenge and judging contracts are preserved.
- [x] Submission artifact contract is defined.
- [x] Current private ideation conversation is excluded from submission.
- [x] Allowed and prohibited source classes are defined.
- [x] Synthetic-fixture derivation protocol is defined.
- [x] Trace capture, sanitization, and human-review rules are defined.
- [x] Project provenance ledger and entry template exist.
- [x] Generic secret/path/contamination scanner exists.
- [x] Raw traces, private denylist, temporary files, and generated archives are ignored.
- [x] Control-plane actions, retry, verification, and decision are recorded separately
      from the future Improvement Changelog.
- [x] A private contamination denylist and raw-trace directory exist outside the
      worktree. Their environment variable values and contents must never be logged,
      committed, or submitted.
- [x] The preflight uses the same Node runtime as the future TypeScript project; no
      Python source, test, bytecode, or runtime is required.

Run:

```bash
npm test
npm run preflight:control
```

Expected control-plane result:

```text
READY_FOR_CLEAN_BRANCH
```

## Phase 2 — Clean branch transition

- [x] Identify the Git repository.
- [x] Start from reviewed control-plane snapshot
      `5cae0e3b5a46ea56de7b36d1ef1f3799cfb19bcf`.
- [x] Transfer the approved v1.1 surface to named non-default branch
      `impl/stateshift-guardian`; post-handoff reconciliation started at checkpoint
      `dbf9d55123bef9fc38ec5e9b99dbc56f37aa9290`.
- [x] Subsequently rename `impl/stateshift-guardian` to `impl/beyondgreen` without
      rewriting history; current checkpoint is
      `4af117762fa15b02d81b75e23d9b22113caf48ea`.
- [x] Start a new authoring task without an inherited private transcript.
- [x] Obtain explicit human approval of specification-only boundary
      `SES-20260829-001` with approver and approval evidence.
- [x] Create a factual approved session-boundary record before normative editing.
- [x] Restrict authorized product paths to the clean repository root; compensating
      tool-call audit records no unauthorized outside-root access.
- [x] Provide the real private denylist only to the scanner subprocess through the
      owner-authorized control interface; its value and external path remain
      undisclosed to the general task shell and repository.
- [x] Confirm the tool audit shows no external private workspace read, browser call,
      connected-app call, or private-MCP call.
- [ ] Complete automated and human review of the current specification transcript;
      its boundary record currently marks it `pending_review`.

## Phase 3 — Before implementation

- [x] `config/topic.yaml` projects the BeyondGreen v1.1 candidate.
- [x] `docs/PROJECT_SPEC.md@1.1.0` is accepted by the human reviewer.
- [x] Intended user, bottleneck, realistic scenario, and usable output are explicit.
- [x] Status-quo and BeyondGreen scored arms receive the same 20 immutable candidates.
- [x] Decision accuracy, defect recall, false alarms, completion, formulas,
      denominators, and exact targets are defined in the candidate global specification.
- [ ] Ten fixture specifications and 20 candidates exist; the 4/6 membership and all
      candidate/oracle hashes are frozen.
- [ ] Hidden-oracle access controls are implemented and tested; their conceptual typed
      boundary is specified without relying on prompt wording.
- [x] `docs/EVALUATION.md` projects v1.1 scoring, oracle controls, targets, and the
      one-attempt/three-minute policy; exact package/model cap decisions remain Phase 0.5 gates.
- [x] `docs/IMPROVEMENT_CHANGELOG.md` records the initial candidate and corrected
      review revision without claiming semantic freeze.
- [x] Schema-oriented trajectory and provenance indexes exist without concrete
      fixture entries.
- [ ] Public library choice and license are recorded.
- [ ] Phase 0.5 runtime feasibility spike proves deterministic observability for all
      planned behavior classes after stack approval and before fixture prose.
- [x] Clean-environment and replay command families are documented.
- [x] The repository owner accepted section 20 Phase 0.5 `TBD` items only as
      mandatory pre-implementation gates, not as permission to start implementation.

Run from the implementation branch:

```bash
npm run preflight:implementation
```

The denylist environment-variable name is safe to document, but its expanded path,
contents, and match terms must never be copied into committed configuration, logs, or
submitted traces. The required success result after all implementation gates is:

```text
READY_FOR_IMPLEMENTATION
```

The scanner output alone does not authorize product code. Human spec/boundary
approval, a new neutral task, Phase 0.5, fixture-prose/provenance freeze, and the
remaining semantic gates above still apply.

## Historical verified control-plane result

- Unit tests: `10 passed` on Node 22.22.3.
- Control-plane scan: `READY_FOR_CLEAN_BRANCH`.
- Implementation negative test at that snapshot: `BLOCKED` on the then-unresolved gates.
- Binary review notice: four official challenge evidence files; these are reference
  inputs and are excluded from the final ZIP unless explicitly required and licensed.
- Git mutation: not performed.
- Product specification, fixtures, spikes, and solution-agent runs: not started.

## Current clean-task result

- Current branch: `impl/beyondgreen` at clean checkpoint
  `4af117762fa15b02d81b75e23d9b22113caf48ea`. It was renamed after the historical
  `impl/stateshift-guardian` handoff without rewriting commits.
- Implementation boundary `SES-20260829-002` is explicitly approved for transition
  to the separately gated trace-first checkpoint. That checkpoint has now passed;
  only separate Phase 0.5 discussion and freeze may follow, while product
  implementation remains unauthorized.
- The owner-controlled scanner-only probe confirmed the denylist and raw-trace
  directory are available outside the repository without exposing either value or
  external path. The real contamination preflight passed with no contamination
  findings.
- Trace-first validation at checkpoint `4af1177` passed `npm test` with 10/10 tests,
  scanner-only `probe`, and control preflight with `READY_FOR_CLEAN_BRANCH`. The
  implementation scanner reached repository analysis and returned `BLOCKED` only on
  the two intentional Phase 0.5 placeholders plus the current docs-only dirty-tree
  warning; four official binary artifacts retain their human-review notices. These
  expected blockers do not invalidate contamination clearance.
- The owner-controlled trace `probe` confirmed the external raw-trace directory is
  present, outside the repository, and readable/writable. The owner-provided launcher
  SHA-256 is `0abf0e3aca018b2deea1f0877440bb8d0ae32eab2414cc385a1b7cd69b21c1bc`;
  this task did not independently verify it or inspect the launcher or external path.
- Coordinator raw export and immutable capture for `TRC-BG-TRACEFIRST-001` succeeded;
  the automated raw scan passed with submission redaction required. A readable
  redaction candidate and pending review record now preserve the technical sequence.
  The separate real-denylist repository-candidate scan passed after redaction with
  zero contamination findings and zero machine/thread/tool metadata findings in the
  local check; four official binary-review notices remain. Repository-owner human
  review initially received no owner approval because the packet lacked accessible
  Russian materials. After a full Russian counterpart and plain-language review card
  became available, the owner explicitly confirmed the quoted approval statement.
  Human review passed, technical meaning was confirmed, and
  `TRC-BG-TRACEFIRST-001` is now indexed as the eligible representative trace.
- Phase 0.5 package, model, replay, budget, fixture-assignment, and Chromium decisions
  remain unresolved and are now the next and only pre-product decision gate. Product
  implementation is not ready or authorized.
- Post-promotion verification: tests passed 10/10; control preflight returned
  `READY_FOR_CLEAN_BRANCH`; implementation preflight remained `BLOCKED` on the two
  Phase 0.5 placeholders plus the expected dirty-worktree and four binary-review
  notices, with no contamination findings. The regenerated checksum manifest covers
  and verifies exactly 47 intended files.
- Global product specification: BeyondGreen v1.1 approved at
  `2026-08-29T10:46:39Z`; this approval does not authorize implementation.
- Concrete fixture behavior/provenance, held-out membership files, product code,
  solution-agent prompts, and benchmark runs: not created.

## Stop conditions

Stop immediately when:

- an agent requests or discovers a path outside the clean root;
- a public anchor or license cannot be recorded;
- a fixture resembles a remembered private component structurally;
- a trace contains private context, credentials, personal information, or private
  identifiers;
- evaluation cases or hidden oracles become visible to an evaluated branch;
- a result is used to change held-out scoring after unblinding;
- a scanner finding cannot be confidently resolved by independent recreation.
