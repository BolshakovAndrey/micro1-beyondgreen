# micro1 Frontier Engineering Challenge 2026

Status: live; final challenge instructions preserved  
Verified: 2026-08-28  
Official page: <https://www.hackerearth.com/community/challenges/hackathon/micro1-frontier-engineering-challenge-2026/>

This document preserves the published rules, schedule, judging rubric, and the
engineering implications that must guide the project. The official problem PDF,
starter materials, constraints, acceptance tests, and public clarifications released
at kickoff take precedence if they conflict with this brief.

The maintained implementation contract for the final kickoff PDF is
[`CHALLENGE.md`](CHALLENGE.md).

## Current event status

- Kickoff and final-instruction release: **2026-08-28 15:00 UTC / 17:00
  Europe/Belgrade**.
- Submission deadline: **2026-08-31 18:00 UTC / 20:00 Europe/Belgrade**.
- Published duration: **3 days 3 hours**.
- The challenge is live and the official ten-page `Agentic Workflows Hackathon` PDF
  has been downloaded, extracted, and visually verified.
- The live page currently advertises a **$10,000 cash prize pool**, three selective
  awards, and up to 50 paid opportunities.

## Non-negotiable qualification gate

A submission is scored only after it passes all of the following checks:

- eligibility;
- completeness;
- integrity and originality;
- coding-agent trace availability and integrity;
- reproducibility.

A project that cannot be run or verified may be disqualified before rubric scoring.
Therefore, repository completeness, exact run commands, tests, trace evidence, and a
clean-environment reproduction path are release blockers, not optional polish.

## Published judging rubric (100 points)

| Criterion | Weight | What judges assess | Required project evidence |
| --- | ---: | --- | --- |
| Problem & user value | 15% | Solves a meaningful problem for a clearly defined user. Who experiences the bottleneck, and why does solving it matter? | README problem statement, intended user, bottleneck, value, and a realistic scenario. |
| Agent solution & engineering | 30% | Uses agents purposefully and is technically sound. Which design choices helped the agent solve the problem? | Agent architecture, instructions, tool contracts, safeguards, tests, representative trajectories, design rationale, and failure handling. |
| End-to-end quality | 20% | Completes a realistic, self-contained execution and produces a result the user can use. Would the intended user consider this high quality? | One complete realistic workflow, usable output, acceptance tests, and demo evidence. |
| Measured improvement | 15% | Demonstrates gains over a fair baseline and uses the changelog to connect each iteration to evidence. | Runnable baseline and advanced solution, fixed evaluation, metrics, results, and evidence-linked Improvement Changelog. |
| Reproducibility | 15% | Gives another person a clear path to run the solution and baseline and reach the main result from a clean environment. | Pinned versions, setup and exact commands, required data, expected output, runtime/cost, deterministic evaluation where possible. |
| Hot take / insights | 5% | Turns an observed failure mode into a practical lesson for building more reliable agents. | Main observed failure mode, evidence, and a concise practical lesson. |

### Tie-break order

1. Higher Agent Solution & Engineering score.
2. Higher Reproducibility score.
3. Higher Measured Improvement score.
4. Higher End-to-End Quality score.
5. Final panel review of documented evidence; judges' decision is binding to the
   extent permitted by law and the official terms.

## Current authoritative schedule

The August 27 reminder email and the live HackerEarth header agree on the following
event window. Europe/Belgrade is CEST (UTC+2) during the event.

| Stage | UTC | Europe/Belgrade | What happens |
| --- | --- | --- | --- |
| Hackathon kickoff | Fri, Aug 28, 15:00 | Fri, Aug 28, 17:00 | Event opens; problem document and starter materials are released. |
| Submission deadline | Mon, Aug 31, 18:00 | Mon, Aug 31, 20:00 | Submissions close. The reminder email requires one source-and-traces ZIP plus an accessible video link. |

### Superseded schedule warning

The pre-event timeline captured on August 25 listed a submission deadline of
2026-08-30 23:59 UTC and later validation/judging milestones. That deadline is
superseded by both the August 27 participant email and the live HackerEarth page.
Do not use the old `2026-08-30 23:59 UTC` deadline for planning or submission.

The dates for office hours, validation, judging, and winner announcement from the old
timeline remain historical/unverified until the kickoff instructions or a newer
official communication confirms them.

## Eligibility and participation

- Participation is online, global, individual, and free; team size is one.
- Participants must be at least 18 at registration.
- Participation is unavailable where prohibited by law, sanctions, export controls,
  organizer restrictions, or platform restrictions.
- Each participant may register once and submit one final entry. Revisions are allowed
  until the deadline; only the latest complete submission is evaluated.
- At least six months of practical software-building experience or equivalent
  hands-on evidence is expected; professional employment is not required.
- Working engineers, founders, open-source contributors, competitive programmers,
  final-year or graduate students, and recent graduates may participate if they meet
  the experience requirement.
- micro1 employees, event administrators, judges, challenge creators/testers, and
  their immediate household members are ineligible for prizes.
- Prize or trace-acquisition recipients must be able to receive payment through the
  approved payout rail in their country.
