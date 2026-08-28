# Clean-Room and NDA Boundary

**Status:** blocking preflight contract  
**Applies from:** before the first product specification, fixture, spike, or agent run  
**Scope:** repository, prompts, tool calls, traces, logs, screenshots, video, and ZIP

## 1. Purpose

The project is motivated by general professional experience with React state
migrations, but the submission must be independently reproducible without employer or
client material. The project may transfer a publicly documented problem class and
general engineering knowledge. It may not transfer private implementation expression.

This policy is a qualification-gate control for originality, privacy, trace
integrity, and reproducibility. A violation stops implementation or packaging.

## 2. Current boundary

The conversation used to select the topic contained private ideation context. It is a
control-plane conversation and is **not submission eligible**. Previous external
review outputs are also excluded. They must not be copied into prompts, trajectories,
reports, screenshots, the video, or the final ZIP.

The next product-development conversation must begin fresh with only:

- the official challenge documents;
- the topic-independent artifact and clean-room contracts;
- public source references;
- independently written synthetic specifications; and
- repository files created inside the clean implementation branch.

## 3. Permitted source classes

- Official hackathon instructions and public organizer clarifications.
- Public React and selected signals-library documentation.
- Public issue reports, papers, articles, and redistributable open-source examples,
  with URL, access date, author/project, and license recorded.
- Original synthetic behavior specifications written before fixture code.
- General professional knowledge expressed as abstract failure classes or engineering
  judgment, without internal names, structures, or implementation details.

## 4. Prohibited source classes

- Employer or client source, tests, fixtures, data, screenshots, logs, traces, diffs,
  commits, branches, tickets, documentation, or architecture diagrams.
- Internal product, module, class, hook, API, domain, repository, path, or task names.
- Translated, renamed, paraphrased, or structurally mirrored private artifacts.
- A private signals primitive, its API shape, or its adaptation layer.
- The current private ideation conversation or unreviewed external-review output.
- Credentials, personal information, customer information, or production data.

Changing nouns is not clean-room authorship. The submitted expression must have an
independent origin.

## 5. Agent access contract

Every coding or solution agent must receive a task-scoped context packet and the
following effective boundary:

1. Work only under the clean hackathon repository root.
2. Do not add external workspaces, sibling repositories, home-directory search roots,
   browser sessions with private state, or private MCP resources.
3. Do not ask the user to paste private source or tests.
4. Use only paths explicitly listed in the task packet.
5. Treat an import or error that points outside the repository as a stop condition,
   not permission to inspect the target.
6. Produce changes only in the assigned clean branch or sandbox.

A branch is version-control isolation, not confidentiality isolation. Tool path
allowlists and context selection provide the confidentiality boundary.

## 6. Synthetic fixture derivation protocol

Each fixture must pass these steps in order:

1. **Public anchor:** record at least one public source for the failure class.
2. **Neutral domain:** select a domain unrelated to any employer/client workflow.
3. **Behavior first:** write user actions, observable outputs, invariants, and the
   hidden failure in prose before writing implementation code.
4. **Freeze:** assign a fixture ID and hash the behavior specification before agent
   optimization begins.
5. **Fresh implementation:** implement from the frozen prose specification using a
   public, licensed signals library and a deliberately simple architecture.
6. **Provenance entry:** record author/agent, model, date, public anchors, license, and
   attestation that no prohibited source was used for the submitted expression.
7. **Contamination review:** run the generic scanner with the external local-only
   private denylist supplied through `MICRO1_PRIVATE_DENYLIST`, then perform human
   review before the artifact becomes submission eligible. Never print the variable's
   value.

If a fixture cannot be justified from public sources without private knowledge, it is
removed. It is not generalized, renamed, or rewritten.

## 7. Honest disclosure

The project must not claim that private code was never seen during the author's
career or during early ideation. The accurate statement is:

> No employer/client code or artifacts are included in the submission or used as the
> source of submitted fixtures. Submitted implementations are independently authored
> from frozen behavior specifications and recorded public sources.

This statement remains subject to final human and, where appropriate, employer/legal
review. This policy is an engineering provenance control, not legal advice.

## 8. Contamination response

When a scanner or reviewer finds potentially private material:

1. Stop the affected task.
2. Quarantine the file or trace outside the repository.
3. Record only the finding category and disposition in the public log; do not copy the
   sensitive term into repository history.
4. Determine whether the artifact can be independently recreated from its public
   specification in a fresh clean session.
5. Prefer recreating the artifact over editing a contaminated trace.
6. Require human approval before returning the artifact to submission scope.

No automated redaction can by itself clear an artifact for release.
