# TRC-BG-D01-SCALE-002 — Decision-to-evidence map

**Boundary:** `SES-20260830-002`  
**Run class:** unscored development evidence only  
**Trace start:** owner approval recorded before the first product-code inspection  
**Inherited gate:** `D01_CHECKPOINT=PASS_WITH_CONCERNS`, `SCALE_READY=no`

**Owner gate update:** the additional intermediate Claude review is cancelled. This task stops after repo-local verification for owner-controlled capture. A separate coordination task owns any later Codex acceptance matrix and scaling approval. The separately approved future benchmark reduction is outside this scope and does not change the frozen evaluation methodology here.

## Pre-inspection requirement and risk matrix

| Decision | Confirmed concern | Contract mapping | Hypothesis | Required falsification | Initial disposition |
| --- | --- | --- | --- | --- | --- |
| `D01-SCALE2-DEC-001` | `FixtureDescriptor` feeds a materially D01-specialized engine | `FR-001`, `FR-004`, `FR-008`–`FR-010`, `AR-003`, `RUB-ASE`, `RUB-REP` | Schema factories and injected stage contracts can make one engine own orchestration, checks, reasoning, replay, and reporting while preserving D01 bytes and behavior | Test-only descriptor with non-D01 IDs/cardinalities must traverse the generic contracts without adding a fixture or oracle | inspect, then keep/revise |
| `D01-SCALE2-DEC-002` | Physical capability flags are parent-declared rather than independently evidenced | `FR-006`–`FR-008`, `NFR-002`, `NFR-005`, `EV-006`, `RUB-ASE`, `QG-ORIG` | Runner-emitted process identity and bounded capability/denial observations can be schema-validated and digest-bound before finalization | Missing, tampered, contradictory, or cross-process evidence and premature evaluator invocation must fail closed | inspect, then keep/revise |
| `D01-SCALE2-DEC-003` | Arm-visible package binding trusts a manifest list instead of complete directory enumeration | `FR-001`, `NFR-004`, `NFR-006`, `AR-003`, `RUB-REP`, `QG-REPRO` | Deterministic enumeration of the authorized root can bind the complete package and reject every unregistered or unsafe entry | Unlisted file, symlink, escape, duplicate, source mismatch, and manifest tamper must fail before decision execution | inspect, then keep/revise |
| `D01-SCALE2-DEC-004` | Evidence map, provenance, compile scope, reproduction, and EN/RU projections lag measured implementation | `EV-009`, `AR-002`–`AR-007`, `QG-TRACE`, `QG-REPRO` | Updating projections only after code evidence exists will prevent readiness overstatement | Projection audits, exact commands, checksum reconciliation, and Russian parity must pass | defer until evidence exists |
| `D01-SCALE2-DEC-005` | The public invariant identifies the seeded defect family | `EV-002`, `EV-005`, `AR-007`, `QG-ORIG` | Honest construction-validity disclosure can preserve the frozen invariant and methodology without claiming hidden-oracle strength | Frozen behavior/invariant/candidate bytes remain unchanged and projections disclose the limitation | keep frozen decision |

## Mandatory stop conditions

- Any external path/private-context exposure, oracle influence on an arm decision, or contamination finding.
- Any required change to frozen behavior, candidate, oracle, visible assertions, evaluation methodology, dependency/runtime/Phase 0.5, or cross-platform isolation policy.
- Any deterministic failure outside the directly approved remediation scope.

Implementation evidence, failures, retries, exact commands, and final dispositions are appended chronologically after inspection and verification.

## Chronological implementation evidence

### `D01-SCALE2-DEC-003` — directory-complete package binding

- Confirmed evidence: `validateBoundPackage` compared only descriptor-listed paths to manifest-listed paths and never enumerated `rootPath`.
- Hypothesis: deterministic recursive enumeration under the authorized root can make the descriptor list complete rather than merely self-consistent.
- Rejected alternative: trusting an additional manifest count would remain list-bound and would not detect an unregistered file.
- Change: `PackageBinding` now owns `rootPath`; validation enumerates regular files, rejects symlinks and unsupported entries, checks unique in-root declared paths, and requires exact sorted equality between disk and descriptor before manifest/digest validation.
- Files/symbols: `src/d01/fixture.ts` (`PackageBinding`), `src/d01/candidate.ts` (`enumeratePackageFiles`, `validateBoundPackage`), `tests/d01-package-binding.test.ts`.
- Exact command: `node --test --experimental-strip-types tests/d01-package-binding.test.ts`.
- Evidence: passed `1/1`; positive validation plus unlisted-file, duplicate, path-escape, symlink, and manifest-tamper counterexamples all behaved fail-closed.
- Failure/retry: none.
- Decision: **keep**; full-suite and manifest reconciliation remain pending.

### `D01-SCALE2-DEC-002` — runner/worker capability evidence

