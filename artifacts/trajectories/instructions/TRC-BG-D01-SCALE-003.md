# TRC-BG-D01-SCALE-003 — Codex implementation instructions

Implement only the owner-approved corrections in `SES-20260830-003`:

1. Route the real D01 orchestrator/workers through one injected generic
   `FixtureEngineBindings`/descriptor execution path, keep D01 data-only, add one
   TEST-ONLY integration descriptor covering the real schemas/checks/reasoning/
   evaluator/replay/report pipeline, and remove `BoardObservation` from the generic
   schema layer or inject its schema explicitly.
2. Make runner-produced capability evidence falsifiable with launch-to-worker
   identity binding, canonical sandbox/path-policy digests, exact role/profile/proof
   bijection, per-arm event state machines, and evaluator-event binding to each
   arm's immutable decision digest. Offline replay must independently verify
   `reasonCorrectReject` and `oracleAcceptedCandidate`.
3. Correct recursive package-path comparison for valid nested structures and add a
   direct negative test for mutation of bytes in an already registered source.
4. Reconcile only the active current-state projections enumerated in the boundary.
   Do not rewrite historical records.

Preserve D01 behavior, visible assertions, candidate bytes, oracle, ground truth,
evaluation methodology, dependencies, Phase 0.5, and `SCALE_READY=false`. Do not
create BG-D02, run official/scored work, invoke Claude/live model/Chromium, commit,
push, or access anything outside the clean repository except the two approved safe
interfaces after successful local verification.

Verification is limited to compile, ordinary tests, and targeted non-scored D01
verification. Stop on the first deterministic verification failure for a separate
owner decision.
