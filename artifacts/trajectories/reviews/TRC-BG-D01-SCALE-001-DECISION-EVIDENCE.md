# TRC-BG-D01-SCALE-001 — Decision-to-evidence map

**Boundary:** `SES-20260830-001`  
**Run class:** unscored development evidence only  
**Current gate:** exact trace capture/review passed; repeated checkpoint returned
`PASS_WITH_CONCERNS` and `SCALE_READY=no`; owner promotion passed independently from
the scaling gate, and prepared boundary `SES-20260830-002` is pending approval

This map connects each scale-readiness decision to repository evidence. It does not
substitute for the native coding-agent trajectory and does not make the trace eligible.

| Decision | Concern and contract | Implemented evidence | Falsification / verification | Disposition |
| --- | --- | --- | --- | --- |
| `D01-SCALE-DEC-001` | D01 values were hard-coded; `FR-001`, `AR-003` | `src/d01/fixture.ts` owns the `FixtureDescriptor`; orchestrator, schemas, scripts, candidates, and manifests consume it | Descriptor ownership and manifest-tamper tests in `tests/d01-vertical-slice.test.ts`; compile and full D01 verification | keep |
| `D01-SCALE-DEC-002` | ProbePlan could encode the seeded defect; `FR-002`, `FR-004`, `EV-005` | `src/d01/risk.ts` derives probes from `ARM_VISIBLE_INVARIANTS` plus risk inventory and records the derivation digest with `seededDefectKnowledgeUsed=false` | Both candidates produce the same invariant-driven plan; negative schema/binding tests | keep |
| `D01-SCALE-DEC-003` | Decision-owning parent read verifier-only bytes before decisions; `FR-006`, `EV-006` | `src/d01/orchestrator.ts` finalizes both arm decisions before verifier validation; `src/d01/execution.ts` derives ordering and boundary claims from measured events | Injected validator-order test and event-order negative tests | keep |
| `D01-SCALE-DEC-004` | Replay trusted serialized decisions/evaluator output too loosely; `FR-008`–`FR-010`, `NFR-008` | `src/d01/replay.ts` calls `verifyFinalizedDecision`, checks both observation captures, and recomputes evaluator-input binding | Replay rejects a valid-looking evaluator record whose decision binding was changed | keep |
| `D01-SCALE-DEC-005` | EV-009 fields were asserted rather than measured or missing | `src/d01/orchestrator.ts` records wall-clock start/end and monotonic duration; schema/evaluator add `membership` and `falseAlarm` | Tests require measured positive duration, development membership, and correct false-alarm values | keep |
| `D01-SCALE-DEC-006` | Execution order and K=0 claims were hand-authored; `FR-006`, `FR-007`, `EV-006` | `src/d01/execution.ts` derives ordering from a monotonic event ledger, but capability flags remain parent-declared rather than independently measured | Existing negative tests reject reordered events; missing-event and independently falsified capability-evidence tests remain absent | partial; scale blocker |
| `D01-SCALE-DEC-007` | One post-decision observation could hide nondeterminism; `FR-008`, `NFR-002` | `finalizeObservationPair` captures each arm twice in distinct observer processes and compares canonical digests before evaluation | Direct and process-level tests prove mismatch fails closed and evaluator is not invoked | keep |
| `D01-SCALE-DEC-008` | Isolation proof was one-directional; `FR-006`, `EV-006` | `evaluation/verifier-only/BG-D01/evaluator-denied-probe.mjs` proves evaluator access to oracle while candidate enumeration/stat/read are denied indistinguishably | Reciprocal boundary test in `tests/d01-boundary.test.ts` | keep |
| `D01-SCALE-DEC-009` | Arm-visible manifest was not bound to a code-owned digest; `FR-001`, `NFR-004` | `FixtureDescriptor` owns arm manifest/package digests; `validateBoundPackage` verifies metadata, every source digest, and package digest inside the arm and parent | Manifest mutation test fails before decision execution | keep |
| `D01-SCALE-DEC-010` | Five visible assertions had duplicate executable definitions; `FR-003` | `evaluation/arm-visible/BG-D01/visible-assertions.ts` is the sole executable list consumed by visible tests and arm checks | Descriptor/source-of-truth test and unchanged visible result `5/5` for both candidates | keep |
| `D01-SCALE-DEC-011` | Divergence evidence could grow without bound and was absent from HTML; `FR-009`, `AR-003` | `src/d01/arm-checks.ts` emits at most five counterexample items plus omitted count; `src/d01/report.ts` renders the validated bounded structure | A 300-item synthetic divergence produces five items and `omittedCount=295` | keep |
| `D01-SCALE-DEC-012` | Trace/projection/compile status overstated readiness; `AR-003`, `AR-005`, `AR-009` | `tsconfig.json` uses scalable D-fixture globs; reproduction, preflight, topic, provenance, trace index, specs, evaluation, and changelog distinguish historical verification from pending remediation trace | Compile, projection audits, checksum reconciliation, safe preflights, and `git diff --check` | keep pending final gate |

