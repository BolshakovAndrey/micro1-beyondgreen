# StateShift Guardian — Global Product Specification

**Normative status:** single source of truth
**Version:** `1.0.0`
**State:** specification candidate awaiting human approval
**Clean session:** `SES-20260828-001`

This document is the only normative product-semantics contract.
`docs/SUBMISSION_ARTIFACTS_SPEC.md` is the subordinate but binding delivery contract;
it may add packaging and evidence obligations but may not change product semantics.
`config/topic.yaml`,
`docs/EVALUATION.md`, `docs/IMPROVEMENT_CHANGELOG.md`, trajectory indexes, provenance
indexes, implementation plans, and reports are projections of requirement IDs in
this specification. If any projection conflicts with this file, this file wins and
the projection must be corrected.

No product code, fixture implementation, benchmark result, or model result is part
of this specification.

## 1. Product thesis

StateShift Guardian helps a frontend/platform engineer migrate React components from
conventional state to signals in a mature codebase whose existing tests are
incomplete. The dangerous outcome is a plausible patch that passes visible legacy
tests while changing observable behavior, lifecycle/subscription semantics, or
another behavior the old tests never covered.

> A migration should be accepted only when an independent verifier can connect the
> proposed patch to frozen behavioral evidence; a green legacy suite alone is not an
> adequate stop condition.

The primary demonstrated value is a higher behavior-preserving migration rate and a
higher rate of stopping false-green migrations. Render, CPU, or memory improvements
are secondary and cannot compensate for a correctness failure.

The user is a frontend/platform engineer responsible for safely modernizing React
components and reviewing migration patches across a mature TypeScript codebase.
Their bottleneck is proving that state ownership, read timing, update propagation,
subscription ownership, batching, lifecycle cleanup, and derived values remain
equivalent despite incomplete visible tests.

In the realistic scenario the engineer selects one independently authored synthetic
editor fixture whose two manifests were already created and frozen by the external
fixture-authoring pipeline. Guardian inventories state and subscriptions, derives
only a per-attempt visible migration contract, proposes a plan, pauses for a human checkpoint, applies a
candidate patch only in a sandbox, runs visible legacy tests, delegates independent
differential, behavioral, mutation, and adversarial checks, then returns an accepted
or rejected verdict with evidence.

The usable output is a **migration evidence bundle** containing:

- state and subscription inventory;
- frozen behavior contracts and hashes;
- migration plan and genuine human checkpoint record;
- proposed sandboxed TypeScript patch;
- visible legacy-test results;
- differential and behavioral results;
- mutation and adversarial-check results;
- risk findings and accept/reject rationale;
- runtime/cost metadata; and
- final human approval checkpoint for external patch application.

## 2. Relationship to the real problem

The workflow is designed to be reusable later for authorized internal migrations
after separate security, legal, repository-access, and human-review approval. The
hackathon implementation and all submitted evidence are limited to an independently
authored synthetic editor and synthetic fixtures. Synthetic benchmark performance
does not prove correctness on a proprietary or production codebase.

No real component, identifier, structure, code, test, data, build, trace, screenshot,
or video from any employer, client, or existing product may enter the repository,
prompts, traces, demo, or submission archive.

## 3. Terminology

| Term | Normative definition |
| --- | --- |
| Behavior-preserving migration | A candidate that compiles and matches every frozen observable, lifecycle, subscription, ordering, and invariant check for its fixture. |
| False green | A candidate that passes all visible legacy tests but fails at least one independent hidden behavior-oracle check. |
| Visible legacy tests | Tests exposed to the evaluated migration path and used by the simple coding-agent baseline as its stop signal. They are incomplete but not intentionally broken. |
| Hidden behavior oracle | Frozen expected behavior and checks inaccessible to the evaluated migration path and available only inside the independent verifier boundary. |
| Migration evidence bundle | The complete inventory, contracts, plan, checkpoints, patch, checks, risk verdict, metadata, and evidence links for one attempt. |
| Accepted migration | A candidate for which every blocking check passes, no high risk remains, evidence is complete, and the configured approval policy is satisfied. |
| Rejected migration | An attempt stopped for unsupported scope, missing approval, compile/test failure, behavioral mismatch, weak mutation sensitivity, unresolved risk, exhausted budget, or incomplete evidence. |
| Solution agent | The StateShift Guardian orchestrator evaluated as the product. |
| Coding agent | An agent used to design/implement this repository or the controlled coding-agent comparison arm; it is disclosed separately from the solution agent. |

