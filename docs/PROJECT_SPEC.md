# BeyondGreen — Global Product Specification

**Normative status:** single source of truth
**Version:** `1.1.0`
**State:** normative v1.1 remains frozen and unchanged. Implementation is complete;
official `eval-v1.1.0` evidence is immutable at `POSTDECISION-004`: 40 RUN-002 arm
decisions, 80 captures, 40 evaluator records, 10/20 status-quo accuracy and 19/20
BeyondGreen accuracy. Post-decision recovery made zero new arm or model calls. The final
video uses `40+ ITERATIONS`; its primary YouTube URL is verified without sign-in and a
public Vimeo mirror is recorded. The final independent review and config-derived
clean-extraction rehearsal passed, and the owner authorized final archive creation after
the complete release gates. Upload remains owner-controlled. This status does not amend
the normative semantics below.

### Historical implementation checkpoints

The following chronological record is retained as provenance and must not be read as the
current project state. Phase 0.5 was frozen under an explicit nested-CLI waiver.
The unscored D01 vertical slice has an owner-approved eligible historical
verification trace, `TRC-BG-D01-VERIFY-002`. Under approved boundary
`SES-20260830-001`, the enumerated scale-readiness corrections are implemented and
repo-locally validated. That historical trace does not cover the new implementation.
`TRC-BG-D01-SCALE-001` has passed exact native byte identity, strict UTF-8,
categorical path redaction, complete native-layer review, and the private-denylist
scan. The repeated Claude Opus checkpoint returned
`D01_CHECKPOINT=PASS_WITH_CONCERNS` and `SCALE_READY=no`; Codex independently
confirmed remaining architecture and evidence concerns. The repository owner approved
the reviewed trajectory as eligible implementation evidence and it is indexed in
`actual_traces`; its eligibility is independent from the future scale-readiness
checkpoint. The owner subsequently approved `SES-20260830-002`, and
`TRC-BG-D01-SCALE-002` passed capture, review, safe scanning, and owner promotion.
After a Codex acceptance matrix confirmed four remaining blockers, the owner approved
the bounded correction boundary `SES-20260830-003` and one eligible implementation
trajectory, `TRC-BG-D01-SCALE-003`. The real orchestrator, worker processes, replay,
and report now traverse one injected generic descriptor execution path while D01
remains a data-only composition root; the D01 observation schema is explicitly
injected, and a TEST-ONLY descriptor proves the injected contracts through the real
pipeline. Runner evidence now verifies launch-to-worker identity, canonical sandbox
and path-policy digests, exact role/profile/proof bijection, per-arm event state, and
evaluator binding to immutable arm decisions. Offline replay independently checks
`reasonCorrectReject` and `oracleAcceptedCandidate`. Recursive package validation
accepts valid nested structures and rejects changed bytes in a registered source.
The later owner-approved `SES-20260830-004` trajectory family closed those five
bounded blockers without changing the five visible assertions, candidate bytes,
behavior freeze, oracles, evaluation methodology, targets, dependencies, or runtime
policy. Ordinary tests passed `56/56`; complete `d01:verify`, offline replay, and
Phase 0.5 verification passed. Eight automatic implementation JSONL captures passed
safe raw scanning, and the repeated Codex matrix passed A1, A2, A3, S1, S2, S3, S4,
P1, P2, and D1. The repository owner approved the reviewed main trace and seven
continuations, indexed all eight captures in `actual_traces`, and explicitly set
`SCALE_READY=true`. Deterministic machine-path redaction remains mandatory. No
official/scored run, live-model call, Chromium call, BG-D02 work, commit, or push
occurred.
Under owner-approved `SES-20260830-009`, the independently authored BG-D02,
BG-D03, and BG-D04 development fixtures were integrated without changing this
normative product contract. Their frozen candidates, visible assertions, and
verifier-only packages pass fixture-specific verification and the shared D01-D04
descriptor, manifest, isolation, and replay regression. This is unscored development
evidence; the integration trajectory and its continuations remain pending trace
capture/review and owner promotion. No official/scored run occurred.
Under owner-approved `SES-20260830-011`, the six frozen held-out packages BG-H01
through BG-H06 are integrated byte-for-byte from their three authorized fixture
commits. Non-official visible gates, evaluator self-checks, immutable manifests,
reciprocal filesystem denial, ten-class bijection, 4/6 membership, sole challenging
case, neutral candidate cardinality, oracle-leak, and `K=0` checks pass. No
official/scored execution or unblinding occurred. The repository owner accepted the
integrated state and authorized exactly one checkpoint commit without push.
`TRC-BG-HELDOUT-FIXTURES-INTEGRATION-001` was subsequently reviewed and promoted to
`actual_traces` in commit `e08f2f91440a484df9f9c9ae772461bd3d9d49d1`.
The bounded TypeScript `TS2532` correction was integrated in commit
`cb51e7de1e9908088dbef4dbeb29946d1edbc16b` without a Chromium run.
Under owner-approved `SES-20260830-015`, the pre-unblinding freeze self-test then
passed compilation/visible gates for all 20 candidates, evaluator controls for ten
accepts and ten reason-correct rejects, immutable manifest reconciliation, reciprocal
oracle denial, exact cardinality/membership/class controls, and the held-out leak
scan. The exact normative task names now exist only as fail-closed pre-unblinding
contract validators; they cannot execute an arm, score, unblind, call a model, or
create a run record. A temporary manifest-backed ZIP clean-extraction rehearsal
passed 115/115 ordinary tests, the complete freeze self-test, all four contract-only
entrypoints, existing unscored D01 offline replay, and the 54/54 license audit. Two
non-indexed control-plane service records were excluded under explicit owner approval
because one preserved a machine-local control path; their source SHA-256 values and
reasons were bound in the temporary manifest. The archive and extraction directory
were deleted. No official/scored run, unblinding, final archive, live-model call,
Chromium call, commit, or push occurred.
**Human approval:** 2026-08-29T10:46:39Z
**Clean session:** `SES-20260829-001`

