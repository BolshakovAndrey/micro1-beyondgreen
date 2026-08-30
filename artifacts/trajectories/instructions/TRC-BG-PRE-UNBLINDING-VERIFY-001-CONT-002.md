# TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-002 — Repeated read-only verification

Repeat the SES-20260830-016 verification from the beginning on exact HEAD
`cb51e7de1e9908088dbef4dbeb29946d1edbc16b`. Do not modify any repository file.

The reviewed implementation subject is exactly these thirteen SES-015 paths:

1. `config/topic.yaml`
2. `docs/CONTROL_STATUS_RU.md`
3. `docs/EVALUATION.md`
4. `docs/PROJECT_SPEC.md`
5. `scripts/tasks/registry.ts`
6. `scripts/tasks/types.ts`
7. `artifacts/trajectories/reviews/BG-PRE-UNBLINDING-READINESS-CHECKPOINT_RU.md`
8. `artifacts/trajectories/session-boundaries/SES-20260830-015.yaml`
9. `scripts/d00-freeze-cardinality.ts`
10. `scripts/d00-pre-unblinding-entrypoint.ts`
11. `scripts/d00-zip-rehearsal.ts`
12. `scripts/tasks/pre-unblinding.ts`
13. `tests/d00-pre-unblinding-entrypoints.test.ts`

Classify all SES-016/SES-017 instructions, boundaries, review records, checksum
projection, and the repository-local structural projector as later service artifacts,
not as part of the thirteen-file implementation subject. Preserve the initial failed
trace and CONT-001 as retry records only.

Read `AGENTS.md` and every mandatory contract named there in full. Review the exact
thirteen-file diff and confirm it changes no candidate, oracle semantics, visible
assertion, frozen behavior, scoring, evaluation methodology, ground truth,
development/held-out membership, or existing frozen candidate/oracle hash.

Run only this read-only verification sequence:

1. Check exact HEAD and classify every changed/untracked path.
2. Run `git diff --check`; perform equivalent whitespace checks for untracked files
   without writing them.
3. Run `npm run compile`.
4. Run `npm test`.
5. Run `npm run task -- freeze:self-test`.
6. Run `baseline:verify`, `beyondgreen:verify`, `evaluation:run`, and `replay` only
   with `--evaluation-version eval-v1.1.0`.
7. Run `npm run task -- submission:rehearse` exactly once; it may create and delete
   only its temporary rehearsal directory and must not retain an archive or run
   record.
8. Run `npm run task -- checksums:check` and classify the expected mismatch caused by
   later uncommitted service/projector artifacts; do not write checksums.

Stop immediately on a source, frozen-surface, compilation, test, isolation,
cardinality, replay, rehearsal, archive-membership, or unexpected checksum finding.
Do not repair or retry.

Do not run repository preflight inside this verifier. Do not perform official/scored
execution, arm execution, unblinding, a live product-model call, Chromium, browser,
MCP, Claude, another agent, external-workspace inspection, publication, commit, or
push. Return a concise English report with exact commands/results, retry
classification, limitations, and a statement that the trace remains unpromoted.