## 4. Scope, non-goals, and clean-room invariants

### In scope

- Node.js/TypeScript-only orchestration, fixtures, tests, evaluator, and reports.
- A small independently authored synthetic editor domain.
- Twelve behavior-first fixture specifications with public anchors and provenance.
- Three comparison arms: mechanical baseline, legacy-green coding-agent baseline,
  and advanced Guardian workflow.
- Sandboxed patch generation, independent verification, and deterministic evidence.

### Non-goals

- Automatic modification of a real repository.
- General React codemod coverage or production-readiness claims.
- Training or fine-tuning a model.
- Benchmark optimization after held-out unblinding.
- Treating resource reduction as a substitute for correctness.
- Browser, connected-app, private-MCP, private-memory, or private-workspace access.
- Python source, tests, bytecode, runtime, or build commands.

### Clean-room invariants

1. Product work reads and writes only inside the clean repository.
2. The only permitted outside-root operations are scanner-only denylist reads and
   raw-trace writes/readback through their named environment variables.
3. Browser, connected-app, private-MCP, sibling-workspace, and global-memory access
   is unauthorized and must remain absent from the tool-call audit.
4. Fixture prose is independently authored from general behavior classes and public
   anchors before fixture code exists.
5. Every fixture prose file is hashed and provenance-reviewed before implementation.
6. Hidden oracles are unavailable through the evaluated migration tool interface.
7. Scanner matches, uncertain provenance, or resemblance to remembered private
   structure stop the affected task for human review.
8. Judge-facing records contain environment-variable names and digests, never
   private values, denylist contents, or raw absolute paths.

## 5. Normative workflow

Before any evaluated arm runs, a fixture-authoring pipeline outside Arms A/B/C:

```text
author public behavior prose
  -> create and hash ArmVisibleTaskContractManifest
  -> independently create and hash VerifierOracleManifest
  -> provenance and human freeze approval
  -> mount arm-visible artifact in benchmark harness
  -> load verifier-only artifact exclusively in verifier storage
```

The evaluated Guardian workflow is:

```text
inventory
  -> derive VisibleMigrationContract from arm-visible manifest, visible tests, inventory
  -> migration plan
  -> human plan checkpoint
  -> sandboxed patch
  -> visible legacy tests
  -> make final patch immutable
  -> independent verifier final gate (behavioral/differential/mutation/adversarial)
  -> accept or reject
  -> migration evidence report
  -> human external-application checkpoint
```

The orchestrator must stop rather than skip a required stage. A rejection is a valid
product outcome; an unsupported acceptance is not.

Checkpoint semantics differ by mode:

- interactive/demo mode requires a real approver identity, timestamped plan approval,
  approval evidence, and a separate final external-application approval;
- automated benchmark mode uses one frozen `benchmark_policy_gate` whose policy and
  digest receive genuine human approval before the suite, followed by mechanical
  per-case policy checks;
- per-case benchmark records use `checkpoint_mode: benchmark_policy_gate` and must
  never label the mechanical result as human approval; and
- human time is recorded honestly at policy approval and interactive checkpoints.

## 6. Purposeful agent architecture

The minimum architecture is one **StateShift Guardian orchestrator** with narrow
typed tools and one **independent verifier boundary**. Inventory, contract derivation,
planning, migration, testing, and reporting are typed stages/tools, not decorative
autonomous agents.

The verifier is outside the migration path's process and filesystem capability
boundary. It owns hidden oracles, differential comparison, mutation/adversarial
checks, and final correctness facts. Evaluation v1 uses `K=0` verifier-derived repair
rounds: no failure category, action sequence, mutant ID, expected value, oracle diff,
or diagnostic reaches an evaluated migration path before its final patch is immutable
and scored. Post-score counterexamples may appear only in evidence and cannot alter
the v1 output.

Coding agents used to build the repository are documented in trajectory artifacts
and are not product architecture. The coding-agent benchmark arm is a controlled
comparison policy, not an additional Guardian sub-agent.

## 7. Conceptual typed tool contracts