This document is the only normative product-semantics contract.
`docs/SUBMISSION_ARTIFACTS_SPEC.md` is the subordinate but binding delivery
contract; it may add packaging and evidence obligations but may not change product
semantics. `config/topic.yaml`, `docs/EVALUATION.md`, diagrams, changelogs,
implementation plans, schemas, and reports are projections of requirement IDs in
this specification. If a projection conflicts with this file, this file wins and the
projection must be corrected.

No product code, fixture implementation, official benchmark run, or scored model
result is part of this specification. Phase 0.5 feasibility evidence is referenced
only to freeze pre-product contracts and limitations.

## 1. Product thesis

**BeyondGreen** helps a frontend engineer decide whether an already-existing React
state-to-signals migration is safe to merge when mature legacy tests are green but
potentially incomplete. The dangerous outcome is a plausible candidate that compiles
and passes visible tests while changing an observable behavior, update ordering,
identity, lifecycle, subscription, or rollback invariant that those tests omit.

> Green compilation and legacy tests are evidence, not proof. Merge only when an
> independent verifier can connect an immutable candidate to complete, reproducible
> behavioral evidence.

The judge-facing name is BeyondGreen. This is a marketing rename only; the proven v1
scope remains React state to signals. The primary user is a frontend engineer
migrating mature React code with green but potentially incomplete legacy tests.

The only scored workflow is **verify-existing**. A candidate already exists before a
scored run and remains immutable throughout verification. BeyondGreen inventories
risk, derives additional probes and behavioral contracts, executes independent
checks, and returns an evidence-backed merge decision. It does not generate or repair
the candidate during a scored run.

The usable output for every candidate is a **verification evidence bundle**:

- immutable candidate identity and hashes;
- state, dependency, lifecycle, subscription, ordering, identity, and rollback risk
  inventory;
- compilation and visible legacy-test results;
- additional probe and behavioral-contract results;
- final `accept`, `reject`, or `abstain` verdict with rationale;
- schema-validated JSON and a static HTML report;
- runtime, human-time, model/token reporting, billing mode, and monetary-cost
  applicability/status metadata; and
- evidence digests sufficient to reproduce the decision.

## 2. Scope, non-goals, and product boundary

### In scope for mandatory v1

- Verification of existing React state-to-signals candidates only.
- Ten independently authored synthetic fixtures: four development and six held-out.
- One behavior-preserving and one seeded false-green candidate per fixture: exactly
  20 fixed accept/reject decisions.
- Two scored arms receiving the same immutable candidates: a status-quo baseline and
  BeyondGreen.
- A reproducible CLI, schema-validated JSON, and static HTML report.
- Node.js/TypeScript throughout: TypeScript Compiler API, Zod, `node:test`, a minimal
  React harness, jsdom formal behavioral checks, and Chromium only for the demo and
  secondary performance evidence.
- A provider-neutral reasoning-model adapter and offline replay.
- Physical hidden-oracle isolation, `K=0` verifier feedback, and a denied-access test.
- One realistic end-to-end demo, complete changelog/reproduction evidence, eligible
  traces, and a clean-extraction submission rehearsal.

### Not scored and tightly bounded

After a verdict and explicit human approval, one targeted repair demonstration is
allowed for development fixture `BG-D01`. It is unscored, clearly labeled, and must
be followed by a fresh independent verification. It cannot change any scored result.

### Deferred until all mandatory gates pass

- generation-migration as a scored mode;
- a third scored arm;
- a full GUI;
- a broad mutation catalog;
- performance as a primary claim; and
- additional control documents not required by qualification, judging, or release.

### Explicit non-goals

- Automatic modification of a real or proprietary repository.
- Claims of general codemod coverage, production readiness, statistical
  significance, or production performance.
- Training or fine-tuning a model.
- Optimization driven by held-out results after unblinding.
- Browser, connected-app, private-MCP, private-memory, sibling-workspace, or private
  repository access.
- Product source, fixtures, tests, or scripts in Python.

## 3. Terminology and decision semantics

| Term | Normative definition |
| --- | --- |
| Candidate | A pre-existing React state-to-signals change frozen and hashed before either scored arm runs. |
| Behavior-preserving candidate | A candidate that compiles and satisfies every frozen observable, lifecycle, subscription, ordering, identity, and rollback invariant for its fixture. |
| Seeded false green | A fixed candidate that compiles and passes visible legacy tests but violates at least one verifier-only behavioral invariant. |
| Status-quo baseline | The policy that accepts when compilation and visible legacy tests pass, without additional probes, contracts, or risk analysis. |
| Hidden behavior oracle | Frozen expected behavior and checks physically unavailable to both scored arms and owned only by the independent evaluator. |
| BeyondGreen internal checker | An arm-owned, oracle-free jsdom checker that executes only the arm-derived `ProbePlan` and arm-visible contracts. |
| Independent evaluator | A harness-owned post-decision scorer that alone owns verifier-only oracles and ground truth; it runs only after the arm verdict is immutable. |
| `K=0` | Zero evaluator-derived feedback or repair rounds before the arm verdict is immutable and scored. |
| `accept` | Evidence is complete and every blocking check supports merging the immutable candidate. |
| `reject` | Evidence identifies a reproducible blocking defect or contract violation. |
| `abstain` | A decision cannot be supported because evidence is incomplete, a required probe fails operationally, a timeout occurs, or verification is otherwise inconclusive. Abstention blocks merge. |
| Completed decision | A schema-valid final `accept` or `reject` with complete required evidence. `abstain` is not completion. |
| Verification evidence bundle | The immutable input identity, risk inventory, check results, verdict, rationale, resource metadata, and report artifacts for one candidate. |

