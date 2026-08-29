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

Every later iteration must record observed failure, hypothesis, exact change,
command/version, evidence/run IDs, agent/model, trajectory IDs, errors/retries,
genuine human checkpoint, decision (`kept`, `revised`, or `removed`), and next action.
Held-out results cannot drive evaluation v1.1 tuning.

Strongest measured change, measured removed experiment, remaining implementation
failure, and final hot take remain unclaimed until evidence exists.
