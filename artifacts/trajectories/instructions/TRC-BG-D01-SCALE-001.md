# TRC-BG-D01-SCALE-001 — D01 Scale-Readiness Corrections

## Session and authorization

- Session boundary: `artifacts/trajectories/session-boundaries/SES-20260830-001.yaml`
- Coding agent: `COD-CODEX-008`, Codex Desktop
- Purpose: implement only the approved BG-D01 scale-readiness corrections before a repeated D01 checkpoint.
- Starting point: branch `impl/beyondgreen`, HEAD `f0418bc6051002d8d42ccf84822d2e1f2e25b02e`, inherited dirty D01 working tree.
- Human approval recorded at `2026-08-30T07:37:37Z`.

## Allowed work

Implement and test only the remediation items enumerated in `SES-20260830-001`:

1. fixture parameterization through `FixtureDescriptor`;
2. arm-visible, defect-agnostic `ProbePlan` derivation;
3. verifier-only isolation from the decision-owning parent until arm decisions finalize;
4. replay decision verification and evaluator-to-decision binding;
5. complete measured EV-009 fields;
6. measured-event execution-order and oracle-boundary claims with negative tests;
7. two post-decision observations with fail-closed nondeterminism handling;
8. reciprocal evaluator-denied-candidate evidence;
9. code-owned arm-visible manifest binding;
10. one source of truth for the five visible assertions;
11. bounded JSON/HTML divergence counterexample;
12. trace, reproduction, compile-scope, and preflight projection corrections; and
13. a reviewed implementation trajectory with a decision-to-evidence map.

## Hard prohibitions

- No official or scored run.
- No live model, Chromium, browser, connected app, private MCP, shared memory, sibling repository, or external workspace access.
- No BG-D02 or other fixture work.
- No commit or push.
- External access is limited to the approved safe scanner-read and raw-trace interfaces.
- Do not change Phase 0.5, add a dependency/runtime/container policy, or claim cross-platform `K=0` without separate owner approval.

## Trace capture contract

For each decision, preserve the concern, repository evidence, mapped requirement, hypothesis, exact edit, exact verification command, result, failure/retry, and keep/revise/defer decision. The final reviewed layer must map every retained implementation decision to trace evidence and test evidence. The Codex Desktop native Markdown export is the permitted immutable source fallback if no raw internal export is available; it must be captured through the approved external raw-trace interface and reviewed before indexing.
