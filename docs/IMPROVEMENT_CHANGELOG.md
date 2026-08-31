# BeyondGreen — Improvement Changelog Projection

**Projection of:** `docs/PROJECT_SPEC.md@1.1.0`
**Requirements:** `AR-003`, `AR-004`, `AR-009`, `EV-008`–`EV-010`
**State:** approved contracts plus one unscored BG-D01 vertical slice; no official/scored benchmark run exists

## ITR-000 — Superseded generation-first candidate

- **Observed problem:** a React state-to-signals patch can pass visible legacy tests
  while violating an untested behavior or lifecycle contract.
- **Hypothesis:** generating migrations and comparing multiple generation approaches
  could demonstrate safer modernization.
- **Exact change tested:** a specification candidate proposed generation-first
  orchestration, three comparison arms, 12 fixtures with a 5/7 split, and BPMR as
  the primary metric.
- **Evaluation command/version:** specification review only; no executable evaluation
  or benchmark run occurred.
- **Evidence:** preserved historical specification history; no run IDs.
- **Decision:** `removed` from active v1.1 semantics. It expanded the claim surface,
  did not isolate the real verify-existing bottleneck, and made a fair comparison
  harder to explain under the remaining schedule.
- **Human checkpoint:** the repository owner approved the v1.1 requirements in the
  neutral specification task packet.
- **Next action:** replace generation scoring with fixed-candidate decision scoring.

This entry is the required documented removed experiment at specification level. It
must not be presented as a measured product experiment; later measured work must
still preserve at least one evidence-backed negative or removed experiment.

## ITR-001 — Verdict, isolation, and evidence hardening

- **Observed problem:** an earlier candidate left verdict edge cases, oracle
  capability isolation, truthful checkpoints, and evidence mapping underspecified.
- **Hypothesis:** explicit fail-closed semantics, physical isolation, frozen evidence,
  and canonical requirement mappings reduce unsupported acceptance risk.
- **Exact change tested:** added explicit decision semantics, immutable evidence,
  process/filesystem oracle isolation, `K=0`, denied-access tests, truthful human
  approvals, and canonical rubric/qualification tokens.
- **Evaluation command/version:** specification consistency review only; no candidate
  or benchmark run occurred.
- **Evidence:** normative contracts and clean-room policies; no run IDs.
- **Decision:** `kept` as constraints in v1.1, with semantics projected onto
  verify-existing rather than generation.
- **Human checkpoint:** boundary `SES-20260829-001` approved before v1.1 editing.
- **Next action:** preserve these controls in the D01 vertical slice after final spec
  approval.

## ITR-002 — BeyondGreen normative v1.1 rescope

- **Observed problem:** generation-first scope, a mechanical third arm, 12 cases,
  BPMR, and generation-oriented outputs did not match the approved primary workflow:
  deciding whether an already-existing candidate is safe despite incomplete tests.
- **Hypothesis:** two arms receiving the same fixed candidates make the incremental
  value of risk-directed independent verification legible and reproducible.
- **Exact change:** renamed the judge-facing product to BeyondGreen; restricted scored
  v1 to verify-existing; fixed ten fixtures, 20 candidate decisions, a 4/6 split, two
  arms, accept/reject/abstain semantics, decision-accuracy metrics and targets,
  three-minute one-attempt limits, required CLI/JSON/HTML, the Node/TypeScript stack,
  provider-neutral replay, one unscored D01 repair demo, behavior-gated Chromium
  evidence, and the trace-first/D01/early-ZIP critical path.
- **Evaluation command/version:** normative/projected consistency checks for
  `eval-v1.1.0`; tests and preflight are recorded after the bounded review.
- **Evidence:** `docs/PROJECT_SPEC.md`, its complete Russian translation,
  `docs/EVALUATION.md`, `config/topic.yaml`, diagrams, artifact-contract amendment,
  and the approved session-boundary record.
- **Run IDs:** none; product code, fixtures, candidates, and benchmark runs are
  prohibited in this task.
- **Review agents:** Codex author/reconciler and one bounded Claude read-only reviewer.
- **Claude verdict:** `FAIL` for pre-fix readiness, while describing the two-arm
  rescope as directionally correct. Blocking findings were internal-checker/evaluator
  conflation, missing green-gate semantics for preserving candidates, undefined
  BeyondGreen behavior on visible-test failure, absent challenging-case requirement,
  a trace-first/Phase 0.5 preflight cycle, missing oracle archive policy, and an
  undisclosed algebraic dependency between the accuracy and advantage targets.
- **Codex reconciliation:** independently confirmed those findings and the associated
  projection drift; corrected the normative EN/RU contracts, evaluation, diagrams,
  artifact paths, preflight state, indexes, provenance timing, and future-agent read
  contract. Rejected any implication that missing future implementation evidence was
  a current spec defect; it remains `UNKNOWN` and implementation stays prohibited.
- **Post-fix checks:** `npm test` passed 10/10; JSON and YAML parsing passed; EN/RU
  parity passed for 21 sections and 43 requirement rows; requirement references and
  all five target projections resolved; oracle-boundary assertions and
  `git diff --check` passed; structural control preflight returned
  `READY_FOR_CLEAN_BRANCH`; structural implementation preflight remained correctly
  `BLOCKED` on the two intentional Phase 0.5 placeholder tokens and detached HEAD.
- **Decision:** `kept`; normative v1.1 approved after review reconciliation.
- **Human checkpoint:** repository owner approved `docs/PROJECT_SPEC.md@1.1.0` at
  `2026-08-29T10:46:39Z`, accepted the Phase 0.5 open decisions as mandatory gates,
  and explicitly withheld implementation and commit/push authorization.
- **Next action:** transfer approved changes to the main branch under user control,
  then require real contamination preflight, a new approved implementation boundary,
  and eligible trace-first success before product work.

## ITR-003 — Post-handoff normative reconciliation

- **Observed problem:** the approved v1.1 surface had reached a named branch, while
  operational contracts and the checksum manifest still described transfer as
  pending and retained historical digests.
- **Hypothesis:** reconciling only factual branch/gate state and regenerating the
  manifest will make the transferred specification independently verifiable without
  weakening any implementation gate.
- **Exact change:** recorded named branch `impl/stateshift-guardian` and reconciliation
  checkpoint `dbf9d55123bef9fc38ec5e9b99dbc56f37aa9290`; removed transfer and detached
  HEAD from current blockers; retained Phase 0.5, real contamination preflight, a new
  approved implementation boundary, and eligible trace-first as blockers; excluded
  the two local-only task-denied documents from scanner traversal; and regenerated
  the post-v1.1 checksum surface without those excluded files.
- **Evaluation command/version:** `npm test`; JSON/YAML parsing; `git diff --check`;
  `shasum -a 256 -c docs/CONTROL_PLANE_SHA256SUMS`; exact manifest-coverage check;
  and structural control/implementation preflights with a non-private external stdin
  canary.
- **Evidence:** post-handoff branch/checkpoint checks, validation output, and current
  diff only; no product, fixture, candidate, solution-agent, or benchmark run IDs.
- **Scanner limitation:** the real private environment variables were absent. The
  structural canary is not a replacement for a real private denylist and does not
  establish contamination clearance. Before the exact scanner-ignore paths were
  reconciled, the initial automated self-scan could technically traverse the two
  task-excluded local-only documents, although it emitted neither their contents nor
  a finding from them. One transient shortened test-output file was also mistakenly
  written outside the repository root and immediately removed. This reconciliation
  transcript is therefore not submission eligible; transcript review remains
  pending.
- **Decision:** `kept` as control-plane reconciliation only. No product implementation
  or commit/push was authorized or performed.
- **Next action:** obtain a real contamination preflight, resolve Phase 0.5, approve a
  new implementation `SESSION_BOUNDARY`, and pass the eligible trace-first gate before
  any product work.

## ITR-004 — Trace-first infrastructure candidate

- **Observed problem:** after the branch was renamed without rewriting history, the
  active preflight status still named `impl/stateshift-guardian`, while the real
  implementation branch was `impl/beyondgreen`. The trace-first gate also lacked a
  reviewed representative candidate tied to the approved implementation boundary.
- **Hypothesis:** one minimal docs-only correction, verified by the real scanner-only
  controls and preserved as an immutable raw trace, can demonstrate the capture and
  review path without starting Phase 0.5 or product work.
- **Exact change:** corrected only current branch/gate facts in
  `docs/PREFLIGHT_CHECKLIST.md`; preserved the historical handoff and recorded the
  subsequent rename without history rewrite; ran the approved test, scanner, and
  trace probes; then prepared instruction, readable pending-trace, and review
  candidates for `TRC-BG-TRACEFIRST-001`. After repository-owner approval, moved the
  EN/RU traces to reviewed paths without changing their technical chronology, updated
  their review status, indexed the trace, and regenerated the checksum manifest; no
  checksum update occurred before approval.
- **Exact commands:** `npm test`; `micro1-safe-preflight probe`;
  `micro1-safe-preflight control`; `micro1-safe-preflight implementation`;
  `micro1-safe-trace probe`; `git diff --check`; exact branch/HEAD, changed-file, and
  untracked-file scope checks.
- **Command evidence:** tests passed 10/10; scanner probe passed; control preflight
  returned `READY_FOR_CLEAN_BRANCH`; implementation preflight reached repository
  analysis and returned `BLOCKED` only on two intentional Phase 0.5 placeholders plus
  the docs-only dirty-worktree warning; trace probe passed; final diff scope was
  exactly `docs/PREFLIGHT_CHECKLIST.md` with no untracked files during the traced
  turn.
- **Raw trace evidence:** immutable external capture, 49,645 bytes, SHA-256
  `ccaf8498a6ff978d94b35a576cb90ee35bf8bcf75487c281144cb31c52647f00`;
  automated scan `passed_requires_submission_redaction`; one denylist match confined
  to machine path metadata before virtual path redaction and zero afterward; 13
  absolute-user-path occurrences require submission redaction; no email or
  secret-assignment matches.
- **Submission-candidate scan:** after redaction, the real-denylist control preflight
  returned `READY_FOR_CLEAN_BRANCH` with zero contamination findings. A separate
  local metadata check found zero machine/thread/tool identifier findings; four
  official binary artifacts retained human-review notices only.
- **Agent/model:** Codex desktop / GPT-5; approved boundary `SES-20260829-002`.
- **Trajectory:** `TRC-BG-TRACEFIRST-001` passed automated and repository-owner
  review and is present in `actual_traces` as the eligible representative trace for
  `COD-CODEX-002`.
- **Retries:** zero agent action retries. Coordinator capture had one transport retry:
  the first PTY transfer stopped before EOF and produced no partial raw; atomic
  capture succeeded from an exact temporary external export, which was then deleted.
- **Run IDs:** none; no product, solution-agent, candidate, model, or benchmark run
  occurred.
- **Human checkpoint:** the owner was shown the exact prompt
  `Подтверждаете: «Одобряю русскую и английскую версии TRC-BG-TRACEFIRST-001 как точный и безопасный отчёт»?`
  and responded `Подтверждаю одобрение (Recommended)`. This is recorded as explicit
  confirmation of the quoted statement, not as a claim that the owner typed the full
  statement verbatim. Both Russian companion paths were available before approval.
- **Human feedback revision:** the repository owner did not approve promotion on the
  first review attempt because the packet had no accessible Russian-language review
  materials. This is human feedback, not an agent retry or capture retry. Added a
  full Russian semantic counterpart, a short plain-language Russian review card, and
  a permanent policy requiring Russian companions before every owner checkpoint. A
  second review then passed.
- **Decision:** `kept`. The reviewed infrastructure artifact receives eligible
  representative-trace credit; this does not claim product or Phase 0.5 results.
- **Post-promotion checks:** YAML, Markdown, EN/RU fact alignment, privacy metadata
  scan, and `git diff --check` passed; `npm test` passed 10/10; real-denylist control
  preflight returned `READY_FOR_CLEAN_BRANCH`; implementation preflight remained
  `BLOCKED` only on the two Phase 0.5 placeholders plus the expected dirty-worktree
  and four binary-review notices, with zero contamination findings. The regenerated
  control-plane manifest verified all 47 intended files with exact coverage.
- **Next action:** separately discuss and freeze the Phase 0.5 decisions. Product
  implementation, commit, and push remain unauthorized.

## ITR-005 — Phase 0.5 decision research candidate

- **Observed problem:** section 20 correctly blocked implementation but left seven
  stack, engine, budget, replay, case-assignment, and Chromium decisions unresolved.
  Starting a spike without exact owner-reviewed inputs would make its evidence hard
  to reproduce or interpret.
- **Hypothesis:** an exact EN/RU decision contract, a plain-Russian owner card, and a
  machine-readable candidate can make the later spike bounded and reviewable without
  prematurely changing active product semantics or dependencies.
- **Exact change:** proposed `@preact/signals-react@3.12.0` and an exact
  Node/TypeScript/React/jsdom/Zod/type stack; lockfile and transitive-license-audit
  rules; locally authenticated `codex exec` with `gpt-5.6-sol` as the primary live
  candidate, one call, no retries, read-only/ephemeral/ignored-user-config controls,
  `not_measured` marginal USD cost, conditional CLI-reported token evidence,
  and deterministic offline replay; a 180-second timeout; a versioned JSONL/hash
  contract; an exact 4-development / 6 held-out neutral behavior-class assignment
  with `BG-D01` first and `BG-H02` challenging; and a correctness-first Chromium
  protocol. Added no product code, fixture prose, candidate, oracle, package,
  lockfile, model output, or benchmark evidence.
- **Coordinator-review revision:** replaced subscription-based Codex CLI as the
  primary transport because it did not establish reliable scored USD accounting.
  Proposed a Responses API transport and expanded per-candidate accounting. Replaced the small
  D01 counter with an independently designed 300-card museum visit group allocation
  board, fixed bulk stale-snapshot actions, full correctness digests, explicit
  userland render counters, and before/after CDP `TaskDuration` CPU deltas. The card
  count is frozen before measurement; infeasibility returns to owner review.
- **Owner-feedback revision:** the repository owner rejected the coordinator's
  Responses API/SDK/per-candidate USD design as unnecessary complexity because the
  authenticated Codex session has fixed subscription billing. The active proposal
  therefore returns to CLI-first execution, records marginal USD cost as
  `not_measured`, records tokens only when the CLI reports them stably, and controls
  budget through call cardinality, no retries, and timeout. The OpenAI SDK is not a
  dependency candidate. The owner feedback retained the independently designed
  300-card Chromium protocol unchanged. This is a human decision revision, not an
  agent/model retry.
- **Final owner model correction:** coordinator evidence recorded
  `codex login status` → `Logged in using ChatGPT` for `codex-cli 0.148.0`. Terra had
  been a temporary cost-driven candidate during the rejected API alternative. Once
  fixed subscription billing was confirmed, the owner selected `gpt-5.6-sol`, the
  current flagship for complex professional work, as the strongest candidate. The
  spike checks Sol availability in that ChatGPT-authenticated CLI session, forbids
  substitution, and returns to owner review if unavailable. No login or model call
  was rerun in this task; the 300-card protocol and all other active decisions were
  unchanged.
