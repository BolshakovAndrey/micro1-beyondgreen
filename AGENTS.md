# Project Instructions

Before planning, implementing, reviewing, or documenting any hackathon work, read all
of these contracts in full:

1. `docs/CHALLENGE.md`
2. `docs/HACKATHON_RULES.md`
3. `docs/CLEAN_ROOM_POLICY.md`
4. `docs/TRACE_POLICY.md`
5. `docs/PREFLIGHT_CHECKLIST.md`

After normative v1.1 receives final human approval, every implementation, review,
evaluation, or packaging task must also read these current product projections before
acting:

1. `docs/PROJECT_SPEC.md` (sole normative product-semantics contract)
2. `docs/EVALUATION.md`
3. `config/topic.yaml`

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

## Owner-facing language

- Judge-facing and machine-readable artifacts may remain in English.
- Every report, review card, status update, or approval packet intended for the
  repository owner must have a complete, natural Russian translation. A mixture of
  Russian sentences with untranslated English working vocabulary is not a Russian
  translation.
- Keep English only for exact commands, paths, code identifiers, library names, and
  official product names. Explain every unavoidable English term in Russian on its
  first use.
- Before requesting owner approval, independently check that the Russian companion
  explains the result, evidence, retries, risks, and approval scope without requiring
  the owner to read the English artifact.

## Code documentation

- Document public functions, exported types, important modules, and non-obvious
  contracts with concise English JSDoc.
- Add short English comments to key implementation fragments when a reviewer needs
  context about an invariant, design decision, security or privacy boundary,
  failure mode, or deliberately constrained behavior.
- Comments must explain why the code is written this way or what contract it
  protects. Do not narrate obvious syntax or comment every line.
- Keep documentation sufficient for an independent reviewer to understand the
  architecture, critical data flow, hidden-oracle boundary, and correctness risks
  without making the source noisy.

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

## Git commit convention

- Write commit messages in English.
- Use the format `type(Scope):[Domain] Imperative summary`.
- The bracketed value is a product or business domain, not a ticket ID or repository
  name. Use `[BeyondGreen]` for the current hackathon product domain.
