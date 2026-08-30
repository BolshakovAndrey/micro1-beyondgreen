# TRC-BG-D01-SCALE-004-CONT-005 — role-separated runtime composition

Continue the owner-approved BeyondGreen SCALE-004 work only inside the current clean
repository root. Read in full before acting:

1. `AGENTS.md`
2. `artifacts/trajectories/session-boundaries/SES-20260830-004.yaml`
3. `artifacts/trajectories/instructions/TRC-BG-D01-SCALE-004.md`
4. The current SCALE-004 compile/test stop checkpoints under
   `artifacts/trajectories/reviews/`
5. Only the minimum source surface already identified by the approved diagnosis:
   `src/d01/runtime.ts`, `src/d01/worker-bindings.ts`, `src/d01/engine.ts`,
   `src/d01/orchestrator.ts`, `src/d01/worker-runtime.ts`, the three D01 worker
   entrypoints, and the directly affected boundary-test file(s).

## Exact authorized correction

Fix the confirmed transitive-import isolation defect with the smallest coherent
role-separated composition:

- arm and candidate-observer entrypoints must load an injected fixture engine whose
  direct and transitive module graph contains no import from
  `evaluation/verifier-only/`;
- verifier bindings, including `evaluateCanonicalObservations`, must be imported and
  composed only by the evaluator entrypoint/runtime path;
- the parent orchestration may retain the complete engine needed after decisions are
  immutable, but arm/observer child composition must remain verifier-free;
- do not add verifier-only paths to arm/observer allowed-read policies and do not
  weaken physical oracle isolation;
- add or refine only minimal negative checks proving transitive verifier import/read
  denial for arm and observer, plus a positive check proving verifier-only access is
  available only to evaluator;
- add concise English JSDoc/comments explaining why role-specific composition is a
  security boundary rather than ordinary code organization.

Preserve the already-approved A1/A2/S1/S2/S3 implementation and keep A3/S4/P1/P2/D1
green. Do not change fixtures, candidates, oracle contents or semantics, visible
assertions, evaluation methodology, targets, denominators, dependencies,
`package-lock.json`, runtime policy, allowlist semantics, BG-D02, or `SCALE_READY`.
Avoid unrelated cleanup. Do not use Claude, Chromium, browser state, connected apps,
MCP resources, global memory, sibling repositories, external workspaces, or another
agent/model. Do not commit or push.

## Strict command sequence

After all edits are complete, execute commands strictly in this order and at most
once each:

1. `npm run compile`.
2. Only if compile passes, run only the directly affected targeted boundary test
   command, using the repository's existing test runner and exactly the relevant
   boundary test file(s). Do not run unrelated targeted tests.
3. Only if the targeted boundary tests pass, run `npm test` exactly once.

At the first nonzero result, stop immediately. Do not edit, retry, diagnose by
another product command, or continue to the next command. Never run `d01:verify`,
replay, demo, official/scored evaluation, preflight, formatter, dependency install,
or any command outside the sequence.

On failure, create only a concise complete natural-Russian stop checkpoint at
`artifacts/trajectories/reviews/BG-D01-SCALE-004-ROLE-SEPARATION-STOP_RU.md` with the
safe failure class, command, counts, causal stage, preserved exclusions, and exact
owner decision required. On complete PASS, create only
`artifacts/trajectories/reviews/BG-D01-SCALE-004-ROLE-SEPARATION-CHECKPOINT_RU.md` in
complete natural Russian. Record changed paths and security invariant, exact commands
and results, absence of retries, remaining `d01:verify` and trace-review gates,
`SCALE_READY=false`, and no commit/push.

Never disclose or persist machine-specific absolute paths, environment-variable
values, external paths, raw trace payload, secrets, private denylist terms, or hidden
oracle contents. JSONL stdout and stderr are captured by the unchanged approved
automatic safe transport; do not use Copy as Markdown or any manual export.
