# BeyondGreen — Improvement Changelog Projection

**Projection of:** `docs/PROJECT_SPEC.md@1.1.0`
**Requirements:** `AR-003`, `AR-004`, `AR-009`, `EV-008`–`EV-010`
**State:** specification only; no product, fixture, candidate, or benchmark run exists

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