| Tool/stage | Input | Output | Stop/failure conditions | Human checkpoint |
| --- | --- | --- | --- | --- |
| `authorFixtureContracts` (pre-benchmark, outside evaluated arms) | Approved public behavior prose and public anchors | Frozen hashed `ArmVisibleTaskContractManifest` plus separately frozen hashed `VerifierOracleManifest` delivered directly to their respective owners | Missing anchor, unstable contract, provenance failure | Fixture freeze approval |
| `inventoryState` | Fixture source, visible types | `StateInventory` with owners, reads, writes, derived edges, effects, subscriptions | Unsupported syntax, ambiguous owner, external import | None |
| `deriveVisibleContracts` | Arm-visible manifest, visible tests, inventory | Per-attempt `VisibleMigrationContract` | Missing visible contract, inconsistent inventory | None |
| `planMigration` | Inventory, `VisibleMigrationContract`, selected signals capability profile | `MigrationPlan` with invariants and risk hypotheses | Unsupported semantic, unresolved ownership | Required plan approval |
| `applySandboxPatch` | Approved plan, fixture source | `CandidatePatch` and compile manifest | Outside-sandbox write, dependency drift, transform error | Approval already required |
| `runVisibleTests` | Candidate build, visible test IDs | `LegacyTestResult` | Timeout, crash, nondeterminism | None |
| `verifyIndependently` (verifier-owned) | Immutable candidate reference, fixture ID, frozen seed; verifier loads its own oracle artifact | `VerifierResult` defined below | Oracle access attempt, evaluator mismatch, nondeterminism | Evaluator changes require pre-unblinding approval |
| `runMutationChecks` (verifier-owned) | Internal verifier context and approved mutation catalog | Verifier-internal mutation/adversarial outcome | Oracle leak, invalid mutant, inadequate sensitivity | None |
| `assessRisk` | Inventory, plan, check summaries | `RiskVerdict` with severity/rationale | Missing evidence, unresolved high severity | Patch approval only after pass |
| `buildEvidenceBundle` | All immutable stage records | `MigrationEvidenceBundle` | Dangling IDs, hash mismatch, unsupported claim | Final external-application approval |

Typed implementations validate inputs and outputs at runtime. Tools receive explicit
data, not arbitrary filesystem paths or shell commands.

`VerifierResult` contains exactly these judge-reportable fields:

- `verdict`: `pass` or `fail`;
- `category`: one safe enum value from `preserving`, `compile_failure`,
  `visible_test_failure`, `behavior_mismatch`, `lifecycle_mismatch`,
  `subscription_mismatch`, `mutation_gate_failure`, `timeout`, `nondeterministic`,
  `oracle_access_denied`, or `evidence_incomplete`;
- `arm_visible_contract_ids` and their manifest digest;
- `verifier_oracle_contract_ids` and their manifest digest, disclosed only after
  immutable scoring; and
- evidence record digests.

It never contains oracle source, expected values, reference diffs, mutant IDs, or
action-level diagnostics before score finalization. Arm B and Arm C run in processes
whose sandboxes do not mount verifier-only paths. Access-denial tests must exercise
both arms; typed APIs alone are not accepted as isolation evidence.

## 8. Fair comparison contract

### Arm A — deterministic mechanical baseline

A fixed syntax-directed transformation migrates recognized state declarations and
direct updates, runs visible legacy tests, and reports its patch/result. It has no
model, inventory, contract derivation, independent verifier feedback, repair, or risk
gate. Returning a final patch is an implicit accept; failure or no patch is reject.

### Arm B — legacy-green coding-agent baseline

A general coding agent receives the fixture, task, visible tests, selected public
library documentation, and sandbox tools. It stops when compilation and visible
legacy tests are green. It cannot access hidden oracles. It uses the same selected
model/provider and total inference cap as Guardian once those choices are approved.
Its genuine best-effort prompt and stop policy are frozen and published before any
run. Returning a final patch is an implicit accept; failure or no patch is reject.

### Arm C — StateShift Guardian

The single orchestrator follows the normative workflow. It uses the same fixture,
visible inputs, environment, model/provider, total inference budget, wall-clock
ceiling, and frozen scoring as Arm B. Non-model verifier work is measured separately.

### Fairness rules

- All arms run the same 12 fixtures in the same environment.
- Evaluation v1 scores exactly one attempt per fixture per arm with one frozen seed.
  Determinism repeats are a separate diagnostic and are never pooled into BPMR.
- All candidates are scored only by the independent evaluator.
- Arm A's lack of model cost is disclosed rather than equalized away.
- Arms B and C receive equal total model caps; actual calls, tokens, time, and cost
  are reported even when usage is below the cap. Call decomposition may differ.
- Timeouts, retries, failures, human time, and estimated cost are reported per arm.
- Visible tests are incomplete by design but valid for their stated behavior.
- No arm is tuned using held-out outputs after unblinding.

## 9. Benchmark contract

