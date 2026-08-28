# Clean-Room Preflight Checklist

**Current state:** `READY_FOR_CLEAN_BRANCH` after the control-plane command passes.  
**Not yet:** `READY_FOR_IMPLEMENTATION`.

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

- [ ] Initialize or identify the Git repository with explicit user approval.
- [ ] Preserve a reviewed snapshot of the control-plane artifacts.
- [ ] Create a dedicated non-default implementation branch.
- [ ] Start a new conversation/task with no inherited private ideation context.
- [ ] Create the session-boundary record before the first product-agent action.
- [ ] Restrict agent paths to the clean repository root.
- [ ] Provide the private denylist only through `MICRO1_PRIVATE_DENYLIST`; confirm its
      value resolves outside the worktree and is not printed.
- [ ] Confirm no external private workspace is indexed, mounted, or named in prompts.

The current directory is not yet a Git repository. Git initialization, commits, and
branch creation are intentionally deferred to a user-approved transition.

## Phase 3 — Before implementation

- [ ] `config/topic.yaml` is complete.
- [ ] `docs/PROJECT_SPEC.md` is accepted.
- [ ] Intended user, bottleneck, realistic scenario, and usable output are explicit.
- [ ] Fair baselines are defined.
- [ ] Primary metric and false-green metric are frozen.
- [ ] At least ten fixture specifications exist; held-out membership is frozen.
- [ ] Hidden-oracle access is enforced by tool path controls, not prompt wording.
- [ ] `docs/EVALUATION.md` records scoring, budgets, leakage controls, and thresholds.
- [ ] `docs/IMPROVEMENT_CHANGELOG.md` begins with the frozen baseline.
- [ ] Trajectory and provenance indexes exist.
- [ ] Public library choice and license are recorded.
- [ ] Clean-environment and replay strategies are documented.

Run from the implementation branch:

```bash
npm run preflight:implementation
```

The denylist path is safe to document, but its contents and match terms must never be
copied into committed configuration, logs, or submitted traces. The command must end
with:

```text
READY_FOR_IMPLEMENTATION
```

before product code, fixtures, spikes, or solution-agent prompts begin.

## Last verified control-plane result

- Unit tests: `10 passed` on Node 22.22.3.
- Control-plane scan: `READY_FOR_CLEAN_BRANCH`.
- Implementation negative test: `BLOCKED` on the expected seven unresolved gates.
- Binary review notice: four official challenge evidence files; these are reference
  inputs and are excluded from the final ZIP unless explicitly required and licensed.
- Git mutation: not performed.
- Product specification, fixtures, spikes, and solution-agent runs: not started.

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
