# Clean-Room Preflight Checklist

## Current final-submission state

- [x] Normative v1.1, all ten fixture packages, twenty candidates, manifests, and
      physical hidden-oracle controls are frozen and implemented.
- [x] Representative coding-agent trajectories required by the submission are reviewed
      and indexed; failed/no-change attempts remain retry records.
- [x] RUN-002 contains 40 immutable arm decisions; `POSTDECISION-004` contains 80
      captures, 40 evaluator records, aggregates, reports, and exact offline replay.
- [x] Official result is disclosed without target suppression: status quo 10/20,
      BeyondGreen 19/20, reason-correct recall 3/10 against the frozen 8/10 target.
- [x] The current submission candidate passed a 1054-file config-derived clean-extraction rehearsal
      (1053 release files plus its temporary rehearsal-only manifest) and
      the 54/54 license audit.
- [x] Four binary reference inputs were human-reviewed and excluded from the archive.
- [x] Video wording is corrected from `43` to `40+`; public URL is recorded and verified
      signed out.
- [x] Whole-candidate checksums, scans, both safe preflights, and the post-video-URL
      clean-extraction rehearsal pass on the current candidate.
- [x] Final independent review and explicit owner ZIP approval are complete.

Scanner readiness is evidence, not human approval. The historical checkpoints below are
retained to explain how the project reached this state; statements that work was then
unauthorized or incomplete are not the current status.

## Historical gate record

**Current scanner state:** `READY_FOR_IMPLEMENTATION` (automated structure only).
**Product work state:** normative `docs/PROJECT_SPEC.md@1.1.0`, the Phase 0.5 freeze,
and the BG-D01 behavior/provenance freeze are human-approved. Historical recovery
and exclusion records remain preserved below. `TRC-BG-D01-VERIFY-002` passed its
capture, review, scanner, and owner gates and remains an eligible representative
verification of the pre-remediation D01 state.

The owner approved `SES-20260830-001` only for the enumerated D01 scale-readiness
corrections. The implementation parameterizes D01 through a descriptor, derives
the ProbePlan from arm-visible contracts and risk evidence, defers verifier-package
access until both decisions are final, binds replay and evaluator evidence, records
EV-009 timing/membership/false alarms, derives claims from measured events, performs
two post-decision observations with fail-closed nondeterminism, proves reciprocal
access denial, binds the arm-visible package in code, shares one visible-assertion
source, and bounds JSON/HTML counterexamples. Repo-local validation passed, but the
independent checkpoint found that physical capability claims were still
parent-declared and the engine remained materially D01-specialized.

The old verification trace does not cover these edits. Exact native capture and
review of `TRC-BG-D01-SCALE-001` and the private-denylist scan passed. The repeated
Claude Opus checkpoint returned `D01_CHECKPOINT=PASS_WITH_CONCERNS` and
`SCALE_READY=no`, and Codex independently confirmed the remaining concerns.
Repository-owner trace promotion passed, and the eligible trajectory is indexed in
`actual_traces`; its eligibility is independent from the future scale-readiness gate.
The owner approved `SES-20260830-002`; `TRC-BG-D01-SCALE-002` passed native capture,
review, safe scanning, and owner promotion. A later Codex acceptance matrix confirmed
four bounded blockers. The owner then approved `SES-20260830-003` and exactly one
eligible correction trajectory, `TRC-BG-D01-SCALE-003`. The real orchestrator and
workers now traverse one injected descriptor execution path, with the D01 observation
schema explicitly injected and a TEST-ONLY descriptor exercising the real pipeline.
Runner evidence verifies launch-to-worker identity, canonical sandbox and path-policy
digests, exact role/profile/proof bijection, per-arm event state, and immutable
decision binding. Replay independently checks both evaluator conclusions. Recursive
package validation handles valid nested structures and rejects changed bytes in an
already registered source. The owner-approved SCALE-004 trajectory family then
closed the five remaining blockers. Ordinary tests passed `56/56`; complete
`d01:verify`, offline replay, and Phase 0.5 verification passed. Eight automatic
implementation JSONL captures passed safe raw scanning, complete EN/RU review is
available, and the repeated Codex matrix passed A1, A2, A3, S1, S2, S3, S4, P1,
P2, and D1. The owner approved the main trace and seven continuations, indexed all
eight captures in `actual_traces`, and explicitly set `SCALE_READY=true` while keeping
deterministic submission path redaction mandatory. Official/scored runs, live
model, Chromium, BG-D02, commit, and push remain unauthorized. Scanner output is
evidence, not approval.