Evaluation v1 contains exactly 12 independently authored synthetic fixture
specifications:

- `SSG-D01` through `SSG-D05`: development fixtures;
- `SSG-H01` through `SSG-H07`: held-out, hash-frozen fixtures.

Before fixture implementation, every case must have frozen behavior prose, user
actions, observables, lifecycle/subscription invariants, visible-test scope, hidden
oracle scope, public anchors, provenance, license/terms, and SHA-256 digest.

Development cases may guide implementation. Held-out prose hashes and oracle inputs
are frozen before optimization. The evaluated path can see the fixture task and
visible tests but cannot read hidden oracle logic or expected values. Capability
isolation, not prompt wording, enforces this rule.

Each fixture contract is split into two distinct hashed artifacts:

- an arm-visible task/contract manifest owned by the benchmark harness and mounted
  read-only into Arms A, B, and C; and
- a verifier-only oracle manifest owned by the independent verifier and never
  mounted into an arm sandbox.

Every fixture requires one known-good reference migration and one seeded known-bad
false-green control. Before arm execution, evaluator self-tests must accept the
known-good control and reject the known-bad control for all 12 fixtures. A fixed
verifier-control set of exactly four candidates is selected and frozen before runs
from the 12 per-fixture seeded known-bad controls, then scored separately for a
comparable detection/rejection test.

Required behavior classes include snapshot/closure timing, queued updates and
batching, derived dependencies, identity preservation, external-store subscription,
effect cleanup, prop/state reset, async ordering, failure rollback, and adversarially
incomplete legacy coverage. Exact assignments are frozen after spec approval.

## 10. Frozen metrics and thresholds

### Primary — behavior-preserving migration rate

```text
delivered_accept = final_patch_delivered AND final_verdict_is_accept
behavior_preserving_success = delivered_accept AND hidden_verifier_pass
BPMR(arm) = behavior_preserving_successes / 12
```

For Arms A and B, returning a final patch is the implicit accept verdict. Reject/no
patch, compile failure, timeout, and missing result score zero. Aggregation is an
exact count over 12 fixtures; development and held-out counts are also reported.

Success requires:

- Guardian BPMR at least `9/12` overall;
- Guardian held-out BPMR at least `5/7`;
- Guardian exceeds Arm A by at least `3/12` overall; and
- Guardian exceeds Arm B by at least `2/12` overall.

### Diagnostic — false-green stop rate

```text
potential_false_green = visible_legacy_pass AND hidden_oracle_fail
false_green_stop_rate = potential_false_greens_rejected / all_potential_false_greens
```

If the denominator is zero, the result is `not_applicable` and supports no claim.
Guardian must stop at least `0.80` of potential false greens. Reports also show false
greens accepted and accepted-migration precision. Since this denominator is
endogenous within an arm, the central comparison also reports:

```text
false_greens_delivered_per_12 = delivered_patches_that_fail_hidden_verifier / 12
```

The fixed verifier-control set reports controls rejected out of exactly four frozen
seeded false-green candidates. Central claims use that result and
`false_greens_delivered_per_12`, not stop rate alone.

### Supporting metrics

```text
accepted_precision = behavior_preserving_accepted / all_accepted
non_preserving = no_final_patch OR compile_or_build_failure OR timeout_or_missing_result OR hidden_verifier_fail
correct_decision = (accept AND preserving) OR (reject AND non_preserving)
decision_accuracy = correct_decisions / 12
task_completion_rate = complete_evidence_bundles / 12
```

If `all_accepted=0`, accepted precision is `not_applicable` and cannot satisfy its
gate. If the false-green denominator is zero, stop rate is `not_applicable`. Runtime
or cost with no observations is `not_measured`, not zero. Guardian requires accepted
precision `1.00`, decision accuracy at least `10/12`, and task completion at least
`11/12`. No separate minimum-accept gate is needed because BPMR `>=9/12` prevents
reject-all. Runtime, calls, tokens where available, human seconds, and estimated cost
are aggregated as median, p95, and total per arm. For the 12 scored observations,
p95 is the nearest-rank value at rank `ceil(0.95 * 12) = 12` after ascending sort.

Render count, CPU time, and memory are secondary-only. A metric is claim-eligible
only when three non-scored repeat runs have identical functional digests and that
metric's coefficient of variation is `<=10%`. Otherwise raw values are published as
exploratory and no improvement claim is made. Secondary metrics cannot offset a
correctness failure.

