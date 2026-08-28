# Project Instructions

Before planning, implementing, reviewing, or documenting any hackathon work, read all
of these contracts in full:

1. `docs/CHALLENGE.md`
2. `docs/HACKATHON_RULES.md`
3. `docs/CLEAN_ROOM_POLICY.md`
4. `docs/TRACE_POLICY.md`
5. `docs/PREFLIGHT_CHECKLIST.md`

Treat the qualification gate and the published 100-point judging rubric as product
requirements. Every meaningful implementation decision must be traceable to at least
one rubric criterion or to the final problem statement released at kickoff.

For every meaningful iteration:

1. Preserve a runnable baseline.
2. Record the hypothesis, change, evaluation command, evidence, and decision in the
   Improvement Changelog.
3. Keep representative coding-agent trajectories, including tool responses, retries,
   feedback, and human checkpoints.
4. Maintain exact clean-environment commands for the baseline, advanced solution,
   tests, and evaluation.
5. Never put credentials or private information in the repository or submitted traces.

## Clean-room access contract

For every agent task:

1. Work only under the clean hackathon repository root.
2. Do not add sibling repositories, home-directory roots, external workspaces,
   browser sessions with private state, or private MCP resources.
3. Do not request or accept employer/client source, tests, data, screenshots, traces,
   paths, identifiers, or internal documentation.
4. Use only the explicit paths and public sources listed in the task packet.
5. Treat imports, errors, or links pointing outside the clean root as stop conditions,
   not permission to inspect their targets.
6. Keep the private denylist and raw traces outside the worktree. Their environment
   variable values must never be printed, committed, logged, or submitted.

Stop immediately and request human review when a task encounters an external path,
private context, uncertain provenance/license, a fixture resembling remembered
private structure, hidden-oracle leakage, or a contamination finding that cannot be
resolved by independent recreation.

The current control-plane conversation is submission-ineligible. Product
specification and implementation must begin in a fresh task with an approved
`templates/SESSION_BOUNDARY.yaml` record.

The official problem PDF and public organizer clarifications override this file and
the pre-event brief where they conflict. `docs/CHALLENGE.md` is the maintained
implementation contract for the final kickoff PDF.

When the user explicitly says `клод`, `claude`, `$claude`, or asks to invite Claude
as a reviewer, use the project skill at `.agents/skills/claude/SKILL.md`. Claude is a
read-only external reviewer; Codex must select the minimum sufficient context and
verify every actionable finding before adopting it.
