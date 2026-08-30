# TRC-BG-D01-VERIFY-002 — bounded D01 verification instruction packet

Status: reviewed reconstruction of the source-task instruction scope.

## Trace identity resolution

The approved source boundary `SES-20260829-008` planned
`TRC-BG-D01-VERIFY-001`. After the source task ended, the first external capture
attempt was retained as an unused encoding failure. The repository owner then
authorized a new exact UTF-8 capture as `TRC-BG-D01-VERIFY-002`.

This packet does not rewrite the historical boundary. The replacement decision,
capture receipts, transport retries, and exact-source review are post-capture events
recorded separately in
`artifacts/trajectories/reviews/TRC-BG-D01-VERIFY-002-POST-CAPTURE.yaml`.

## Purpose

Independently verify the current unscored BG-D01 implementation, reproduction path,
evidence integrity, and hidden-oracle isolation without performing an official or
scored run.

## Required source context

Read the repository-local contracts and projections identified by
`SES-20260829-008`. Treat `docs/PROJECT_SPEC.md@1.1.0` as the sole normative product
semantics contract.

Do not use the blocked predecessor trajectory as source or evidence. Do not inspect
private context, sibling repositories, browser state, connected applications,
private MCP state, shared memory, or external paths.

## Authorized verification scope

After explicit repository-owner approval of `SES-20260829-008`, the source task was
authorized to perform only:

1. a repository-local read-only review of the current BG-D01 code and evidence;
2. `npm run compile`;
3. `npm test`;
4. `npm run task -- d01:verify`;
5. `npm run task -- d01:replay`;
6. `npm run task -- phase0.5:verify`;
7. `npm run task -- checksums:check`; and
8. `git diff --check`.

The source task had to stop at every deterministic failure. It could not repair a
failure, reconcile checksums, or restart the scope without a separate, narrow owner
authorization.

## Prohibited actions

- official or scored execution;
- product or evaluation changes without a separate owner checkpoint;
- model, Claude, Codex CLI, Chromium, browser, or network execution;
- access outside the clean repository root;
- trace capture from inside the source task;
- commit or push.

## Required outcome

Report the complete bounded verification result, including failures, stopped
commands, owner-authorized retries, final checks, limitations, and unchanged
prohibitions. The task result is evidence for the unscored D01 vertical slice only;
it is not an official benchmark result.