With `N=12`, results are directional evidence for this synthetic benchmark only.
Statistical-significance, population-generalization, and production-performance
claims are forbidden.

`docs/EVALUATION.md` projects these definitions into executable schemas, case tables,
budgets, and commands without changing their meaning.

### Canonical rubric and qualification tokens

- `RUB-PUV`: Problem & User Value (15)
- `RUB-ASE`: Agent Solution & Engineering (30)
- `RUB-E2E`: End-to-End Quality (20)
- `RUB-MI`: Measured Improvement (15)
- `RUB-REP`: Reproducibility (15)
- `RUB-HT`: Hot Take / Insights (5)
- `QG-ELIG`: eligibility
- `QG-COMP`: completeness
- `QG-ORIG`: integrity, originality, provenance, and clean-room compliance
- `QG-TRACE`: coding-agent trace availability and integrity
- `QG-REPRO`: qualification-level reproducibility

## 11. Functional requirements

| ID | Requirement | Acceptance evidence | Rubric mapping |
| --- | --- | --- | --- |
| FR-001 | Inventory state owners, reads, writes, derived edges, effects, and subscriptions. | Inventory schema tests and demo bundle | RUB-ASE, RUB-E2E |
| FR-002 | Before benchmark execution, create separate arm-visible and verifier-only manifests outside evaluated arms and freeze both digests. | Manifest/hash and mount tests | RUB-ASE, RUB-REP, QG-ORIG |
| FR-003 | Produce an invariant-linked migration plan. | Plan schema and trace | RUB-ASE |
| FR-004 | Enforce genuine interactive approvals and truthful benchmark policy-gate semantics. | Checkpoint records and negative tests | RUB-ASE, QG-ORIG |
| FR-005 | Generate changes only in an ephemeral arm sandbox with no verifier-only mount. | Filesystem/mount tests | RUB-ASE, RUB-REP, QG-ORIG |
| FR-006 | Run visible legacy tests and preserve complete results. | Per-case run evidence | RUB-MI |
| FR-007 | Invoke the verifier only after final patch immutability with K=0 feedback rounds. | Access-denial and immutability tests | RUB-ASE, QG-ORIG |
| FR-008 | Run mutation and adversarial checks wholly inside the verifier boundary. | Mutation boundary/results | RUB-ASE, RUB-E2E |
| FR-009 | Accept/reject fail-closed using complete evidence and risk policy. | Verdict tests/failure fixtures | RUB-E2E, RUB-ASE |
| FR-010 | Produce a migration evidence bundle for every attempt. | Demo output/schema validation | RUB-E2E, RUB-REP |
| FR-011 | Require genuine approval before external patch application. | Negative test/checkpoint trace | RUB-E2E, QG-ORIG |
| FR-012 | Execute all three arms on the fixed benchmark. | Comparable run set | RUB-MI |

## 12. Quality and safety requirements

| ID | Requirement | Acceptance evidence | Rubric mapping |
| --- | --- | --- | --- |
| NFR-001 | Use only Node.js/TypeScript for product source, tests, and scripts. | Language scan | RUB-REP, QG-REPRO |
| NFR-002 | Fail closed on ambiguity, missing evidence, timeout, nondeterminism, or oracle access attempt. | Negative tests | RUB-ASE, QG-ORIG |
| NFR-003 | Restrict tools, processes, mounts, and paths to authorized arm capabilities. | Boundary tests/audit | RUB-ASE, QG-ORIG |
| NFR-004 | Keep browser, connected-app, private-MCP, private-memory, and unauthorized outside-root calls at zero. | Tool-call audit | RUB-REP, QG-ORIG |
| NFR-005 | Never expose secrets, denylist terms, environment values, or raw absolute paths. | Preflight/human review | RUB-REP, QG-ORIG |
| NFR-006 | Use one frozen scored seed; keep determinism repeats separate from BPMR. | Seed manifest/repeat diagnostic | RUB-REP, RUB-MI |
| NFR-007 | Preserve complete failures and negative results. | Run reconciliation | RUB-MI, QG-ORIG |
| NFR-008 | Pin runtimes/dependencies before the first executable baseline. | Lockfile/version report | RUB-REP, QG-REPRO |
| NFR-009 | Treat performance as secondary to behavioral correctness. | Evaluator gating test | RUB-PUV, RUB-MI |

## 13. Evaluation requirements