All timeouts, required-probe failures, missing evidence, nondeterminism, evaluator
mismatch, and denied oracle-access attempts fail closed to `abstain` and block merge.
No such event may be silently converted to `accept` or to a proven `reject`.

## 4. Clean-room and oracle invariants

1. Product work reads and writes only inside the clean repository root.
2. The only permitted outside-root operations are scanner-only denylist reads and
   reviewed raw-trace writes/readback through their named environment variables.
3. No employer/client code, tests, data, identifiers, structures, screenshots,
   traces, or private documentation may enter source, prompts, reports, or artifacts.
4. Fixture behavior prose is independently authored from public anchors before any
   fixture code or candidate exists, then hashed and provenance-reviewed.
5. The arm-visible task package and verifier-only oracle package are separately
   hashed and stored. Neither scored arm process or filesystem mounts verifier-only
   paths.
6. Oracle isolation is enforced by capabilities, not prompt wording. A denied-access
   test is mandatory before scored runs.
7. Evaluation uses `K=0`: no independent-evaluator result, category, expected value,
   action-level diagnostic, diff, or mutant information reaches an arm before its
   verdict is final and scored.
8. Scanner findings, uncertain provenance/license, or resemblance to remembered
   private structure stop the affected task for human review.
9. Judge-facing records disclose environment-variable names and digests but never
   private values, denylist contents, or raw absolute paths.

## 5. Fixed benchmark and candidate construction

Evaluation v1.1 contains exactly ten independently authored synthetic fixtures:

- `BG-D01` through `BG-D04`: development fixtures;
- `BG-H01` through `BG-H06`: held-out fixtures.

Each fixture is assigned exactly one of these behavior classes before fixture code.
The assignment is a bijection: every class is used by exactly one fixture.

1. stale snapshots;
2. queued or batched updates;
3. derived state;
4. subscription cleanup;
5. prop reset;
6. async ordering;
7. identity stability;
8. conditional lifecycle;
9. external store; and
10. rollback.

At least one fixture is labeled as the challenging case before fixture code. Its
manifest records why it is challenging, its behavior class, and the final report
explains what its result revealed.

For every fixture, an independent fixture-authoring path creates and freezes:

- behavior-first prose, public anchors, neutral domain, provenance, license/terms,
  observable actions, invariants, and SHA-256 digest;
- one behavior-preserving candidate; and
- one seeded false-green candidate that remains green under compilation and visible
  legacy tests but fails at least one verifier-only invariant.

Every behavior-preserving candidate must also compile and pass 100% of its fixture's
visible legacy tests. The freeze self-test records this fact; a preserving candidate
that fails the visible gate is invalid and must be independently reauthored before
the benchmark freezes.

This yields exactly 20 fixed ground-truth decisions: ten `accept` and ten `reject`.
Both scored arms receive those same candidates. The development/held-out membership,
candidate hashes, ground truth, visible inputs, and oracle hashes freeze before
solution optimization. The development workflow and both arms are capability-denied
access to held-out oracle packages; the evaluator opens them only at the single
recorded unblinding.

Before any scored arm run, evaluator self-tests must accept all ten preserving
candidates and reject all ten false-green candidates. Any miss blocks evaluation.

## 6. Normative scored workflow

The fixture-authoring and evaluator setup occur outside both scored arms:

```text
author behavior prose and public provenance
  -> freeze arm-visible task package
  -> independently freeze verifier-only oracle package
  -> create and hash preserving and false-green candidates
  -> evaluator self-test on all 20 candidates
  -> human freeze approval
```

The BeyondGreen scored workflow is:

```text
ingest immutable existing candidate
  -> inventory migration risk
  -> run compilation and visible legacy tests
  -> derive additional probes and behavioral contracts
  -> execute arm-owned oracle-free jsdom checks from the ProbePlan
  -> assemble complete evidence
  -> accept | reject | abstain
  -> emit JSON and static HTML report
  -> freeze arm verdict
  -> independent evaluator scores against verifier-only oracle
```

The candidate hash is checked before and after every scored run. BeyondGreen must not
edit, regenerate, repair, or request a second candidate. The evaluator owns final
ground-truth scoring and never gives repair feedback during the run.

Each candidate has exactly one official scored run, exactly one attempt, and a
maximum wall-clock duration of three minutes. The model/mode, invocation count,
timeout/retry limits, token-reporting policy, fixed-subscription billing mode, and
monetary-cost applicability/status are frozen after Phase 0.5 and before fixtures;
no per-run USD calculation, estimate, or cap is required. A timeout produces
`abstain`.
Provider transport or rate-limit failures permit no model retry or second attempt;
they produce `abstain`. Offline replay is evidence reproduction, not a retry.

The status-quo baseline runs the same candidate, compilation command, visible tests,
environment, wall-clock ceiling, and evidence recorder. It accepts only when
compilation and all visible legacy tests are green. It performs no risk inventory,
additional probes, behavioral-contract derivation, or oracle-aware verification.

For BeyondGreen, a proven compilation failure or deterministic visible legacy-test
failure is a blocking defect and forces `reject`. A crash, timeout, or
nondeterministic legacy-gate result forces `abstain`. BeyondGreen may never `accept`
a candidate whose legacy gate is not green.

## 7. Purposeful architecture and typed contracts

The minimum solution is one BeyondGreen orchestrator with narrow typed stages, an
arm-owned oracle-free internal checker, and a separate independent evaluator
boundary. Stages are not decorative autonomous agents.

