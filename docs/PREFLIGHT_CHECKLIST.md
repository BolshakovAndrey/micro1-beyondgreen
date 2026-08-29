# Clean-Room Preflight Checklist

**Current scanner state:** `BLOCKED_FOR_IMPLEMENTATION`.
**Product work state:** normative `docs/PROJECT_SPEC.md@1.1.0` is human-approved, but
its transfer to named branch `impl/stateshift-guardian` removes only the prior
detached-HEAD/handoff blocker. Implementation remains blocked pending Phase 0.5,
real contamination preflight, a new approved implementation `SESSION_BOUNDARY`, and
a successful eligible trace-first gate. Scanner output is not a substitute for these
gates.

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
- [x] Start a new authoring task without an inherited private transcript.
- [x] Obtain explicit human approval of specification-only boundary
      `SES-20260829-001` with approver and approval evidence.
- [x] Create a factual approved session-boundary record before normative editing.
- [x] Restrict authorized product paths to the clean repository root; compensating
      tool-call audit records no unauthorized outside-root access.
- [ ] Provide the real private denylist only through `MICRO1_PRIVATE_DENYLIST` in the
      future implementation task; it was not present in this specification task.
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

- Session controls: specification-only boundary approved at
  `artifacts/trajectories/session-boundaries/SES-20260829-001.yaml`; transcript review
  remains pending.
- Real `MICRO1_PRIVATE_DENYLIST` and `MICRO1_PRIVATE_TRACE_DIR` paths were absent and
  were not guessed or inspected. The structural preflight used an external stdin
  canary and is not contamination clearance.
- Unit tests: `10 passed` on Node 22.22.3.
- Structural control preflight: `READY_FOR_CLEAN_BRANCH` with an external stdin
  canary; it was not rerun with the real denylist and is not contamination clearance.
- Post-handoff branch check: named branch `impl/stateshift-guardian` at reconciliation
  checkpoint `dbf9d55123bef9fc38ec5e9b99dbc56f37aa9290`; the detached-HEAD blocker is
  removed.
- Post-handoff validation: unit tests passed 10/10; JSON and YAML parsing,
  `git diff --check`, exact checksum coverage, and all 41 listed SHA-256 digests
  passed.
- Structural control preflight: `READY_FOR_CLEAN_BRANCH` with a non-private external
  stdin canary. The task-excluded local-only supervisor/premortem documents are now
  explicit scanner-ignore paths and are absent from the checksum surface.
- Structural implementation scanner: `BLOCKED` on the two intentional Phase 0.5
  placeholder tokens, with a dirty-worktree warning and four expected official
  binary-review notices; it reported no branch error. A structural run is not
  contamination clearance.
- Reconciliation process caveat: the initial self-scan preceded the exact local-only
  scanner ignores, and one transient shortened test-output file was mistakenly
  written outside the repository root and immediately removed. No excluded content
  was printed or retained, but this task transcript is not submission eligible and
  still requires human review.
- Global product specification: BeyondGreen v1.1 approved at
  `2026-08-29T10:46:39Z`; this approval does not authorize implementation.
- Current specification transcript: `pending_review`; it is not yet indexed as an
  eligible representative trace.
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