- Identity, location, contact, and eligibility information must be accurate; duplicate
  or false registrations may be disqualified.

## Challenge and technology policy

- Coding-agent use is required. Tools must be disclosed and representative agent
  trajectories/traces must be submitted.
- Every valid entry must include both a simple baseline and an advanced solution.
- The advanced solution must show meaningful improvement in capability, reliability,
  efficiency, coverage, or engineering quality—not a cosmetic variation.
- Any programming language is allowed. Python, TypeScript, Java, C++, Go, and Rust are
  recommended, subject to the final problem PDF.
- Common ecosystem frameworks and libraries are allowed if the result remains
  reproducible and compliant with the final problem PDF.
- Participants use their own agent setup; API keys and model credits are not provided.
- The kickoff materials may prescribe the repository, runtime, dependency limits, API
  access, or testing environment for fair and deterministic judging.

## Required submission package

The August 27 participant email explicitly requires:

- one `.zip` file containing the source code and coding-agent traces from the agent
  used to build the project; and
- a project video uploaded to a reachable service, with a link that judges can open
  **without requesting additional permissions**.

The detailed package below remains the engineering contract published on the event
page and should be included even where the reminder email uses shorter wording.

### 1. Complete code and Improvement Changelog

Submit the full project and everything required to run it, including instructions that
shape each agent. The README must identify the intended user, their current bottleneck,
and why solving it matters. The clearly labeled Improvement Changelog must contain an
entry for every meaningful iteration and connect it to the evidence that guided the
next decision. End with the main failure mode and the hot take.

### 2. Reproduction guide

Write for a reviewer starting from a clean environment. Include exact setup and run
commands for the advanced solution, baseline, tests, and evaluation; required data;
expected output; relevant versions; and approximate runtime and cost.

### 3. Solution video (maximum five minutes)

Start with the problem and simple baseline. Show one realistic execution from start to
finish, the final comparison, and a brief changelog. Highlight the change with the
largest contribution and one experiment that was removed.

### 4. Agent trajectories

Provide representative trajectories for every agent used. They must be easy to follow
from agent instructions to final result and show tool responses, feedback that shaped
the next step, retries, and human checkpoints.

A valid entry must be timely, complete, original, policy-compliant, and reproducible,
and include the required repository, archive, tests, README, agent-use evidence, and
demo video.

## Rule book and safety constraints

- Existing tools/components are allowed, but clearly disclose what existed before the
  competition and what was added during it.
- Follow every tool/component license and service terms.
- Keep consequential actions in a sandbox or simulation and require human approval
  before they occur.
- Include a qualified human reviewer in any solution that could significantly affect
  a person.
- Choose a legal, ethical use case and handle people and data responsibly.
- Use only information that may be shared; public or synthetic data are preferred,
  and approved anonymous data is acceptable.
- Keep credentials and private information outside the submission and traces.
- Tie every result claim to submitted evidence.
- Give judges sufficient access to run the project and reproduce the main result.
- The Hackathon Participation Agreement states that micro1 owns submissions and may
  use them for AI-model training and evaluation. Review the accepted agreement before
  submitting any proprietary or third-party material.

## Engineering scorecard for every release candidate

Before considering a build submission-ready, answer all items with evidence:

- [ ] A clean environment can run the baseline, advanced solution, tests, and evaluation using exact commands.
- [ ] The baseline is fair and uses the same task/data/evaluation as the advanced solution.
- [ ] A realistic workflow completes end to end and returns a usable artifact/result.
- [ ] Metrics show a meaningful improvement, including limitations and negative results.
- [ ] Each major design choice has a technical rationale tied to observed evidence.
- [ ] Representative trajectories exist for every coding agent and include retries and human checkpoints.
- [ ] The Improvement Changelog links every meaningful iteration to evidence and a decision.
- [ ] Safety, privacy, licensing, provenance, and human-review requirements are satisfied.
- [ ] No credentials or private information appear in code, data, logs, traces, video, or archives.
- [ ] README and five-minute demo cover the user, baseline, execution, comparison, strongest change, removed experiment, failure mode, and hot take.

## Source record

- Official HackerEarth page, initially inspected 2026-08-25 and re-checked live at
  kickoff. The live header confirms the Aug 31 18:00 UTC deadline and $10,000 prize
  pool.
- Official ten-page kickoff PDF, preserved at
  [`micro1-first-hackathon-instructions.pdf`](evidence/micro1-first-hackathon-instructions.pdf)
  and transcribed into [`CHALLENGE.md`](CHALLENGE.md).
- Participant reminder email received 2026-08-27, preserved as a structured local
  source at [`2026-08-27-reminder-email.md`](evidence/2026-08-27-reminder-email.md).
- User-provided screenshots captured 2026-08-25 and preserved locally:
  [`judging-rubric.png`](evidence/judging-rubric.png),
  [`tie-break-order.png`](evidence/tie-break-order.png), and
  [`timeline.png`](evidence/timeline.png).
- The August 25 timeline screenshot is retained as historical evidence but its old
  submission deadline is superseded.
- This file is a faithful working transcription and engineering interpretation, not a
  substitute for the official Participation Agreement or kickoff problem PDF.
