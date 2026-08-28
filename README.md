# micro1 Frontier Engineering Challenge 2026

The challenge is live. The current submission deadline is 2026-08-31 18:00 UTC
(20:00 Europe/Belgrade).

Before making project decisions, read [the final challenge contract](docs/CHALLENGE.md)
and [the preserved rules, judging rubric, and schedule](docs/HACKATHON_RULES.md). The
qualification gate and rubric are treated as product requirements throughout
implementation.

The complete Russian translation of the official 10-page challenge brief is
available in [docs/MICRO1_INSTRUCTIONS_RU.md](docs/MICRO1_INSTRUCTIONS_RU.md).

The topic-independent contract for continuously collecting judge-ready evidence and
building the final submission package is defined in
[docs/SUBMISSION_ARTIFACTS_SPEC.md](docs/SUBMISSION_ARTIFACTS_SPEC.md).

Before opening the implementation branch or starting a product agent, pass the
[clean-room preflight](docs/PREFLIGHT_CHECKLIST.md). The binding NDA/provenance and
trace contracts are [docs/CLEAN_ROOM_POLICY.md](docs/CLEAN_ROOM_POLICY.md),
[docs/TRACE_POLICY.md](docs/TRACE_POLICY.md), and
[docs/PROVENANCE.md](docs/PROVENANCE.md).

```bash
npm test
npm run preflight:control
```

An independent Claude Opus reviewer is available through the project skill
`.agents/skills/claude`. Invoke it by explicitly saying `клод`, `claude`, or
`$claude`; its exact context and CLI contracts are stored inside the skill.