Under owner-approved `SES-20260830-009`, BG-D02 through BG-D04 are integrated into
the typed development verification path. Ordinary tests and the D01-D04 fixture,
manifest, isolation, descriptor/task bijection, discarded-prototype, replay, and
Phase 0.5 regressions pass without an official/scored run. Three machine-local path
spans in the BG-D02 Russian subagent report were replaced with the neutral marker;
the target-only scanner now reports zero absolute-user-path findings. The current
integration trajectory remains pending capture/review and owner promotion.

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
- [x] Ten fixture specifications and 20 candidates exist; the 4/6 membership and all
      candidate/oracle hashes are frozen.
- [x] Hidden-oracle access controls are implemented and tested; their conceptual typed
      boundary is specified without relying on prompt wording.
- [x] `docs/EVALUATION.md` projects v1.1 scoring, oracle controls, targets, and the
      one-attempt/three-minute policy; exact package/model cap decisions remain Phase 0.5 gates.
- [x] `docs/IMPROVEMENT_CHANGELOG.md` records the initial candidate and corrected
      review revision without claiming semantic freeze.
- [x] Schema-oriented trajectory and provenance indexes exist without concrete
      fixture entries.
- [x] Public library choice and license are recorded:
      `@preact/signals-react@3.12.0`, MIT.
