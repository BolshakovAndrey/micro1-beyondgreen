# TRC-BG-D02-D04-INTEGRATION-001-CONT-013 — checkpoint-readiness preparation

Execute the owner-authorized preparatory continuation
`TRC-BG-D02-D04-INTEGRATION-001-CONT-013` inside the current isolated BeyondGreen
worktree under `SES-20260830-009`. Use only repository-local state. Do not inspect
the primary checkout or external state, and do not print absolute machine paths or
environment values.

Read `AGENTS.md` and every mandatory repository contract and current projection it
names in full before acting. Then perform exactly this scope:

1. In
   `artifacts/trajectories/reviews/TRC-BG-D02-D04-INTEGRATION-001-CONT-012-RESULT_RU.md`,
   correct only the erroneous suitability classifications for
   `TRC-BG-D02-D04-INTEGRATION-001` and `CONT-001` through `CONT-006`. Each must be
   classified as suitable for technical/owner review while honestly preserving the
   recorded stop reason. Keep `CONT-007`, `CONT-009`, and `CONT-012` pending trace
   review; keep `CONT-008` suitable; keep `CONT-010` and `CONT-011` unsuitable.
   Do not change any other factual statement in that card.
2. Validate that the card change is limited to the seven intended matrix rows and
   that no other existing line in the card changed.
3. Check the syntax of every current repository JSON and YAML artifact using the
   existing local parsers, without external access or semantic rewriting. Report
   counts and failures without printing sensitive values.
4. Run `git diff --check`.
5. Deterministically reconcile the checksum projection only after all currently
   present instruction/result/stop cards, including the CONT-013 instruction and
   readiness card, are present. Run the checksum check and leave the repository in
   a state where the final checksum check passes. Account for the readiness-card
   sequencing: if necessary, perform an initial reconciliation, create the final
   card, and then perform one final reconciliation/check without modifying any
   checksum-covered file afterward.
6. Create a complete natural-Russian checkpoint-readiness report for CONT-013. It
   must include exact commands, safe validation evidence, the exact complete list
   of changed/untracked repository-relative files in the current integration
   worktree, remaining risks, readiness status, confirmation that `actual_traces`
   was not changed for promotion, and this proposed commit message exactly:
   `feat(Evaluation):[BeyondGreen] Integrate D02-D04 development fixtures`
   Do not perform the commit.
7. Do not run either safe preflight, full tests, compile, official/scored evaluation,
   Claude, Chromium, live model, browser/private MCP, commit, or push. Stop on the
   first unexpected failure. Do not launch another Codex CLI or retry.
8. Keep code, JSDoc, and comments in English. All owner-facing reporting must be
   complete natural Russian.

Hard prohibitions: any safe-preflight invocation; `actual_traces` promotion or
change; primary-checkout or external-state access; official/scored run; Claude;
Chromium; live model; browser/private MCP; commit; push; a second nested Codex CLI;
or any trajectory beyond `CONT-013`.
