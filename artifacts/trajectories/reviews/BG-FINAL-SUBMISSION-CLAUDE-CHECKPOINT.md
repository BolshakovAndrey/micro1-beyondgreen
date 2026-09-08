# BeyondGreen final submission — Claude Opus 5 checkpoint

**Review class:** independent read-only rubric audit  
**Reviewer:** Claude Opus 5 through the local `opus` alias  
**CLI:** Claude Code 2.1.251  
**Tools:** `Read`, `Glob`, and `Grep` only; no shell, network, browser, or writes  
**Prompt SHA-256:** `1545dc3738b99dbc2e00af9aa739bcc3df55bf095dc072a1ed3113c6bf9f30b7`  
**Raw response SHA-256:** `6e010164523449527835aebeb514be3e3c9fbdb49518dc0c0d4db6103d1587cc`  
**Codex reconciliation:** every actionable finding below was checked against repository
bytes before adoption.

## Verdict

- Current state: `PASS_WITH_CONCERNS`; eligible to submit and no qualification gate is
  blocked by a content finding.
- Forecast after mechanical gates: `PASS_WITH_CONCERNS`.
- Qualification after mechanical gates: `PASS`.
- Most-likely rubric score: `84/100`; conservative `75/100`; upside `92/100`.

## Qualification gate

| Gate | Verdict | Basis |
| --- | --- | --- |
| Eligibility | `UNKNOWN` | Age, registration, single-entry status, and payout rails are administrative and cannot be proved from repository bytes. Nothing in the repository contradicts eligibility. |
| Completeness | `PASS` | Code, 45-entry changelog, reproduction guide, accessible video links, and representative reviewed traces exist. |
| Integrity/originality | `PASS_WITH_CONCERNS` | Clean-room and provenance controls exist. The reason-correct causal narrative and package/config drift required correction. |
| Coding-agent traces | `PASS_WITH_CONCERNS` | Representative reviewed traces exist, but the central index required final-session reconciliation. |
| Reproducibility | `PASS` | Pinned Node/lockfile, stable Make targets, immutable evidence, offline replay, and clean-extraction rehearsal are present. macOS-only physical checks fail closed on Linux. |

No gate is `FAIL`, so numeric scoring is permitted.

## Findings

### F1 — High — reason-correct narrative did not match the production scorer

The prose definition described semantic identification of a frozen behavior class or
invariant family. Production evaluators instead lowercase the rationale, replace every
non-ASCII-alphanumeric run with `-`, and test literal containment of a verifier-owned
`behaviorClass` or `failedAction`; BG-D03 directly tests `derived-state`.

Immutable evidence demonstrates the distinction. BG-H02 cites
`BG-H02-INV-CURRENT-EPOCH` and accurately describes stale completion ordering but does not
contain `async-ordering` or `complete-r1`, so it receives `false`. BG-H04 cites
`BG-H04-INV-CONDITIONAL-LIFECYCLE`; that identifier happens to contain the expected
`conditional-lifecycle` token and receives `true`. The operational metric therefore gives
opposite credit to structurally comparable explanations because of token spelling.

The result `3/10` is honest and conservative and must remain unchanged. The accepted
correction is documentation only: record the lexical operationalization exactly and stop
describing all seven uncredited explanations as insufficiently specific. This turns the
weakness into a measurement-validity insight: a diagnostic metric that requires vocabulary
the agent was never shown partly measures the harness rather than the agent.

### F2 — High release-process finding — package membership ignored cleanroom config

`config/cleanroom.json` declared submission exclusions, while rehearsal and metadata used a
different six-path hard-coded set. Nine file members entered the PRE-CLAUDE RC1 contrary to
that declaration. `docs/CONTROL_STATUS_RU.md` and `docs/PREMORTEM_RU.md` were also outside
scanner traversal, so the claim that the entire archive membership had passed scanning was
not supportable. A targeted read found no credential, path, email, secret, or private data;
content risk was low but the release-control gap was real.

`docs/DISCLOSURES.md` also says `docs/CHALLENGE.md` and `docs/HACKATHON_RULES.md` are the
redistributable text projections intended to ship, contradicting their former exclusion.

Accepted correction: make both packagers consume one prefix-aware config contract, keep the
two scanner-ignored owner documents excluded, ship the redistributable challenge/rules text,
and add a regression test proving that no packaged path matches a configured exclusion.

### F3 — Medium — central trajectory index was stale

The index stopped at SES-20260830-012, omitted the 2026-08-31 boundaries behind the final
official evidence, omitted COD-CODEX-008 through COD-CODEX-012 from declared agents despite
their indexed traces, omitted two reviewed pre-unblinding traces, and understated Claude
checkpoint counts. The accepted correction is index reconciliation with explicit trace
dispositions; final verifier-bridge work is covered as owner-controlled boundary evidence,
not falsely promoted as a reviewed representative authoring trace.