- [x] Phase 0.5 stack/replay feasibility proves deterministic observability for all
      planned behavior classes; Chromium correctness passed under the explicit
      nested-CLI waiver. Live nested `codex exec` remains unverified and both
      failures remain failures.
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
  `2a41d4d2bab8a8b25406400a8ec7d8cd21112a4e`. It was renamed after the historical
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
  remain unresolved and are now the next and only pre-product decision gate. A
  research-only EN/RU candidate packet now proposes the locally authenticated
  `codex exec`/`gpt-5.6-sol` ChatGPT-authenticated subscription path with one call,
  no retries, no model substitution, a
  180-second timeout, honest `not_measured` cost/usage fields when CLI data is
  unavailable, offline replay, and the fixed 300-card correctness-first Chromium
  scenario. The owner explicitly approved this measured spike at
  `2026-08-29T12:52:58Z`. Exact lockfile generation and `npm ci --ignore-scripts`
  passed, but the first transitive-license audit command failed before assessment
  because `npm query . --json` used an unsupported selector. npm also emitted a
  machine-specific external debug-log path into raw tool output; it was not opened or
  persisted and requires trace redaction. The spike stopped without retry before
  stack, model, replay, or Chromium execution. Phase 0.5 is not ready to freeze and
  product implementation remains unauthorized.
  At `2026-08-29T12:58:49Z`, the owner authorized exactly one corrected
  repository-local Node license-audit attempt via the selected response
  `«Разрешаю retry (Recommended)»`. The replacement reads only lockfile and installed
  package metadata inside the repository, fails closed on unknown or non-permissive
  licenses, and permits further spike work only after a complete PASS.
  The one authorized corrected audit completed at `2026-08-29T13:00:10Z` and failed
  closed: 54 installed packages enumerated, 51 allowlisted, zero missing, zero
  unknown, and three non-allowlisted SPDX expressions (`MIT-0` twice and
  `BlueOak-1.0.0` once). No second corrected audit, stack test, model call, replay,
  or Chromium run followed. Phase 0.5 remains not ready to freeze.
  At `2026-08-29T13:03:36Z`, the owner approved adding only `MIT-0` and
  `BlueOak-1.0.0`, requiring reproducible `THIRD_PARTY_NOTICES.md`, and authorizing
  exactly one final audit of the unchanged tree. Continuation requires 54/54 PASS,
  policy-neutral inventory SHA-256
  `68519a270c035c5cb2c8cb92f6d27b44ed47958a4c31b134bcbdb7f4a364ef18`, and unchanged
  lockfile SHA-256
  `1beb2987e3e0654cb525b80c2f97a2f6577f92399e8a78fcd8eb9f9ab6487d4c`.
  The final audit passed 54/54 with both digests matching and generated reproducible
  `THIRD_PARTY_NOTICES.md`. Stack capability/integration checks passed 11/11 after one
  harness-only retry caused by Node 22's read-only `globalThis.navigator`. Local
  initial model-adapter/JSONL/offline-replay tests passed 4/4. The first authorized frozen
  `gpt-5.6-sol` call then exited 1 with `MODEL_TRANSPORT_FAILURE`, zero retries, no
  substitute, and no schema-valid output. Only stderr SHA-256 was retained; content
  was not persisted or disclosed. The spike stopped before Chromium and Phase 0.5
  remains not ready to freeze.
  At `2026-08-29T13:11:21Z`, the owner authorized one privacy-safe diagnostic retry
  of the exact same subscription command and model. Total Phase 0.5 live-call
  cardinality is capped at two, with no automatic retry or substitute. Raw stderr
  must not be persisted or disclosed; only the approved safe class, exit code, hash,
  elapsed time, and redaction-category counts may be retained. A second failure
  stops the spike without Chromium or a third call.
  The diagnostic retry was consumed and also failed: exit 1 after 3006 ms, safe class
  `unknown`, stderr SHA-256
  `1393963b62d2b0ef4064d9462d967f6b8688db20939a0fcc4b024e7b06ec4ba5`, and zero
  matches in all five redaction categories. Raw stderr and excerpts were not
  persisted or disclosed. Total live calls: 2; owner-authorized diagnostic retries:
  1; automatic retries: 0; substitutes: 0. Model gate remains failed and Chromium
  remains unrun.
  At `2026-08-29T13:17:17Z`, the owner authorized non-model CLI diagnostics only:
  exact-mode login status, `codex doctor`, and an advertised subscription
  usage/limit/status command if present. The wrapper must make zero model/agent calls
  and retain only safe class, pass/fail, CLI version, exit code, hashes, and redaction
  counts; raw output and excerpts remain prohibited.
  The diagnostic completed on `codex-cli 0.148.0` with zero model/agent calls.
  Exact-mode login status was inconclusive because that subcommand rejected
  `--ignore-user-config` (exit 2); `doctor` was advertised but failed with safe class
  `network_transport` (exit 1); advertised `usage` failed with safe class `unknown`
  (exit 1); `limits` and standalone `status` were not advertised. Doctor output had
  14 path and one account/project-ID redactions, with no raw content persisted or
  disclosed. This supports but does not prove a CLI startup/connectivity root cause.
  Chromium remains blocked.
  A stricter 3/3-tested wrapper then reran only `codex doctor`. It exited 1 after
  1329 ms with safe class `dns` and code `DNS_RESOLUTION`. Fourteen absolute paths
  and one account/project ID were replaced before classification; all other
  redaction counts were zero. No raw output or excerpt was retained. This confirms a
  current doctor DNS-resolution failure but does not prove causality for the two
  prior live-model failures. Chromium remains blocked.
  A subsequent allowlisted matrix tested only `chatgpt.com`, `auth.openai.com`, and
  `api.openai.com`: DNS passed, TLS connected, and unauthenticated HTTP returned
  `4xx` under 250 ms for all three. No credentials, IPs, headers, cookies, bodies, or
  URL paths/query were retained. General resolver/environment failure and
  host-specific failure among these three are not present now. The doctor DNS result
  may have been transient or for an unretained service hostname; model-failure
  causality remains unproven and Chromium remains blocked.
  With the public matrix passing, one authorized `codex doctor` rerun reproduced
  `DNS_RESOLUTION` (exit 1, 1259 ms), again with 14 path and one account/project-ID
  redactions and no retained excerpt/raw output. This establishes a reproducible
  doctor-specific DNS failure, not a general outage across the three allowlisted
  public hosts. The unretained hostname must not be reconstructed; model-call
  causality remains unproven and Chromium remains blocked.
  Strict official-suffix extraction then passed 4/4 tests and reran only doctor.
  Doctor again returned `DNS_RESOLUTION` (exit 1, 1883 ms), but no exact
  `openai.com`/`chatgpt.com` root or valid subdomain was extractable. The hostname
  remained null/redacted and no follow-up lookup ran. Fourteen path and one
  account/project-ID redactions repeated; no raw output/excerpt was retained.
- Post-promotion verification: tests passed 10/10; control preflight returned
  `READY_FOR_CLEAN_BRANCH`; implementation preflight remained `BLOCKED` on the two
  Phase 0.5 placeholders plus the expected dirty-worktree and four binary-review
  notices, with no contamination findings. The regenerated checksum manifest covers
  and verifies exactly 47 intended files.
- Global product specification: BeyondGreen v1.1 approved at
  `2026-08-29T10:46:39Z`; this approval does not authorize implementation.
- Concrete fixture behavior/provenance, held-out membership files, product code,
  solution-agent prompts, and benchmark runs: not created.
