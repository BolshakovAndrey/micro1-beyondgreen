# BG-D01 SCALE-003 — Codex acceptance matrix

**Review class:** independent repository-local scale-readiness review  
**Input trace:** `TRC-BG-D01-SCALE-003`  
**Trace eligibility:** owner-approved and indexed in `actual_traces`  
**Scale verdict:** `PASS_WITH_CONFIRMED_BLOCKERS`  
**SCALE_READY:** `false`

Trace eligibility and scaling readiness are independent. This matrix does not revoke
or qualify the eligible SCALE-003 implementation trajectory.

## Matrix

| ID | Result | Evidence | Required disposition |
| --- | --- | --- | --- |
| A1 | FAIL | `src/d01/orchestrator.ts` and real worker entrypoints still import and invoke `D01_ENGINE`; the public real pipeline does not accept injected `FixtureEngineBindings`. | Introduce one real engine-parameterized orchestrator/worker runtime; keep D01 entrypoints as thin data-only composition wrappers. |
| A2 | FAIL | `tests/d01-descriptor-injection.test.ts` manually dispatches fake callbacks and never traverses the real orchestrator/worker/evaluator/replay/report lifecycle. | Make a TEST-ONLY descriptor execute the real engine-parameterized pipeline with bounded injected process transport. |
| A3 | PASS | `BoardObservation` is outside the generic factory and explicitly injected. | Preserve. |
| S1 | FAIL | Capability replay verifies self-consistent canonical hashes but not the exact expected allowlist/policy for each execution slot. | Derive expected role/slot policies from frozen engine contracts and compare exact canonical digests during live validation and replay. |
| S2 | FAIL | Evidence schema accepts any process evidence present in any proof; observation/evaluator outputs are not positionally bound to their expected execution slots. | Bind every output to exactly one expected proof/slot and add cross-role substitution negatives. |
| S3 | FAIL | Per-arm events are internally consistent, but replay does not compare their `decisionSha256` to the actual immutable decision stored for that arm. | Pass immutable decisions into execution validation and require exact per-arm digest equality; add arbitrary-consistent-digest negative test. |
| S4 | PASS | Replay independently recalculates `reasonCorrectReject` and `oracleAcceptedCandidate`; inversion tests fail. | Preserve. |
| P1 | PASS | Recursive enumeration is globally sorted and accepts the `a/source.ts` plus `a.ts` ordering case. | Preserve. |
| P2 | PASS | Direct negative test changes registered nested source bytes and expects `source digest mismatch`. | Preserve. |
| D1 | PASS | Active projections agree that SCALE-003 is owner-approved in `actual_traces`, this matrix is the next gate, and `SCALE_READY=false`. | Preserve and update only with this matrix result. |

## Canonical verification

- `npm run compile` — passed.
- `npm test` — passed `55/55`.
- `npm run task -- d01:verify` — passed visible `5/5`, step `1/1`, oracle `3/3`,
  physical boundary `4/4`, vertical `19/19`, unscored E2E, immutable manifests, and
  the 30-file vertical manifest.
- Package and projection re-review: `P1=PASS`, `P2=PASS`, `D1=PASS`.
- Security re-review: `S4=PASS`; `S1`–`S3=FAIL`.
- Engine re-review: `A3=PASS`; `A1`–`A2=FAIL`.

## Bounded SCALE-004 correction scope

Allowed work is limited to:

1. parameterizing the real orchestration and worker runtime by
   `FixtureEngineBindings`, with D01 retained as a thin data-only composition wrapper;
2. replacing the fake-dispatch TEST-ONLY proof with a real-pipeline integration test;
3. validating exact expected role/slot sandbox and allowed-path policies in live and
   replay paths;
4. enforcing positional output-to-proof/slot binding with substitution negatives;
5. binding every per-arm evaluator event digest to the actual immutable decision;
6. reconciling only directly affected tests, manifests, provenance, changelog, and
   active status projections.

Explicitly excluded: fixture/candidate/oracle/visible-assertion/methodology changes,
BG-D02, benchmark reduction, official/scored runs, live model, Claude, Chromium,
dependency or runtime-policy changes, commit, and push.

## Decision

`SCALE_READY=false`. Start one fresh submission-eligible `SES-20260830-004` task for
the bounded SCALE-004 scope, capture and review its implementation trace, rerun this
Codex matrix, and require explicit owner approval before scaling.