### F4 — Medium — seven immutable rationales are Russian

Seven of 20 BeyondGreen arm rationales contain Russian text because the model answered under
the operator locale. They must not be translated after the decision became immutable. The
lexical scorer removes Cyrillic during normalization, but language is not the primary cause
of the `3/10` result: six of seven uncredited false-green rationales are English. Accepted
correction: disclose the language fact and its bounded measurement implication.

### F5 — Low — static-plan flags can be misread

RUN-002 `execution-plan.json` contains `officialOrScoredRun:false`,
`unblindingPerformed:false`, and `candidateExecutionAllowed:false` because it is the
non-executable static-preflight plan. The 40 immutable arm records and provenance are the
execution evidence. Accepted correction: explain this next to the reproduction path.

### F6 — Low — post-decision inventory drift needed its mitigation stated

POSTDECISION-004 records `inventorySha256Match:false` after owner-approved verifier repairs.
The repairs changed transcript cardinality and identity transport, not candidates, decisions,
oracle semantics, or scoring. The predeclared construction control still produced exactly
10/20 for status quo and the same 10/10 ground-truth split. Accepted correction: state this
argument next to the provenance disclosure.

### F7 — Low — command and platform wording drift

- `THIRD_PARTY_NOTICES.md` named a nonexistent `npm run audit:licenses` command instead of
  `node scripts/license-audit.ts`.
- Reproduction used `npm ci` while the stable Make target uses
  `npm ci --ignore-scripts`.
- README listed the macOS-only physical D01 demo before its platform warning.

Accepted correction: exact command and inline platform markers.

### F8 — Informational — no root project license

Third-party licensing is complete and audited. The repository has no root license for its
own code. The challenge rules do not make this a qualification gate, so no deadline-time
change is required.

### F9 — Informational — ignored rehearsal debug directory

An ignored directory existed under `tmp/`. Packaging excludes `tmp/`, so it cannot ship.
This is housekeeping, not a release blocker.

## Rubric forecast

| Criterion | Max | Conservative | Most likely | Upside |
| --- | ---: | ---: | ---: | ---: |
| Problem & User Value | 15 | 12 | 13 | 14 |
| Agent Solution & Engineering | 30 | 22 | 25 | 27 |
| End-to-End Quality | 20 | 15 | 17 | 18 |
| Measured Improvement | 15 | 11 | 12 | 14 |
| Reproducibility | 15 | 12 | 13 | 14 |
| Hot Take / Insights | 5 | 3 | 4 | 5 |
| **Total** | **100** | **75** | **84** | **92** |

The strongest area is the evidence architecture: reciprocal process denial, `K=0` by
execution order, before/after candidate hashing, duplicate captures, immutable decisions,
offline replay, and preservation of failed attempts. The main scoring cap is that the product
agent is one model call per candidate; most sophistication lives in the verification harness.

The weakest area was the story around the reason-correct metric. The highest-leverage action
was to retain `3/10` but document the lexical implementation and its validity limit exactly.

## Alternative explanations checked by Claude

- A deliberately strict lexical proxy is legitimate, but the documentation must call it
  lexical rather than semantic.
- Russian language is not the main explanation for the missed target.
- `reasonCorrectReject` is not arm-independent: production evaluators inspect the immutable
  decision verdict and rationale.
- Ground truth is computed by the frozen oracle at evaluation time; the post-decision repair
  argument therefore needs the unchanged construction control.

## Risk register after accepted corrections

| Domain | Residual status |
| --- | --- |
| Packaging regression | Controlled by one config-derived membership function and regression test. |
| Privacy | Raw traces and denylist remain external; scanner-ignored owner documents remain excluded. |
| Licensing | 54/54 dependency audit; own-code license remains informational. |
| Provenance | Inventory drift is disclosed with the unchanged construction control. |
| Trace coverage | Central index must include final boundaries and explicit eligibility dispositions. |
| Platform | Physical isolation remains macOS-only and fails closed; offline replay is cross-platform. |

## Required final mechanical gates

1. Compile and run the complete ordinary test suite.
2. Reconcile control and submission checksums from the accepted files.
3. Run control and implementation safe preflight.
4. Generate and verify submission metadata from configured membership.
5. Run a clean-extraction ZIP rehearsal and all documented no-model reproduction checks.
6. Create one final archive only after the checklist is complete and report its SHA-256.
7. Keep commit, push, upload, official execution, arm calls, and model calls owner-gated.

`QUALIFICATION_AFTER_MECHANICAL_GATES=PASS`  
`MOST_LIKELY_SCORE=84/100`
