# Claude Review Context Contract

Create one focused prompt per review. Do not rely on Claude's conversation history;
every invocation is fresh and non-persistent.

## Required context

Every prompt must contain:

1. **Review mode:** `change-review`, `rubric-audit`, or `diagnosis-review`.
2. **Exact decision:** the concrete question Claude must answer.
3. **Authority order:** final problem PDF and official clarifications, then
   `AGENTS.md`, then `docs/HACKATHON_RULES.md`.
4. **Observed evidence:** relevant paths and line ranges, diff excerpts, commands
   already run, exact outputs, metrics, costs, runtimes, and failure traces.
5. **Hypothesis/proposal:** explicitly separated from observed facts.
6. **Scope exclusions:** files, systems, or questions Claude must not evaluate.
7. **Sensitive-data statement:** confirm that the packet contains no credentials,
   private information, or unrelated client data.

For change reviews, paste the relevant `git diff --no-ext-diff --unified=80` output or
an equivalent exact diff into the prompt. Claude's tool allowlist intentionally has no
Bash, so a mere instruction to run `git diff` is insufficient.

For rubric audits, provide the exact artifact paths for the baseline, advanced
solution, evaluation harness/results, Improvement Changelog, README/reproduction
guide, tests, and representative agent trajectories. Missing artifacts must remain
`UNKNOWN`; Claude must not infer credit without evidence.

## Prompt template

```text
You are an independent, read-only reviewer for the micro1 Frontier Engineering
Challenge 2026. Do not edit files, run commands, access the network, or propose work
outside the stated scope.

REVIEW MODE
<change-review | rubric-audit | diagnosis-review>

EXACT DECISION
<one concrete question>

AUTHORITATIVE CONTEXT — READ IN THIS ORDER
1. <final problem PDF / official clarifications, when available>
2. AGENTS.md
3. docs/HACKATHON_RULES.md
4. <task-specific source and evidence paths>

OBSERVED EVIDENCE
<facts, diff, test/eval commands and exact results, measurements>

HYPOTHESIS OR PROPOSED CHANGE
<clearly labelled hypothesis; write NONE if this is an audit>

SCOPE EXCLUSIONS
<explicit exclusions>

DATA DISCLOSURE
This packet contains no credentials, tokens, private information, personal data, or
unrelated client material.

REQUIRED RESPONSE
1. Verdict: PASS, PASS_WITH_CONCERNS, or FAIL.
2. Qualification gate: PASS, FAIL, or UNKNOWN for eligibility, completeness,
   integrity/originality, agent traces, and reproducibility. A gate failure blocks a
   numeric score.
3. Findings ordered by severity. For each: severity, evidence path/line or quoted
   packet evidence, impact, and minimal corrective action. Distinguish observation
   from inference.
4. Rubric table: evidence-backed points for Problem & User Value /15, Agent Solution
   & Engineering /30, End-to-End Quality /20, Measured Improvement /15,
   Reproducibility /15, and Hot Take /5. Use UNKNOWN where evidence is absent; do not
   award speculative credit.
5. Alternative explanations or invalid assumptions.
6. Regression, safety, privacy, licensing, provenance, and reproducibility risks.
7. Exact additional tests, measurements, or artifacts required before acceptance.
8. Strongest aspect, weakest aspect, and the single highest-leverage next action.
```

## Selecting evidence

- Prefer source paths and exact outputs over summaries.
- Include only trajectories relevant to the reviewed decision.
- Include negative results and removed experiments when they affect the conclusion.
- State when tests were not run. Never describe an unexecuted check as passing.
- If the prompt would become excessively large, split it into separate decisions
  rather than omitting the qualification gate or rubric contract.