| ID | Requirement | Acceptance evidence | Rubric mapping |
| --- | --- | --- | --- |
| EV-001 | Use exactly 5 development and 7 held-out/hash-frozen fixtures in evaluation v1. | Case manifest/hashes | RUB-MI, RUB-REP |
| EV-002 | Freeze prose and public anchors before fixture implementation. | Provenance timestamps/hashes | RUB-REP, QG-ORIG |
| EV-003 | Keep verifier manifests and paths unavailable to Arms B/C processes and filesystems. | Both-arm access-denial tests | RUB-ASE, QG-ORIG |
| EV-004 | Score delivered/accepted verifier-passing patches with the fixed BPMR denominator 12. | Aggregate recomputation | RUB-MI |
| EV-005 | Report false-green stop rate, false greens delivered per 12, and all zero-denominator states. | Result-schema tests | RUB-MI |
| EV-006 | Report verdict-aware precision, decision accuracy, completion, runtime, and cost. | Comparison report | RUB-PUV, RUB-MI |
| EV-007 | Apply fairness rules, publish Arm B policy, and disclose actual resource use under caps. | Policy hash and budget/run audit | RUB-MI, QG-ORIG |
| EV-008 | Run mutation/adversarial checks behind the verifier boundary; challenging IDs remain unset until approved. | Boundary/mutation results | RUB-ASE, RUB-E2E |
| EV-009 | Preserve per-case failures, retries, evaluator version, checkpoint mode, and human time. | Immutable run directories | RUB-REP, QG-ORIG |
| EV-010 | Prohibit held-out-driven tuning after unblinding. | Changelog/release audit | RUB-MI, QG-ORIG |
| EV-011 | Self-test every fixture with known-good and known-bad controls and run exactly four preselected frozen false-green controls. | Evaluator control report | RUB-ASE, RUB-MI |
| EV-012 | Score exactly one attempt per fixture per arm using one frozen seed; never pool repeat diagnostics. | Run cardinality/seed audit | RUB-MI, RUB-REP |

## 14. Artifact and evidence requirements

| ID | Requirement | Acceptance evidence | Rubric mapping |
| --- | --- | --- | --- |
| AR-001 | Keep this file as the sole product-semantics contract and the artifact spec as subordinate binding delivery contract. | Hierarchy consistency test | RUB-REP, QG-ORIG |
| AR-002 | Link every projection/decision to requirement IDs and canonical tokens. | Traceability validator | RUB-PUV, RUB-ASE, RUB-E2E, RUB-MI, RUB-REP, RUB-HT |
| AR-003 | Preserve runnable baselines and exact npm plus make commands. | Baseline runs/reproduction guide | RUB-MI, RUB-REP |
| AR-004 | Record each iteration with hypothesis, change, command, evidence, and decision. | Improvement Changelog | RUB-MI, RUB-HT |
| AR-005 | Preserve reviewed trajectories for every coding/solution/review agent used, excluding ineligible transcripts. | Trajectory index/reviews | RUB-ASE, QG-TRACE |
| AR-006 | Record provenance, anchors, license/terms, prose hash, and review for each fixture. | Provenance index | RUB-REP, QG-ORIG |
| AR-007 | Map each judge-facing claim to immutable evidence and run IDs. | Claims validation | RUB-PUV, RUB-ASE, RUB-E2E, RUB-MI, RUB-REP, RUB-HT |
| AR-008 | Produce a manifest-backed, clean-tested archive and accessible video. | Release checklist/checksums | RUB-REP, QG-COMP, QG-REPRO |
| AR-009 | Deliver `README.md`, `LICENSES.md`, `Makefile`, `docs/SUBMISSION_REPORT.md`, `docs/ARCHITECTURE.md`, `docs/EVALUATION.md`, `docs/IMPROVEMENT_CHANGELOG.md`, `docs/REPRODUCTION.md`, `docs/DISCLOSURES.md`, `docs/VIDEO_SCRIPT.md`, `docs/VIDEO_LINK.md`, `evaluation/cases.jsonl`, `evaluation/scoring-rubric.yaml`, `evaluation/challenging-cases.yaml`, `artifacts/claims.yaml`, run/comparison/trajectory/demo/provenance artifacts, `submission/MANIFEST.yaml`, `submission/CHECKLIST.md`, `submission/SHA256SUMS`, source, tests, agent instructions, and validated `dist/submission.zip` required by the subordinate artifact contract. | Manifest path audit | QG-COMP, RUB-REP |

## 15. Reproducibility contract

The stack must be pinned before executable baseline work:

- Node.js `22.22.3`;
- TypeScript compiler, React-compatible test runtime, signals library, schema library,
  and test runner: exact choices remain open and require human approval plus lockfile;
