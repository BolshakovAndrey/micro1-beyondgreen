# BeyondGreen — Evaluation Projection

**Projection of:** `docs/PROJECT_SPEC.md@1.1.0`
**Normative:** no; the global product-semantics specification wins on conflict
**Evaluation version:** `eval-v1.1.0`
**State:** Phase 0.5 inputs are frozen under the explicit nested-CLI waiver.
`TRC-BG-D01-VERIFY-002` remains an eligible historical verification of the prior
unscored D01 state, but it does not cover the scale-readiness implementation in
`SES-20260830-001`. Those corrections are repo-locally validated, and exact native
capture/review of `TRC-BG-D01-SCALE-001` passed. The repeated Claude Opus checkpoint
returned `D01_CHECKPOINT=PASS_WITH_CONCERNS` and `SCALE_READY=no`; Codex confirmed
remaining architecture and evidence concerns. The owner promoted the reviewed
coding-agent trajectory into `actual_traces`; its evidence eligibility is independent
from the future scaling gate. The owner approved `SES-20260830-002`, and
`TRC-BG-D01-SCALE-002` passed native capture, review, safe scanning, and owner
promotion. A later Codex acceptance matrix confirmed four bounded blockers. Under
owner-approved `SES-20260830-003`, `TRC-BG-D01-SCALE-003` now routes the real
orchestrator and workers through one injected descriptor pipeline, explicitly
injects the D01 observation schema, verifies falsifiable runner capability and
per-arm event evidence, independently replays both evaluator conclusions, and
correctly validates nested package paths plus registered-source bytes. Under
owner-approved `SES-20260830-004`, the five remaining runtime/capability blockers
were closed. Ordinary tests passed `56/56`; complete `d01:verify`, offline replay,
and Phase 0.5 verification passed without changing the frozen methodology, visible
assertions, candidates, or oracles. Eight implementation JSONL captures passed raw
scanning, and the repeated Codex matrix passed all A1/A2/A3/S1/S2/S3/S4/P1/P2/D1
criteria. The owner approved and indexed all eight reviewed captures and explicitly
set `SCALE_READY=true`; deterministic machine-path redaction remains mandatory, and no
official/scored run exists.
The owner-approved `SES-20260830-009` integration adds the frozen BG-D02-D04
development packages to the existing typed verification architecture. Fixture-local
verification and the shared D01-D04 manifest, isolation, descriptor/task bijection,
discarded-prototype, and deterministic D01 replay checks pass. These are unscored
development controls and do not change evaluation v1.1, any candidate/oracle bytes,
visible assertions, targets, denominators, attempt policy, or `K=0`.
The frozen held-out coordinator trajectory was later promoted to `actual_traces` in
commit `e08f2f91440a484df9f9c9ae772461bd3d9d49d1`; the bounded TypeScript `TS2532`
correction followed in commit `cb51e7de1e9908088dbef4dbeb29946d1edbc16b`.
Under owner-approved `SES-20260830-015`, a non-scored freeze self-test passed all 20
compilation/visible gates, ten evaluator accepts, ten reason-correct evaluator
rejects, manifest reconciliation, reciprocal oracle denial, exact 10-fixture /
20-candidate cardinality, 4/6 membership, ten-class bijection, sole challenging case
`BG-H02`, `K=0`, and the held-out leak scan. The normative task names
`baseline:verify`, `beyondgreen:verify`, `evaluation:run`, and `replay` are registered
only as exact-version pre-unblinding contract validators. They report and enforce
`officialOrScoredRun=false`, `unblindingPerformed=false`, `armExecuted=false`, and
`runRecordCreated=false`; `replay` additionally reproduces the existing unscored D01
evidence offline. A temporary manifest-backed clean-extraction rehearsal passed
compile, 115/115 ordinary tests, the complete freeze self-test, all four contract
entrypoints, D01 replay, and the 54/54 license audit. It created no persistent archive
or run record. These readiness controls are not evaluation results and make no score
claim; official/scored execution and the single unblinding remain separately gated.

This projection specializes `FR-001`–`FR-012`, `NFR-001`–`NFR-009`,
`EV-001`–`EV-013`, and `AR-003`–`AR-007`. It claims no result.

## Fixed cases and decisions

- Exactly ten independently authored synthetic fixtures: `BG-D01`–`BG-D04` and
  `BG-H01`–`BG-H06`.
- Exactly one preserving and one seeded false-green candidate per fixture.
- Exactly 20 frozen ground-truth decisions: ten accept and ten reject.
- All 20 candidates compile and pass 100% of visible legacy tests at freeze.
- Exactly one official attempt per arm/candidate and a three-minute maximum.
- Candidate hashes are identical across arms and checked before and after runs.
- Held-out evidence is unblinded once and never tunes v1.1 afterward.

The ten fixture behavior classes are stale snapshots, queued/batched updates,
derived state, subscription cleanup, prop reset, async ordering, identity stability,
conditional lifecycle, external store, and rollback. Exact case assignment freezes
before fixture code as a bijection. At least one fixture is labeled challenging
before code, with rationale and final-result disclosure.

