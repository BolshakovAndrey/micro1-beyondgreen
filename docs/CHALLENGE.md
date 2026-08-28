# Final Challenge Contract — Agentic Workflows Hackathon

Status: authoritative kickoff instructions  
Published: 2026-08-28  
Verified: 2026-08-28  
Official PDF: [`evidence/micro1-first-hackathon-instructions.pdf`](evidence/micro1-first-hackathon-instructions.pdf)

This document turns the official kickoff PDF into an implementation contract. The
official PDF remains the primary source. Public organizer clarifications published
after kickoff override this transcription where they conflict.

## Challenge

Choose a **specific, meaningful problem you understand** and use agents to solve it.
Provide clear evidence that the solution improves how the task is handled today. The
result should be practical and useful enough that a real person would want to use it.

Every proposal must answer four questions:

1. Who has this problem?
2. What bottleneck makes it worth solving?
3. Does the agent solve it well?
4. Can another person reproduce the result?

## Agent design standard

Use whichever capabilities materially help the chosen problem: context, tools,
memory, verification, specialized skills, or multi-agent orchestration. Judges care
about whether each design choice improves reliability and outcome quality.

**Purposeful choices matter more than the number of components.** Do not add agents,
memory, tools, or orchestration without evidence that they address an observed
failure, bottleneck, or quality requirement.

## Baseline contract

Create a simple but reasonable baseline representing how the task could be handled
before the advanced workflow. Examples from the official instructions include:

- one direct prompt with basic instructions;
- one general-purpose agent with basic tools;
- a simple script or template; or
- the current manual process.

The comparison must be fair:

- baseline and final solution receive the same task and evaluation cases;
- meaningful resource differences must be disclosed;
- the final comparison measures the total improvement;
- the changelog explains which individual changes produced that improvement.

## Evaluation contract

Define the evaluation **before** optimizing the solution.

1. Select one primary metric that reflects success for the intended user.
2. Define what a good final result looks like for that user.
3. Use the same evaluation cases for baseline and final solution.
4. Share the complete results, including failures and negative results.
5. Use **10 or more cases** when the task allows it.
6. Include at least one challenging case and explain what it revealed.
7. Record human time per task and cost per task when they matter to the value claim.
8. If a conventional metric is a poor fit, define a clear scoring rubric before the
   run and propose it for the judges to use.

Recommended comparison table:

| Metric | Simple baseline | Agent solution | Change |
| --- | ---: | ---: | ---: |
| Primary outcome | TBD | TBD | TBD |
| Human time per task | TBD | TBD | TBD |
| Cost per task | TBD | TBD | TBD |

No score may be claimed without traceable evidence.

## Improvement Changelog contract

Start with the baseline and add one entry for every important experiment, including
experiments later removed. Use the same evaluation method whenever possible.

| Stage | What was tried and why | Evidence | Decision / learning |
| --- | --- | --- | --- |
| Baseline | Basic approach | Baseline result | Starting point established |
| Iteration | Change addressing an observed issue | Comparable result | Kept, revised, or removed |
| Final | Combination of changes that worked | Final result | Main contribution identified |

Each entry must answer:

- What was tried?
- Why was it tried?
- What evidence resulted?
- What changed next?
- If removed, what did the failed experiment teach?

## End-to-end quality standard

The solution must complete a realistic, self-contained execution and produce a final
result the intended user can actually use. The finish quality should be something a
person would sign their name to, not an obvious AI-generated draft.

## Final deliverables

1. **Complete solution code and Improvement Changelog**
   - full project and everything required to run it;
   - instructions that shape every agent;
   - README defining the user, bottleneck, and practical value;
   - evidence-linked entry for every meaningful iteration;
   - main failure mode and hot take.
2. **Reproduction guide**
   - clean-environment setup;
   - exact commands for baseline, final solution, and evaluation;
   - required data and expected output;
   - relevant versions, approximate runtime, and cost.
3. **Solution video, maximum five minutes**
   - problem and baseline;
   - one realistic execution from start to finish;
   - final comparison and short changelog;
   - highest-contributing change;
   - one removed experiment.
4. **Agent trajectories**
   - representative trajectory for every agent used;
   - agent instructions, actions, and tool responses;
   - feedback that shaped the next step;
   - retries and human checkpoints.

The participant reminder additionally says the source code and coding-agent traces
must be packaged in one ZIP, and the video link must be accessible without requesting
permissions.

## Ground rules

1. Existing tools and components may be used.
2. Clearly disclose what existed before the competition and what was added.
3. Follow licenses and service terms.
4. Sandbox or simulate consequential actions and require human approval before them.
5. Add a qualified human reviewer when the solution could significantly affect a
   person.
6. Choose a legal, ethical use case and handle people and data responsibly.
7. Use only shareable information; public or synthetic data are preferred, and
   approved anonymous data is acceptable.
8. Keep credentials and private information outside the submission.
9. Connect every result claim to submitted evidence.
10. Give judges enough access to run the project and reproduce the main result.

## Published examples are illustrative, not assigned tracks

The appendix gives three examples:

- evaluating the quality/value of a code repository;
- candidate evaluation with qualified human review and synthetic/approved data; and
- cross-episode podcast translation consistency.

These examples demonstrate how to define user, bottleneck, agent value, evaluation,
and reproducibility. They do not restrict the project to those domains.

## Explicit unknowns and non-requirements

The kickoff PDF does **not** prescribe:

- a specific industry or use case;
- a starter repository;
- a programming language or framework;
- a fixed dataset;
- organizer-provided acceptance tests;
- a mandatory agent framework or number of agents; or
- a fixed primary metric.

These choices must be made deliberately and justified with user value, evaluation
quality, reproducibility, safety, and the published scoring rubric.

## Pre-build decision gate

Do not start implementation until the proposed idea has:

- [ ] one clearly defined user;
- [ ] one painful, frequent, or costly bottleneck;
- [ ] one realistic end-to-end workflow;
- [ ] one fair baseline;
- [ ] one primary metric defined before evaluation;
- [ ] at least 10 feasible evaluation cases, including one challenging case;
- [ ] a credible source of public, synthetic, or approved data;
- [ ] an explanation of why an agent is necessary and which capabilities matter;
- [ ] a clean-environment reproduction strategy;
- [ ] a trajectory-capture strategy for every coding agent;
- [ ] safety, privacy, licensing, and human-review boundaries.