- Confirmed evidence: the parent previously wrote `networkDenied`, `hostPathInherited`, verifier access, and candidate access booleans directly into execution events.
- Hypothesis: binding an actual runner-launch attestation to process-local allowed/denied probes and process identity will make physical claims independently falsifiable.
- Rejected alternatives: parent request flags alone remain declarations; a report-only boundary test is not bound to the finalized decision or replay.
- Change: successful runner results now carry applied sandbox/permission/path-policy evidence; arm, observer, and evaluator workers emit process-identity and reciprocal read/denial probes; `bindCapabilityProof` binds both layers; finalized arm decision envelopes include the proof digest; observations/evaluator results retain worker evidence; execution events, evidence schema, replay, and HTML bind and reproduce all proofs.
- Negative evidence: missing proof, changed digest, contradictory candidate access, duplicate process identity, missing event, reordered evaluator start, and nondeterministic observations fail closed.
- Files/symbols: `src/d01/capability.ts`, `src/d01/schemas.ts`, `src/d01/execution.ts`, `src/d01/decision.ts`, `src/d01/orchestrator.ts`, `src/d01/replay.ts`, `src/d01/report.ts`, three D01 workers, and `tests/d01-vertical-slice.test.ts`.
- Exact commands: `npm run compile`; `node --test --experimental-strip-types tests/d01-vertical-slice.test.ts`.
- Evidence: compile passed; targeted vertical suite passed `19/19`; both real D01 candidates retained their prior accept/reject behavior and `K=0` evidence.
- Failure/retry: the first combined capability patch matched an outdated schema location and was rejected before writing; it was split by owning symbol. The first post-schema targeted suite passed `18/19`; its sole failure was the old synthetic observation helper missing newly mandatory process evidence. The helper was updated with test-only runner/worker attestations and the unchanged suite then passed `19/19`.
- Decision: **keep**; full ordinary/replay verification remains pending.

### `D01-SCALE2-DEC-001` — descriptor-driven engine ownership

- Confirmed evidence: schemas and orchestration contained fixed D01 cardinalities and workers directly assembled specialized arm/reasoning/evaluator contracts.
- Hypothesis: one frozen engine registry plus descriptor-derived execution plan and schema primitives can make identifiers, cardinalities, worker selection, arm checks, reasoning, evaluator, replay, report, and artifacts injected contracts while D01 remains the only real descriptor.
- Rejected alternative: renaming D01 modules or copying them for a hypothetical D02 would not prove reuse and would violate the approved scope.
- Change: descriptor data now owns arm IDs, risk categories, observation sizes, and replay record types; `createFixtureSchemaPrimitives`, `defineFixtureEngine`, and `createFixtureExecutionPlan` are fixture-neutral; `D01_ENGINE` injects the real schemas, arm checks, reasoning adapter, evaluator worker, replay, and report contracts; orchestrator and workers consume the engine plan/registry.
- Test-only proof: an in-memory `TEST-ONLY` descriptor uses three unrelated candidate IDs, two visible IDs, two risk categories, four observation items, different paths, and injected stub contracts. It creates no BG-D02 files, candidate, oracle, manifest, or behavior spec.
- Files/symbols: `src/d01/fixture.ts`, `src/d01/schema-factory.ts`, `src/d01/engine.ts`, `src/d01/runtime.ts`, `src/d01/schemas.ts`, `src/d01/risk.ts`, `src/d01/orchestrator.ts`, three D01 workers, and `tests/d01-descriptor-injection.test.ts`.
- Exact commands: `npm run compile`; `node --test --experimental-strip-types tests/d01-descriptor-injection.test.ts tests/d01-package-binding.test.ts`; `node --test --experimental-strip-types --test-name-pattern='full candidate-a slice' tests/d01-vertical-slice.test.ts`.
- Evidence: compile passed; focused injection/package suites passed `2/2`; actual engine-path candidate-a slice passed `1/1` with both arms accepted and complete capability evidence.
- Failure/retry: the first two compiles after schema extraction exposed that the factory widened frozen candidate literals to `string`. The retained correction keeps the D01 union exact at its exported boundary while generic factory schemas remain descriptor-derived; compile then passed. A later engine guard compared a statically two-element arm tuple to zero; the impossible check was removed and compile passed.
- Decision: **keep**; full suite and replay/report reconciliation remain pending.

### `D01-SCALE2-DEC-004` — projection, provenance, compile-scope, and reproduction reconciliation