- At `2026-08-29T13:30:50Z`, the owner waived the nested desktop CLI live-probe gate
  for Phase 0.5 only. Both failures remain failures; CLI runtime is deferred/
  unverified, and app-level Sol operation is owner-observed context rather than
  submission evidence. Deterministic offline replay is the verified reproducibility
  path. The waiver permits only the approved Chromium spike, not product/scored work,
  benchmark, commit, or push.
- The approved independent 300-card museum-board Chromium spike is now complete in
  `Chrome/152.0.7977.64`. Correctness passed for every value, selection, action-log
  digest, and reset, with zero console errors and unhandled exceptions. The final
  fixed protocol retained all 60 measured samples after five warmups per arm. It
  observed 2400 baseline versus 1900 advanced card-render calls per sample (20.83%
  fewer), but mean CDP `TaskDuration` was 4.7071 ms versus 5.0037 ms, so no CPU
  improvement is claimed. The first run retained summaries only; one unchanged
  instrumentation/evidence retry added the required per-sample records without
  changing N, actions, ordering, warmups, or repetitions. At that checkpoint Phase
  0.5 was ready for an owner freeze decision under the explicit CLI waiver but had
  not yet been frozen; product work, scored artifacts, benchmark, commit, and push
  remained unauthorized.
- Final structural verification passed: tests 16/16, stack 11/11, model/offline
  controls 6/6, CLI privacy 3/3, doctor privacy 4/4, network privacy 3/3, Chromium
  harness 4/4, license audit 54/54, YAML, Markdown, privacy scan, and
  `git diff --check`. At that pre-freeze checkpoint safe control preflight returned `READY_FOR_CLEAN_BRANCH` with
  no contamination findings. Safe implementation preflight remains intentionally
  `BLOCKED` by the two unresolved Phase 0.5 placeholders and dirty worktree, with the
  four existing binary-review notices; this is not a contamination failure or a
  claim of implementation readiness.
- At `2026-08-29T13:41:51Z`, the owner's earlier conditional instruction to close
  Phase 0.5 when no obstacle remained was satisfied by the coordinator-verified
  Chromium evidence: 60 samples, 30 per arm, frozen ordering and N=300, all
  correctness fields/digests passed, 2400 versus 1900 card renders, 4.7071 ms versus
  5.0037 ms mean CPU TaskDuration, and passing listed tests plus `git diff --check`.
  CPU improvement is not claimed. Phase 0.5 is frozen under the explicit nested-CLI
  waiver; the two CLI failures remain failures and offline replay remains the
  verified reproducibility path.
- Product implementation remains blocked by governance rather than the resolved
  placeholders: product work needs separate explicit owner authorization; fixture
  code additionally requires independently authored behavior prose/public provenance
  and their freeze. No scored artifacts, official benchmark, commit, or push are
  authorized.
- Post-freeze safe preflights passed with no contamination findings: control returned
  `READY_FOR_CLEAN_BRANCH`; implementation returned `READY_FOR_IMPLEMENTATION` after
  exactly the two Phase 0.5 placeholders were resolved. The latter also reported the
  expected dirty-worktree warning and four existing binary-review notices. Automated
  readiness is not human authorization and does not clear the product-approval or
  fixture-provenance gates above.
- The post-promotion checksum manifest verifies exactly 79 intended repository files;
  coverage comparison reports zero missing or extra paths. The manifest remains
  self-excluding, and the two documented local-only files remain excluded.
- External immutable capture for `TRC-BG-PHASE05-001` is recorded as `3511076`
  bytes with SHA-256
  `031477de3fd7e42591ba5e7c1820ac39cb2dd1b691dbae29ae850a2aee895b86`.
  The raw scan failed: it reported 667 absolute user-path matches, two private-term
  matches before path redaction and one after it, with zero email and zero
  secret-assignment matches. The packaging task did not access the raw file/path or
  learn the private term. EN/RU reviewed-layer candidates and a plain-Russian owner
  card now exist. The reviewed layer passed real-denylist control with zero
  contamination and zero machine/thread/tool metadata findings; four existing
  binary human-review notices remain. The repository owner then approved the EN/RU
  reports and confirmed that technical meaning was preserved after the stated
  exclusions. `technical_meaning_preserved=true`, and the trace is indexed in
  `actual_traces`. The raw scan remains `failed`; its counts and limitations are
  unchanged. This approval authorizes trace promotion only.
- Post-promotion validation passed: repository tests 16/16; Phase 0.5 test suites
  11/11, 6/6, 3/3, 4/4, 3/3, and 4/4 without model or browser execution; YAML,
  EN/RU approval parity, privacy, `git diff --check`, and all 79 checksums. Safe
  control returned `READY_FOR_CLEAN_BRANCH`; safe implementation returned
  `READY_FOR_IMPLEMENTATION` with the expected dirty-worktree warning and four
  binary-review notices. No contamination finding occurred, and automated readiness
  still does not authorize product work.