Frozen assignment: `BG-D01` stale snapshots, `BG-D02` queued/batched updates,
`BG-D03` derived state, `BG-D04` subscription cleanup, `BG-H01` prop reset,
`BG-H02` async ordering (predeclared challenging case), `BG-H03` identity stability,
`BG-H04` conditional lifecycle, `BG-H05` external store, and `BG-H06` rollback.
Membership/classes remain frozen. BG-D01 through BG-D04 development prose,
candidates, and oracle packages now exist. The six held-out implementations also
exist as frozen non-official verification packages; integration checks pass without
an official/scored run or unblinding. The owner accepted the integrated state and
authorized one checkpoint commit without push; the reviewed held-out coordinator
trajectory is now promoted in `actual_traces`.

## Two scored arms (`FR-011`, `EV-003`, `EV-004`)

| Arm | Inputs | Decision policy | Oracle visibility |
| --- | --- | --- | --- |
| Status quo | Immutable candidate, compilation, visible legacy tests | Accept if compilation and all visible tests pass; reject on proven visible failure; abstain on operationally inconclusive execution | none |
| BeyondGreen | Identical candidate and visible inputs | Risk inventory, additional probes/contracts, independent evidence, then accept/reject/abstain | final evidence only after decision finalization |

Both arms share candidates, visible inputs, environment, compilation, tests, scoring,
seed policy, evidence recorder, wall-clock ceiling, and operational limits. Baseline
resource differences are disclosed. BeyondGreen's live engine, model/mode,
invocation count, timeout/retry limits, and token-reporting policy freeze after
Phase 0.5. Actual runtime, calls, human time, tokens only when stably reported,
fixed-subscription billing, and monetary-cost applicability/status are reported;
per-run USD is not calculated, estimated, or capped.

The optional live adapter contract is frozen as `codex-exec-jsonl-v1` targeting
`gpt-5.6-sol` through locally ChatGPT-authenticated `codex exec`, with one call,
zero retries, a read-only sandbox, and a 180-second total deadline. Nested-desktop
runtime validation is owner-waived and remains deferred/unverified; two historical
failures remain failures. Model unavailability or transport failure produces
`abstain`, never a substitute or retry. Deterministic `offline-replay-jsonl-v1` is
the verified reproducibility path but does not prove live model behavior. Fixed
subscription per-run USD is `not_applicable` or `not_measured` and is not calculated
or estimated. Tokens are recorded only when reported explicitly and stably.

## Metrics and exact target semantics (`EV-007`, `EV-008`)

```text
correct_decision =
  (verdict == accept AND ground_truth == preserving) OR
  (verdict == reject AND ground_truth == false_green)

decision_accuracy = correct_decisions / 20
reason_correct_reject = verdict == reject AND rationale identifies the violated frozen behavior class or invariant family
defect_recall = false_green_candidates_with_reason_correct_reject / 10
false_alarm_rate = preserving_candidates_blocked / 10
preserving_candidate_blocked = verdict == reject OR verdict == abstain
completion_rate = completed_decisions / 20
completed_decision = schema_valid_complete_report AND verdict IN {accept, reject}
accuracy_advantage = BeyondGreen correct decisions - baseline correct decisions
```

An abstention blocks merge but is not a correct decision, not defect recall, not
completion, and is a false alarm when ground truth is preserving.
Reason correctness is evaluated only after verdict immutability and creates no
pre-decision feedback.

Predeclared BeyondGreen targets, without rounded substitutes:

- decision accuracy `>=16/20`;
- accuracy advantage over status quo `>=6/20`;
- defect recall `>=8/10`;
- false alarms `<=2/10`;
- completion `>=18/20`.

If a target is missed, the unchanged target and honest actual result are both
published. No score is inferred from missing observations.

By construction the status-quo baseline should accept all 20 candidates and score
exactly `10/20`, with `0/10` recall and `0/10` false alarms. Any different completed
baseline result invalidates the candidate set or run. The advantage target is an
explicit restatement of the absolute accuracy target, not an independent empirical
claim.

## Candidate and oracle boundary (`EV-002`, `EV-005`, `EV-006`)

The fixture-authoring path is outside both arms. For every fixture it separately
freezes:

1. an arm-visible task package containing public task, source, visible tests,
   contracts, and allowed inputs;
2. a verifier-only oracle package containing hidden expected behavior and invariant
   checks; and
3. preserving and false-green candidates with immutable hashes and ground truth.

Arm processes and filesystems never mount `evaluation/verifier-only/`; arm-visible
packages are stored under `evaluation/arm-visible/`. Both directories ship in the
reproducible archive, while runtime capabilities enforce isolation. A denied-access
test must prove the boundary before scoring. Typed APIs or prompt instructions alone
are insufficient.

Before scored runs, the freeze self-test must show all 20 compilation/visible gates
green; the evaluator must then accept all ten preserving candidates and reject all
ten false-green candidates. Any miss blocks the benchmark.