| Stage | Input | Output | Fail-closed condition |
| --- | --- | --- | --- |
| `ingestCandidate` | Candidate path, fixture ID, frozen manifest | `ImmutableCandidateRef` with hashes | Missing input, hash mismatch, outside-root path |
| `inventoryRisk` | Immutable candidate and visible source/types | `RiskInventory` | Unsupported syntax, ambiguous ownership, external import |
| `runLegacyGate` | Candidate, compile command, visible test IDs | `LegacyGateResult` | Crash, timeout, nondeterminism |
| `deriveProbePlan` | Risk inventory and arm-visible contracts | `ProbePlan` with risk-to-check links | Missing coverage or unsupported risk |
| `runInternalChecks` | Immutable candidate reference, arm-derived `ProbePlan`, arm-visible contracts | `InternalCheckResult` and evidence digests | Oracle access attempt, required-probe failure, timeout, nondeterminism |
| `decide` | Complete immutable stage records | `accept`, `reject`, or `abstain` with rationale | Missing or inconsistent evidence |
| `buildReport` | Final evidence bundle | Schema-valid JSON and static HTML | Schema failure, dangling evidence, unsupported claim |

Runtime schemas use Zod. Source and type analysis use the TypeScript Compiler API.
Formal behavioral checks execute in jsdom through a minimal React harness using
`node:test`. Chromium is excluded from formal correctness scoring and used only for
the E2E demonstration and the single secondary performance scenario.

The reasoning engine is accessed through a provider-neutral adapter. The live engine
is selected during Phase 0.5 and frozen before fixtures. Every live result must be
recordable and replayable through an offline adapter without network access. Offline
replay reproduces submitted evidence; it is not a new scored attempt.

`InternalCheckResult` contains only arm-visible probe outcomes and their evidence
digests. It has no oracle capability. After the arm verdict is immutable, the
independent evaluator produces an `EvaluatorResult` containing ground-truth score and
evidence digests. Before finalization it exposes no oracle source, expected values,
action sequences, reference diffs, failure category, or diagnostic to either arm.
An evaluator version/hash mismatch invalidates the scored record and blocks the
benchmark; it is not an arm-observable event and cannot alter the arm verdict.

## 8. Fair two-arm comparison

| Arm | Inputs | Decision policy | Additional verification |
| --- | --- | --- | --- |
| Status quo | Same immutable candidate, compiler, visible tests, environment, and limits | Accept when compilation and visible tests pass; otherwise reject, or abstain on operationally inconclusive execution | None |
| BeyondGreen | The identical candidate and visible inputs | Build risk inventory and independent evidence, then `accept`, `reject`, or fail-closed `abstain` | Additional probes/contracts and oracle-free internal behavioral checks |

Fairness rules:

- both arms receive the same 20 candidates and frozen visible inputs;
- candidates remain byte-identical across arms and throughout scoring;
- each arm receives one official attempt per candidate and the same three-minute
  wall-clock ceiling;
- environment, compilation, visible tests, scoring, seeds, and operational ceilings
  are identical;
- the BeyondGreen reasoning controls are frozen after Phase 0.5; actual model/mode,
  calls, technical limits, runtime, human time, tokens when the CLI reports them
  explicitly and stably, fixed-subscription billing, and monetary-cost status are
  disclosed without a per-run USD calculation or estimate;
- baseline resource differences are disclosed, not hidden or artificially equalized;
- all decisions are scored only by the independent evaluator; and
- no held-out result may tune evaluation v1.1 after unblinding.

## 9. Frozen metrics and targets

Ground truth contains ten preserving candidates and ten seeded false-green
candidates.

```text
correct_decision =
  (verdict == accept AND ground_truth == preserving) OR
  (verdict == reject AND ground_truth == false_green)

decision_accuracy = correct_decisions / 20
normalize(value) = lowercase(value) with each non-[a-z0-9] run replaced by "-"
reason_correct_reject = verdict == reject AND normalize(rationale) literally contains
                        normalize(verifier_behavior_class OR verifier_failed_action)
defect_recall = false_green_candidates_with_reason_correct_reject / 10
false_alarm_rate = preserving_candidates_blocked / 10
preserving_candidate_blocked = verdict == reject OR verdict == abstain
completion_rate = completed_decisions / 20
completed_decision = schema_valid_complete_report AND verdict IN {accept, reject}
accuracy_advantage = BeyondGreen correct decisions - status_quo correct decisions
```

An `abstain` is fail-closed and blocks merge, but it is not a correct accept/reject
decision, does not count as defect recall, counts as a false alarm on a preserving
candidate, and does not count as completion.

Reason correctness is scored post hoc by the independent evaluator only after the arm
verdict and rationale are immutable. This does not create evaluator feedback and does
not weaken `K=0`.

The frozen production operationalization is recorded exactly: it is a lexical token
proxy rather than a semantic-rationale grader. Its result must therefore be reported as
recall under that token contract and must not be generalized into a count of all
semantically correct diagnostic explanations.

By construction, all 20 candidates compile and pass visible legacy tests. The
status-quo policy is therefore predicted before execution to accept all 20: exactly
`10/20` correct decisions, `0/10` defect recall, and `0/10` false alarms. This is a
construction-validity control, not an empirical finding. Any different completed
baseline result invalidates the candidate set or run. The approved `>=6/20`
advantage target is consequently algebraically equivalent to the `>=16/20` absolute
accuracy target and is retained as an explicit comparison requirement. Primary
evidentiary weight rests on BeyondGreen's absolute accuracy, reason-correct defect
recall, false-alarm rate, and held-out results.

Predeclared targets for BeyondGreen:

- decision accuracy at least `16/20`;
- advantage over the status-quo baseline at least `6/20` correct decisions;
- defect recall at least `8/10`;
- false alarms at most `2/10`; and
- completion at least `18/20`.

If any target is missed, the actual complete results are published without changing
the target or suppressing failures. Results are directional evidence for this
synthetic benchmark only; statistical significance and production generalization are
not claimed.