- Confirmed evidence: active projections still described `SES-20260830-002` as pending, provenance ended at `COD-CODEX-008`, and reproduction wording implied broader compile coverage than the exact `tsconfig.json` patterns.
- Hypothesis: evidence-first synchronization after implementation verification can remove status overstatement without changing product or evaluation semantics.
- Change: current EN/RU specification headers, evaluation, preflight, topic, trace boundary/index, provenance, reproduction, and Improvement Changelog now distinguish the historical `PASS_WITH_CONCERNS` checkpoint from completed repo-local remediation and pending trace capture. Compile wording now lists only the exact TypeScript include families and explicitly excludes non-TypeScript/control artifacts from that claim.
- Construction limitation: current reports and projections disclose that the frozen public D01 invariant directly identifies the seeded defect family; the invariant and methodology remain unchanged.
- Exact verification: `npm run task -- phase0.5:verify`; `git diff --check`; `npm run task -- checksums:write`; `npm run task -- checksums:check`; four safe preflight/trace wrapper commands.
- Evidence: safe Phase 0.5 verification passed license `54/54` and suites `11/11`, `6/6`, `3/3`, `4/4`, `3/3`, `4/4`; `git diff --check` passed; final control checksums passed `187/187`; safe probes passed, control returned `READY_FOR_CLEAN_BRANCH`, implementation returned `READY_FOR_IMPLEMENTATION`, and contamination findings were zero.
- Failure/retry: the first checksum check correctly stopped on stale projections; authorized reconciliation was repeated after the final owner card and verified 187 entries.
- Decision: **keep**; the pre-capture checksum reconciliation passed, and post-capture reviewed-layer reconciliation is recorded below.

## Repo-local verification gate before owner capture

- `npm run compile` — passed.
- `npm test` — passed `55/55` ordinary tests.
- First `npm run task -- d01:verify` — all behavioral/code gates passed and stopped only on the expected stale vertical manifest.
- `npm run task -- d01:vertical:manifest:write` then check — wrote and verified 30 files, SHA-256 `6be3ea9671143f2df228102a348df5e0f41d3570535f510d7eec4af331282739`.
- Repeated `npm run task -- d01:verify` — passed compile, visible `5/5`, step `1/1`, oracle `3/3`, boundary `4/4`, vertical `19/19`, unscored E2E, four immutable manifests, and the 30-file vertical manifest.
- `npm run task -- d01:demo` — wrote JSON SHA-256 `db3d64776e38bfbfba6be2c174a68b7c96bd3a4a543fc64f892a74a3551aa074` and HTML SHA-256 `dd34b63a3b63a6faac7596e911c5008ec7a8df349059e255a7e7fc2770adbc87`.
- `npm run task -- d01:replay` — passed with `reportArtifactsMatched=true` and reproduced both report digests.
- No official/scored run, live product model, Chromium, BG-D02, candidate/oracle/visible-assertion/methodology change, dependency/runtime/Phase 0.5 change, commit, or push occurred.
- The additional intermediate Claude review was cancelled by the owner and was not invoked.
- Pre-capture disposition: implementation and repo-local verification complete; owner-controlled native capture/review was the next gate; `SCALE_READY=false` until a separate Codex acceptance matrix and explicit owner approval.

## Post-capture reconciliation

- Owner authorization: native `Copy as Markdown` was confirmed and safe capture plus subsequent review were explicitly authorized.
- Exact source: 43,616 bytes, SHA-256 `8d60978fcfce04f7c6fe3fa777d5b438a62347328c482da85f60993e48c3247a`; external path and raw content were not disclosed.
- Raw scan: one private-term match was confined to two absolute machine-path occurrences; after virtual path redaction there were zero private-term matches, zero email matches, and zero secret-assignment matches.
- Exact reconciliation: clipboard bytes matched the capture receipt and passed strict UTF-8. Exactly two repository-root occurrences were replaced with `<repository-root>`.
- Reviewed layer: 43,540 bytes, 571 lines, SHA-256 `ba3b29f14abe3ea0524b711d15b390b5fabb63a28583334163e4da80e3d24444`; complete Codex line review and EN/RU reconciliation preserve the approval, chronology, changes, failures, retries, commands, evidence, decisions, and final stop.
- Validation retry: an ad hoc Node YAML parse stopped before reading the files because the optional `yaml` package was absent. No dependency was added; the same six files passed a system read-only safe YAML parse, and `git diff --check` passed.
- Final validation: control checksums passed `192/192`; safe control and implementation preflights returned `READY_FOR_CLEAN_BRANCH` and `READY_FOR_IMPLEMENTATION` with zero contamination findings, the expected dirty-tree warning, and four binary human-review notices.
- Independent review: the owner cancelled the intermediate Claude checkpoint; Claude was not invoked.
- Final trace disposition: `owner_approved_eligible_indexed_in_actual_traces_scale_ready_false`. The owner explicitly approved the reviewed trajectory as eligible implementation evidence. Eligibility remains independent from the separate Codex scaling acceptance matrix; `SCALE_READY=false`.
- Post-promotion validation: the trace occurs exactly once in `actual_traces` and zero times in `pending_trace_review`; eight YAML projections passed safe parsing; control checksums passed `192/192`; `git diff --check` and both safe preflights passed with zero contamination findings.