- **Public research commands/version:** `node --version` (`v22.22.3`);
  `npm --version` (`10.9.8`); `codex --version` (`codex-cli 0.148.0`);
  `codex exec --help`; and `npm view ... --json` metadata queries for
  `@preact/signals-react`, React, ReactDOM, TypeScript latest and 5.9, jsdom, Zod,
  `@types/node` latest and 22, `@types/react`, `@types/react-dom`, and `@types/jsdom`.
  A read-only `openai` metadata query and official Responses documentation review
  occurred only while the now-rejected coordinator alternative was considered; they
  do not define an active dependency, transport, or pricing decision. Exact active
  commands and returned decision fields are preserved in the EN/RU packet; no
  package was installed, packed, or executed and no API/model request occurred.
- **Evidence:** public npm registry fields and official upstream repository/license
  URLs reported by those fields; local read-only version/help output; candidate files
  `docs/PHASE_0_5_DECISIONS.md`, `docs/PHASE_0_5_DECISIONS_RU.md`,
  `docs/PHASE_0_5_REVIEW_RU.md`, and `config/phase-0.5.candidate.yaml`.
- **Run/product IDs:** none. This is research evidence only; no product, fixture,
  candidate, solution-agent, model, browser, benchmark, or Phase 0.5 spike run exists.
- **Agent/model:** Codex desktop / GPT-5, under approved boundary
  `SES-20260829-002` and eligible representative trace
  `TRC-BG-TRACEFIRST-001`.
- **Errors/retries:** zero research-action and external-capture retries. The first
  local EN/RU token check reported a false mismatch because it compared `12,000`
  with Russian `12 000` without normalizing separators. The first correction then
  treated Russian decimal `0,25` as a thousands separator. A second corrected
  validation retry used explicit localized-number pairs; both false mismatches left
  the documents unchanged. The first exact-scope parser used `trim()`, removed the
  leading porcelain-status space from the first tracked path, and falsely reported
  `ocs/...`; one corrected scope retry used `trimEnd()` and left files unchanged.
  During the coordinator revision, the first two EN/RU checks falsely mismatched the
  localized `USD 2.00` notation and a Markdown line break before the 15-pair order;
  a third check used explicit currency pairs and whitespace-insensitive ordering and
  passed without document changes.
  The owner-feedback revision had one local patch-application retry: a combined patch
  found a stale approval-scope context and applied no changes; the same bounded edits
  then succeeded as file-specific patches. No model, browser, install, or capture
  retry occurred.
  Direct `npm run preflight:control` could not access the
  scanner-only denylist and returned `Missing value for --denylist`; one retry through
  the owner-authorized `micro1-safe-preflight control` interface returned
  `READY_FOR_CLEAN_BRANCH` without exposing the value.
- **Validation:** candidate YAML and Markdown structure passed; required EN/RU facts,
  versions, localized numbers, and all ten behavior IDs aligned; privacy/machine
  metadata check found no prohibited identifiers; `npm test` passed 10/10;
  `git diff --check` passed; real-denylist control preflight found no contamination
  and retained four expected binary human-review notices. The coordinator-review
  revision passed the same YAML, Markdown, EN/RU, privacy, test, diff-scope, and
  scanner-only control checks before owner review. The later owner-feedback revision
  requires and receives the same checks before the next owner review.
- **Human checkpoint:** at `2026-08-29T12:52:58Z`, the repository owner was shown
  `«Одобряете технический Phase 0.5 spike с подписочным codex exec/gpt-5.6-sol без API, одним вызовом без повторов и сценарием на 300 карточек?»` and selected
  `«Одобряю spike (Recommended)»`. This explicitly authorizes only the measured
  Phase 0.5 spike. Phase 0.5 freeze, product implementation, commit, and push remain
  unauthorized pending review of measured evidence.
- **Decision:** `revised` as a bounded candidate replacing section-20 placeholders
  for review only; active product projections and checksum manifest remain unchanged.
- **Next action:** run the now-approved measured stack/model/replay/Chromium spike
  exactly once under its gates and return the evidence for another owner decision
  before Phase 0.5 freeze or product implementation.

Every later iteration must record observed failure, hypothesis, exact change,
command/version, evidence/run IDs, agent/model, trajectory IDs, errors/retries,
genuine human checkpoint, decision (`kept`, `revised`, or `removed`), and next action.
Held-out results cannot drive evaluation v1.1 tuning.

Strongest measured change, measured removed experiment, remaining implementation
failure, and final hot take remain unclaimed until evidence exists.

## ITR-006 — Phase 0.5 dependency gate stopped before measurement

- **Observed problem:** the approved spike required a complete transitive-license
  audit before any stack, model, replay, or Chromium evidence could be accepted.
- **Hypothesis:** exact versions plus a lifecycle-script-free lockfile/install and a
  machine-readable license inventory would establish a reproducible licensed stack.
- **Exact change:** added only the approved exact dependencies to `package.json`,
  generated `package-lock.json`, and installed with lifecycle scripts disabled. No
  spike harness, fixture, candidate, oracle, product code, or benchmark was created.
- **Exact commands:** `npm install --package-lock-only --ignore-scripts` passed;
  `npm ci --ignore-scripts` passed; `npm query . --json` failed with
  `EQUERYNODEPTYPE`, and the downstream in-memory JSON parser then failed because it
  received no package array.
- **Evidence:** 54 dependency packages installed, 55 total packages audited, zero
  vulnerabilities reported. The license inventory itself was not produced, so the
  license hard gate failed before assessment.
- **Errors/retries:** one license-audit command error and one consequential parser
  error in the same pipeline; zero audit retries. npm printed a machine-specific
  external debug-log path into raw tool output. The path was not opened, inspected,
  copied, or persisted and must be submission-redacted by category. The only
  approved model call was not used.
- **Run/product IDs:** none. No model, Chromium, offline-replay, behavior-capability,
  fixture, candidate, oracle, official benchmark, repair, or product run occurred.
- **Human checkpoint:** the spike input approval remains factual, but it does not
  authorize bypassing a failed dependency/license or trace-redaction gate.
- **Decision:** `revised`; stop the spike and return to owner review rather than
  improvising a second audit command.
- **Next action:** if the owner explicitly authorizes a new attempt, run one corrected
  repository-local license audit first. Continue the previously approved spike only
  if that audit and contamination review pass.

## ITR-007 — Repository-local transitive-license audit retry

- **Observed problem:** the first audit used an unsupported npm query selector and
  produced no license inventory; its raw error also exposed a machine-specific debug
  log path that must be submission-redacted.
- **Hypothesis:** a deterministic standard-library Node scanner can compare the npm
  lock graph with installed package metadata, normalize common license shapes, and
  fail closed without reading or emitting any external path.
- **Human checkpoint:** at `2026-08-29T12:58:49Z`, the repository owner was shown
  `«Разрешаете одну исправленную попытку transitive-license audit через локальный Node-сканер, после которой spike продолжится только при полном PASS?»` and selected
  `«Разрешаю retry (Recommended)»`. This authorizes exactly one corrected audit; it
  does not authorize bypass, a second audit retry, Phase 0.5 freeze, product code,
  commit, or push.
- **Exact change:** added `scripts/license-audit.ts`, focused scanner tests, a single
  `npm run audit:licenses` command, a documented permissive SPDX allowlist, and a
  privacy-safe JSON report target. The scanner reads only `package-lock.json` and
  installed `node_modules/**/package.json` metadata under the repository root.
- **Policy:** allowed identifiers are `0BSD`, `Apache-2.0`, `BSD-2-Clause`,
  `BSD-3-Clause`, `CC0-1.0`, `ISC`, `MIT`, `Python-2.0`, `Unlicense`, `X11`, and
  `Zlib`; `LLVM-exception` is the only allowed exception. Missing, unknown,
  non-allowlisted, unreadable, unsafe-location, or lock/install-mismatched metadata
  fails the gate.
- **Validation before audit:** the first focused test run exposed two scanner-test
  defects (classification of `SEE LICENSE...` and an ESM-incompatible test helper).
  Both were corrected; the second run passed 15/15. These were scanner-development
  test iterations, not transitive audit attempts. The sole approved dependency audit
  remained unused at this point.
- **Audit command/evidence:** the sole authorized `npm run audit:licenses` attempt
  completed at `2026-08-29T13:00:10Z` and wrote
  `artifacts/phase-0.5-license-audit.json`. It enumerated 54 installed packages: 51
  allowed, zero missing, zero unknown, and three non-allowlisted findings. The
  findings were `@csstools/color-helpers@6.1.1` (`MIT-0`),
  `@csstools/css-syntax-patches-for-csstree@1.1.9` (`MIT-0`), and
  `lru-cache@11.5.2` (`BlueOak-1.0.0`). Inventory SHA-256 is
  `da4ea21744663f8a0343fc8020da92791369ea426eb298141ceb513121efede9`;
  report-payload SHA-256 is
  `d0d2db07447216439ac6f93a5dc7118fc4039a2e1b3ebc98cd05db28dd1d0b55`.
- **Errors/retries:** one historical failed npm-query audit and exactly one
  owner-authorized corrected audit; no second corrected audit. Before the corrected
  audit, the scanner's first unit-test run exposed two implementation/test defects;
  after correction, tests passed 15/15. Model-call count and Chromium-run count remain
  zero.
- **Decision:** `revised`; corrected audit status is FAIL because three valid SPDX
  expressions were outside the frozen allowlist. Stop before stack/model/replay/
  Chromium work and return to owner. This does not assert that those licenses are
  non-permissive; it enforces the owner-approved policy.
- **Next action:** owner review must decide whether to extend the allowlist or change
  dependencies and must explicitly define any further audit authorization. Phase 0.5
  freeze and product implementation remain unauthorized.

## ITR-008 — Owner-approved license-policy amendment and final audit gate

- **Observed problem:** the complete audit found only three findings: `MIT-0` on two
  packages and `BlueOak-1.0.0` on one package. Both identifiers were outside the
  frozen allowlist, so the correct result was FAIL despite complete metadata.
- **Authoritative grounds supplied by coordinator:** SPDX describes `MIT-0` at
  `https://spdx.org/licenses/MIT-0.html` and `BlueOak-1.0.0` at
  `https://spdx.org/licenses/BlueOak-1.0.0.html`. The supplied Blue Oak notice rule
  requires recipients of a copy to receive its license text or link.
- **Human checkpoint:** at `2026-08-29T13:03:36Z`, the owner was shown
  `«Одобряете MIT-0 и BlueOak-1.0.0 как допустимые permissive-лицензии, обязательный THIRD_PARTY_NOTICES.md и один финальный повтор audit?»` and selected
  `«Одобряю и продолжить (Recommended)»`. This approves only those two SPDX additions,
  the required notices artifact, and exactly one final audit of the unchanged tree.
- **Hypothesis/change:** add only `MIT-0` and `BlueOak-1.0.0`; generate a deterministic
  `THIRD_PARTY_NOTICES.md` with SPDX links for all installed packages so packaging can
  retain every actually distributed dependency's notice without implying that
  `node_modules` itself is shipped.
- **Digest correction:** the v1.0 inventory digest included policy status and could
  not remain stable across a policy amendment. Before changing policy, the saved
  report established a policy-neutral `name/version/license` SHA-256 of
  `68519a270c035c5cb2c8cb92f6d27b44ed47958a4c31b134bcbdb7f4a364ef18`.
  The historical policy-coupled digest
  `da4ea21744663f8a0343fc8020da92791369ea426eb298141ceb513121efede9` remains retry
  evidence. Lockfile SHA-256 must remain
  `1beb2987e3e0654cb525b80c2f97a2f6577f92399e8a78fcd8eb9f9ab6487d4c`.
- **Decision:** `revised`; test the amended scanner/notices generator, then consume
  the one final audit authorization. Continue only on 54/54 PASS and matching stable
  inventory/lockfile digests.
- **Evidence/result:** scanner/notices tests passed 16/16. The sole final
  `npm run audit:licenses` passed 54/54 with zero findings, stable inventory SHA-256
  `68519a270c035c5cb2c8cb92f6d27b44ed47958a4c31b134bcbdb7f4a364ef18`, unchanged
  lockfile SHA-256
  `1beb2987e3e0654cb525b80c2f97a2f6577f92399e8a78fcd8eb9f9ab6487d4c`, report
  payload SHA-256 `7d4d0477585c61e7179fbb6bdd1ff7bf019083536e93362b7fc12a173595ec92`,
  and `THIRD_PARTY_NOTICES.md` SHA-256
  `6345e22330c67f4091526d3b516bf5a2e06c2694e61b057cd05aabfd8a6f35de`.
- **Decision after measurement:** `kept`; the amended policy and notices requirement
  passed. Continue to stack/model gates under the earlier approval.

## ITR-009 — Stack passes; frozen live-model transport abstains

- **Hypothesis:** the exact approved stack can express all ten synthetic behavior
  capabilities, and the frozen subscription-authenticated Codex command can emit one
  schema-valid JSON response with deterministic JSONL parsing and no retry.
- **Change:** added spike-only capability tests, exact JSON Schema and synthetic
  prompt, deterministic JSONL parser, failure controls, offline replay hash-chain,
  and a one-call runner. No product, scored fixture/candidate/oracle, or benchmark
  code was created.
- **Commands/evidence:** `npm run test:phase-0.5:stack` first passed all ten behavior
  tests but failed the integration setup because Node 22 exposes
  `globalThis.navigator` as read-only. Removing the unnecessary assignment made the
  second run pass 11/11. `npm run test:phase-0.5:model` passed 4/4, covering frozen
  argv, deterministic JSONL/schema parsing, malformed/missing/duplicate failure, and
  deterministic replay tamper detection.
- **Live call:** `npm run spike:phase-0.5:model` invoked the exact frozen
  `codex exec --ephemeral --ignore-user-config --json --output-schema spikes/phase-0.5/model-output.schema.json --sandbox read-only --model gpt-5.6-sol`
  command once. It exited 1 after approximately 3.93 seconds with
  `MODEL_TRANSPORT_FAILURE` and no schema-valid output. Stderr content was not
  persisted or disclosed; SHA-256 is
  `3b93186506b30e5901974d0a6f8f0c3c876309b7920735f66205cef575d0c264`.
- **Errors/retries:** one stack-harness setup retry; exactly one total model call,
  zero model retries, zero transport retries, and no substitute model. The retained
  evidence cannot distinguish model unavailability from another transport error.
- **Decision:** `revised`; operational abstain is a hard model gate failure. Stop
  before Chromium and return to owner. Phase 0.5 is not ready to freeze.

## ITR-010 — Owner-authorized privacy-safe model diagnostic

- **Observed problem:** the first and only live call returned exit 1, while retained
  evidence intentionally contained only a stderr hash and could not distinguish
  model availability from another safe failure class.
- **Human checkpoint:** at `2026-08-29T13:11:21Z`, the owner was shown
  `«Разрешаете один privacy-safe диагностический повтор той же подписочной команды codex exec без замены модели?»` and selected
  `«Разрешаю один retry (Recommended)»`. This authorizes exactly one second and final
  Phase 0.5 live call of the unchanged command/model, not an official scored run.
