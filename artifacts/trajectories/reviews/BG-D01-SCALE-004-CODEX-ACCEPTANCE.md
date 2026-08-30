# BG-D01 SCALE-004 — Codex acceptance matrix

**Review class:** independent repository-local scale-readiness review  
**Input:** owner-approved SCALE-004 trace bundle indexed in `actual_traces`  
**Verdict:** `PASS_OWNER_APPROVED_SCALE_READY`  
**SCALE_READY:** `true`

| ID | Result | Evidence |
| --- | --- | --- |
| A1 | PASS | `src/d01/orchestrator.ts:251-263,431-471,534-644`; `src/d01/worker-runtime.ts:14-140`; D01 scripts only compose `D01_ENGINE` into shared functions. |
| A2 | PASS | `tests/d01-descriptor-injection.test.ts:10-40` runs TEST-ONLY through real process transport, evaluator, replay, and report. |
| A3 | PASS | `src/d01/schema-factory.ts`; `src/d01/schemas.ts:6-13` keeps `BoardObservationSchema` D01-owned and explicitly injected. |
| S1 | PASS | `src/d01/capability.ts:68-116`, `src/d01/execution.ts:72-92`, `src/d01/replay.ts:59-65`; negatives at `tests/d01-vertical-slice.test.ts:447-485`. |
| S2 | PASS | Exact proof/role/profile/slot bijection and event binding at `src/d01/execution.ts:68-127`; cross-role negative at `tests/d01-vertical-slice.test.ts:569-573`. |
| S3 | PASS | Actual immutable decisions are compared at `src/d01/execution.ts:136-161`; wrong-arm and arbitrary-consistent digest negatives at `tests/d01-vertical-slice.test.ts:504-515`. |
| S4 | PASS | Replay recomputes evaluator conclusions at `src/d01/replay.ts:31-57`; inversion negatives at `tests/d01-vertical-slice.test.ts:574-579`. |
| P1 | PASS | Recursive enumeration and global lexical sort at `src/d01/candidate.ts:31-48`; nested ordering fixture at `tests/d01-package-binding.test.ts:19-31`. |
| P2 | PASS | Registered nested-source byte mutation fails closed at `tests/d01-package-binding.test.ts:60-67`. |
| D1 | PASS | Current review, provenance, topic, changelog, and trajectory index consistently record all eight owner-approved entries and `SCALE_READY=true`. |

## Verification evidence

- Ordinary tests: `56/56`.
- `d01:verify`: compile, visible `5/5`, step `1/1`, oracle `3/3`, boundary `5/5`,
  vertical `19/19`, E2E, and manifests passed.
- Offline replay passed and reproduced JSON/HTML exactly.
- Phase 0.5 verification passed `4/4`.
- All eight implementation JSONL captures passed raw scanning with deterministic
  machine-path redaction required and zero remaining private-term, email, or secret
  matches.

## Decision

All ten acceptance criteria pass on the current code and evidence. The repository
owner promoted all eight reviewed captures into `actual_traces` and explicitly set
`SCALE_READY=true`. This does not authorize an official/scored run, commit, or push.
