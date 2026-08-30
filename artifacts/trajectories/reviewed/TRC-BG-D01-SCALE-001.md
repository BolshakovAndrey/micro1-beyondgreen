# TRC-BG-D01-SCALE-001 — D01 Scale-Readiness Corrections

Status: owner-approved eligible implementation trajectory indexed in
`actual_traces`; repeated independent checkpoint returned `PASS_WITH_CONCERNS` and
`SCALE_READY=no`; a newly approved remediation boundary is still required.

## Capture classification

- Source: Codex Desktop native user-visible `Copy as Markdown` export.
- Immutable source size: 56,127 bytes.
- Immutable source SHA-256:
  `605d014dd5e631d7be4b9d746eee222ebc9bd5acaa679a0e2e9e71e36bcddfb0`.
- Raw source remains outside the repository and its path is not disclosed.
- The safe raw scanner found no private terms, email addresses, or secret
  assignments. It found two absolute-user-path occurrences, which are categorically
  replaced here by repository-relative paths.
- The native export represents the user-visible chronology. Hidden reasoning,
  internal application events, and stdout omitted by the UI are not claimed.

## Purpose and authorization

The repository owner approved `SES-20260830-001` for only the enumerated BG-D01
scale-readiness corrections. The task inherited the previously verified dirty D01
working tree on `impl/beyondgreen` at
`f0418bc6051002d8d42ccf84822d2e1f2e25b02e`.

The task prohibited official/scored runs, live product-model calls, Chromium,
BG-D02 or other fixtures, commit, push, and external access other than the approved
private-denylist scanner and raw-trace interface. Live-adapter policy and any
cross-platform isolation change requiring a dependency, container/runtime policy,
or Phase 0.5 change were reserved for separate owner decisions.

## 1. Boundary and trace-first gate

Before product changes, the agent read the repository contracts, created and
validated `SES-20260830-001`, verified the repository-relative root, branch, HEAD,
and inherited dirty state, and ran the approved scanner/trace probes. Control and
implementation preflights returned `READY_FOR_CLEAN_BRANCH` and
`READY_FOR_IMPLEMENTATION`, with zero contamination findings, the expected dirty
working-tree warning, and four existing binary human-review notices.

The first boundary YAML parser attempt failed because the repository-local YAML
module was not installed. No package or network access was added; bounded text and
repository checks were used instead. The owner then explicitly approved the exact
boundary and remediation scope.

## 2. Implementation decisions

The trajectory records twelve linked decisions. The detailed requirement, source,
test, and command mapping is preserved in
`artifacts/trajectories/reviews/TRC-BG-D01-SCALE-001-DECISION-EVIDENCE.md`.

1. `FixtureDescriptor` became the owner of D01 fixture/candidate/path/schema/run and
   package-binding values.
2. ProbePlan derivation now uses only arm-visible invariant contracts and risk
   inventory, with an explicit `seededDefectKnowledgeUsed=false` record.
3. The decision-owning parent no longer validates verifier-only package bytes until
   both arm decisions are finalized.
4. Replay verifies finalized decisions and recomputes evaluator-to-decision,
   observation-pair, and verifier-manifest bindings.
5. EV-009 records measured wall timestamps, monotonic duration, fixture membership,
   and false-alarm status.
6. Execution-order and oracle-boundary claims are derived from measured events and
   fail on missing, reordered, or capability-inconsistent evidence.
7. Each arm is observed twice after decision finalization in separate observer
   processes; mismatch fails closed before evaluator execution.
8. A reciprocal physical test proves that the evaluator can read its oracle but
   cannot enumerate, stat, or read either candidate.
9. Arm-visible manifest metadata, source hashes, and package hash are checked against
   code-owned digests in both the parent and arm process.
10. The five visible assertions have one executable source used by visible tests and
    arm checks.
11. JSON and HTML expose a bounded divergence counterexample: at most five items plus
    an omitted-item count.
12. Reproduction, provenance, trace roles, compile scope, preflight, topic, spec,
    evaluation, changelog, and checksum projections distinguish the old eligible
    verification trace from the new pending implementation trace.

Candidate source bytes, the five visible behavioral expectations, and verifier
ground-truth outcomes were not changed. The macOS `sandbox-exec` isolation remains
fail-closed on unsupported platforms; no reduced-assurance K=0 mode was added.

## 3. Implementation retries and negative evidence

- A combined patch that attempted to delete and add the same file was rejected
  before writing. It was split into valid patches.
