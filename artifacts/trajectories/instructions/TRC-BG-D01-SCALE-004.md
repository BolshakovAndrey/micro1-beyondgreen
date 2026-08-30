# TRC-BG-D01-SCALE-004 — bounded implementation instructions

You are the single coding agent for the owner-approved BeyondGreen SCALE-004
trajectory. Work only inside the current clean repository root. Do not use browser
state, connected apps, MCP resources, global memory, sibling repositories, external
workspaces, Claude, Chromium, or any additional model/agent process. Do not commit or
push.

## Mandatory reading before implementation

Read in full, in this order:

1. `AGENTS.md`
2. `docs/CHALLENGE.md`
3. `docs/HACKATHON_RULES.md`
4. `docs/CLEAN_ROOM_POLICY.md`
5. `docs/TRACE_POLICY.md`
6. `docs/PREFLIGHT_CHECKLIST.md`
7. `docs/PROJECT_SPEC.md`
8. `docs/EVALUATION.md`
9. `config/topic.yaml`
10. `artifacts/trajectories/reviews/BG-D01-SCALE-003-CODEX-ACCEPTANCE.md`
11. `artifacts/trajectories/reviews/BG-D01-SCALE-003-CODEX-ACCEPTANCE_RU.md`
12. `artifacts/trajectories/reviews/TRC-BG-D01-SCALE-003.yaml`
13. `artifacts/trajectories/session-boundaries/SES-20260830-004.yaml`

The repository already has a dirty working tree. Preserve all inherited changes and
attribute only your own edits to this trajectory. Never persist a machine-specific
absolute path.

## Exactly authorized implementation scope

Correct only these five confirmed blockers:

- A1: make the real orchestrator and worker runtime accept injected
  `FixtureEngineBindings`; keep D01 as a thin data-only composition wrapper.
- A2: replace the manual fake-callback TEST-ONLY dispatcher with one TEST-ONLY
  descriptor that traverses the real engine-parameterized orchestrator, worker,
  evaluator, replay, and report pipeline through bounded injected process transport.
- S1: derive and compare the exact expected canonical sandbox and allowed-path
  policies for every execution slot during live local validation and replay. Reject
  extra, missing, changed, or slot-substituted policy.
- S2: bind every observation and evaluator output positionally to exactly one
  expected proof, role, profile, and execution slot. Add cross-role substitution
  negative tests.
- S3: require each per-arm event `decisionSha256` to equal the digest of the actual
  immutable decision for that arm during live local validation and replay. Add a
  negative test with an internally consistent but arbitrary digest.

Preserve these already-passing contracts unchanged:

- A3: `BoardObservation` remains outside the generic factory and explicitly injected.
- S4: replay independently recalculates `reasonCorrectReject` and
  `oracleAcceptedCandidate`, and inversion tests fail.
- P1: recursive enumeration remains globally sorted and retains the `a/source.ts`
  plus `a.ts` ordering case.
- P2: changed bytes in an already registered nested source still fail closed.
- D1: active projections retain SCALE-003 as owner-approved eligible evidence and
  `SCALE_READY=false`.

You may reconcile only directly affected tests, manifests, provenance, the
Improvement Changelog, new SCALE-004 trace/review service artifacts, and active
status projections after code evidence exists.

## Hard exclusions

Do not change fixtures, candidates, oracles, ground truth, the five visible
assertions, evaluation methodology, targets, or denominators. Do not touch BG-D02 or
held-out work. Do not reduce the benchmark, run official/scored evaluation, invoke a
live product model, use Chromium, change dependencies, `package-lock.json`, runtime
policy, containers, Phase 0.5, Linux policy, or `K=0`. Do not run an unscored repair.
Do not rewrite historical records. Do not change `SCALE_READY`. Do not commit or push.

## Execution and evidence protocol

1. Inspect only the minimum repository-local implementation surface needed for A1,
   A2, S1, S2, and S3.
2. Preserve a runnable inherited baseline and avoid unrelated cleanup.
3. Document public/exported and non-obvious contracts with concise English JSDoc or
   comments only where reviewer context is needed.
4. Record each meaningful hypothesis, change, exact command, evidence, and decision
   in the append-only Improvement Changelog entry for SCALE-004.
5. After implementation, run each command at most once in this order:
   `npm run compile`, `npm test`, then `npm run task -- d01:verify`.
6. On the first deterministic command failure, stop immediately. Do not retry, patch
   around it, install dependencies, or expand scope. Write a concise Russian
   repository-local stop checkpoint under `artifacts/trajectories/reviews/` that
   reports the command, safe failure class, affected blocker, and exact owner decision
   needed. Do not include raw output, secrets, or absolute paths.
7. If all checks pass, write a complete natural-Russian implementation checkpoint at
   `artifacts/trajectories/reviews/BG-D01-SCALE-004-IMPLEMENTATION-CHECKPOINT_RU.md`.
   It must cover changes by A1/A2/S1/S2/S3, preservation of A3/S4/P1/P2/D1, commands
   and results, errors/retries, privacy exclusions, remaining risks, and the next
   trace-review and repeated-acceptance-matrix gates. It must explicitly say that
   `SCALE_READY=false` and commit/push were not performed.

Your JSONL stdout is captured externally and must remain a faithful trajectory.
Never print environment-variable values, external paths, secrets, raw trace payload,
or private denylist terms. A successful implementation is still only a candidate
until the captured trace passes automated review, complete EN/RU technical review,
and separate owner approval.