Supporting measures are per-arm and per-candidate runtime, completion, human time,
model/mode, invocation count, technical limits, tokens only when the CLI reports
them explicitly and stably, billing mode, and monetary-cost applicability/status.
Fixed-subscription per-run USD is `not_applicable` or `not_measured`, never estimated
or represented as zero. Missing observations are `not_measured`, not zero.
Aggregates include totals and clearly defined median/p95 where meaningful.
Human time means agent-supervision time only. No human-time-savings claim is made
against the automated status-quo arm; manual review time is out of scope and is not
estimated.

## 10. Secondary performance evidence

Performance is not a primary metric. Exactly one reproducible synthetic Chromium
before/after scenario is allowed as secondary evidence.

The protocol is ordered:

1. run identical user actions against the before and after implementations;
2. prove all declared behavioral invariants and observable outputs are identical;
3. only after behavioral equivalence passes, compare React render counts and CPU;
4. publish environment, actions, repeats, raw measurements, and variance; and
5. if any behavioral check fails, make no performance-win claim.

Performance cannot compensate for a correctness failure and cannot affect the 20
scored decisions.

## 11. Functional requirements

| ID | Requirement | Acceptance evidence | Mapping |
| --- | --- | --- | --- |
| FR-001 | Ingest and continuously hash-check an existing immutable candidate. | Hash/immutability contract tests | RUB-ASE, RUB-REP |
| FR-002 | Inventory state, reads/writes, derived edges, subscriptions, lifecycle, ordering, identity, and rollback risks. | Risk-inventory schema and D01 report | RUB-ASE, RUB-E2E |
| FR-003 | Run compilation and all visible legacy tests without changing their semantics. | Per-candidate legacy-gate records | RUB-MI, RUB-REP |
| FR-004 | Derive additional risk-linked probes and behavioral contracts from arm-visible evidence only. | Probe-plan schema and trace | RUB-ASE |
| FR-005 | Execute arm-derived formal jsdom behavioral checks in the oracle-free internal checker. | Contract tests and internal-check evidence | RUB-ASE, RUB-E2E |
| FR-006 | Physically isolate hidden oracles and prove denied access before scoring. | Process/mount and denied-access tests | RUB-ASE, QG-ORIG |
| FR-007 | Enforce `K=0` and immutable one-attempt scored execution. | Capability and run-cardinality tests | RUB-ASE, RUB-MI |
| FR-008 | Produce fail-closed `accept`, `reject`, or `abstain` decisions from complete evidence. | Verdict-policy negative tests | RUB-E2E, RUB-ASE |
| FR-009 | Expose a reproducible CLI plus schema-valid JSON and static HTML reports. | CLI/E2E/schema tests | RUB-E2E, RUB-REP |
| FR-010 | Support a provider-neutral live adapter and deterministic offline replay. | Adapter contract and replay tests | RUB-ASE, RUB-REP |
| FR-011 | Execute both scored arms on the same 20 immutable candidates. | Candidate/hash/run reconciliation | RUB-MI |
| FR-012 | Permit only one approved, unscored D01 repair demo followed by fresh independent verification. | Demo label, approval, and rerun evidence | RUB-E2E, QG-ORIG |

## 12. Quality and safety requirements

| ID | Requirement | Acceptance evidence | Mapping |
| --- | --- | --- | --- |
| NFR-001 | Use Node.js/TypeScript, TypeScript Compiler API, Zod, `node:test`, minimal React harness, and jsdom for formal checks. | Lockfile, language and dependency audit | RUB-REP, QG-REPRO |
| NFR-002 | Fail closed to `abstain` on timeout, failed required probe, nondeterminism, ambiguity, or incomplete evidence. | Negative tests | RUB-ASE, QG-ORIG |
| NFR-003 | Enforce exactly one attempt, no model transport retry, and a maximum three-minute official run per candidate. | Run-policy audit | RUB-MI, RUB-REP |
| NFR-004 | Freeze model/mode, adapter policy, invocation/time/retry limits, token-reporting policy, fixed-subscription billing and monetary-cost status, dependencies, and evaluator before fixture implementation; do not project a per-run USD estimate or cap. | Versioned manifests and hashes | RUB-REP, QG-ORIG |
| NFR-005 | Keep hidden-oracle, private workspace, browser, connected-app, private-MCP, and global-memory access unavailable or unused as required. | Capability audit and denied-access tests | RUB-ASE, QG-ORIG |
| NFR-006 | Never expose secrets, private paths/terms, oracle details, or unsupported claims. | Preflight and human review | RUB-REP, QG-ORIG |
| NFR-007 | Preserve every failure, abstention, negative result, retry prohibition, resource observation, and decision. | Immutable evidence reconciliation | RUB-MI, QG-TRACE |
| NFR-008 | Make live runs replayable offline and judge-critical checks independent of network credentials. | Clean replay/extraction test | RUB-REP, QG-REPRO |
| NFR-009 | Keep performance secondary and behavior-gated; no full GUI is required for v1. | Performance protocol and scope audit | RUB-PUV, RUB-MI |

## 13. Evaluation requirements

