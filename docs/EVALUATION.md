# StateShift Guardian — Evaluation Projection

**Projection of:** `docs/PROJECT_SPEC.md@1.0.0`
**Normative:** no; the global product-semantics specification wins on conflict
**Evaluation version:** `eval-v1.0.0`

This projection specializes `FR-006`–`FR-012`, `NFR-006`–`NFR-009`,
`EV-001`–`EV-012`, and `AR-003`–`AR-007`. No result is claimed.

## Fixed design

- Exactly 12 cases: `SSG-D01`–`SSG-D05` and `SSG-H01`–`SSG-H07`.
- Exactly one scored attempt per fixture per arm.
- One frozen scored seed shared by all arms.
- Determinism repeats are a separate diagnostic and never enter BPMR.
- Exact behavior assignments and challenging-case IDs remain unset until human
  approval; no membership file or fixture prose exists yet.
- Results are directional evidence for this synthetic benchmark only. Statistical
  significance, population generalization, and production claims are forbidden.

## Three fair arms (`FR-012`, `EV-007`, `EV-012`)

| Arm | Final-delivery semantics | Stop policy | Oracle visibility |
| --- | --- | --- | --- |
| A: mechanical | Final patch is implicit accept; failure/no patch is reject | Fixed transform, then visible tests | none |
| B: coding-agent baseline | Final patch is implicit accept; failure/no patch is reject | Genuine best-effort frozen prompt; stop when compile and visible tests are green | none |
| C: Guardian | Explicit accept/reject after all pre-verdict stages | One orchestrator; final patch immutable before verifier; K=0 verifier feedback rounds | final gate outcome only after scoring |

Arm B's prompt, tool policy, model/provider, stop rule, and digest are published before
any run. Arms B/C share the same model/provider and total inference cap; actual calls,
tokens, time, and cost are reported even below caps. All arms share fixtures, seed,
environment, visible inputs, wall/memory ceilings, and frozen scoring.

## Verdict-aware metrics (`EV-004`–`EV-006`)

```text
delivered_accept = final_patch_delivered AND final_verdict_is_accept
behavior_preserving_success = delivered_accept AND hidden_verifier_pass
BPMR = behavior_preserving_successes / 12

potential_false_green = visible_legacy_pass AND hidden_verifier_fail
false_green_stop_rate = potential_false_greens_rejected / all_potential_false_greens
false_greens_delivered_per_12 = delivered_patches_that_fail_hidden_verifier / 12

accepted_precision = behavior_preserving_accepted / all_accepted
non_preserving = no_final_patch OR compile_or_build_failure OR timeout_or_missing_result OR hidden_verifier_fail
correct_decision = (accept AND preserving) OR (reject AND non_preserving)
decision_accuracy = correct_decisions / 12
task_completion_rate = complete_evidence_bundles / 12
```

Reject/no patch, compile failure, timeout, and missing result score zero in BPMR.
Exact gates, without rounded equivalents:

- Guardian overall BPMR `>=9/12`;
- Guardian held-out BPMR `>=5/7`;
- Guardian minus Arm A overall BPMR `>=3/12`;
- Guardian minus Arm B overall BPMR `>=2/12`;
- Guardian accepted precision `=1.00` when applicable;
- Guardian decision accuracy `>=10/12`;
- Guardian completion `>=11/12`;
- Guardian false-green stop rate `>=0.80` when applicable.

If `all_accepted=0`, accepted precision is `not_applicable` and cannot satisfy its
gate. If `all_potential_false_greens=0`, stop rate is `not_applicable` and supports no
claim. Missing runtime/cost observations are `not_measured`, never zero. BPMR `>=9/12`
already prevents reject-all, so there is no separate minimum-accept gate.

The central false-green comparison uses `false_greens_delivered_per_12` and the fixed
verifier-control set below, not the endogenous stop-rate denominator alone.

## Dual-manifest oracle boundary (`FR-002`, `FR-007`, `EV-003`)

The pre-benchmark fixture-authoring pipeline, outside all evaluated arms, creates and
freezes two separately hashed artifacts for each future fixture:

1. `ArmVisibleTaskContractManifest`, owned by the benchmark harness, contains task,
   visible tests/contracts, allowed inputs, and public contract IDs. It is mounted
   read-only into Arms A/B/C.
