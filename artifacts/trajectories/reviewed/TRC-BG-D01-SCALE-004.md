# TRC-BG-D01-SCALE-004 — reviewed implementation trajectory bundle

**Review status:** owner-approved eligible bundle; all eight captures indexed  
**Session boundary:** `SES-20260830-004`  
**SCALE_READY:** `true`

## Scope and source layers

This reviewed layer covers the main SCALE-004 Codex JSONL trajectory and seven
owner-authorized continuations. The immutable JSONL stdout captures remain outside
the repository. Stderr captures and launcher attempts that ended before model work
are classified separately and are not implementation evidence. No raw payload or
external path is reproduced here.

All eight implementation captures passed `micro1-safe-trace-review scan-raw`. Each
requires deterministic omission of absolute machine paths before submission. After
that categorical omission there are zero private-term matches; every capture also
has zero email and secret-assignment matches.

## Chronology

1. The main trajectory parameterized the real orchestrator and worker runtime by
   `FixtureEngineBindings`, added exact slot-policy and evidence bindings, and added
   the required negative tests. Its first compile stopped on seven bounded generic
   runtime type errors.
2. `CONT-001` corrected those seven errors and stopped when the TEST-ONLY arm-visible
   descriptor lacked four package-binding fields.
3. `CONT-002` added only those arm-visible fields and stopped on the equivalent
   verifier-only descriptor mismatch.
4. `CONT-003` added only the four verifier-only fields; compilation passed.
5. `CONT-004` ran the single ordinary-test gate in the nested environment and stopped
   on child-isolation failures.
6. `CONT-005` separated arm/observer composition from evaluator-only verifier imports;
   compilation exposed one explicit evaluator-composition parameter type error.
7. `CONT-006` corrected that one type. Compile passed; its nested targeted boundary
   run stopped because the nested sandbox could not apply the system sandbox.
8. Direct owner-authorized Desktop gates then passed the same role-boundary tests
   `5/5`, ordinary tests `56/56`, complete `d01:verify`, and offline replay.
9. `CONT-007` deterministically wrote and checked the 37-file vertical manifest.
10. The owner-authorized unscored evidence regeneration changed only the JSON and
    HTML artifacts; replay JSONL was already byte-current. Offline replay then passed
    and reproduced both report artifacts exactly.

## Technical result

- A1: the real orchestrator and shared worker functions accept injected engine
  bindings; D01 entrypoints are composition wrappers.
- A2: TEST-ONLY traverses real process transport, workers, evaluator, replay, and
  report construction.
- S1: live validation and replay compare the exact canonical sandbox and allowed-path
  policy for each execution slot.
- S2: observations and evaluator results are positionally bound to proof, role,
  profile, and slot; cross-role substitution fails closed.
- S3: each arm event digest is bound to the actual immutable arm decision; an
  internally consistent arbitrary digest fails closed.
- A3, S4, P1, P2, and D1 remain satisfied.

## Verification

- `npm run compile`: passed.
- `npm test`: passed `56/56`.
- `npm run task -- d01:verify`: passed compile, visible `5/5`, step `1/1`, oracle
  `3/3`, physical/role boundary `5/5`, vertical contracts `19/19`, E2E, and manifests.
- `npm run task -- d01:replay`: passed; report artifacts matched.
- `npm run task -- phase0.5:verify`: passed `4/4`.

## Decision

`owner_approved_eligible_bundle_indexed_in_actual_traces_scale_ready_true`.
The repository owner approved the main trace and all seven continuations as eligible
implementation evidence and separately set `SCALE_READY=true`. Deterministic machine-
path redaction remains mandatory before submission. No official or scored run, BG-D02
work, Claude, Chromium, dependency or methodology change, commit, or push occurred.