## Captured implementation retries

- The first combined patch attempt was rejected before writing because the same file
  was both deleted and added; the change was split and reapplied.
- After the evidence schema moved to v1.1, the first compile exposed two stale test
  literals; the tests were corrected to the descriptor-owned version.
- The first targeted test run passed 25/26 because a no-I/O regex matched the word
  `deriveExecutionClaims`; the regex was narrowed to actual execution APIs and the
  suite passed 29/29.
- A broad `scripts/**/*.ts` and `tests/**/*.ts` compile scope surfaced historical
  untyped control-plane utilities outside the product implementation contract. The
  scope was revised to scalable D-fixture product patterns without changing the
  frozen Phase 0.5 utilities.
- The boundary YAML parser attempt found no installed repository-local YAML module;
  no dependency or network access was added, and repository-local structural checks
  were used instead.

## Exact verification commands

```text
npm run compile
npm test
npm run task -- d01:verify
npm run task -- d01:replay
npm run task -- phase0.5:verify
npm run task -- checksums:check
git diff --check
micro1-safe-preflight control
micro1-safe-preflight implementation
micro1-safe-trace probe
```

## Final repo-local gate

- `npm run compile` — passed.
- `npm test` — passed 53/53.
- `npm run task -- d01:verify` — passed: visible 5/5, step contract 1/1,
  oracle 3/3, physical boundary 4/4, vertical contracts 19/19, unscored E2E,
  four foundation manifests, and the 24-file vertical manifest.
- `npm run task -- d01:replay` — passed with `reportArtifactsMatched=true`;
  canonical JSON SHA-256
  `47035ed40c9ab16473d3a5866bc2071138712d01992a20a617a48bf0e19cd674`,
  HTML SHA-256
  `9f552bb43399463afaf8257a265dad9c235343be5d836b1215f0b14b8d0f88ed`,
  replay SHA-256
  `4ba082113fae1e1f97139c26a3c42e807a1530c66777bc980f5a5346c889b9e0`.
- `npm run task -- phase0.5:verify` — passed without live model or browser
  execution: licenses 54/54; suites 11/11, 6/6, 3/3, 4/4, 3/3, and 4/4.
- The first checksum check correctly reported a stale projection after the authorized
  changes. `checksums:write` reconciled it, and the repeat passed 171/171.
- `git diff --check` passed.
- Safe control and implementation preflights returned `READY_FOR_CLEAN_BRANCH` and
  `READY_FOR_IMPLEMENTATION`; contamination findings were zero. The implementation
  result retained the expected dirty-worktree warning, and both scans retained four
  official binary human-review notices.
- After exact trace review and checkpoint reconciliation, the control checksum
  projection passed 177/177 and `git diff --check` passed again.
- Final root/branch/HEAD check remained repository-relative root `.`, branch
  `impl/beyondgreen`, and initial HEAD
  `f0418bc6051002d8d42ccf84822d2e1f2e25b02e`.

These results establish repo-local correctness only. Native trace review and owner
promotion passed, so the trajectory is eligible and indexed in `actual_traces` even
though the repeated independent checkpoint did not grant scale readiness. Prepared
boundary `SES-20260830-002` requires exact owner approval before further remediation.