BeyondGreen's oracle-free internal checker executes only the arm-derived ProbePlan
and arm-visible contracts. Evaluation uses `K=0`: no independent-evaluator verdict,
category, expected value, action-level diagnostic, diff, or oracle detail reaches
either arm before its decision is immutable and scored. The candidate itself is never
modified during a scored run.

## Verdict and completion rules (`FR-008`, `NFR-002`)

- `accept`: complete evidence supports merge and all blocking checks pass.
- `reject`: complete evidence proves a reproducible blocking defect. A proven
  compilation failure or deterministic visible-test failure forces reject.
- `abstain`: timeout, failed required probe, nondeterminism, missing evidence,
  ambiguity, provider transport failure, or denied oracle access. It blocks merge.

An evaluator version/hash mismatch invalidates the run at harness level and blocks
the benchmark; it is not arm-observable and cannot alter the arm verdict. Provider
transport failures permit no retry or second attempt.

Only schema-valid complete accept/reject records count as completed decisions.
Operational uncertainty must never be mislabeled as a proven defect.

## Run protocol (`EV-004`–`EV-010`)

1. Validate clean-room state, evaluation version, candidate/manifests hashes,
   model/mode and adapter, invocation/time/retry limits, token-reporting policy,
   fixed-subscription billing and monetary-cost status, three-minute ceiling, and
   policy digests.
2. Prove denied oracle access for both arms.
3. Self-test all 20 visible gates, then self-test evaluator ground truth.
4. Run status quo exactly once on every candidate.
5. Run BeyondGreen exactly once on every candidate without candidate mutation or
   verifier feedback.
6. Preserve timeouts, failures, abstentions, resource use, hashes, and evidence paths.
7. Recompute aggregates only from immutable per-candidate JSON records.
8. Unblind held-out results once and prohibit v1.1 tuning afterward.

Required command families:

```text
npm run task -- baseline:verify --evaluation-version eval-v1.1.0
npm run task -- beyondgreen:verify --evaluation-version eval-v1.1.0
npm run task -- evaluation:run --evaluation-version eval-v1.1.0
npm run task -- replay --evaluation-version eval-v1.1.0
```

The current complete unscored D01 vertical slice is reproduced with
`npm run task -- d01:verify`; its preserved demonstration and offline replay use
`npm run task -- d01:demo` and `npm run task -- d01:replay`.
The typed registry under `scripts/tasks/` lists only implemented tasks and rejects
unknown names or arguments before process execution.
Ordinary `npm test` uses bounded deterministic discovery under `tests/` and
`evaluation/arm-visible/`; it never discovers `evaluation/verifier-only/`. The safe
frozen Phase 0.5 audit and harness tests are available only as
`npm run task -- phase0.5:verify`; live historical run commands are not registered.

## Per-candidate evidence fields (`EV-009`)

Each record contains: schema and evaluation versions; arm; fixture and candidate IDs;
development/held-out class; ground-truth reference available only to evaluator;
arm-visible and verifier-only manifest digests; candidate hash before/after; attempt
ordinal fixed to one; start/end/duration; timeout ceiling; compilation and visible
test results; risk/probe summaries where applicable; verdict; evidence-completeness
state; correct-decision bit; defect-recall bit; false-alarm bit; completion bit;
errors; model/mode, invocation count and technical limits; tokens when stably
reported; fixed-subscription billing and monetary-cost applicability/status; human
time; and evidence paths/digests.

Human time is agent-supervision time. No time-savings claim is made against the
automated status-quo arm, and manual review time is not estimated.

JSON must pass a versioned Zod schema. Static HTML is generated only from the
validated JSON. Offline replay must reproduce the report without network credentials.

## Unscored D01 repair (`FR-012`, `EV-011`)

Only after the scored D01 verdict is final and a human explicitly approves may one
targeted repair demo run. It receives a distinct unscored run type and candidate
hash, then undergoes a fresh independent verification. It cannot enter any scored
denominator, target, or resource comparison.

## Secondary Chromium evidence (`EV-012`, `NFR-009`)

Exactly one synthetic before/after scenario may compare React renders and CPU. It
must first run identical actions and prove all behavioral invariants and observables
equal. A behavioral failure forbids a performance-win claim. Chromium results never
affect decision scoring.

The frozen independent 300-card museum-board spike passed all correctness observables
and retained 30 measured samples per arm after five warmups. It observed 2400 versus
1900 card renders (20.83% fewer) for this synthetic scenario only. Mean CDP
`TaskDuration` was 4.7071 ms versus 5.0037 ms, so CPU improvement is not demonstrated
or claimed. These Phase 0.5 measurements are feasibility evidence, not an official
benchmark result and not part of any scored denominator.

## Challenging case (`EV-013`)

Before fixture code, at least one fixture is recorded in
`evaluation/challenging-cases.yaml` with its behavior class and reason for difficulty.
The final report explains what its result revealed, including a failure or abstention
without suppression.
