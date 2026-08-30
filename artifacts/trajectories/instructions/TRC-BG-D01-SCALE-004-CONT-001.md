# TRC-BG-D01-SCALE-004-CONT-001 — owner-authorized compile correction

Continue the owner-approved BeyondGreen SCALE-004 work inside the current clean
repository root. This is a bounded continuation after the first deterministic
failure recorded in
`artifacts/trajectories/reviews/BG-D01-SCALE-004-STOP-CHECKPOINT_RU.md`.

Read in full before acting:

1. `AGENTS.md`
2. `artifacts/trajectories/session-boundaries/SES-20260830-004.yaml`
3. `artifacts/trajectories/instructions/TRC-BG-D01-SCALE-004.md`
4. `artifacts/trajectories/reviews/BG-D01-SCALE-004-STOP-CHECKPOINT_RU.md`
5. The minimum repository-local source/type surface needed to understand only the
   seven recorded TypeScript errors in `src/d01/orchestrator.ts`.

The repository owner authorizes exactly this work:

- correct only the seven existing TypeScript errors in the generic runtime contract;
- five concern loss of the exact arm type while constructing observer/evaluator
  execution slots after injecting `FixtureEngineBindings`;
- two concern the generic arm-visible/verifier package-binding type lacking fields
  required by the existing `PackageBinding`;
- execute `npm run compile` exactly once after the correction.

Do not run compile before the correction is complete. Do not run `npm test`,
`d01:verify`, replay, demo, preflight, formatters, dependency installation, or any
other product command. Do not modify dependencies, `package-lock.json`, runtime
policy, fixtures, candidates, oracles, visible assertions, evaluation methodology,
targets, denominators, BG-D02, A3, S4, P1, P2, D1, or `SCALE_READY`. Do not use
Claude, Chromium, browser state, connected apps, MCP resources, global memory,
sibling repositories, external workspaces, or another agent/model process. Do not
commit or push.

Preserve all inherited work and avoid unrelated cleanup. If the single authorized
`npm run compile` fails, stop immediately without any further edit or retry and
update the Russian stop checkpoint with the safe failure class and exact owner
decision needed. If it passes, write
`artifacts/trajectories/reviews/BG-D01-SCALE-004-COMPILE-CHECKPOINT_RU.md` in complete
natural Russian. Record the seven-error correction, the one compile result, absence
of retries/tests, unchanged exclusions, remaining unverified A1/A2/S1/S2/S3 work,
and that `SCALE_READY=false`, commit and push remain unchanged.

Never print or persist machine-specific absolute paths, environment-variable values,
external paths, raw trace payload, secrets, or private denylist terms. Your JSONL
stdout and stderr are captured externally through the approved safe transport.
