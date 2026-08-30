# TRC-BG-D01-DOCS-001-CONT-001 — four bounded documentation findings

Work only inside the clean repository root under owner-approved boundary
`SES-20260830-005`. This is a documentation-only continuation of
`TRC-BG-D01-DOCS-001`.

Correct exactly these four documentation-audit findings and nothing else:

1. Add substantive English JSDoc to the exported declaration at
   `scripts/d01-arm-worker.ts:11`.
2. Add substantive English JSDoc to the exported declaration at
   `scripts/d01-candidate-observer-worker.ts:11`.
3. Add substantive English JSDoc to the exported declaration at
   `scripts/d01-evaluator-worker.ts:17`.
4. Strengthen the short English JSDoc for the exported declaration currently at
   `src/d01/schemas.ts:387` so it explains the runtime contract rather than syntax.

Preserve every executable token, runtime behavior, API shape, test, fixture,
candidate, oracle, methodology, dependency, target, and process policy. Do not edit
any other path or declaration. Do not run audit, compile, tests, verification,
replay, manifests, checksums, preflight, model, browser, Chromium, Claude, commit, or
push commands; the coordinator will perform verification serially after capture.

Preserve the inherited dirty tree. Never print machine-specific absolute paths,
environment values, private terms, secrets, raw trace paths, or raw payloads.
