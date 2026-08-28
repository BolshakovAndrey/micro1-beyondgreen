---
name: claude
description: Invoke the local Claude CLI with the latest Opus alias requested as Opus 5 as an independent read-only reviewer for this micro1 project. Use only when the user explicitly says "клод", "claude", "$claude", "позови клод", or otherwise explicitly asks for a Claude/Opus review; do not use for ordinary review or implementation.
---

# Claude Opus 5 Reviewer

Use Claude only as an external reviewer. Codex owns context selection, verifies every
actionable claim, and decides what to adopt. Claude must never implement changes.

## Before disclosure

1. Read `AGENTS.md` and `docs/HACKATHON_RULES.md` in full. At kickoff, also read the
   final problem PDF, starter constraints, acceptance tests, and official
   clarifications.
2. Define the exact review decision. Separate observed evidence from hypotheses.
3. Remove credentials, tokens, cookies, private data, personal data, and unrelated
   client material. Claude CLI is an external-model disclosure boundary.
4. Do not send the whole repository by default. Select the smallest sufficient set of
   paths, diff excerpts, test/evaluation results, changelog entries, and trajectories.

## Prepare the review packet

Read [the context contract](references/context-contract.md) and create a task-scoped
prompt under a temporary directory. For a code change, include the relevant diff in
the prompt because Claude has no Bash or Git tool. For a whole-project rubric audit,
list the exact paths Claude should inspect with Read/Glob/Grep.

Always require Claude to assess both:

- the qualification gate before assigning any score; and
- the weighted judging rubric with evidence-backed points and explicit unknowns.

## Invoke Claude

Run from the project root:

```bash
.agents/skills/claude/scripts/run-review.sh /absolute/path/to/review-prompt.md
```

To preserve the raw response in an explicitly chosen artifact location:

```bash
.agents/skills/claude/scripts/run-review.sh \
  /absolute/path/to/review-prompt.md \
  /absolute/path/to/claude-review.txt
```

The wrapper intentionally uses a fresh, non-persistent, non-interactive session with
`--model opus` (the official CLI alias for the latest available Opus), maximum effort, and
only `Read`, `Glob`, and `Grep`. Do not weaken its flags or call Claude with Edit,
Write, Bash, browser tools, MCP servers, resumed sessions, or permission bypasses.

If network sandboxing blocks the command, request normal execution approval and retry
the exact same wrapper command. Preserve the failure output.

On the first successful authenticated run, inspect the returned CLI metadata or model
report and verify that `opus` resolves to the requested Opus 5. If the account exposes
a different model, stop and report the mismatch instead of silently accepting it or
guessing an undocumented full model identifier.

## Reconcile the review

Verify every finding against the source and evidence. Report separately:

1. Claude's verdict and findings.
2. Codex's verification or rejection of each actionable finding.
3. The accepted actions, remaining unknowns, and required measurements.

The review does not authorize edits, commits, pushes, deployments, database access,
or any other mutation.
