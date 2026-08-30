# TRC-BG-D01-DOCS-001 — bounded TypeScript documentation task

Work only inside the current clean repository root and under the owner-approved
`SES-20260830-005` boundary. Read `AGENTS.md`, the complete mandatory contracts named
there, the boundary, and its Russian owner card before changing files. Do not access
any outside workspace, browser state, connected app, private MCP resource, global
memory, private denylist contents, or raw trace path.

## Objective

Bring exactly the 42 TypeScript files enumerated in
`SES-20260830-005.bounded_documentation_scope_after_explicit_human_approval.allowed_typescript_paths`
into compliance with the `AGENTS.md` code-documentation contract without changing
runtime behavior or public API shape. Work quickly and batch related edits.

Prioritize architecture-level module JSDoc and substantive JSDoc for exported/public
contracts, functions, types, and classes. Prioritize these files first:

- `src/d01/orchestrator.ts`
- `src/d01/engine.ts`
- `src/d01/capability.ts`
- `src/d01/capability-schemas.ts`
- `src/d01/schemas.ts`
- `src/d01/runtime.ts`
- `src/d01/worker-runtime.ts`
- `evaluation/arm-visible/BG-D01/contract.ts`
- `evaluation/verifier-only/BG-D01/canonical-driver.ts`

Add short English inline comments only where they explain `K=0`, physical oracle
isolation, decision immutability, process policy, replay integrity, or fail-closed
behavior. Group related simple aliases/helpers and Zod schemas under one meaningful
JSDoc block where appropriate. Do not narrate syntax, comment every alias, or inflate
the code with repetitive prose. Use `@param`, `@returns`, and `@throws` only when
they materially clarify a contract.

## Hard boundaries

- Documentation-only changes in the 42 allowed `.ts` files.
- Preserve all executable tokens, runtime behavior, API shape, tests, fixtures,
  candidates, oracles, methodology, dependencies, targets, and process policy.
- Do not modify manifests, evidence, checksums, projections, historical records, or
  any non-TypeScript file during authoring.
- Do not work on BG-D02+, invoke Claude, Chromium, a browser, connected apps, private
  MCP, a live product model, or an official/scored run.
- Do not commit or push.

## Required sequence and stop policy

1. Inspect the 42 allowed TypeScript files and perform the documentation-only edits.
2. Run a documentation audit over exactly those 42 files. Report totals for exported
   declarations, missing JSDoc, and comments that remain too short to explain a
   contract. Treat grouped documentation as valid only when the grouping is clear.
3. Run `npm run compile`.
4. Stop immediately on the first real audit or compile failure. Do not fix, retry,
   reconcile, or continue to later checks. Report the exact failure safely.
5. If both pass, stop and report the changed paths, audit evidence, compile result,
   and any residual documentation limitations. Do not run the later boundary-plan
   checks; the coordinating task will run them serially.

Preserve the inherited dirty tree. Do not revert or overwrite changes that predate
this trajectory. Your JSONL stdout is captured externally and must remain a faithful,
privacy-safe trajectory; never print machine-specific absolute paths, environment
values, private terms, secrets, or raw trace locations.