| ID | Requirement | Acceptance evidence | Mapping |
| --- | --- | --- | --- |
| EV-001 | Use exactly 10 fixtures with a 4-development/6-held-out split and the ten frozen behavior classes. | Fixture manifest and hashes | RUB-MI, RUB-REP |
| EV-002 | Freeze one preserving and one seeded false-green candidate per fixture before arm runs; both must compile and pass 100% of visible legacy tests. | 20-candidate/visible-gate manifest | RUB-MI, QG-ORIG |
| EV-003 | Give both scored arms exactly the same immutable candidates, visible inputs, environment, and scoring. | Cross-arm digest audit | RUB-MI, RUB-REP |
| EV-004 | Score exactly one official attempt per arm/candidate with a three-minute ceiling. | Run cardinality and timeout audit | RUB-MI |
| EV-005 | Self-test the visible gate and evaluator on all 20 candidates before scoring: all visible gates green, then 10 oracle accepts and 10 oracle rejects. | Visible/evaluator control report | RUB-ASE, RUB-MI |
| EV-006 | Enforce physical oracle isolation, denied-access testing, and `K=0`. | Boundary evidence | RUB-ASE, QG-ORIG |
| EV-007 | Compute decision accuracy `/20`, accuracy advantage, reason-correct defect recall `/10`, false-alarm rate `/10`, and completion `/20` exactly as frozen. | Independent aggregate recomputation | RUB-MI |
| EV-008 | Preserve the five predeclared targets and publish honest actuals when missed. | Rubric/hash and final report | RUB-MI, QG-ORIG |
| EV-009 | Record runtime, human time, model/mode, invocation count, technical limits, tokens when stably reported, fixed-subscription billing, monetary-cost applicability/status, errors, abstentions, evidence paths, and hashes per candidate. | Immutable per-candidate records | RUB-PUV, RUB-REP |
| EV-010 | Iterate only on development evidence and unblind held-out results once. | Changelog and unblinding record | RUB-MI, QG-ORIG |
| EV-011 | Keep D01 repair unscored and require approval plus independent reverification. | Demo/run classification audit | RUB-E2E, QG-ORIG |
| EV-012 | Gate the single Chromium performance comparison on identical actions and passed behavioral invariants. | Performance evidence record | RUB-MI |
| EV-013 | Label at least one fixture as the challenging case before fixture code, record why it is challenging and its behavior class, and report what its final result revealed. | Challenging-case manifest and report | RUB-MI, RUB-E2E |

## 14. Artifact and evidence requirements

| ID | Requirement | Acceptance evidence | Mapping |
| --- | --- | --- | --- |
| AR-001 | Keep this file as the sole product-semantics contract and the artifact spec subordinate. | Hierarchy consistency test | RUB-REP, QG-ORIG |
| AR-002 | Link projections, schemas, decisions, claims, and diagrams to requirement IDs and canonical rubric tokens. | Traceability validator | All rubric criteria |
| AR-003 | Preserve exact CLI, npm, and Make reproduction commands and archive-included arm-visible/verifier-only packages for baseline, BeyondGreen, tests, evaluation, replay, demo, and packaging. | Clean reproduction and oracle-boundary log | RUB-MI, RUB-REP |
| AR-004 | Record every meaningful retained, revised, removed, neutral, and negative iteration with hypothesis, change, command, evidence, and decision. | Improvement Changelog | RUB-MI, RUB-HT |
| AR-005 | Preserve eligible representative trajectories for Codex implementation and Claude read-only checkpoints, with retries and human approvals. | Reviewed trajectory index | RUB-ASE, QG-TRACE |
| AR-006 | Record public anchors, provenance, license/terms, prose hashes, candidate hashes, oracle hashes, and reviews. | Provenance index | RUB-REP, QG-ORIG |
| AR-007 | Map every judge-facing claim to immutable evidence and run IDs; unsupported claims block release. | Claims ledger validation | All rubric criteria |
| AR-008 | Deliver one E2E demo, public video no longer than five minutes, and a manifest-backed ZIP passing clean extraction. | Demo/video/extraction records | RUB-E2E, RUB-REP, QG-COMP |
| AR-009 | Preserve one documented negative or removed experiment and all must-not-cut artifacts. | Changelog, report, manifest audit | RUB-HT, QG-COMP |

Canonical tokens are `RUB-PUV` (15), `RUB-ASE` (30), `RUB-E2E` (20), `RUB-MI`
(15), `RUB-REP` (15), `RUB-HT` (5), and qualification gates `QG-ELIG`,
`QG-COMP`, `QG-ORIG`, `QG-TRACE`, and `QG-REPRO`.

## 15. Reproducibility and interface contract

The runtime is Node.js `22.22.3` with npm `10.9.8`. Exact dependency versions are
frozen in `package-lock.json` (lockfile version 3): TypeScript `5.9.3`, React and
ReactDOM `19.2.8`, jsdom `30.0.1`, Zod `4.5.2`, `@types/node` `22.20.1`,
`@types/react` `19.2.18`, `@types/react-dom` `19.2.5`, and `@types/jsdom` `30.0.0`.
The selected public signals package is `@preact/signals-react@3.12.0`, MIT-licensed,
with the capability profile and transitive-license evidence frozen in
`config/phase-0.5.candidate.yaml` and `artifacts/phase-0.5-license-audit.json`.

The optional live adapter contract is `codex-exec-jsonl-v1` using the locally
authenticated command `codex exec --ephemeral --ignore-user-config --json
--output-schema <schema> --sandbox read-only --model gpt-5.6-sol`, one call per
candidate, no model or transport retry, and a 180-second total deadline with a
15-second finalization reserve. Its runtime behavior is deferred and unverified in
the nested Codex desktop environment under the repository owner's explicit Phase
0.5 waiver. Both measured CLI failures remain failures; app-level Sol operation is
owner-observed context, not submission evidence. Deterministic
`offline-replay-jsonl-v1` using `beyondgreen-replay-jsonl@1.0.0`, UTF-8/LF,
RFC 8785 JCS canonicalization, SHA-256 chaining, no network, no subprocess, and no
workspace writes is the verified reproducibility path. It does not prove live model
operation.

The archive reserves `evaluation/arm-visible/` for task packages and
`evaluation/verifier-only/` for oracle packages and ground-truth manifests. Both are
included in the final ZIP so judges can reproduce scoring. Runtime process and
filesystem capabilities—not omission from version control—prevent either scored arm
from mounting or reading `evaluation/verifier-only/`. Clean-extraction evaluation
must reproduce and test this denied-access boundary.

Required command families:

```text
npm ci
npm test
npm run compile
npm run task -- list
npm run task -- d01:verify
npm run task -- development:verify
npm run preflight:implementation
npm run task -- baseline:verify --evaluation-version eval-v1.1.0
npm run task -- beyondgreen:verify --evaluation-version eval-v1.1.0
npm run task -- evaluation:run --evaluation-version eval-v1.1.0
npm run task -- replay --evaluation-version eval-v1.1.0
npm run task -- demo:d01
npm run task -- performance:d01
npm run task -- artifacts:check
npm run task -- submission:build
```

The root `package.json` keeps only stable general entrypoints. Phase- and
fixture-specific orchestration lives in the typed, reviewable registry under
`scripts/tasks/`; `npm run task -- list` shows only tasks whose implementation is
currently present. Future command-family names above are registered only when their
corresponding scoped implementation is authorized and exists.
`npm test` delegates to `test:all`, which deterministically discovers `*.test.ts`
only under the fixed public roots `tests/` and `evaluation/arm-visible/`, rejects
empty or out-of-bound discovery, and intentionally excludes verifier-only oracle
self-checks. Historical live Phase 0.5 commands are not ordinary registered tasks.

The required top-level Make interface is a thin one-to-one wrapper:

```text
make setup           -> npm ci
make baseline        -> npm run task -- baseline:verify
make solution        -> npm run task -- beyondgreen:verify
make test            -> npm test
make eval            -> npm run task -- evaluation:run
make replay          -> npm run task -- replay
make demo            -> npm run task -- demo:d01
make artifacts-check -> npm run task -- artifacts:check
make submission      -> npm run task -- submission:build
```

The CLI is mandatory. JSON output must pass a versioned Zod schema. The static HTML
report is generated only from validated JSON and requires no server. A full GUI is
not a v1 gate.

Every command records exit status, environment versions, evaluation version,
candidate/fixture IDs, hashes, duration, model/mode, invocation count, technical
limits, tokens only when stably reported, fixed-subscription billing,
monetary-cost applicability/status, human time, and output paths. Per-run USD is not
calculated, estimated, or capped. Offline replay must reproduce report artifacts
from submitted records without credentials.

## 16. Improvement and unblinding protocol

1. Freeze v1.1 requirements, evaluation formulas, targets, budgets, candidates, and
   oracle isolation before optimization.
2. Preserve the runnable status-quo baseline and every BeyondGreen iteration.
3. Record hypothesis, exact change, exact command/version, evidence/run IDs, result,
   decision, retry/failure information, and human checkpoint for every iteration.
4. Preserve retained, revised, removed, neutral, and negative experiments.
5. Iterate only on `BG-D01`–`BG-D04` development evidence.
6. Perform exactly one declared unblinding of `BG-H01`–`BG-H06`.
7. Do not tune evaluation v1.1 after unblinding. Corrections require a new benchmark
   version and forfeit the untouched-held-out claim.
8. Derive the strongest change, removed experiment, remaining failure, and hot take
   only from measured evidence.

## 17. Demo, repair, and video contract

One end-to-end demo must show an already-existing candidate, the green status-quo
decision, BeyondGreen risk/probe evidence, and the final decision/report. The demo
must be a preserved real run, not a hand-authored mock.

After its scored verdict is immutable and a human explicitly approves, `BG-D01` may
be used for one targeted unscored repair demonstration. The repaired candidate is a
new demo artifact and must undergo a fresh independent verification. Neither its
result nor its resource use enters the scored 20 decisions.

The public video is no longer than five minutes and covers: user and bottleneck;
status-quo baseline; one E2E verification; two-arm comparison; strongest measured
change; one removed/negative experiment; remaining limitation; practical hot take;
and reproduction path. Its link must open without requesting permission.

## 18. Coding workflow and independent review checkpoints

Codex implements the repository. Claude is a bounded, read-only independent reviewer
at exactly three checkpoints:

1. normative v1.1 before any product code;
2. complete `BG-D01` vertical slice before scaling; and
3. final ZIP after clean extraction.

Claude receives the minimum sufficient clean packet, cannot edit, and does not
authorize changes. Codex independently verifies every actionable finding. Human
approval remains the gate after each review where specified.

Approval of this specification and the Phase 0.5 freeze did not itself authorize
product development. The bounded D01 foundation began under explicit
repository-owner authorization in `SES-20260829-004`, after the Phase 0.5 trajectory
review and D01 behavior/provenance freeze. The owner subsequently approved
`SES-20260829-005` for the complete unscored D01 vertical slice, but that authoring
session is now excluded by `EXC-003`. The owner authorized independent clean recovery
in `SES-20260829-007`; no SES-006 change is inherited. That authorization covers only
this one development workflow through reports and offline replay;
official/scored runs, repair, other fixtures, model/Chromium work, commit, push, and
every later phase remain separately gated.

## 19. Critical path and milestones

| Phase | Output | Blocking gate |
| --- | --- | --- |
| 0. Normative v1.1 | Approved BeyondGreen spec and consistent projections | Claude read-only review, Codex reconciliation, final human spec approval |
| Trace-first gate | Submission-eligible implementation session and trajectory plan | Approved boundary, control preflight, trace capture verified, and structural implementation preflight clean except for the enumerated section 20 Phase 0.5 decisions |
| 0.5 Stack spike | Frozen public stack, lockfile, optional/unverified live adapter, verified offline replay, budget policy, behavior assignment, and Chromium protocol | Closed under explicit nested-CLI waiver after license 54/54, stack 11/11, replay controls, and 300-card Chromium correctness PASS; CPU improvement not demonstrated |
| D01 vertical slice | One complete verify-existing case, reports, isolation, E2E demo path | All contracts, denied-access test, clean replay, and second Claude checkpoint pass |
| Early package rehearsal | ZIP built and run after clean extraction | Required files, commands, licenses, traces, and manifests reconcile |
| Remaining fixtures | `BG-D02`–`BG-D04` and `BG-H01`–`BG-H06` prose, candidates, oracles, and development validation | Provenance, hashes, evaluator self-tests, challenging-case label, and 4/6 split freeze |
| Single unblinding | One official two-arm run on all 20 decisions | No subsequent v1.1 held-out tuning; honest results published |
| Final package | Public video, changelog, reports, traces, ZIP | Clean extraction and final Claude checkpoint, then human release approval |