- The schema-version update exposed two stale literals at compile time; they were
  corrected to use descriptor-owned values.
- The first targeted run passed 25/26 because a no-I/O regex accidentally matched
  `deriveExecutionClaims`. The regex was narrowed to actual execution APIs; the
  targeted suite then passed 29/29.
- A broad `scripts/**/*.ts` and `tests/**/*.ts` compile experiment exposed historical
  untyped control-plane utilities outside the D-fixture product surface. The scope
  was revised to scalable D-fixture product globs without modifying frozen Phase 0.5
  utilities.
- The first final checksum check correctly failed after authorized repository
  changes. The reviewed `checksums:write` task reconciled the projection, and the
  repeat passed 171/171.

Negative tests cover manifest tampering, seeded-defect independence, event
reordering, evaluator-binding tampering, observation nondeterminism, reciprocal
candidate denial, and bounded counterexample truncation. They do not yet falsify
missing event evidence or independently measured physical-capability evidence; the
current capability flags are parent-declared.

## 4. Repo-local validation

- `npm run compile` — passed.
- `npm test` — passed 53/53.
- `npm run task -- d01:verify` — passed visible 5/5, positive-step 1/1,
  canonical oracle 3/3, physical boundary 4/4, vertical contracts 19/19,
  unscored E2E, four foundation manifests, and the 24-file vertical manifest.
- `npm run task -- d01:replay` — passed with report artifacts matched.
- `npm run task -- phase0.5:verify` — passed without live model or browser
  execution: license audit 54/54 and suites 11/11, 6/6, 3/3, 4/4, 3/3, and 4/4.
- Checksum verification passed 171/171 after the authorized reconciliation.
- `git diff --check` passed.
- Final safe control and implementation preflights passed with zero contamination
  findings, the expected dirty-tree warning, and four binary review notices.

Preserved evidence digests:

- canonical JSON:
  `47035ed40c9ab16473d3a5866bc2071138712d01992a20a617a48bf0e19cd674`;
- static HTML:
  `9f552bb43399463afaf8257a265dad9c235343be5d836b1215f0b14b8d0f88ed`;
- offline replay:
  `4ba082113fae1e1f97139c26a3c42e807a1530c66777bc980f5a5346c889b9e0`;
- combined D01 manifest:
  `69894e4ab39484a89d300391317fc4a79d895c8790f8c1f7edb0f1a8ba6fdb92`.

## 5. Post-implementation capture gate

The implementation task stopped with `SCALE_READY=false` because the trace and
repeated checkpoint were still pending. The owner separately authorized exact native
capture, reviewed EN/RU reconciliation, and—only after successful trace review—a
read-only Claude Opus 5 checkpoint.

The first interactive capture transport received no payload and failed safely with
`ERROR: empty trace payload`; it created no raw artifact. After owner confirmation
that `Copy as Markdown` was ready, the current clipboard was piped directly into the
approved wrapper without displaying or separately reading its content. The wrapper
anchored the exact 56,127-byte source described above. The raw scanner passed with
only the two documented machine-path occurrences requiring submission redaction.

## Outcome and limits

The implementation and repo-local verification are complete. Exact clipboard bytes
matched the external receipt, strict UTF-8 passed, two categorical path redactions
were applied mechanically, and all 729 lines of the native reviewed layer were
inspected. This reviewed layer
preserves the visible instruction, authorization, implementation decisions, failures,
retries, measurements, and human checkpoints while omitting machine-specific paths.
The omissions do not alter the technical causal chain.

The repeated read-only Claude Opus checkpoint returned
`D01_CHECKPOINT=PASS_WITH_CONCERNS` and `SCALE_READY=no`. Codex confirmed that
physical capability evidence remains parent-declared, the engine remains materially
D01-specialized, and arm-visible manifest binding is not directory-complete. The
public-invariant construction concern and cross-platform isolation require separate
owner decisions. The full reconciliation is in
`artifacts/trajectories/reviews/BG-D01-SCALE-CLAUDE-CHECKPOINT.md`.

The repository owner approved this reviewed coding-agent trajectory and authorized
its inclusion in `actual_traces`. Its eligibility records the implementation
trajectory honestly, including the failed scale gate; it neither implies scale
readiness nor depends on a future `PASS/yes` checkpoint. Further product/evaluation
changes require a new approved implementation boundary. No official/scored run,
product live-model call, Chromium call, BG-D02 creation, commit, or push occurred.
