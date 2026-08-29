# Clean-Room Preflight Checklist

**Current scanner state:** `READY_FOR_IMPLEMENTATION`.
**Product work state:** blocked pending human approval of `docs/PROJECT_SPEC.md`, its
open decisions, and a future neutral implementation task. The current authoring
transcript is excluded; scanner output is not a substitute for these gates.

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

- [x] Identify the Git repository and user-approved implementation branch.
- [x] Start from reviewed control-plane snapshot
      `5cae0e3b5a46ea56de7b36d1ef1f3799cfb19bcf`.
- [x] Use dedicated branch `impl/stateshift-guardian`.
- [x] Start a new authoring task without an inherited private transcript.
- [ ] Obtain explicit human boundary approval with approver and approval evidence.
- [x] Create a factual pending session-boundary record before product implementation.
- [x] Restrict authorized product paths to the clean repository root; compensating
      tool-call audit records no unauthorized outside-root access.
- [x] Provide the private denylist only through `MICRO1_PRIVATE_DENYLIST`; confirm its
      value resolves outside the worktree and is not printed.
- [x] Confirm the tool audit shows no external private workspace read, browser call,
      connected-app call, or private-MCP call.
- [x] Exclude the current authoring transcript by category without recording the
      prohibited identifier.

## Phase 3 — Before implementation

- [x] `config/topic.yaml` is a complete projection of the global specification.
- [ ] `docs/PROJECT_SPEC.md` is accepted by the human reviewer.
- [x] Intended user, bottleneck, realistic scenario, and usable output are explicit.
- [x] Mechanical, legacy-green coding-agent, and Guardian comparison arms are defined.
- [x] Primary metric, false-green diagnostics, formulas, denominators, controls, and
      exact count thresholds are defined in the candidate global specification.
- [ ] At least ten fixture specifications exist; held-out membership is frozen.
- [ ] Hidden-oracle access controls are implemented and tested; their conceptual typed
      boundary is specified without relying on prompt wording.
- [x] `docs/EVALUATION.md` projects scoring, leakage controls, thresholds, and budget
      constraints; exact package/model-dependent budgets remain an approved open decision.
- [x] `docs/IMPROVEMENT_CHANGELOG.md` records the initial candidate and corrected
      review revision without claiming semantic freeze.
- [x] Schema-oriented trajectory and provenance indexes exist without concrete
      fixture entries.
- [ ] Public library choice and license are recorded.
- [ ] Phase 0.5 runtime feasibility spike proves deterministic observability for all
      planned behavior classes after stack approval and before fixture prose.
- [x] Clean-environment and replay command families are documented.

Run from the implementation branch:

```bash
npm run preflight:implementation
```

The denylist environment-variable name is safe to document, but its expanded path,
contents, and match terms must never be copied into committed configuration, logs, or
submitted traces. The scanner currently ends with:

```text
READY_FOR_IMPLEMENTATION
```

The scanner output alone does not authorize product code. Human spec/boundary
approval, a new neutral task, Phase 0.5, fixture-prose/provenance freeze, and the
remaining semantic gates above still apply.

## Last verified control-plane result

- Unit tests: `10 passed` on Node 22.22.3.
- Control-plane scan: `READY_FOR_CLEAN_BRANCH`.
- Implementation negative test: `BLOCKED` on the expected seven unresolved gates.
- Binary review notice: four official challenge evidence files; these are reference
  inputs and are excluded from the final ZIP unless explicitly required and licensed.
- Git mutation: not performed.
- Product specification, fixtures, spikes, and solution-agent runs: not started.

## Current clean-task result

- Session controls: verified, but human boundary approval is pending; factual record at
  `artifacts/trajectories/session-boundaries/SES-20260828-001.yaml`.
- External raw-trace canary: passed; judge-facing record contains only category,
  environment-variable name, digest, and safe verification metadata.
- Unit tests: `10 passed` on Node 22.22.3.
- Control preflight: `READY_FOR_CLEAN_BRANCH`.
- Implementation scanner: `READY_FOR_IMPLEMENTATION`, with a dirty-worktree warning
  and four expected official-binary review notices.
- Global product specification: corrected candidate awaiting human approval.
- Current coding-agent authoring transcript: excluded by category; the prohibited
  identifier is not recorded in repository artifacts.
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