- no Python and no judge-critical network, credential, browser, or private service.

Required command families:

```text
npm ci
npm test
npm run preflight:implementation
npm run benchmark:mechanical -- --evaluation-version eval-v1.0.0
npm run benchmark:agent-baseline -- --evaluation-version eval-v1.0.0
npm run guardian -- --evaluation-version eval-v1.0.0
npm run eval -- --evaluation-version eval-v1.0.0
npm run demo
npm run artifacts:check
npm run submission
```

The subordinate delivery contract's required top-level `make` interface is preserved
through a thin Makefile with one-to-one wrappers:

```text
make setup           -> npm ci
make baseline        -> npm run benchmark:mechanical
make solution        -> npm run guardian
make test            -> npm test
make eval            -> npm run eval
make demo            -> npm run demo
make artifacts-check -> npm run artifacts:check
make submission      -> npm run submission
```

The coding-agent comparison remains directly available through
`npm run benchmark:agent-baseline`. Make wrappers add no logic and propagate exit
status unchanged.

The final archive excludes official PDFs/screenshots, `docs/evidence/`, the full
translation, and challenge/rules transcriptions or derived organizer material unless
redistribution permission is recorded. Judge-facing project documentation must be
self-contained without bundling those source-evidence files.

Every command records output paths, exit status, environment versions, seed, fixture
IDs, duration, and material cost. Before measurement, runtime/cost fields use
`not_measured_pre_implementation`; no numeric result is invented. After valid runs,
honest approximate ranges are derived from evidence.

## 16. Improvement protocol

1. Preserve runnable mechanical and legacy-green coding-agent baselines.
2. Freeze evaluation version, hashes, metrics, and thresholds before optimization.
3. Record observed failure, hypothesis, exact change/command, evidence/run IDs,
   result, decision, and next action for every meaningful change.
4. Keep retained, revised, removed, neutral, and negative experiments.
5. Iterate only on development fixtures.
6. Unblind held-out results once at the declared gate.
7. Do not tune against version 1 held-out outcomes after unblinding; corrective work
   creates a new benchmark version and loses the untouched comparison claim.
8. Name strongest change, removed experiment, remaining failure, and hot take only
   from measured evidence.

## 17. Demo contract

The final video is at most five minutes and shows: the incomplete-test bottleneck;
a false-green baseline on a synthetic fixture; the same migration through Guardian;
a detected regression and safe rejection or safe accepted patch; the three-arm metric
comparison; strongest measured change; one removed experiment; remaining failure;
and evidence-backed hot take. The shown run is preserved as demo evidence and no mock
is presented as execution.

## 18. Phased roadmap and gates

| Phase | Output | Blocking gate |
| --- | --- | --- |
| 0. Spec freeze | Approved global spec/consistent projections | Human approves decisions needed for fixture work |
| 0.5 Runtime feasibility spike | Throwaway, non-fixture proof that the selected public stack deterministically exposes every planned behavior class | Spike evidence passes without proprietary structure or fixture implementation |
| 1. Fixture prose/provenance freeze | 12 prose specs, anchors, hashes, 5/7 split | Scan and human provenance review pass |
| 2. Baselines | Runnable Arms A/B and preserved runs | Same environment/cases/scoring; visible tests valid |
| 3. Evaluator/oracles | Verifier, mutation catalog, access controls | Isolation/evaluator contract tests pass |
| 4. Advanced workflow | Guardian and evidence bundle | Typed stages/checkpoints/fail-closed tests pass |
| 5. Measured iterations | Development experiments | Changelog/trajectories reconcile with runs |
| 6. Held-out evaluation | Declared unblinding/final comparison | No version 1 held-out tuning afterward |
| 7. Packaging/video | Archive, demo, accessible video | Qualification/safety/rubric/extraction checks pass |

Implementation cannot begin until preflight returns `READY_FOR_IMPLEMENTATION` and
the human approves the open decisions below.

## 19. Open decisions and assumptions

Intentionally unresolved:

1. React execution surface: real test renderer, minimal compatible harness, or other
   public adapter.
2. Signals library: exact public package, version, license, and integration mode.
3. AST stack: TypeScript compiler API or another public licensed transformer.
4. Schema/test packages and exact versions.
5. Model/provider: external, local, or deterministic; if model-backed, exact model,
   offline judge fallback, and cost capture.