- **Hypothesis/change:** classify in-memory stderr into the narrow enum `auth`,
  `model_unavailable`, `schema`, `argument`, `network_transport`,
  `sandbox_repository`, or `unknown`; retain only class, exit code, SHA-256, elapsed
  time, and redaction counts. Raw stderr and excerpts remain unpersisted and
  undisclosed. Add synthetic tests covering every class and all redaction categories.
- **Cardinality:** maximum two total owner-authorized live spike calls, one diagnostic
  retry, zero automatic retries, no substitute model, and no third invocation.
- **Decision:** `revised`; run tests, then consume the one authorized diagnostic retry.
  Continue to Chromium only on schema-valid PASS; otherwise stop for owner review.
- **Validation:** updated safe-class/redaction tests passed 6/6. They cover all seven
  classes, all five redaction categories, unchanged frozen argv, deterministic JSONL,
  schema cardinality failures, and offline replay tamper detection.
- **Diagnostic result:** the second and final unchanged live call exited 1 after
  3006 ms. Safe class was `unknown`; stderr SHA-256 was
  `1393963b62d2b0ef4064d9462d967f6b8688db20939a0fcc4b024e7b06ec4ba5`. Absolute
  path, email, account/project ID, token/secret, and machine-identifier redaction
  counts were all zero. No raw stderr or excerpt was persisted or disclosed.
- **Errors/retries:** two total owner-authorized live calls, one diagnostic retry,
  zero automatic model/transport retries, no substitute model, and no third call.
- **Decision after measurement:** `revised`; second operational abstain leaves the
  model gate failed. Stop before Chromium and return to owner. Phase 0.5 is not ready
  to freeze.

## ITR-011 — Non-model Codex CLI diagnosis

- **Observed problem:** both owner-authorized live calls exited 1; the second safe
  class was `unknown`, and no third model call is allowed.
- **Human checkpoint:** at `2026-08-29T13:17:17Z`, the owner was shown
  `«Разрешаете non-model диагностику Codex CLI (login status в exact-mode и codex doctor) с сохранением только безопасного класса результата?»` and selected
  `«Разрешаю диагностику (Recommended)»`. This authorizes zero model/agent calls.
- **Hypothesis/change:** use CLI-only `--version`, command discovery, exact-mode
  `login status`, `doctor`, and an advertised usage/limit/status command if present.
  Capture raw output only in memory and persist safe class, pass/fail, version, exit
  code, stdout/stderr hashes, and redaction counts without excerpts.
- **Decision:** `revised`; validate the privacy wrapper, run only the authorized
  non-model commands, record the most specific safe result, and stop.
- **Validation:** synthetic wrapper tests passed 3/3. A successful help record was
  initially misclassified as `network_transport` because its text mentioned network
  options; exit-0 precedence corrected the stored safe class to `passed` without
  rerunning any CLI diagnostic.
- **Evidence/results:** `codex-cli 0.148.0`; zero model/agent calls. Exact-mode login
  status exited 2 as `exact_mode_flag_unsupported`. Advertised `doctor` exited 1 as
  `network_transport`, with 14 path and one account/project-ID redactions. Advertised
  `usage` exited 1 as `unknown`; `limits` and standalone `status` were not advertised.
  Raw output and excerpts were not persisted or disclosed. Evidence is
  `artifacts/phase-0.5-cli-diagnostics.json`.
- **Errors/retries:** one safe-classification correction from already retained
  booleans/hash/counts; zero CLI-command reruns, zero model/agent calls.
- **Decision after diagnosis:** `revised`; the strongest safe diagnosis is a CLI
  startup/connectivity problem, but causality for the two model failures is not
  proven. Stop with Chromium blocked and Phase 0.5 not ready to freeze.
- **Follow-up hypothesis/change:** a fail-closed wrapper that replaces all paths,
  emails, account/project IDs, tokens/secrets, and machine identifiers before any
  excerpt selection can safely distinguish DNS/TLS/HTTP/auth/startup/config/
  unsupported/connection failures. Tests passed 3/3; no arbitrary excerpt is kept.
- **Follow-up command/evidence:** reran only `codex doctor`; no help, login, usage,
  status, model, or agent command. It exited 1 after 1329 ms with class `dns`, code
  `DNS_RESOLUTION`, stdout SHA-256
  `862ce104bdab383665ccc8a7bc8e411f6298bea88dbfc687df6c631a13600e08`, empty-stderr
  SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, and combined
  SHA-256 `bd4c5e02a6e422990d8259f8b7903db0d9f80038170cd5ff7d46b6fa4375bb2f`.
  Redactions were 14 paths, one account/project ID, and zero in the other categories.
- **Decision after follow-up:** `revised`; DNS resolution failure is confirmed for
  current `codex doctor`, but causality for prior model calls remains an inference.
  Keep Chromium blocked and stop for owner review.
- **Reachability hypothesis/change:** a three-host public matrix can distinguish a
  general resolver failure, one-host filtering, and post-DNS transport policy without
  retaining IPs or HTTP content. Added a 3/3-tested Node wrapper using `dns.lookup`
  and unauthenticated HTTPS HEAD for only `chatgpt.com`, `auth.openai.com`, and
  `api.openai.com`.
- **Matrix evidence:** all three had DNS PASS, TLS connect, `4xx`, and `under_250ms`
  DNS/HTTPS buckets. Credentials were absent; IPs, headers, cookies, bodies, and URL
  paths/query were not retained. No additional hostname was used.
- **Decision after matrix:** `revised`; public-service reachability currently passes,
  so a general resolver failure is not reproduced. The doctor result may be transient
  or may involve an unretained hostname. Do not infer model-call causality or unblock
  Chromium.