- The owner approved the clean BG-D01 EN/RU behavior/provenance packet at
  `2026-08-29T14:50:15Z`. Post-freeze trace review found a prohibited private
  identifier category in the initial coordinator instruction; the identifier is not
  recorded and does not occur in the frozen repository packet. The raw
  `TRC-BG-D01-001` transcript is excluded under `EXC-002`, while the clean artifact
  freeze remains valid. D01 implementation must begin in a new neutral task packet;
  product code still requires a separate explicit owner checkpoint.
- The owner then selected `«Commit и код (Recommended)»` for the exact question
  recorded in `SES-20260829-004`, authorizing only the described neutral D01
  implementation checkpoint. The checkpoint created the arm-visible fixture/API,
  shared legacy React reference, two neutral signals candidates, exactly five frozen
  visible tests, verifier-only canonical driver, physical Node permission boundary,
  and four immutable SHA-256 manifests. No commit or push was performed because this
  checkpoint explicitly forbids both. Visible tests passed 5/5 for both candidates;
  separate positive-step contract passed 1/1 without adding a sixth visible test;
  evaluator self-check passed 3/3, including the shared legacy reference; denied
  access passed 2/2 for both arms and both candidates while each candidate remained executable. Model and Chromium calls
  remained zero. Real scanner-only probe/control/implementation checks passed with
  zero contamination findings, the expected dirty-worktree warning, and the four
  pre-existing official binary human-review notices. The implementation artifacts,
  provenance, and trajectory remain pending repository-owner review.
- The canonical active command for the complete bounded D01 path is now
  `npm run task -- d01:verify`. The typed registry is discoverable through
  `npm run task -- list`; this orchestration-only refactor did not change candidate
  hashes, manifests, oracle behavior, visible-test semantics, or evaluation results.
- Stable `npm test` delegates to `test:all`, which discovers sorted tests only below
  `tests/` and `evaluation/arm-visible/`, fails closed on empty or out-of-bound
  discovery, and excludes verifier-only self-checks. Registry definitions are split
  into common, D01, and safe Phase 0.5 groups; historical live run tasks are absent.
- Clean recovery `SES-20260829-007` independently audited the repo-local D01 draft
  against `f0418bc`. It rewrote the shared arm deadline into independent 180-second
  deadlines, replaced candidate-name heuristics with TypeScript-symbol analysis,
  typed evaluator reason matching, bound evaluator output to decision/manifest
  digests, and made offline replay reproduce and compare JSON/HTML in memory.
- SES-007 recovery validation originally passed compile and ordinary tests 47/47;
  the later pre-commit hardening passed ordinary tests 49/49 and the complete D01 verify,
  two identical offline replays, and safe Phase 0.5 verification without live
  execution. The repo-local control preflight stopped before scanning because the
  required external private denylist was unavailable and forbidden by this session;
  implementation preflight did not run in that chained attempt. No bypass or
  synthetic denylist was used. Both owner-controlled private-denylist preflights
  were later completed through the owner-authorized interface: control returned
  `READY_FOR_CLEAN_BRANCH`, implementation returned `READY_FOR_IMPLEMENTATION`, and
  no contamination finding occurred. Four official binary-review notices and the
  dirty-worktree warning remain expected. The native Codex Desktop Markdown source
  capture completed with 66,250 bytes and SHA-256
  `bcf36c6cc64f7695adbdac8a49a888bee8c33b6658a5a469306ae2422db7c612`.
  Hidden reasoning/internal application events are not claimed as captured. Final
  eligibility was initially approved, then reopened by pre-commit review. A later
  79,779-byte native export was semantically compared and the reviewed layer was
  reconciled, but it is not the anchored 66,250-byte immutable capture. Post-capture
  decisions now live in a separate provenance record. Exact-source equivalence is
  still unproven, and the original recovery trace is not indexed in `actual_traces`.
  Replacement verification session `SES-20260829-008` then completed the bounded
  D01 verification with two fail-closed stops and owner-authorized retries. Its
  exact UTF-8 native capture `TRC-BG-D01-VERIFY-002` passed semantic review,
  private-denylist scanning, and repository-owner review and is now indexed in
  `actual_traces`. This replacement proves the independent verification trajectory;
  it does not retroactively make the blocked SES-007 source capture exact.

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