2. `VerifierOracleManifest`, owned by the verifier, contains hidden expected behavior,
   lifecycle/subscription checks, known-good/bad controls, and oracle contract IDs. It
   is mounted only into the verifier process.

Arm B and Arm C sandboxes never mount verifier-only directories. Separate process and
filesystem capability controls are mandatory; typed API design alone is insufficient.
Access-denial tests target both arms.

Guardian receives only the arm-visible manifest, visible tests, and its inventory.
Its `deriveVisibleContracts` stage outputs only a per-attempt
`VisibleMigrationContract` used by the migration plan. The verifier independently
owns and loads the verifier-only manifest.

Evaluation v1 has `K=0` verifier-derived repair rounds. Before final patch immutability
and score, no failure category, action sequence, mutant ID, expected value, oracle
diff, or diagnostic reaches an arm. Mutation/adversarial checks run fully behind the
verifier boundary. Post-score evidence may contain safe counterexamples but cannot
alter the v1 output.

## VerifierResult

After immutable scoring, the verifier returns only:

- `verdict`: `pass|fail`;
- `category`: `preserving|compile_failure|visible_test_failure|behavior_mismatch|lifecycle_mismatch|subscription_mismatch|mutation_gate_failure|timeout|nondeterministic|oracle_access_denied|evidence_incomplete`;
- arm-visible contract IDs and manifest digest;
- verifier oracle contract IDs and manifest digest for post-score reporting; and
- evidence record digests.

It never returns oracle source, expected values, reference diffs, or mutant IDs.

## Evaluator controls (`EV-011`)

Every fixture must later supply one known-good reference migration and one seeded
known-bad false-green control. Before arm execution, evaluator self-test must accept
all 12 known-good controls and reject all 12 known-bad controls. Any miss blocks the
benchmark.

Exactly four candidates are selected before runs from the 12 per-fixture seeded
known-bad controls and frozen as the v1 verifier-control set. That unchanged set is
used for the comparable detection/rejection result. Controls are evaluator tests,
not naturally produced arm outputs and not benchmark fixtures.

## Checkpoint modes (`FR-004`, `FR-011`, `EV-009`)

- `interactive_human`: real approver, timestamp, approval evidence, plan digest, and
  separate final external-application approval.
- `benchmark_policy_gate`: one real human approves the frozen policy/digest before
  the suite; per-case checks are mechanical and never labeled human approval.

Every record includes `checkpoint_mode`, approver/evidence reference where applicable,
mechanical policy result, and honest human time.

## Secondary and operational metrics

Runtime, calls, tokens where available, human seconds, and estimated cost are reported
as median, p95, and total per arm. Over the 12 scored observations, p95 is nearest-rank
at rank `ceil(0.95 * 12) = 12` after ascending sort.

Render, CPU, and memory metrics are secondary. Each metric is claim-eligible only
when three non-scored repeat runs have identical functional digests and coefficient
of variation `<=10%` for that metric. Otherwise raw values are published as
exploratory and no improvement claim is made. They cannot offset correctness failure
(`NFR-009`).

## Run protocol (`EV-009`, `EV-010`, `EV-012`)

1. Validate clean state, v1 hashes, frozen seed, budgets, controls, and policy digest.
2. Self-test every fixture's known-good and known-bad candidates.
3. Run fixed false-green verifier controls.
4. Execute exactly one scored attempt for each arm/fixture pair.
5. Preserve all failures, timeouts, actual resource use, checkpoint mode, and human
   time.
6. Recompute counts only from immutable per-case records.
7. Run repeat diagnostics separately and label them non-scored.
8. Unblind held-out results once; never tune v1 afterward.

Command families:

```text
npm run benchmark:mechanical -- --evaluation-version eval-v1.0.0
npm run benchmark:agent-baseline -- --evaluation-version eval-v1.0.0
npm run guardian -- --evaluation-version eval-v1.0.0
npm run eval -- --evaluation-version eval-v1.0.0
```

The required Makefile later wraps the normative npm commands one-to-one as specified
in `docs/PROJECT_SPEC.md` section 15.

## Per-case evidence fields

Each record contains evaluation version; arm; fixture, source, and both manifest
digests; scored seed; attempt ordinal fixed to one; final-patch presence; accept/reject
verdict; visible-test result; verifier result; mutation gate; BPMR success bit;
false-green classification; decision correctness; evidence completeness; checkpoint
mode; actual resource use; human time; errors; and evidence paths.