Must not cut: ten cases/twenty decisions; same candidates/scoring; physical oracle
isolation; eligible traces; clean-room/provenance; one E2E demo; changelog and exact
reproduction; public video at most five minutes; ZIP clean-extraction rehearsal; and
one negative or removed experiment.

## 20. Open decisions and locked decisions

### Locked by v1.1

- BeyondGreen name and verify-existing-only scored workflow.
- Two scored arms and the same 20 immutable candidates.
- Ten fixtures, 4/6 split, ten behavior classes, metrics, formulas, and targets.
- Three-minute limit, one attempt, `K=0`, physical oracle isolation, fail-closed
  abstention, CLI/JSON/HTML interface, Node/TypeScript stack, and secondary-only
  Chromium performance.
- Codex implementation and three bounded Claude read-only checkpoints.

### Frozen by Phase 0.5 at `2026-08-29T13:41:51Z`

1. Signals: `@preact/signals-react@3.12.0`, MIT, with public repository and tested
   React/signals capability profile recorded in the frozen decision packet.
2. Stack: Node `22.22.3`, npm `10.9.8`, TypeScript `5.9.3`, React/ReactDOM `19.2.8`,
   jsdom `30.0.1`, Zod `4.5.2`, and exact type packages listed in section 15;
   lockfile version 3 and `npm ci` are mandatory. The transitive-license gate passed
   54/54 and `THIRD_PARTY_NOTICES.md` is required for distributed dependencies.
3. Live reasoning: provider-neutral optional `codex-exec-jsonl-v1` contract targeting
   `gpt-5.6-sol` through ChatGPT-authenticated local `codex exec`, read-only sandbox,
   ephemeral session, ignored user config, JSONL and schema output, one call and zero
   retries. Nested-desktop runtime validation is owner-waived, deferred, and
   unverified; two failures remain failures and app-level Sol operation is not
   submission evidence. Unavailability produces `abstain`; no substitute model.
4. Budget/accounting: fixed subscription; per-run USD is `not_applicable` or
   `not_measured` and is not calculated, estimated, or capped. Tokens are recorded
   only if the CLI reports them explicitly and stably. Enforce one call, zero
   retries, 165 engine seconds plus 15 finalization seconds.
5. Replay: `offline-replay-jsonl-v1` / `beyondgreen-replay-jsonl@1.0.0`, UTF-8/LF,
   RFC 8785 JCS, SHA-256 chain, schema-valid single final output, no network,
   subprocess, or workspace write. This is the verified reproducibility path, not a
   model retry and not proof of live operation.
6. Assignment: `BG-D01` stale snapshots (museum visit group allocation board),
   `BG-D02` queued/batched updates, `BG-D03` derived state, `BG-D04` subscription
   cleanup; `BG-H01` prop reset, `BG-H02` async ordering and predeclared challenging
   case, `BG-H03` identity stability, `BG-H04` conditional lifecycle, `BG-H05`
   external store, and `BG-H06` rollback. Fixture prose and oracle contents remain
   future independently authored artifacts.
7. Chromium: independent 300-card museum-board CSS grid; frozen ordered actions
   `mount`, `select-all`, `allocate-1x2`, `step-3`, `allocate-3x2`,
   `select-every-third`, `remove-3x1`, `reset`; five warmups and 30 measured samples
   per arm in alternating order. Correctness passed for all values, selections,
   action digest, reset, and zero page errors. Synthetic card renders were 2400
   baseline versus 1900 advanced (20.83% fewer). Mean CDP `TaskDuration` was 4.7071
   ms versus 5.0037 ms, so CPU improvement is explicitly not demonstrated. This
   synthetic render-count result is secondary evidence only and cannot affect scored
   decisions or support a production-performance claim.

The repository owner's earlier conditional decision to close Phase 0.5 if no other
obstacle remained is satisfied by the coordinator-verified Chromium correctness and
reproducibility evidence. This freeze closes only Phase 0.5; it does not authorize
product code, scored fixtures/candidates/oracles, an official benchmark, commit, or
push.

## 21. Traceability and rubric completeness

| Contract area | Requirements | Primary evidence | Rubric/gate |
| --- | --- | --- | --- |
| User and decision value | Sections 1–3 | README, D01 report, video | RUB-PUV, RUB-E2E |
| Immutable verify-existing workflow | FR-001–FR-008 | Contract, boundary, and verdict tests | RUB-ASE, RUB-E2E |
| Required interface and replay | FR-009–FR-010, NFR-008 | CLI/schema/HTML/replay tests | RUB-ASE, RUB-REP |
| Fair two-arm evaluation | FR-011, EV-001–EV-010 | Manifests, per-case records, aggregate recomputation | RUB-MI, QG-ORIG |
| D01 repair and performance guard | FR-012, EV-011–EV-013, NFR-009 | Clearly labeled demo/performance/challenging-case evidence | RUB-E2E, RUB-MI |
| Clean room and provenance | NFR-004–NFR-007, AR-005–AR-007 | Preflight, provenance, trajectories, claims | QG-ORIG, QG-TRACE |
| Reproduction and release | AR-003, AR-008–AR-009 | Changelog, video, manifest, clean extraction | RUB-REP, RUB-HT, QG-COMP, QG-REPRO |

Qualification gate status remains evidence-based. Specification completeness alone
does not prove eligibility, implementation completeness, trace integrity, or
reproducibility. Any absent implementation artifact remains `UNKNOWN` until built and
verified after final human approval.