- **Doctor rerun after matrix:** reran only `codex doctor` once through the existing
  wrapper. It again returned `dns` / `DNS_RESOLUTION`, exit 1, in 1259 ms. stdout
  SHA-256 was `dcb8a2c15ce3727412039c74d5080db37ce00859bcc74d2baca806666d8c4d26`, stderr
  SHA-256 was `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, and combined
  SHA-256 was `acd43b1a5a2f2ccb608ad8407291d8f1d88000be64a5dbee5c4fff9107dabf27`.
  Redactions repeated at 14 paths and one account/project ID; no raw/excerpt.
- **Decision after rerun:** `revised`; the failure is reproducible and doctor-specific
  while the three public hosts pass. Do not reconstruct the unretained hostname,
  infer model-call causality, or unblock Chromium.
- **Strict-host extraction:** added a 4/4-tested rule accepting only exact
  `openai.com`/`chatgpt.com` or valid subdomains, rejecting path/query/port and
  lookalikes. Reran only doctor: `DNS_RESOLUTION`, exit 1, 1883 ms. No allowlisted
  hostname was extractable, so no DNS lookup ran. stdout SHA-256 was
  `0f66f6cd971e53f86845e67202e5450e5d8de261d437640e407e60b983c40035`; combined
  SHA-256 was `94d219b3ae1eac135d107d6abb0eb5ea1eef48ef03d6906539f5540f1d02cacf`;
  stderr remained empty. Redactions repeated at 14 paths and one account/project ID.
- **Decision after strict extraction:** `revised`; keep hostname null/redacted, do not
  guess or probe it, keep Chromium blocked, and stop.

## ITR-012 — Owner waiver for nested desktop CLI validation

- **Owner decision:** at `2026-08-29T13:30:50Z`, the owner stated:
  `«Я не вижу смысла в этом запуске, мы и так работаем через Sol сейчас, когда я отправляю эти запросы. Возможно, это не работает при вызове из приложения ChatGPT на Mac, но это и не важно, потому что запросы проходят и ответы приходят. Я хочу скипнуть эту проверку и, если других препятствий нет, закрыть эту часть»`.
- **Interpretation:** owner-waive only the nested CLI gate for Phase 0.5. Preserve both
  failed calls as FAIL and keep CLI runtime validation deferred/unverified. The
  owner's app-level Sol observation is context, not submission evidence.
- **Verified fallback:** deterministic offline replay remains the verified
  reproducibility path. It does not validate live CLI behavior.
- **Decision:** `revised`; continue only to the already approved neutral 300-card
  Chromium spike. Product/scored artifacts, benchmark, commit, and push remain
  unauthorized.
- **Chromium hypothesis/change:** an independently authored museum-allocation board
  with 300 cards can exercise stale snapshots and reveal excess userland card renders
  while keeping identical observables in baseline and advanced arms. The harness
  checks all values/selections after every action, the ordered action-log digest,
  reset, console errors, and unhandled exceptions before considering performance.
- **Commands:** `npm run test:phase-0.5:chromium` and
  `npm run spike:phase-0.5:chromium`. The protocol remained fixed at N=300, five
  warmups and 30 measured samples per arm, with 15 baseline/advanced pairs followed
  by 15 advanced/baseline pairs.
- **Evidence:** final correctness PASS in `Chrome/152.0.7977.64`; observable SHA-256
  `064dc4a20841c306c1fff12c94fb2a6c8a12f510e6154e8c0f70b4322aef01a8`; action-log
  SHA-256 `5273d540115aa4e44a4d47738a0b5537ef78450f5e042132d6fd2310de83cabf`;
  zero console errors and unhandled exceptions. Card-render calls were 2400 baseline
  and 1900 advanced per sample (20.83% fewer). Mean CDP `TaskDuration` was 4.7071 ms
  baseline and 5.0037 ms advanced, so no CPU improvement is claimed. Evidence file
  SHA-256: `688baad33e10966944f8d73dd09e03af1f7aa4301cd2d2c66d7efe1b03bf6b41`.
- **Errors/retries:** the first successful protocol execution persisted summaries but
  omitted the contractually required individual measured samples. One
  instrumentation/evidence retry persisted all 60 samples. Card count, actions,
  ordering, warmups, and repetitions were unchanged; no parameter was tuned after
  observing results.
- **Decision after measurement:** `kept`; local dependency, license, stack, offline
  replay, and Chromium correctness gates support owner freeze review under the
  explicit nested-CLI waiver. Live `codex exec` remains deferred/unverified and both
  failures remain failures. Phase 0.5 is not frozen until owner approval; no product,
  scored artifact, official benchmark, commit, or push is authorized.
- **Final validation:** `npm test` passed 16/16; stack 11/11; model-adapter/offline
  controls 6/6; CLI privacy 3/3; doctor privacy 4/4; network privacy 3/3; Chromium
  harness 4/4. `npm run audit:licenses` passed 54/54 with unchanged stable inventory,
  lockfile, report-payload, and notices digests. YAML, Markdown, privacy scan, and
  `git diff --check` passed. The first YAML validation command used an unavailable
  Ruby `safe_load_file` helper; the immediate read-only retry with
  `safe_load(File.read(...))` passed. Safe control preflight returned
  `READY_FOR_CLEAN_BRANCH` with four binary-review notices and no contamination
  findings. Safe implementation preflight correctly remained `BLOCKED` on the two
  unresolved Phase 0.5 placeholders and the expected dirty-worktree warning, plus
  the same four binary-review notices.
- **Cleanup correction:** both Chromium attempts initially left a fresh temporary
  profile directory because the harness removed it before the browser process had
  fully exited. The runner now waits for process exit before deletion and its tests
  cover that ordering. A broad `rm -rf` cleanup command was rejected before
  execution by the command policy; the two exact repository-local temporary
  directories were then removed with scoped depth-first deletion without reading or
  retaining their contents. Final verification found zero remaining Chromium
  profile directories.

## ITR-013 — Conditional Phase 0.5 freeze satisfied

- **Observed problem:** Phase 0.5 remained pending even after the owner conditionally
  chose to waive the nested desktop CLI probe and close the phase if the remaining
  Chromium gate found no obstacle.
- **Owner decision:** `«Я не вижу смысла в этом запуске, мы и так работаем через Sol
  сейчас, когда я отправляю эти запросы. Возможно, это не работает при вызове из
  приложения ChatGPT на Mac, но это и не важно, потому что запросы проходят и ответы
  приходят. Я хочу скипнуть эту проверку и, если других препятствий нет, закрыть эту
  часть»`.
- **Condition evidence:** the coordinator independently verified exactly 60 measured
  Chromium samples, 30 per arm, frozen ordering and N=300; all correctness fields
  passed with identical observable/action digests; card renders were 2400 baseline
  and 1900 advanced (20.83% fewer); mean CPU TaskDuration was 4.7071 ms and 5.0037
  ms; all listed tests and `git diff --check` passed. CPU improvement is disclosed as
  not demonstrated and is not claimed.
- **Change:** freeze the seven section-20 decisions in the normative EN spec and RU
  companion, update evaluation/topic/clean-room projections, close the Phase 0.5
  YAML status, resolve exactly the two scanner placeholders, and update
  provenance/trajectory/checksum controls. Keep `codex exec` optional and unverified
  under the waiver; retain both CLI failures as failures and offline replay as the
  verified reproducibility path.
- **Commands:** `npm test`; all Phase 0.5 test scripts; `npm run audit:licenses`;
  YAML/Markdown/EN-RU/privacy/diff/checksum validation;
  `micro1-safe-preflight control`; `micro1-safe-preflight implementation`.
- **Trace status:** this current Phase 0.5 trajectory has no external raw capture,
  raw digest, automated submission scan, Russian trace companion, or repository-owner
  trace review yet. It must remain outside `actual_traces` until the TRACE_POLICY
  sequence completes; no eligible raw trace is invented.
- **Decision:** `kept`; Phase 0.5 is frozen at `2026-08-29T13:41:51Z` under the
  explicit nested-CLI waiver. This closes only the preparatory phase. Product/scored
  work, official benchmark, commit, and push remain unauthorized.
- **Post-freeze preflight:** real-denylist control returned
  `READY_FOR_CLEAN_BRANCH`; implementation returned `READY_FOR_IMPLEMENTATION` after
  exactly the two Phase 0.5 placeholders were resolved, with only the expected
  dirty-worktree warning and four binary-review notices. No contamination findings
  occurred. This automated verdict does not authorize product implementation.
- **Checksum/provenance result:** regenerated
  `docs/CONTROL_PLANE_SHA256SUMS` only after freeze. All 74 intended files verify and
  exact path-set comparison reports zero missing or extra entries. The manifest is
  self-excluding; private denylist/raw traces and the two documented local-only files
  remain outside coverage.
- **Validation retry:** the first read-only EN/RU numeric-parity command expected the
  English decimal `4.7071` inside the Russian companion, which correctly uses
  localized `4,7071`, and therefore returned a false failure. The locale-aware retry
  checks equivalent dot/comma forms separately; no artifact data or claim changed.
- **Review-card parity correction:** the next parity check found that the short
  Russian owner card named the stack but omitted its exact frozen versions. The card
  now lists Node/npm, TypeScript, React/ReactDOM, jsdom, Zod, and
  `@preact/signals-react@3.12.0`/MIT so the owner need not consult YAML or English
  materials. No decision value changed.
- **Privacy-validator retry:** the first final regex used an unbounded `sk-` fragment
  and falsely matched ordinary `risk-` text. The corrected check requires a
  token-shaped standalone prefix and sufficient following length. This was a
  validator false positive, not a contamination or secret finding.

## ITR-014 — Phase 0.5 reviewed-layer trace candidate

- **Observed problem:** immutable external capture for the completed Phase 0.5
  trajectory became available, but its automated raw scan failed. Coordinator-
  supplied metadata reports 3,511,076 bytes, SHA-256
  `031477de3fd7e42591ba5e7c1820ac39cb2dd1b691dbae29ae850a2aee895b86`,
  667 absolute user-path matches, two private-term matches before path redaction and
  one afterward, zero emails, and zero secret assignments. The raw path was not
  disclosed and this task did not access the external file.
- **Hypothesis:** repository evidence and clean-task facts are sufficient to build a
  complete EN/RU chronological candidate while omitting machine paths, the remaining
  private occurrence, internal thread/tool identifiers, and the unrelated
  pre-Phase0.5 prelude without claiming that preservation has already been proved.
- **Change:** added a consolidated clean instruction scope, full EN/RU reviewed-layer
  trajectories, a machine-readable pending review record, and a plain-Russian owner
  card; updated trajectory/provenance indexes and current preflight status. Machine
  paths are repository-relative or `<REDACTED_MACHINE_PATH>`. The remaining private
  match is neither copied, named, described, nor guessed.
- **Commands:** YAML/Markdown structure and EN/RU fact checks; repository privacy
  scans; `npm test`; `git diff --check`; checksum-manifest regeneration and exact
  coverage verification; `micro1-safe-preflight control`.
- **Evidence/errors:** the raw scan remains `failed`. The reviewed layer passed
  `micro1-safe-preflight control` with `READY_FOR_CLEAN_BRANCH`, zero contamination
  findings, zero machine/thread/tool metadata findings in the local checks, and four
  existing binary human-review notices. Before human review, this packaging task
  could not inspect the remaining raw private-match context, so
  `technical_meaning_preserved=false` and `actual_traces` remained unchanged. The
  first checksum-regeneration parser removed one character from each listed path and
  stopped before writing; the corrected parser regenerated and verified all 79
  entries. This was a control-script retry, not a trace-content change.
- **Metadata correction before approval:** coordinator review required the pending
  index/provenance records to include every iteration `ITR-005` through `ITR-014`
  and to qualify the task model as `Codex desktop / GPT-5.6 Sol (owner-observed
  current default; raw export has no model field)`. EN/RU materials explain that the
  model was inherited and owner-observed, not machine-exported.
- **Owner review:** at `2026-08-29T14:07:36Z`, the owner was asked
  `«Подтверждаете русскую и английскую версии TRC-BG-PHASE05-001 как точный и безопасный отчёт, в котором после указанных исключений сохранён технический смысл?»`
  and selected `«Подтверждаю одобрение (Recommended)»`. Both required Russian
  companions were available. The reviewed layer is therefore approved with
  `technical_meaning_preserved=true` and indexed in `actual_traces`; the raw scan
  remains failed with all counts and limitations unchanged.
- **Decision:** `kept`; promote only `TRC-BG-PHASE05-001`. This approval does not
  authorize product/scored work, model/Chromium reruns, official benchmark, commit,
  or push.
- **Post-promotion validation:** repository tests passed 16/16; Phase 0.5 test
  suites passed 11/11, 6/6, 3/3, 4/4, 3/3, and 4/4 without executing a model or
  browser. YAML, EN/RU approval parity, privacy patterns, `git diff --check`, and all
  79 checksums passed. Safe control returned `READY_FOR_CLEAN_BRANCH`; safe
  implementation returned `READY_FOR_IMPLEMENTATION` with the expected dirty-tree
  warning and four binary-review notices. Contamination findings were zero;
  automated readiness is not product authorization.

## ITR-015 — D01 behavior and provenance freeze candidate

- **Observed problem:** D01 implementation is owner-authorized only after an
  independently authored behavior/provenance checkpoint. Without exact prose, a
  future false green could be tailored after code or hidden results exist.
- **Hypothesis:** freezing a neutral museum-group contract, reasonable incomplete
  visible tests, candidate-construction constraints, and a capability-enforced
  verifier boundary before code makes the stale-snapshot failure reproducible
  without private expression or oracle leakage.
- **Exact change:** created `SES-20260829-003`; authored full EN/RU D01 behavior
  prose, machine freeze and provenance records, Russian owner card, and trajectory
  plan. The contract fixes 300 synthetic cards, the canonical action sequence,
  `old + 2 * step` accumulation, five visible-test obligations that omit the double
  update, and future preserving/one-defect false-green rules. No candidate or oracle
  was constructed.
- **Evaluation command/version:** structural/privacy/preflight checkpoint only for
  `eval-v1.1.0`; no candidate, arm, model, Chromium, scored, or official benchmark
  run.
- **Evidence:** `evaluation/behavior-specs/BG-D01_BEHAVIOR.md`, its Russian
  companion, `BG-D01_FREEZE.yaml`, `PRV-BG-D01-BEHAVIOR-001`, and
  `TRC-BG-D01-001` plan.
- **Cost clarification:** fixed subscription; no USD calculation or estimate.
  Reproducibility records model/mode, invocation count, and technical limits only;
  monetary cost is `not_applicable` or `not_measured`.
- **Decision:** `pending_owner_review`; stop before React/signals code, fixtures,
  candidates, oracle implementation, model/Chromium calls, official benchmark,
  commit, or push.
- **Human checkpoint:** exact question is recorded in
  `artifacts/trajectories/reviews/BG-D01-BEHAVIOR-FREEZE_RU.md`.
- **Checkpoint validation:** YAML, EN/RU key parity, privacy patterns, placeholder
  scan, and `git diff --check` passed; repository tests passed 16/16. The approved
  scanner-only probe confirmed both external resources without exposing values or
  paths. Control returned `READY_FOR_CLEAN_BRANCH`; implementation returned
  `READY_FOR_IMPLEMENTATION` with only the expected dirty-worktree warning and four
  existing binary-review notices. Contamination findings were zero. Automated
  readiness does not advance the owner checkpoint.
- **Validation retry:** the first final control preflight correctly rejected a
  projection that changed `config/cleanroom.json.current_thread` to eligible. That
  field represents the permanently excluded original control-plane transcript, not
  this clean D01 task. The projection was corrected; D01 eligibility remains in
  `SES-20260829-003`. This was a metadata-scope error, not contamination and not a
  behavior-contract change.
- **Independent editorial review retry:** before owner approval, review found two
  narrow issues. First, active projections still mixed fixed-subscription accounting
  with `token/cost cap`, marginal/estimated USD language. PROJECT_SPEC EN/RU,
  EVALUATION, topic, and D01 now consistently record billing mode, monetary-cost
  applicability/status (`not_applicable` or `not_measured`), model/mode, invocation
  count, technical limits, and tokens only when stably reported; no per-run USD
  calculation, estimate, or cap is projected. Second, D01 now explicitly defines
  `allocate once`/`remove once` as permitted single-adjustment test actions and maps
  canonical parameterized labels to step and multiplicity. No version, metric,
  evaluation method, test obligation, candidate, or defect family changed. Decision
  remained `pending_owner_review` until the owner decision below.
- **Owner freeze approval:** at `2026-08-29T14:50:15Z`, the repository owner gave
  the exact confirmation `«Подтверждаю BG-D01 freeze»`. Decision is now `kept` and
  status `frozen_repository_owner_approved`. The EN/RU behavior/provenance packet is
  the safe source for future independently authored D01 implementation. This permits
  only a request for a separate implementation checkpoint and does not authorize
  React/signals component code, fixture/candidate/oracle implementation,
  model/Chromium, official/scored benchmark, commit, or push.
- **Approval-projection validation retry:** the first exact-text parity validator
  found that the provenance index encoded the approval only inside a normalized
  status token. Separate `exact_confirmation` and timestamp fields were added to the
  provenance and trajectory indexes. Approval text and scope did not change.
- **Post-freeze trace review and exclusion:** external immutable capture of
  `TRC-BG-D01-001` succeeded with `671032` bytes and SHA-256
  `aade138543e0b2f56be3d1501a5e38b84ae9c8a8e14536be66b5bffd1602abbb`.
  Review then found that the initial coordinator instruction itself contained one
  prohibited private-identifier category, even though it appeared only in a denial
  rule. The identifier is not recorded. The raw transcript is excluded under
  `EXC-002`; no reviewed submission layer is created. Repository scans found no
  occurrence in the frozen EN/RU behavior/provenance packet, so its owner-approved
  freeze remains valid. Future implementation must start in a new neutral task whose
  packet contains only repository-relative contracts and synthetic terminology.
- **Capture transport retries:** the first external capture waited for EOF that the
  PTY control channel did not deliver. The second exact-byte attempt was rejected as
  an empty payload because canonical terminal buffering exceeded its line limit.
  Both processes were stopped without claiming success. The final unchanged export
  used non-canonical, no-echo input plus the exact byte count and completed. These
  retries changed transport only, not transcript content.

## ITR-016 — D01 fixture/candidate foundation

- **Observed problem:** the owner-approved D01 behavior freeze had no executable
  arm-visible package, immutable candidate pair, verifier-only oracle, or physical
  runtime boundary. Green single-adjustment tests therefore could not yet
  demonstrate the frozen false-green construction.
- **Hypothesis:** a shared React reference plus two neutral signals candidates,
  exactly five unchanged visible tests, a separate canonical driver, and Node's
  filesystem permission system can reproduce the single stale-snapshot defect while
  preventing pre-verdict oracle access.
- **Exact change:** created `SES-20260829-004`; implemented the deterministic
  300-card museum fixture API, DOM observations, microtask/render settlement,
  action-log contract, shared legacy React reference, `candidate-a` preserving
  migration, and `candidate-b` with only the frozen lost-accumulation family. Added
  the five visible tests, verifier-only canonical driver and ground truth, D01-pair
  evaluator self-check, physical denied-access process test, and four immutable
  SHA-256 manifests. Added provenance, trajectory plan/index, and the Russian owner
  review card.
- **Evaluation commands/version:** `npm run compile`; `npm run
  test:d01:visible`; `npm run test:d01:contract`; `npm run test:d01:verifier`;
  `npm run test:d01:boundary`;
  `npm run manifests:d01:check`; `npm test`; `micro1-safe-preflight probe`;
  `micro1-safe-preflight control`; `micro1-safe-preflight implementation`;
  `git diff --check`; evaluation version `eval-v1.1.0`.
- **Evidence:** visible gate passed `5/5` with both candidates; the separate
  positive-step contract passed `1/1` for the legacy reference and both candidates;
  D01 evaluator passed `3/3`, accepting the legacy reference and preserving
  candidate and rejecting the false green at `allocate-1x2`; physical boundary
  passed `2/2` for both arms and both candidates.
  Each permission-restricted arm process executed its candidate while eight
  verifier operations remained denied and existing/missing error probes were
  indistinguishable. Manifest reconciliation SHA-256 is
  `5273199f8d591068ae827874d80352947eb511844fdf6ccabbcbce9edacccdcf`.
  Run record: `RUN-BG-D01-FOUNDATION-001`.
- **Scanner/privacy evidence:** the owner-controlled scanner-only probe confirmed
  both external resources through boolean fields only. Real control preflight
  returned `READY_FOR_CLEAN_BRANCH`; implementation returned
  `READY_FOR_IMPLEMENTATION` with the expected dirty-worktree warning. Both reported
  only the four pre-existing official binary human-review notices and zero
  contamination findings. The self-excluding control checksum projection verifies
  exactly 112 intended files with zero digest or coverage mismatch.
- **Errors/retries:** the first compile included historical untyped Phase 0.5/control
  scripts and failed strict TypeScript checks outside the D01 surface. `tsconfig.json`
  was narrowed to all new D01 implementation, manifest, and boundary sources; no
  candidate or visible test changed, and compile then passed. The first boundary
  version proved denial but did not execute an allowed candidate. It was strengthened
  before freeze to execute each candidate inside the permitted surface while keeping
  verifier access denied; no behavior or defect family changed. The first YAML
  validation command used a Psych convenience method unavailable in the local Ruby;
  the identical five files passed the supported `safe_load(File.read(...))` form
  without artifact changes.
- **Cost/runtime policy:** fixed subscription; per-run USD was not calculated or
  estimated. Model invocation count `0`; Chromium calls `0`; no tokens were observed
  or recorded. Exact configured model identity is not claimed because it is not
  machine-exported in this task evidence.
- **Decision:** `pending_owner_review`. Preserve this runnable D01 foundation and
  stop. No official/scored arm run, orchestrator beyond the minimal boundary harness,
  replay generation, repair, other fixture, model/Chromium, GUI, commit, or push is
  authorized or performed.

## ITR-017 — Coordinator-requested D01 oracle and evidence corrections

- **Observed problem:** independent coordinator review accepted the architecture but
  found three owner-review blockers: the shared legacy reference was not run through
  the canonical oracle; repeated reset asserted only part of the observable state;
  and new pending artifacts claimed an exact model identity absent from machine
  evidence. The numeric public step type also needed explicit enforcement of the
  frozen positive-integer domain.
- **Hypothesis:** bounded test/evidence corrections can close all four gaps without a
  sixth visible legacy test, new invalid-action semantics, another defect family, or
  any official/model/browser work.
- **Exact change:** added one verifier self-check for `LegacyMuseumBoard`; changed
  repeated reset to reuse the full canonical observation assertion, including card
  IDs/order and canonical log plus one additional `reset`; added one separate
  arm-visible contract test and a shared fail-closed positive-integer guard before
  label/state/log mutation; replaced exact model claims only in the new pending
  SES/provenance/trajectory records with an explicit machine-evidence limitation.
  Historical approved artifacts were not rewritten.
- **Evaluation:** `npm run compile`; exact visible `5/5`; arm-visible contract `1/1`;
  verifier `3/3`; denied-access `2/2`; repository tests `19/19`; four D01 manifests;
  hash-before/after reconciliation; real scanner-only control and implementation
  preflights; checksum coverage; `git diff --check`; `eval-v1.1.0`.
- **Evidence/decision:** `kept_pending_owner_review`. The visible legacy contract
  remains exactly five tests, both candidates remain green there, candidate source
  hashes remain unchanged, and the false green still differs by one stale-snapshot
  hunk only. Model calls and Chromium calls remain zero; fixed-subscription monetary
  cost remains `not_applicable` or `not_measured` with no estimate or cap.

## ITR-018 — Typed task orchestration registry

- **Observed problem:** the root `package.json` exposed a growing set of D01 and
  Phase 0.5 script aliases that would scale poorly as fixtures and phases are added.
- **Hypothesis:** a small stable npm interface backed by a typed, discoverable task
  registry can preserve exact reproduction while preventing package-script sprawl
  and arbitrary shell execution.
- **Exact change:** retained only general `test`, `compile`, and `task` entrypoints
  plus the two stable preflight entrypoints. Moved phase- and fixture-specific
  process sequences to `scripts/tasks/`, then split definitions across `common.ts`,
  `d01.ts`, and `phase0.5.ts`; `registry.ts` now only aggregates, rejects duplicate
  names, and sorts. Stable `npm test` delegates to `test:all`, which discovers sorted
  `*.test.ts` only under `tests/` and `evaluation/arm-visible/`, rejects symlinks,
  empty results, duplicates, and out-of-bound paths, and deliberately excludes
  verifier-only self-checks. Added `npm run task -- list`; unknown names and all
  unexpected arguments fail closed. Every process uses fixed argument arrays with
  `shell: false`. Removed historical live model, diagnostic, network, and Chromium
  run tasks from the ordinary registry; retained one safe `phase0.5:verify` audit and
  harness-test task. Added eight registry/discovery tests. Historical commands in
  ITR-016 and ITR-017 remain unchanged as records of their actual runs.
- **Evaluation:** `npm run task -- list`; `npm run task -- d01:verify`; `npm test`;
  `npm run task -- phase0.5:verify`;
  `npm run task -- checksums:check`; `micro1-safe-preflight control`;
  `micro1-safe-preflight implementation`; `git diff --check`; evaluation version
  `eval-v1.1.0`.
- **Evidence/decision:** `kept_pending_owner_review`. D01 remains visible `5/5`,
  positive-step contract `1/1`, evaluator `3/3`, and denied access `2/2`. Candidate
  SHA-256 values remain `f46b2ed8c85e8558b5c8812491c09d89530099b0890454415579ea4c5d69e8a5`
  and `9e2a9151531aa961cf0ace3e20520fdcfa45ff0bff0f13ae214f7e5fbdad7d2b`;
  the combined D01 manifest digest remains
  `5273199f8d591068ae827874d80352947eb511844fdf6ccabbcbce9edacccdcf`.
  No candidate, oracle, visible-test contract, evaluation semantics, model call,
  Chromium call, commit, or push changed. Safe control preflight returned
  `READY_FOR_CLEAN_BRANCH`; safe implementation preflight returned
  `READY_FOR_IMPLEMENTATION` with the expected dirty-worktree warning. Both retained
  the four existing binary human-review notices and reported zero contamination
  findings.
- **Coordinator correction evidence:** stable `npm test` passed `32/32`, including
  the five visible D01 tests and eight task-runner tests, while verifier-only tests
  remained excluded from discovery. `phase0.5:verify` passed license audit `54/54`
  and test groups `11/11`, `6/6`, `3/3`, `4/4`, `3/3`, and `4/4` without launching a
  model, diagnostic command, network probe, or Chromium. Duplicate names fail closed,
  and no historical `phase0.5:run:*` name appears in the registry.
- **Retry:** the first post-refactor `npm test` passed 22/23 but showed that the
  repository scanner did not mirror the owner-confirmed `.gitignore` exclusion for
  `.idea/`. No file in that directory was intentionally opened or changed. The
  existing scanner and submission exclusion lists were aligned with `.gitignore`,
  after which the same test command was rerun.

## ITR-019 — Complete unscored BG-D01 verify-existing vertical slice

- **Observed problem:** the frozen D01 foundation proved the candidate pair and
  oracle boundary, but did not yet perform the complete user workflow from immutable
  ingestion through a usable report and deterministic offline replay.
- **Hypothesis:** an arm-visible risk/probe pipeline in a permission-restricted
  process, followed by immutable decision hashing and a separately enabled
  post-decision evaluator, can expose the frozen false green without oracle feedback
  or candidate mutation.
- **Exact change:** under approved `SES-20260829-005`, added Zod schemas, bounded
  path/manifest ingestion, before/after SHA-256 checks, TypeScript Compiler API risk
  inventory, the exact five-test legacy gate, an oracle-free `ProbePlan`, arm-owned
  accumulation check, fail-closed verdict policy, immutable decision envelopes, and
  independent evaluator processes opened only after both arm decisions exist. Added
  validated JSON, static HTML generated only from validated JSON, pure in-memory
  replay, CLI/task entries, E2E tests, reproduction documentation, provenance,
  trajectory planning, and a separate vertical-slice source manifest.
- **Evaluation commands/version:** `npm run compile`; `npm test`; `npm run task --
  d01:verify`; `npm run task -- d01:demo`; two consecutive `npm run task --
  d01:replay`; `npm run task -- d01:manifests:check`; `npm run task --
  d01:vertical:manifest:check`; `npm run task -- d01:hash`; real scanner-only probe,
  control and implementation preflights; JSON/YAML validation; checksum
  reconciliation; `git diff --check`; evaluation version `eval-v1.1.0`.
- **Evidence:** historical excluded run `RUN-BG-D01-VERTICAL-SES005-INELIGIBLE` used
  immutable `candidate-b`. Status quo
  accepts after compilation and all five visible tests. BeyondGreen rejects after
  its arm-owned public accumulation probe observes the lost update. Both decision
  digests exist before either evaluator starts; evaluator feedback rounds before
  decision are zero. Post-decision evaluation marks status quo incorrect and
  BeyondGreen correct. Candidate SHA-256 is unchanged before/after. JSON and HTML
  evidence are `artifacts/evaluation/BG-D01-VERTICAL-SLICE.json` and `.html`.
- **Replay evidence:** the excluded SES-005 report claimed that two unchanged offline
  replays produced canonical JSON digest
  `ec923672c8b12b02d65e0831cb1d81d6bc4769057ec0a78c5691823a2f210894`
  and HTML digest
  `2e1bc802070b242fba163a46779607b53a8c99ed168b40298f9c85799a255d9c`.
  Those historical bytes are not retained as eligible artifacts and the digest claims
  were not independently established. `RUN-BG-D01-VERTICAL-001` is reserved solely
  for the independently recovered SES-007 evidence.
  The replay core has no filesystem, network, subprocess, clock, random, or write
  capability; the CLI wrapper only reads the submitted record and prints digests.
- **Failure-state correction:** implementation self-review found that an operational
  visible-test crash would initially have shared the deterministic-failure path.
  Before evidence freeze, the legacy-gate record gained an explicit operational
  failure bit: crashes and nondeterminism now produce `abstain`, while only proven
  deterministic compile/test failures produce `reject`. The same review strengthened
  arm boundary checks to require Node's exact `ERR_ACCESS_DENIED` capability error.
  Candidates, visible tests, and verifier semantics did not change.
- **Tooling retry:** the first complete `d01:verify` exceeded one terminal output
  interval after every preceding group passed; the wrapper did not retain the
  session handle in that call. The identical non-scored verification command was
  rerun only to capture the final marker and passed. This was not a model retry,
  official attempt, candidate change, or evaluator-feedback round.
- **Cost and guards:** fixed subscription; per-run USD is not applicable or not
  measured and was not calculated, estimated, or capped. Model/Codex exec calls `0`,
  Chromium/browser/GUI calls `0`, automatic model retries `0`. Exact configured
  model identity is not claimed because task evidence does not machine-export it.
- **Decision:** `kept_pending_owner_review`. This establishes only one unscored
  development vertical slice. No repair, other fixture, official/scored run, commit,
  or push is authorized or performed.

## ITR-020 — Independently clean-recover the BG-D01 vertical slice

- **Observed problem:** SES-005 and SES-006 became submission-ineligible under
  `EXC-003` and `EXC-004`. Their reports could not establish either the origin or
  correctness of the repo-local D01 draft. Independent audit also found a shared
  two-arm deadline, candidate-identifier-based AST matching, free-text evaluator
  reason matching, incomplete evaluator binding, and a replay wrapper that did not
  actually reproduce the submitted JSON/HTML reports.
- **Hypothesis:** auditing only the repo-local diff against baseline
  `f0418bc6051002d8d42ccf84822d2e1f2e25b02e` and the frozen repository contracts,
  then rewriting every unproven boundary, can recover an eligible implementation
  without importing SES-006 changes or trusting SES-005/006 evidence.
- **Exact change:** created approved boundary `SES-20260829-007`; recorded exclusions
  without external names, paths, or cleanup; bound candidate paths, IDs, strict
  manifests, package digests, and frozen SHA-256 values; gave each arm an independent
  180-second deadline; preserved distinct compile, visible-test, and operational
  outcomes; finalized crash/timeout/invalid JSON/evidence as one no-retry abstention;
  made evaluator corruption a run-integrity failure; resolved signal/snapshot/write
  relationships through TypeScript symbols; added typed decision reason codes;
  strengthened JCS/SHA-chain/footer/cardinality/request-response replay validation;
  and added pure in-memory JSON/HTML reproduction and comparison.
- **Evaluation commands/version:** owner-authorized `npm ci`; `npm run compile`;
  `npm test`; `npm run task -- d01:verify`; `npm run task -- phase0.5:verify`; two
  unchanged `npm run task -- d01:replay`; JSON and HTML structural checks;
  `git diff --check`; evaluation version `eval-v1.1.0`.
- **Evidence:** `npm ci` installed 54 locked packages and reported zero
  vulnerabilities; license audit passed 54/54. Compilation passed. Ordinary tests
  passed 47/47. D01 verification passed 5/5 visible tests, 1/1 step contract, 3/3
  evaluator self-checks, 2/2 permission-boundary tests, 15/15 vertical contracts,
  E2E generation, four foundation manifests, and the 18-file vertical manifest.
  Safe Phase 0.5 groups passed 11/11, 6/6, 3/3, 4/4, 3/3, and 4/4 without live
  execution. Candidate hashes remained unchanged and K remained zero.
  Initial recovery checksum reconciliation passed for 152 repo-local files; after
  adding the trace-review record and human-checkpoint projections, final
  reconciliation passed for 153 files.
- **Replay evidence:** both offline runs reported replay SHA-256
  `7b68fc5ec091b1cf2dc0307f24de320aa60971ef6d33c32415d45c1c80807300`,
  canonical evidence SHA-256
  `fc923f1d09bcb6cd62197918c21bba3de4efc5c4ca749902f62148ab8f0c7c3a`,
  HTML SHA-256
  `014980e8db660c4fe69c27c03e0e8d6c816f84f8e37ab93f821c4839b4d09ff9`,
  and `reportArtifactsMatched=true`.
- **Negative/blocked evidence:** repo-local `npm run preflight:control` stopped before
  scanning because the mandatory external private denylist was unavailable;
  `preflight:implementation` in the chained command did not start. SES-007 forbids
  reading that external input, so no bypass, synthetic denylist, or second attempt
  occurred. The owner-controlled private-denylist preflights remain pending. The
  first combined manifest/demo command also returned no final demo marker within the
  tool-output interval; a separate unchanged repo-local generator run passed. This
  was not a model retry, official attempt, or evaluator-feedback round.
- **Trace-boundary incident:** the initial Git state query unnecessarily enumerated
  machine-specific metadata for other worktrees. No external workspace content was
  read or used and no external name/path was copied into repository artifacts, but
  the action exceeded the minimum current-worktree query and conflicts with the
  literal SES-007 boundary. The reviewed-layer candidate omits this metadata by
  category. SES-007 and its trajectory are not claimed eligible pending an explicit
  owner decision; exclusion and a fresh recovery task may be required.
- **Human checkpoint:** at `2026-08-29T17:41:28Z` the repository owner approved
  categorical removal of machine-specific worktree metadata, confirmed that no
  external-worktree content was read and that technical meaning is preserved, and
  authorized only scanner read through `MICRO1_PRIVATE_DENYLIST` plus raw-trace write
  through `MICRO1_PRIVATE_TRACE_DIR`. All other external access, commit, and push
  remain prohibited. SES-007 proceeds only through trace review and eligibility
  validation under that narrow authorization.
- **Authorized-root review continuation:** the coordinator recorded that the handoff
  to the authorized repository root was performed under explicit owner permission
  and that the old draft remains in a named stash that was neither inspected nor
  deleted. `micro1-safe-preflight probe` and `micro1-safe-trace probe` passed without
  disclosing values or paths. Real-denylist control returned
  `READY_FOR_CLEAN_BRANCH`; implementation returned `READY_FOR_IMPLEMENTATION` with
  only the expected dirty-worktree warning and four official binary human-review
  notices. No contamination finding occurred.
- **Raw-capture negative evidence:**
  `micro1-safe-trace capture TRC-BG-D01-RECOVERY-001` stopped before external write
  with `empty trace payload`. The coordinator did not supply a raw transcript on
  standard input. A reviewed-layer candidate was not substituted for raw evidence;
  raw SHA-256 remains unavailable. A renewed owner instruction triggered one later
  review-only capture attempt from the same authorized root; it returned the same
  `empty trace payload` before external write. This was not a product, model, or
  evaluator retry.
- **Cost and access:** fixed subscription; per-run USD not calculated or estimated;
  product model/Codex subprocess calls `0`; browser, Chromium, Claude, connected-app,
  and private-MCP calls `0`; only `npm ci` used the explicitly authorized public npm
  registry/cache boundary.
- **Decision:** `kept_as_repo_local_recovery_preflights_passed_pending_raw_capture_and_final_owner_review`.
  The recovered implementation and reviewed-layer candidate cleared the authorized
  contamination scan and both preflights. The coding trajectory remains ineligible
  solely because immutable raw capture/digest is absent. Commit, push,
  official/scored execution, repair, and other fixtures remain unapproved.

## ITR-021 — Capture the native Codex Desktop trajectory source

- **Observed problem:** Codex Desktop exposed no raw/internal task export, so the
  original raw-capture requirement could not be satisfied by a documented UI action.
- **Hypothesis:** the unchanged native `Copy as Markdown` output can provide an
  immutable source anchor without pretending to include hidden reasoning or internal
  application events.
- **Change:** added a narrow native-export fallback to `docs/TRACE_POLICY.md`; the
  owner copied SES-007 as native Markdown and streamed the exact clipboard bytes to
  the safe external capture interface. Review, provenance, session, checklist, and
  projection records now distinguish `codex_desktop_native_markdown` from a raw
  internal export.
- **Evidence:** the correct capture `TRC-BG-D01-RECOVERY-001` contains 66,250 bytes
  with SHA-256
  `bcf36c6cc64f7695adbdac8a49a888bee8c33b6658a5a469306ae2422db7c612`;
  `outsideRepository=true` and `pathDisclosed=false`. An initial capture under the
  incorrect ID `TRC-BG-001-RECOVERY-001` produced the same byte count and digest,
  remains external, was not deleted, and is not used as evidence.
- **Limitations:** hidden reasoning/internal Codex events are not available and are
  not claimed. The reviewed submission candidate, not the external source capture,
  is the judge-facing artifact.
- **Decision:** `native_source_capture_complete_pending_final_owner_eligibility`.
  Commit, push, official/scored execution, repair, and other fixtures remain
  unapproved.

## ITR-022 — Approve SES-007 and promote the reviewed D01 trace

- **Observed state:** native Markdown source capture, real-denylist scan, control and
  implementation preflights, categorical redaction, and technical-meaning review had
  passed; only the repository-owner eligibility decision remained.
- **Human decision:** at `2026-08-29T18:36:52Z` the repository owner approved final
  SES-007 eligibility and promotion of `TRC-BG-D01-RECOVERY-001`, explicitly accepting
  that hidden reasoning and internal Codex Desktop events are unavailable and not
  claimed. The wrong-ID external capture remains unused and undeleted.
- **Change:** moved the judge-facing trace from `review-candidates/` to `reviewed/`,
  indexed it in `actual_traces`, and synchronized session, review, provenance,
  checklist, topic, clean-room, English, and Russian status projections.
- **Evidence:** source capture SHA-256
  `bcf36c6cc64f7695adbdac8a49a888bee8c33b6658a5a469306ae2422db7c612`;
  reviewed-layer contamination findings `0`; control `READY_FOR_CLEAN_BRANCH`;
  implementation `READY_FOR_IMPLEMENTATION`; ordinary tests `47/47`.
- **Decision:** `owner_approved_eligible_representative_trace`. Commit, push,
  official/scored execution, repair, other fixtures, model/browser execution, and
  publication remain unapproved.

## ITR-023 — Reconcile directories, projections, and task registry

- **Observed problem:** promotion left an empty `review-candidates/` directory, two
  control-only historical documents looked current, and active projections still
  described D01 as pending owner review.
- **Change:** removed the empty directory; marked `CONTROL_STATUS_RU.md` and
  `PREMORTEM_RU.md` as historical snapshots; synchronized active clean-room, topic,
  provenance, evaluation, specification, preflight, trace, and owner-review statuses;
  marked the earlier foundation provenance as superseded by the independent recovery;
  documented reviewer-safe versus maintainer-only task roles in README.
- **Task audit:** all 12 registered tasks are retained. Safe tasks verify tests,
  manifests, checksums, D01 evidence/replay, or Phase 0.5 harnesses; three `:write`
  tasks are required maintainer reconciliation commands. No live model, network,
  diagnostic, or Chromium launcher is registered.
- **Reference audit:** the first ad-hoc command produced false missing references
  because `rg` prefixed each match with its source filename. No repository change was
  made from that output. The corrected `--no-filename` audit passed every indexed
  repository path and confirmed that the promoted reviewed trace exists and the
  candidate directory is absent. A later count-check grep placed Markdown backticks
  inside a double-quoted zsh argument, causing a harmless attempted `:write` command;
  it changed no files and the corrected single-quoted grep found no stale count.
- **Branch reconciliation:** both `impl/beyondgreen` and the temporary handoff branch
  pointed to `f0418bc6051002d8d42ccf84822d2e1f2e25b02e` with no unique commits. The
  working set returned to `impl/beyondgreen`; the redundant temporary local branch
  was safely deleted and the named stash remained untouched.
- **Decision:** `housekeeping_and_branch_reconciliation_passed_pending_commit_decision`.
  Historical SES-004/005 statuses, exclusions, wrong-ID external capture, and named
  stash remain preserved because they are audit evidence, not clutter. Commit/push
  remain unauthorized.

## ITR-024 — Resolve the independent pre-commit review blockers

- **Observed problem:** four scoped Codex reviewers independently found that the
  repo-local D01 diff was not ready to commit. The parent trusted a child-authored
  decision, replay records were not bound to all decision fields, candidate code ran
  inside the oracle-owning process, verifier manifests were compared only with their
  current bytes, compile/not-run semantics were ambiguous, one boundary test was
  outside the vertical manifest, provenance/run IDs drifted, and native trace source
  completeness had not been compared with the reviewed layer.
- **Hypothesis:** move every trust decision to the parent, separate post-decision
  candidate observation from oracle evaluation, validate frozen packages from
  code-owned digests, deny child network and host metadata, add negative tests, and
  reopen trace eligibility instead of preserving an unsupported claim.
- **Exact change:** arm workers now return raw evidence and the parent recomputes
  `decide`; replay input/output, risk inventory, ProbePlan, reasoning evidence, and
  exact required probe IDs are mutually bound. Compile failure has deterministic
  precedence and `not_run` requires operational evidence. A new post-decision
  candidate-observer process has no verifier capability; the evaluator imports no
  candidate code and receives only validated observations plus a finalized decision.
  Child processes inherit no host `PATH` and run under a macOS OS sandbox that denies
  network egress. The verifier manifest, each source digest, and package digest are
  checked against frozen code-owned values. The 20-file vertical manifest now
  includes the observer and `tests/d01-boundary.test.ts`.
- **Evidence/provenance correction:** the recovery implementation record no longer
  supersedes the conforming fixture-provenance record; `implementation_provenance`
  has an explicit schema. The excluded SES-005 run has the distinct ID
  `RUN-BG-D01-VERTICAL-SES005-INELIGIBLE`. The deterministic D01 orchestrator is
  classified as a non-agent component. External scanner reads, trace writes, and the
  metadata-enumeration incident are enumerated rather than denied. Because the native
  66,250-byte capture was never read through an approved comparison interface,
  `TRC-BG-D01-RECOVERY-001` is removed from `actual_traces` and marked blocked pending
  source-to-reviewed comparison; the earlier owner approval remains preserved as
  historical evidence.
- **Evaluation:** `npm test` passed `49/49`; `d01:verify` passed visible `5/5`, step
  contract `1/1`, verifier self-check `3/3`, physical/network boundary `3/3`, vertical
  contracts `16/16`, E2E generation, foundation manifests, and the 20-file vertical
  manifest. Offline replay reproduced canonical JSON
  `630541a504430b8b0299c8fb83665a2d333128768a302581044117e417f22b39`
  and HTML `b564ed1be7dcb78cf46533c0eb489a8536309accc054135f9e348ab92155c518`.
  Current manifest reconciliation is
  `253448365d1feb471a9c3747e77516921b26a826665918a15049801b12caca18`;
  candidate bytes, visible contracts, ground truth, and oracle outcomes did not
  change. Control checksums reconciled `154/154`; `git diff --check` passed.
  Owner-authorized safe preflights still returned `READY_FOR_CLEAN_BRANCH` and
  `READY_FOR_IMPLEMENTATION`, with only the expected dirty-worktree warning and four
  binary human-review notices; the separate trace-policy gate remains blocked.
- **Tooling retry:** the first stale-status `rg` command placed the literal Markdown
  token `` `actual_traces` `` inside a double-quoted zsh argument, causing one
  harmless attempted command substitution and `command not found`. It changed no
  file. The corrected single-quoted audit returned no stale active-status match.
- **Decision:** `code_and_evidence_review_blockers_resolved_trace_eligibility_blocked`.
  The next gate is a privacy-safe native-source-to-reviewed-layer comparison.
  Commit/push remain unauthorized.

## ITR-025 — Reconcile the reviewed trajectory and separate post-capture provenance

- **Observed problem:** the privacy-safe comparison received a later Codex Desktop
  Markdown export containing 79,779 bytes rather than the externally anchored
  66,250-byte immutable capture. The comparison found high coverage of instructions,
  actions, retries, and test results, but only partial coverage of detailed tool
  responses, errors, and approvals. The reviewed trace also mixed source-derived
  trajectory claims with capture metadata and owner decisions that occurred after
  capture.
- **Hypothesis:** removing unsupported exact details from the reviewed trajectory and
  recording post-capture events in a separate provenance record will make the audit
  story truthful without pretending that the exact immutable source was reviewed.
- **Change:** rewrote `TRC-BG-D01-RECOVERY-001.md` as a source-derived pending
  trajectory; removed exact compiler diagnoses, package count, wait duration, typed
  reason code, capture metadata, and promotion claims that the available export did
  not independently establish. Added
  `TRC-BG-D01-RECOVERY-001-POST-CAPTURE.yaml` for the capture anchor, historical
  owner decision, pre-commit reopening, and comparison result. Synchronized the
  review card, trajectory index, session record, provenance, EN/RU specification
  headers, topic projection, and preflight status.
- **Evaluation:** semantic comparison reported high instruction/action/test coverage,
  partial tool/error/approval coverage, and no reviewed-layer privacy finding. The
  input-size mismatch remains: available export `79,779` bytes versus immutable
  anchor `66,250` bytes. Therefore exact transport identity and technical-meaning
  preservation relative to the immutable capture are not established.
- **Decision:** `reviewed_layer_reconciled_post_capture_provenance_separated_exact_source_gate_blocked`.
  The trace remains outside `actual_traces`. The next gate is either an approved
  comparison of the exact 66,250-byte capture or a newly captured representative
  trace whose exact source can be reviewed. Commit and push remain unauthorized.

## ITR-026 — Replace the blocked recovery trace with an exactly reviewable D01 verification trace

- **Observed problem:** the original `TRC-BG-D01-RECOVERY-001` source anchor could
  not be compared exactly with its reviewed layer. A bounded new verification task
  was required to establish a representative coding-agent trajectory from a source
  that could be captured and reviewed byte for byte.
- **Hypothesis:** independently verify the unchanged unscored D01 state under a new
  approved boundary, preserve every deterministic stop and owner-authorized retry,
  then capture the native user-visible task history as strict UTF-8. This should
  establish trace integrity without treating hidden reasoning or internal Codex
  events as available evidence.
- **Source-task evidence:** `SES-20260829-008` was approved before verification. The
  first run stopped after `npm test` reported 48/49 because the new boundary
  contained two absolute-user-path findings. The owner authorized only those two
  categorical replacements and a full restart. The retry passed compile, 49/49
  ordinary tests, D01 verification, D01 replay, and safe Phase 0.5 checks, then
  stopped on `CONTROL_CHECKSUMS_MISMATCH`. A second bounded owner decision permitted
  diagnosis and manifest reconciliation only if the new boundary was the sole
  mismatch. The agent reported exactly that condition, then reported 156 verified
  checksums and a passing `git diff --check`.
- **Capture retries:** capture attempt `TRC-BG-D01-VERIFY-001` matched its external
  receipt byte for byte but had unresolved text encoding, so it was retained
  externally as unused and never semantically reviewed. The owner authorized one
  strict UTF-8 replacement capture. `TRC-BG-D01-VERIFY-002` contains 24,318 bytes
  with SHA-256
  `6cb44af2ae43b03035fa41044dc2f2bdf9ee54d009ccc699205c2da420e32305`.
- **Exact review:** an independent review confirmed exact byte identity, strict UTF-8
  round-trip, complete native user-visible chronology, zero privacy findings in the
  reviewed source, and preserved technical meaning. Hidden reasoning, internal
  application events, and complete stdout are unavailable and not claimed. Exact
  detailed results absent from the visible export are labelled agent-reported.
- **Change:** created EN/RU reviewed trajectories, a reconstructed instruction
  packet, a review record, a complete Russian owner card, and separate post-capture
  provenance. The historical `SES-008` planned ID remains unchanged; the explicit
  post-capture record resolves `001` as unused and `002` as the canonical replacement.
- **Automated review:** repository tests passed 49/49; compile, D01 verification,
  D01 replay, and safe Phase 0.5 verification passed. The owner-controlled scanner
  returned `READY_FOR_CLEAN_BRANCH` and `READY_FOR_IMPLEMENTATION`, with zero
  contamination findings, four expected binary-review notices, and the expected
  dirty-worktree warning.
- **Decision:** `exact_review_and_automated_scan_complete_pending_owner_approval`.
  Promotion to `actual_traces`, official/scored execution, commit, and push remain
  prohibited until the repository-owner gate passes.

## ITR-027 — Approve and promote the exact D01 verification trace

- **Observed state:** `TRC-BG-D01-VERIFY-002` had passed exact byte identity, strict
  UTF-8, independent semantic review, repository-local verification, and the real
  private-denylist scanner with zero contamination findings. Complete English and
  Russian reviewed trajectories and a plain-language Russian owner card were
  available.
- **Human checkpoint:** at `2026-08-30T06:26:46Z` the repository owner explicitly
  approved `TRC-BG-D01-VERIFY-002` and authorized its inclusion in `actual_traces`.
  The Markdown escape before the underscore in the owner response is presentation
  syntax only; the approved index is `actual_traces`.
- **Change:** marked repository-owner review passed, set
  `technical_meaning_preserved=true`, promoted the trace from pending review into
  `actual_traces`, and synchronized its review record, post-capture provenance,
  D01 implementation provenance, trajectory/provenance indexes, specification
  projections, evaluation projection, topic status, and preflight checklist.
- **Approval scope:** trace promotion only. Official/scored runs, product repair,
  additional fixtures, commit, push, publication, and submission remain separately
  gated and were not performed.
- **Post-promotion evidence:** compile passed; ordinary tests passed 49/49; D01
  passed visible 5/5, step contract 1/1, oracle self-checks 3/3, physical boundary
  3/3, vertical contracts 16/16, E2E, manifests, and exact offline replay. Safe
  Phase 0.5 verification passed without model or browser execution. Real-denylist
  control returned `READY_FOR_CLEAN_BRANCH`; implementation returned
  `READY_FOR_IMPLEMENTATION` with the expected dirty-worktree warning. Both reported
  zero contamination findings and the four existing binary-review notices.
- **Decision:** `owner_approved_eligible_representative_trace_post_promotion_validation_passed`.
  Final checksum and diff-integrity results are recorded in the trace review record.

## ITR-028 — Implement the D01 scale-readiness corrections

- **Observed problem:** the second required independent review returned
  `D01_CHECKPOINT=PASS_WITH_CONCERNS` and `SCALE_READY=no`. Codex independently
  confirmed hard-coded D01 ownership, seeded-defect coupling risk, early parent
  access to verifier-only bytes, incomplete replay/evaluator binding, asserted
  rather than measured claims, single observations, one-way isolation evidence,
  duplicate visible assertions, unbounded divergence output, and stale status and
  compile projections.
- **Hypothesis:** descriptor-owned fixture contracts, arm-visible derivation,
  event-derived claims, two independent observations, reciprocal physical denial,
  stronger replay binding, and explicit measured EV-009 evidence should remove the
  scale-readiness concerns without changing either candidate, the five visible
  behavioral contracts, the verifier ground truth, or the unscored/offline status.
- **Exact change:** implemented the twelve decisions recorded in
  `TRC-BG-D01-SCALE-001-DECISION-EVIDENCE.md`. The vertical source manifest now
  covers 24 files. Candidate hashes remain unchanged; verifier behavior remains
  unchanged while its isolation probe package changed. The combined D01 manifest
  digest is `69894e4ab39484a89d300391317fc4a79d895c8790f8c1f7edb0f1a8ba6fdb92`.
- **Evaluation:** targeted D01 tests passed 29/29; `npm test` passed 53/53; compile,
  four foundation-manifest checks, the 24-file vertical manifest, evidence
  generation, and two identical offline replays passed. The generated canonical
  JSON SHA-256 is `47035ed40c9ab16473d3a5866bc2071138712d01992a20a617a48bf0e19cd674`,
  HTML SHA-256 is `9f552bb43399463afaf8257a265dad9c235343be5d836b1215f0b14b8d0f88ed`,
  and replay SHA-256 is
  `4ba082113fae1e1f97139c26a3c42e807a1530c66777bc980f5a5346c889b9e0`.
  Full `d01:verify` passed visible 5/5, step 1/1, oracle 3/3, reciprocal physical
  boundary 4/4, vertical contracts 19/19, unscored E2E, foundation manifests, and
  the 24-file vertical manifest. Phase 0.5 passed licenses 54/54 and suites 11/11,
  6/6, 3/3, 4/4, 3/3, and 4/4 without live model or browser execution. The initial
  checksum check correctly found the stale projection; after the authorized
  `checksums:write`, the repeat passed 171/171. `git diff --check` passed. Safe
  preflights returned `READY_FOR_CLEAN_BRANCH` and `READY_FOR_IMPLEMENTATION` with
  zero contamination findings, the expected dirty-tree warning, and four existing
  binary-review notices.
- **Retries:** the combined delete/add patch was split after a no-write rejection;
  two stale schema literals were corrected after compile; a false-positive no-I/O
  regex was narrowed after a 25/26 run; overly broad historical script/test compile
  globs were replaced with scalable D-fixture product globs; an unavailable local
  YAML parser was not installed and the boundary used repository-local structural
  checks.
- **Decision:** `implemented_repo_local_validation_passed`. Exact native trace
  capture and review, the repeated independent D01 checkpoint, and repository-owner
  approval remain mandatory. Until then `SCALE_READY=false`. No official/scored run,
  live model, Chromium, BG-D02, commit, or push occurred.

## ITR-029 — Capture the implementation trace and repeat the D01 checkpoint

- **Authorization:** the owner explicitly authorized native `Copy as Markdown`
  capture through `MICRO1_PRIVATE_TRACE_DIR`, safe scanning through
  `MICRO1_PRIVATE_DENYLIST`, complete EN/RU reconciliation, and then one read-only
  Claude Opus checkpoint. Official/scored execution, product live model, Chromium,
  BG-D02, commit, push, and all other external access remained prohibited.
- **Capture and retry:** the first interactive transport failed safely with
  `ERROR: empty trace payload` and created no artifact. The owner-confirmed native
  clipboard was then sent directly to the safe wrapper. It matched the external
  receipt exactly: 56,127 bytes, SHA-256
  `605d014dd5e631d7be4b9d746eee222ebc9bd5acaa679a0e2e9e71e36bcddfb0`, strict
  UTF-8. The raw scanner found zero private terms, emails, or secret assignments and
  two absolute-user-path occurrences requiring categorical redaction.
- **Exact review:** two mechanically bounded path redactions produced the 56,131-byte
  native reviewed layer with SHA-256
  `251fbc93e7d884269c6b773a4f2e0094a8f2bdc0a8b96bd344f725c24c73c2ac`.
  All 729 lines were manually reviewed; full EN/RU semantic layers and post-capture
  provenance were reconciled.
- **Independent checkpoint:** the project Claude wrapper used the official `opus`
  alias at maximum effort with read-only `Read`/`Glob`/`Grep`, safe mode, no Chrome,
  and no session persistence. It did not emit a full resolved model identifier. The
  25,138-byte raw response has SHA-256
  `535c7d0a6988aa521d9429492717d0fb9e7b4a7e8472af085f0e6b20e9a59b5a` and is not
  a submission artifact. Exact verdict:
  `D01_CHECKPOINT=PASS_WITH_CONCERNS`; `SCALE_READY=no`.
- **Codex reconciliation:** confirmed parent-declared rather than independently
  measured physical capability evidence, a materially D01-specific engine despite
  descriptor-shaped inputs, list-bound rather than directory-complete arm-visible
  manifest enforcement, and overstated missing/capability negative-test coverage.
  The trace exact-review and stale-ledger findings were closed after the review. The
  public-invariant concern is recorded as an evaluation-construction limitation, not
  a hidden-oracle leak under the approved D01 freeze; changing that freeze requires
  an owner decision. macOS-only isolation remains a separately gated owner decision.
- **Decision:** `exact_trace_review_passed_checkpoint_concerns_confirmed`.
  Repository-owner trace promotion and a new implementation boundary are pending.
  Trace promotion would not imply scale readiness. No official/scored run, product
  live-model call, Chromium call, BG-D02 creation, commit, or push occurred. After
  reconciliation, control checksums passed 177/177, `git diff --check` passed, and
  safe control/implementation preflights returned `READY_FOR_CLEAN_BRANCH` and
  `READY_FOR_IMPLEMENTATION` with zero contamination findings, the expected dirty
  working-tree warning, and four binary human-review notices.

## ITR-030 — Promote the reviewed D01 scale trajectory and prepare the next boundary

- **Owner decisions:** the repository owner approved `TRC-BG-D01-SCALE-001` as
  eligible implementation evidence and required its eligibility to remain independent
  from the future scale-readiness gate. The owner preserved the approved public D01
  invariant contract and authorized explicit disclosure of its construction-validity
  limitation; the behavior freeze and evaluation methodology remain closed.
- **Trace promotion:** indexed the exact reviewed coding-agent trajectory in
  `actual_traces`, marked owner review and technical-meaning preservation passed, and
  retained the exact `D01_CHECKPOINT=PASS_WITH_CONCERNS` / `SCALE_READY=no` outcome.
  A future `D01_CHECKPOINT=PASS` and `SCALE_READY=yes` blocks only scaling; it does
  not revoke or condition this trajectory's eligibility.
- **Next boundary:** prepared pending boundary `SES-20260830-002` and planned trace
  `TRC-BG-D01-SCALE-002` for only the remaining generic-engine, runner-produced
  capability-evidence, directory-completeness, negative-test, and projection work.
  BG-D02 is not used to prove genericity; test-only descriptor injection is required.
  Linux/judge portability, dependencies, containers, runtime/Phase 0.5 changes, and
  any reduced-assurance K=0 claim remain excluded pending a separate owner decision.
- **Decision:** `trace_owner_approved_eligible_next_boundary_prepared_pending_approval`.
  The new boundary does not authorize implementation. No product code, tests,
  fixtures, candidates, manifests, evaluation artifacts, or benchmark records were
  changed during this gate. No official/scored run, live product model, Chromium,
  BG-D02, commit, or push occurred. Post-promotion control checksums passed 178/178,
  `git diff --check` passed, and safe preflights returned `READY_FOR_CLEAN_BRANCH`
  and `READY_FOR_IMPLEMENTATION` with zero contamination findings, the expected
  dirty-tree warning, and four binary human-review notices.

## ITR-031 — Close remaining D01 engine, capability-evidence, and package-binding blockers

- **Boundary and hypothesis:** the owner approved `SES-20260830-002` for only the
  remaining concerns confirmed by the second D01 checkpoint. The hypothesis was that
  one injected engine contract, runner/worker evidence, and complete package
  enumeration could close those concerns without changing D01 behavior, candidates,
  oracle, five visible assertions, or evaluation methodology.
- **Descriptor engine change:** descriptor data now owns arm IDs, risk categories,
  observation sizes, replay records, schemas, workers, and artifacts. One frozen
  engine registry/plan injects schemas, arm checks, reasoning, evaluator, replay, and
  report contracts. D01 is the only real descriptor. A test-only in-memory descriptor
  uses different candidate IDs and cardinalities without creating BG-D02, a candidate,
  oracle, behavior spec, or manifest.
- **Capability-evidence change:** the actual runner emits the applied sandbox and
  permission evidence, while each arm/observer/evaluator emits hashed process identity
  and reciprocal allowed/denied read probes. Proof digests bind finalized decisions,
  observations, evaluator inputs/results, execution events, replay, JSON, and HTML.
  Missing events/evidence, tamper, contradictions, duplicate process identity,
  premature evaluation, and nondeterminism fail closed.
- **Directory-completeness change:** package validation now recursively enumerates the
  authorized root and rejects unlisted files, symlinks, path escapes, duplicate
  declarations, source mismatch, and manifest tamper before decision execution.
- **Construction-validity disclosure:** the approved public D01 invariant directly
  identifies the seeded defect family. This remains an explicit limitation of the
  experiment construction, not a hidden-defect-discovery claim. The owner kept the
  invariant, behavior freeze, and methodology unchanged.
- **Commands and evidence:** `npm run compile` passed; focused descriptor/package
  tests passed `2/2`; `npm test` passed `55/55`; `npm run task -- d01:verify` passed
  visible `5/5`, step `1/1`, oracle `3/3`, boundary `4/4`, vertical `19/19`, unscored
  E2E, four immutable manifests, and the 30-file vertical manifest SHA-256
  `6be3ea9671143f2df228102a348df5e0f41d3570535f510d7eec4af331282739`;
  `npm run task -- d01:demo` wrote JSON
  `db3d64776e38bfbfba6be2c174a68b7c96bd3a4a543fc64f892a74a3551aa074`
  and HTML `dd34b63a3b63a6faac7596e911c5008ec7a8df349059e255a7e7fc2770adbc87`;
  `npm run task -- d01:replay` reproduced both exactly.
- **Failures and retries:** the first capability patch was rejected before writing due
  to stale context and was split by owner symbol. Descriptor schema extraction first
  widened frozen candidate literal types, causing compile errors; the D01 exported
  union remained exact while generic injected schemas stayed descriptor-driven. One
  targeted suite then passed `18/19`; its old synthetic helper lacked mandatory
  process evidence, was corrected without changing product behavior, and passed
  `19/19`. The first canonical verification stopped only on the expected stale
  vertical manifest; the authorized 30-file reconciliation made the repeat pass.
- **Decision:** `keep_repo_local_verified_pending_owner_capture`. The owner cancelled
  an additional intermediate Claude review. `TRC-BG-D01-SCALE-002` now awaits
  owner-controlled native capture and review. A separate coordination task will apply
  a Codex acceptance matrix and require explicit owner approval before scaling, so
  `SCALE_READY=false`. A future five-fixture/ten-case benchmark reduction is outside
  this iteration. No official/scored run, live model, Chromium, BG-D02, commit, or
  push occurred.

## ITR-032 — Capture and reconcile TRC-BG-D01-SCALE-002

- **Authorization:** the repository owner confirmed native `Copy as Markdown` and
  authorized safe capture and subsequent review through the external trace boundary.
- **Exact source:** the safe wrapper anchored 43,616 bytes with SHA-256
  `8d60978fcfce04f7c6fe3fa777d5b438a62347328c482da85f60993e48c3247a` without
  disclosing the external path or content.
- **Automated scan:** `passed_requires_submission_redaction`; one private-term match
  was confined to two absolute machine-path occurrences, with zero matches after
  virtual path redaction, zero email matches, and zero secret-assignment matches.
- **Reconciliation:** clipboard bytes matched the receipt exactly and passed strict
  UTF-8. Exactly two repository-root occurrences were replaced mechanically. The
  resulting 43,540-byte, 571-line native reviewed layer has SHA-256
  `ba3b29f14abe3ea0524b711d15b390b5fabb63a28583334163e4da80e3d24444`.
- **Review evidence:** the complete native layer was inspected; EN/RU reviewed layers
  preserve owner approvals, chronology, changes, failures, retries, commands,
  evidence, decisions, and the stop before scaling. Safe control scan passed with
  zero contamination findings.
- **Validation retry:** an ad hoc Node YAML parse stopped before file parsing because
  the optional `yaml` package was absent. No dependency or runtime policy changed;
  the same six YAML files passed a system read-only safe parse, and
  `git diff --check` passed.
- **Decision:** `technically_reviewed_pending_repository_owner_eligibility_approval`.
  The trajectory is not yet indexed in `actual_traces`; `SCALE_READY=false`. Claude,
  official/scored runs, live model, Chromium, BG-D02, methodology/candidate/oracle
  changes, commit, and push remain absent or prohibited.
- **Final validation:** control checksums passed `192/192`; safe control and
  implementation preflights passed with zero contamination findings, the expected
  dirty-tree warning, and four binary human-review notices.

## ITR-033 — Promote the reviewed TRC-BG-D01-SCALE-002 trajectory

- **Human decision:** at `2026-08-30T09:20:29Z` the repository owner explicitly
  approved the reviewed trace as eligible implementation evidence and authorized its
  inclusion in `actual_traces`.
- **Scope:** trajectory promotion only. The owner explicitly preserved
  `SCALE_READY=false` and assigned any future scaling decision to a separate Codex
  acceptance matrix plus another explicit owner approval.
- **Change:** the trace index, review/provenance records, session boundary, product
  projections, and EN/RU reviewed layers now record owner approval and actual-trace
  inclusion while keeping the scaling gate independent.
- **Decision:** `owner_approved_eligible_indexed_in_actual_traces_scale_ready_false`.
  No official/scored run, live model, Chromium, BG-D02, evaluation-methodology,
  candidate, oracle, or freeze change, commit, or push occurred.

## ITR-034 — Correct confirmed D01 SCALE-003 acceptance blockers

- **Authorization and hypothesis:** under owner-approved `SES-20260830-003`, exactly
  one eligible implementation trajectory, `TRC-BG-D01-SCALE-003`, could correct the
  four confirmed Codex acceptance-matrix blockers without changing D01 behavior,
  visible assertions, candidate bytes, oracles, the frozen evaluation methodology,
  targets, or denominators.
- **Generic execution path:** the real orchestrator, arm/observer/evaluator workers,
  replay, and report now traverse one injected `FixtureEngineBindings` descriptor
  dispatcher. D01 remains the only real, data-only composition root. Its
  `BoardObservation` schema is explicitly injected outside the generic schema layer.
  A TEST-ONLY descriptor traverses the real dispatcher and proves invocation of its
  schemas, checks, reasoning, evaluator selection, replay, and report bindings.
- **Falsifiable capability evidence:** launch and worker identity are digest-bound;
  sandbox and allowed-path policies are canonically recomputed; role, profile,
  execution slot, and proof form an exact bijection; each arm follows an exact event
  state machine; evaluator events bind to the immutable decision digest of their arm.
  Offline replay independently recalculates `reasonCorrectReject` and
  `oracleAcceptedCandidate`.
- **Recursive package binding:** normalized recursive comparisons accept valid nested
  package structures. A direct negative test mutates the bytes of an already
  registered nested source and proves fail-closed rejection.
- **Commands and evidence:** owner-authorized `npm ci` installed 54 packages from the
  unchanged lockfile and reported 0 vulnerabilities. The final `npm run compile`
  passed. The final `npm test` passed `55/55` with `TASK_PASSED test:all`.
  `npm run task -- d01:verify` passed visible `5/5`, positive step `1/1`, oracle
  `3/3`, physical boundary `4/4`, vertical `19/19`, unscored E2E, four immutable
  manifests, and the 30-file vertical manifest SHA-256
  `d6e199439b41b0edd5c842bcdcf7f8c386863b37cf0e00f737abfef62c3eae5b`. The E2E
  JSON digest was `e68895a8ae55374173ab4dc7462bdffcf820abaa082f01efb0cb2c32cb9a7e70`;
  the static HTML digest was
  `458e09c1589c013a5753c17e2a215b76b9a2b8aabb6e220bef39acd1a4e014ff`.
- **Failures and retries:** the initial compile stopped on missing `@types/node`
  (`TS2688`). The owner authorized `npm ci` from the unchanged lockfile and exactly
  one compile retry. That retry stopped on five bounded errors: three
  `executionSlot` type errors and two cyclic `D01_ENGINE` inference errors. The owner
  authorized only those fixes and one retry, which passed. The first test output
  capture was incomplete; an unchanged authoritative rerun reported `51/55`, with
  four `Candidate observation evidence is invalid` failures. Safe diagnosis found a
  launch/worker profile mismatch: the observer used the first descriptor arm rather
  than the immutable decision arm. The owner authorized only that correction plus
  one compile and one test; both passed. The vertical manifest was mechanically
  regenerated after the final source correction before targeted verification.
- **Decision:** `keep_repo_local_verified_pending_native_capture_scan_owner_review`.
  A separate coordination Codex acceptance matrix and explicit owner approval remain
  required before scaling, so `SCALE_READY=false`. No official/scored run, live
  model, Claude, Chromium, BG-D02 work, behavior/candidate/oracle/methodology change,
  commit, or push occurred.
- **Post-verification stop:** the approved safe preflight and trace probes failed
  closed before scanning because their launcher did not recognize the current clean
  repository root as authorized. No private value, path, or content was disclosed.
  No bypass or external-configuration inspection was attempted; owner direction is
  required before any retry.

## ITR-035 — Capture and technically review TRC-BG-D01-SCALE-003

- **Authorization and source:** the repository owner selected native Codex Desktop
  `Copy as Markdown` and piped it directly to the approved external capture wrapper.
  The immutable receipt records 49,485 bytes and SHA-256
  `0fe4e5b8be4ffff71b849bda538e4ecc6d2d44b94a9dcfdf423b1209855d4400` without
  disclosing the external path or content.
- **Identity and encoding:** the first comparison correctly rejected a changed
  171-byte clipboard. After the owner recopied the original task export without a
  second raw capture, the bytes exactly matched the receipt and passed strict UTF-8
  round-trip validation.
- **Automated scan:** `micro1-safe-trace-review scan-raw` confirmed the same byte
  count and digest. It found two absolute machine paths, zero private terms before or
  after path omission, zero email matches, and zero secret-assignment matches.
- **Semantic review:** the verified payload exceeded the coordinator output window,
  so no repository-local raw/native transcription was created. The original Codex
  task transcript was reviewed through the app, and complete EN/RU chronological
  projections preserve authorization, implementation, failures, separately approved
  retries, commands, evidence, decisions, and the stop before scaling. Hidden
  reasoning, internal application events, and complete shell stdout are not claimed.
- **Decision:** `technically_reviewed_pending_repository_owner_eligibility_approval`.
  The trace remains in `pending_trace_review`, not `actual_traces`.
  `SCALE_READY=false`; the later Codex acceptance matrix and explicit owner decision
  remain separate gates. No official/scored run, live model, Claude, Chromium,
  BG-D02, frozen-input or methodology change, commit, or push occurred.
- **Post-capture validation:** control checksums passed `200/200`; `git diff --check`
  passed; safe control and implementation preflights returned
  `READY_FOR_CLEAN_BRANCH` and `READY_FOR_IMPLEMENTATION` with zero contamination
  findings, the expected dirty-tree warning, and four binary human-review notices.

## ITR-036 — Promote the reviewed TRC-BG-D01-SCALE-003 trajectory

- **Human decision:** at `2026-08-30T10:41:34Z`, after the complete Russian review
  was available, the repository owner selected the explicit recommended approval to
  include `TRC-BG-D01-SCALE-003` in `actual_traces` as eligible implementation
  evidence.
- **Scope:** trajectory promotion only. The owner preserved `SCALE_READY=false` and
  required a separate Codex acceptance matrix plus another explicit owner decision
  before scaling. Commit and push remain prohibited.
- **Decision:** `owner_approved_eligible_indexed_in_actual_traces_scale_ready_false`.
  No official/scored run, live model, Claude, Chromium, BG-D02, frozen-input or
  methodology change, commit, or push occurred.

## ITR-037 — Repeat the Codex D01 scale-readiness acceptance matrix

- **Input:** owner-approved eligible `TRC-BG-D01-SCALE-003`, indexed in
  `actual_traces`; eligibility is independent from this scaling decision.
- **Parallel review:** independent engine, capability-security, and package/projection
  reviewers re-read the current tree. Codex then independently checked the actionable
  findings against the referenced implementation.
- **Passed criteria:** `A3`, `S4`, `P1`, `P2`, and `D1`. Compile passed; ordinary
  tests passed `55/55`; canonical `d01:verify` passed visible `5/5`, step `1/1`,
  oracle `3/3`, boundary `4/4`, vertical `19/19`, E2E, and immutable manifests.
- **Confirmed blockers:** `A1` real runtime still imports D01 instead of accepting an
  injected engine; `A2` TEST-ONLY proof manually dispatches fake callbacks rather
  than the real pipeline; `S1` replay does not compare exact expected role/slot
  allowlists; `S2` outputs are not positionally bound to expected proof slots; `S3`
  internally consistent event digests are not checked against actual immutable arm
  decisions.
- **Decision:** `PASS_WITH_CONFIRMED_BLOCKERS`, `SCALE_READY=false`. One fresh
  bounded SCALE-004 session is required. No official/scored run, live model, Claude,
  Chromium, BG-D02, benchmark reduction, frozen-input or methodology change, commit,
  or push occurred.

## ITR-038 — Correct the bounded SCALE-004 runtime and capability blockers

- **Authorization and hypothesis:** owner-approved `SES-20260830-004` authorizes
  exactly A1, A2, S1, S2, and S3. The hypothesis is that injecting all fixture-owned
  runtime operations into the real orchestrator and worker protocol, while deriving
  one exact policy per execution slot and binding outputs/events to immutable
  positional evidence, closes the five blockers without changing D01 semantics.
- **Exact change:** the real orchestrator now exposes engine-parameterized arm,
  observer, evaluator, and vertical-slice functions. Shared worker runtime functions
  accept `FixtureEngineBindings`; executable D01 scripts are thin composition
  wrappers. D01 candidate/oracle operations are injected through a dedicated runtime
  binding. The former manual TEST-ONLY callback dispatcher is replaced by a
  TEST-ONLY descriptor that runs the real sandboxed process transport, worker,
  evaluator, replay, and report lifecycle. Exact canonical sandbox/read policies are
  derived for all eight slots and checked at request construction, runner launch,
  proof binding, and replay. Observation/evaluator outputs are checked against their
  exact proof, role, profile, and slot. Event validation now receives both actual
  immutable arm decisions and rejects an internally consistent arbitrary digest.
- **Negative evidence added:** extra, missing, changed, and slot-substituted path
  policies; cross-role output substitution; and arbitrary consistent event-decision
  digests all fail closed. Existing S4 inversion, P1 ordering, and P2 registered-byte
  mutation tests remain in place; `BoardObservation` remains explicitly injected.
- **Evaluation commands/version:** exactly once after implementation, in order:
  `npm run compile`; `npm test`; `npm run task -- d01:verify`; evaluation version
  `eval-v1.1.0`.
- **Evidence:** the first and only `npm run compile` attempt failed before tests with
  seven bounded TypeScript errors in `src/d01/orchestrator.ts`: five execution-slot
  type mismatches after generic runtime injection and two incomplete generic package-
  binding type conversions. `npm test` and `npm run task -- d01:verify` did not run.
- **Errors/retries:** safe failure class
  `TYPESCRIPT_GENERIC_RUNTIME_BINDING_TYPE_MISMATCH`. No retry, correction,
  dependency installation, model, browser, external workspace, or additional
  agent/model process followed. Russian stop checkpoint:
  `artifacts/trajectories/reviews/BG-D01-SCALE-004-STOP-CHECKPOINT_RU.md`.
- **Decision:** `stopped_on_first_deterministic_compile_failure_pending_owner_decision`.
  `SCALE_READY=false`; SCALE-003 remains owner-approved eligible evidence. Commit and
  push remain prohibited and were not performed.

## ITR-039 — Verify and review the complete SCALE-004 correction bundle

- **Continuation evidence:** seven separately owner-authorized continuations preserved
  every deterministic compile, descriptor, isolation, and environment stop. Direct
  Desktop checks distinguished nested sandbox limitations from product defects.
- **Final verification:** ordinary tests passed `56/56`; `d01:verify` passed visible
  `5/5`, step `1/1`, oracle `3/3`, boundary `5/5`, vertical `19/19`, E2E, and both
  manifest gates. The 37-file vertical package digest is
  `0b59c19a8c229d7584731e711ba4e4ee0606d0008b870d36550fa06676f1d17e`.
  Regenerated unscored JSON/HTML evidence passed offline replay, and Phase 0.5 passed
  `4/4`.
- **Capture review:** the main automatic JSONL capture plus `CONT-001` through
  `CONT-007` passed `micro1-safe-trace-review scan-raw`. Stderr and pre-model launcher
  failures are classified separately. Submission requires deterministic machine-path
  redaction; after it, private-term matches are zero, with zero email or secret
  assignments.
- **Acceptance:** independent Codex review passed A1, A2, A3, S1, S2, S3, S4, P1,
  P2, and D1. Frozen candidates, fixtures, oracle behavior, five visible assertions,
  evaluation methodology, targets, dependencies, and runtime policy were unchanged.
- **Decision:** `all_acceptance_criteria_passed_pending_owner_trace_promotion_and_scale_decision`.
  The reviewed SCALE-004 bundle remains outside `actual_traces`, and
  `SCALE_READY=false`. No official/scored run, BG-D02 work, Claude, Chromium, commit,
  or push occurred.

## ITR-040 — Promote the reviewed SCALE-004 bundle and pass the scale gate

- **Human decision:** the repository owner approved `TRC-BG-D01-SCALE-004` and
  `CONT-001` through `CONT-007` as eligible implementation evidence, authorized eight
  distinct `actual_traces` entries, and explicitly set `SCALE_READY=true` based on the
  all-pass A1/A2/A3/S1/S2/S3/S4/P1/P2/D1 Codex matrix.
- **Promotion:** each immutable implementation JSONL capture is indexed exactly once
  with its own byte count and SHA-256. Stderr, transport canaries, and pre-model
  launcher failures remain excluded from implementation evidence.
- **Residual control:** deterministic machine-path redaction remains mandatory before
  submission. This approval does not authorize an official/scored run, BG-D02 work,
  dependency or methodology changes, commit, or push.
- **Decision:** `owner_approved_eight_capture_bundle_indexed_scale_ready_true`.

## ITR-041 — Integrate and verify the BG-D02-D04 development fixtures

- **Authorization and hypothesis:** owner-approved `SES-20260830-009` and
  `TRC-BG-D02-D04-INTEGRATION-001` with `CONT-001` through `CONT-009`. The
  hypothesis is that three independently frozen development fixtures can use the
  shared typed verification architecture without changing frozen semantics or the
  evaluation contract.
- **Change:** retained the TypeScript BG-D02 `ParcelDispatchBoard` family and the
  discarded MJS prototype record; connected BG-D02-D04 to typed tasks, manifests,
  physical isolation, and cross-fixture regression. The scanner now exposes safe
  non-overlapping spans. Exactly three approved spans in the BG-D02 Russian report
  were replaced in memory by `<redacted-local-path>`; all other bytes were proven
  unchanged and the target-only absolute-path scan returned zero findings.
- **Evaluation commands/version:** `npm test`; `npm run task -- d01:verify`;
  `npm run task -- d01:replay`; `npm run task -- d02:verify`;
  `npm run task -- d03:verify`; `npm run task -- d04:verify`;
  `npm run task -- development:verify`; `npm run task -- phase0.5:verify`;
  documentation/parity checks; checksum check/write/check; `git diff --check`;
  safe control and implementation preflights; evaluation version `eval-v1.1.0`.
- **Evidence:** ordinary tests passed `78/78`; every D01-D04 fixture task passed;
  integrated manifests, isolation, exact four-fixture/task bijection, discarded
  prototype assertion, deterministic replay, and Phase 0.5 passed. The normalization
  precheck and postcheck each proved the owner-specified cardinality and structural
  byte invariant without emitting original values or target lines.
- **Preserved surfaces:** behavior prose, candidates, verifier-only oracles, visible
  assertions, evaluation methodology, targets, denominators, dependencies, lockfile,
  execution policy, `K=0`, and all official/scored state remain unchanged.
- **Decision:** `keep_verified_unscored_integration_pending_trace_capture_review_and_owner_promotion`.
  No official/scored run, live product model, Claude, Chromium, browser/private MCP,
  commit, or push occurred.

## ITR-042 — Integrate and recover verification of BG-H01-H06

- **Authorization and hypothesis:** owner-approved `SES-20260830-011` and the
  automatically captured integration trajectory through `CONT-004`. The hypothesis
  is that the six independently frozen held-out packages can join the shared typed
  registry without changing evaluation semantics or exposing verifier mapping.
- **Change:** preserved all 103 fixture-local files byte-for-byte; added the exact
  ten-fixture descriptor/task registry, heterogeneous manifest reconciliation,
  reciprocal isolation and `K=0` integration checks, and held-out mapping leak scan.
- **Retries:** corrected one missing TypeScript delimiter in `CONT-003`; in
  `CONT-004` narrowed an over-broad descriptor assertion to the six held-out
  declarations and excluded only explicit isolation tests/probes from the working
  source leak scan. The first full test rerun passed 102/111; nine existing D01
  subprocess/loopback checks were blocked by the nested sandbox and were not changed.
- **Evidence:** `npm run compile`, `npm run task -- held-out:verify`,
  `npm run task -- development:verify`, and `npm run task -- d01:replay` passed.
  H01-H06 visible gates, evaluator self-checks, reciprocal denial, all immutable
  manifest bindings, ten-class/4-6/challenging-case/cardinality checks, `K=0`, and
  leak scan passed. No official/scored run or unblinding occurred.
- **Decision:** keep the verified non-official integration uncommitted and request
  separate owner acceptance; do not claim the sandbox-limited full suite as green.

## ITR-043 — Harden and rehearse post-decision observer execution

- **Authorization and hypothesis:** owner-approved `SES-20260831-036`. The failed
  `POSTDECISION-002` exposed only a generic observer failure before any capture. The
  hypothesis was that the frozen BG-D01 terminal `dispose` step was incompatible
  with its observer bridge and that a production-equivalent observer-only rehearsal
  could validate the complete 20-slot surface without another arm or model call.
- **Change:** added privacy-safe role stage categories, structured failure evidence
  that omits raw errors, stacks, stderr, paths, and hidden values; added exactly one
  terminal `dispose` to the BG-D01 bridge; registered a non-writing observer rehearsal;
  and reserved create-once `POSTDECISION-003` under `SES-20260831-036`.
- **Evaluation commands/version:** `npm run compile`; targeted physical role tests;
  `MICRO1_OBSERVER_REHEARSAL_SESSION_BOUNDARY=SES-20260831-036 npm run task --
  evaluation:observer-rehearsal`; `npm test`; evaluation version `eval-v1.1.0`.
- **Evidence:** targeted tests passed `14/14`; the production-equivalent rehearsal
  passed 20 scenario releases and all 80 observer captures with zero arm, model, and
  evaluator invocations. Its capture digest is
  `3d8d29d717495afd2bda1325cdf4270b62db53ca826b5dc034e76a427ad2b8ea`.
  The complete ordinary suite passed `233/233`.
- **Preserved surfaces:** RUN-001, RUN-002, and the four-file partial
  `POSTDECISION-002` remain byte-for-byte unchanged. Candidates, 40 immutable arm
  decisions, frozen scenarios, oracle semantics, ground truth, scoring, and
  evaluation v1.1 were not changed.
- **Decision:** `ready_for_owner_checkpoint_approval_before_postdecision_003`.
  `POSTDECISION-003`, commit, push, ZIP, and publication remain blocked.
