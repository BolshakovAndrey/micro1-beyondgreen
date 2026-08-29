# Clean trajectory capture dry-run

- Session: `SES-20260828-001`
- Performed at: `2026-08-28T19:02:10Z`
- Policy: `docs/TRACE_POLICY.md`
- Result: **PASSED**

## Safe checks performed

- Bound the denylist and raw-trace locations through their environment-variable names.
- Did not print or persist any environment value.
- Did not inspect shared memory, browser state, connected apps, sibling repositories,
  or any path outside the clean repository.
- Wrote a 119-byte synthetic canary to the external raw-trace layer, read it back,
  and verified its digest.
- Did not create a fallback raw trace inside the worktree.

## Judge-facing record

- Category: `external_raw_trace_canary`
- Environment variable: `MICRO1_PRIVATE_TRACE_DIR`
- SHA-256: `522aeeb01e2bc611a755b3ef047b56c3566c9b94629f4431e05390d48454e884`
- Outside repository: `true`
- Write/readback verified: `true`
- Raw path disclosed: `false`

This canary validates capture mechanics only. It is not a representative coding-agent
trace and receives no trajectory-coverage credit. The current authoring transcript is
excluded by category `prohibited_internal_identifier_in_prompt`; the identifier is
not recorded here or elsewhere in the repository.

## Compensating controls

Browser, connected-app, and private-MCP capabilities are exposed but unauthorized.
No such tool was invoked. The only outside-root accesses were the scanner-only
denylist read and the raw-trace canary write/readback. Capability exposure alone is
recorded as a risk, not as evidence that external state was available or inspected.