6. Coding-agent baseline adapter that enforces equal model budget and oracle isolation.
7. Approval-evidence format and approver-role naming for the already frozen
   interactive and `benchmark_policy_gate` semantics.
8. Mutation catalog and adequacy threshold beyond frozen correctness gates.
9. Exact behavior-class assignment to the 12 prose fixtures.
10. Runtime/cost expectations, currently `not_measured_pre_implementation`.

Assumptions to validate: 12 cases show directional improvement but not production
generalization; the selected runtime models needed lifecycle/subscription semantics;
equal model budgets remain practical; and typed capabilities can enforce oracle
isolation in one distributable repository.

No benchmark result, failure distribution, strongest change, removed experiment, or
cost advantage is claimed.

## 20. Traceability matrix

| Requirement | Planned component | Evaluation/run evidence | Judging criterion |
| --- | --- | --- | --- |
| FR-001, FR-003 | Inventory/planning stages | Contract tests; demo bundle | RUB-ASE, RUB-E2E |
| FR-002, EV-001, EV-002 | Dual-manifest freezer | Prose/manifest hashes; provenance | RUB-REP, QG-ORIG |
| FR-004, FR-011 | Checkpoint policy | Negative tests; genuine checkpoints | RUB-ASE, QG-ORIG |
| FR-005, NFR-003 | Process/filesystem sandbox | Both-arm denied-mount evidence | RUB-ASE, RUB-REP, QG-ORIG |
| FR-006 | Visible-test runner | Per-case legacy results | RUB-MI |
| FR-007, EV-003 | K=0 independent verifier | Access-denial/immutability tests | RUB-ASE, QG-ORIG |
| FR-008, EV-008 | Verifier-internal mutation runner | Boundary/mutant results | RUB-ASE, RUB-E2E |
| FR-009, NFR-002 | Verdict/risk policy | False-green/fail-closed tests | RUB-E2E, RUB-ASE |
| FR-010 | Bundle builder | Demo output/schema | RUB-E2E, RUB-REP |
| FR-012, EV-004–EV-007, EV-011, EV-012 | Arms, controls, aggregator | Comparable runs/report | RUB-MI, RUB-PUV |
| NFR-001, NFR-008 | Node/TypeScript stack | Language scan/lockfile | RUB-REP, QG-REPRO |
| NFR-004, NFR-005 | Clean-room audit | Tool audit/scanner/human review | QG-ORIG, RUB-REP |
| NFR-006, EV-009 | Seed/run recorder | Scored-seed audit; separate repeats | RUB-REP, RUB-MI |
| NFR-007, EV-010 | Evidence/changelog policy | Failure ledger/unblinding audit | QG-ORIG, RUB-MI |
| NFR-009 | Correctness gate | Incorrect-performance rejection test | RUB-PUV, RUB-MI |
| AR-001, AR-002 | Spec/projection validator | Consistency/ID-token report | RUB-REP, QG-ORIG |
| AR-003, AR-004 | Baselines/changelog | npm/make commands; iterations | RUB-MI, RUB-HT |
| AR-005 | Trajectory pipeline | Reviewed eligible traces/exclusions | RUB-ASE, QG-TRACE |
| AR-006 | Provenance pipeline | Anchors/terms/hashes | RUB-REP, QG-ORIG |
| AR-007 | Claims ledger | Claim/run reconciliation | RUB-PUV, RUB-ASE, RUB-E2E, RUB-MI, RUB-REP, RUB-HT |
| AR-008, AR-009 | Submission builder | Required-path manifest, checksums, extraction, video | QG-COMP, QG-REPRO, RUB-REP |

## 21. Rubric completeness check

| Criterion | Weight | Normative coverage |
| --- | ---: | --- |
| RUB-PUV | 15 | Sections 1–3: user, bottleneck, thesis, scenario, evidence bundle. |
| RUB-ASE | 30 | Sections 5–7: one orchestrator, K=0 typed stages, isolated verifier, controls, checkpoints. |
| RUB-E2E | 20 | Sections 5, 7, 11, 17: complete workflow and usable demo output. |
| RUB-MI | 15 | Sections 8–10, 16: fair arms, verdict-aware formulas, exact gates, iterations. |
| RUB-REP | 15 | Sections 9, 13–15, 18: cases, pinned stack, npm/make surfaces, evidence, gates. |
| RUB-HT | 5 | Sections 16–17: evidence-backed strongest/removed changes and insight, not invented early. |

Qualification is additionally covered by clean-room invariants, trajectory and
provenance requirements, fail-closed gates, and the ban on unsupported claims.
