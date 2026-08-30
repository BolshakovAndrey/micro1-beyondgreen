# TRC-BG-D01-SCALE-002 — Reviewed implementation trajectory

## Source and review boundary

- Source: Codex Desktop user-visible `Copy as Markdown` export selected by the repository owner.
- Immutable external capture: 43,616 bytes, SHA-256 `8d60978fcfce04f7c6fe3fa777d5b438a62347328c482da85f60993e48c3247a`.
- Native reviewed layer: `artifacts/trajectories/reviewed/TRC-BG-D01-SCALE-002-NATIVE.md`, 43,540 bytes, 571 lines, SHA-256 `ba3b29f14abe3ea0524b711d15b390b5fabb63a28583334163e4da80e3d24444`.
- Redaction: exactly two occurrences of the machine-specific repository root were replaced with `<repository-root>`. No technical action, result, retry, decision, or owner instruction was removed.
- The clipboard bytes matched the external receipt exactly and passed strict UTF-8 decoding before redaction.
- Hidden reasoning, unavailable internal application events, and complete shell stdout are not claimed.

## Chronology and decisions preserved

The task first read the repository contracts and pending `SES-20260830-002` boundary without inspecting product code. Safe probes confirmed the authorized clean root, branch `impl/beyondgreen`, baseline HEAD `f0418bc6051002d8d42ccf84822d2e1f2e25b02e`, pending trace ID, external scanner/trace boundaries, `READY_FOR_CLEAN_BRANCH`, and `READY_FOR_IMPLEMENTATION`. The owner then approved only the enumerated descriptor-engine, capability-evidence, directory-completeness, negative-test, and projection corrections.

The implementation trajectory was created before product-code inspection. Inspection confirmed three bounded problems: D01-specific cardinalities and imports remained distributed through the engine; capability claims were parent-declared; and package binding trusted the declared manifest list without enumerating the directory.

### Directory-complete package binding

`PackageBinding` gained an authorized root. Validation now recursively enumerates it and rejects undeclared files, symlinks, unsupported entries, path escapes, duplicates, source mismatch, and manifest tamper before decision execution. The focused package-binding suite passed `1/1`.

### Runner- and process-produced capability evidence

The runner now records evidence of the actually applied macOS sandbox profile, Node permission model, allowed-read digest, network denial, absent inherited host `PATH`, and child completion. Each arm, observer, and evaluator records a process-identity digest and performs reciprocal allowed/denied read probes. A bound proof digest is carried through finalized decisions, observations, evaluator input/result, execution events, JSON/HTML evidence, and offline replay.

Missing proof, changed digest, contradictory access, duplicate process identity, missing event, premature evaluator start, and nondeterministic observations fail closed. The first post-schema targeted run passed `18/19` because an old synthetic helper lacked newly mandatory process evidence; the helper was corrected without changing product behavior, and the suite passed `19/19`.

### Descriptor-driven engine

Descriptor data now owns arm IDs, risk categories, observation cardinalities, and replay record types. A single registry and execution plan inject schemas, arm checks, reasoning, evaluator, replay, and report contracts. D01 is the only real descriptor. Genericity is demonstrated by an in-memory `TEST-ONLY` descriptor with unrelated IDs and different cardinalities; no BG-D02 fixture, candidate, oracle, behavior specification, or manifest was created.

The first schema extraction widened frozen candidate literals to `string` and produced 15 compile errors. The retained correction preserved the exact D01 union while keeping the generic factory descriptor-driven. Compilation then passed.

### Projection and verification reconciliation

The public invariant, five visible assertions, candidate bytes, oracle, behavior freeze, and evaluation methodology remained unchanged. Provenance, compile scope, reproduction instructions, changelog, and English/Russian projections were synchronized. The construction-validity limitation remains explicit: the public invariant names the seeded defect family and does not prove discovery of an unknown hidden defect.

The first canonical verification passed every behavior/code gate and stopped only on the stale vertical manifest. The authorized reconciliation expanded it to 30 files; repeated verification passed completely.

## Verification evidence

- `npm run compile`: passed.
- `npm test`: passed `55/55`.
- D01 verification: visible `5/5`, step contract `1/1`, oracle `3/3`, physical boundary `4/4`, vertical contracts `19/19`, unscored E2E, four immutable package manifests, and 30-file vertical manifest passed.
- Vertical manifest SHA-256: `6be3ea9671143f2df228102a348df5e0f41d3570535f510d7eec4af331282739`.
- Evidence JSON SHA-256: `db3d64776e38bfbfba6be2c174a68b7c96bd3a4a543fc64f892a74a3551aa074`.
- Evidence HTML SHA-256: `dd34b63a3b63a6faac7596e911c5008ec7a8df349059e255a7e7fc2770adbc87`.
- Offline replay: passed with `reportArtifactsMatched=true`.
- Safe Phase 0.5 verification: passed without a live model or browser.
- Pre-capture control checksums: `187/187`; `git diff --check` passed.
- Safe control/implementation preflights: `READY_FOR_CLEAN_BRANCH` and `READY_FOR_IMPLEMENTATION`; zero contamination findings, expected dirty-tree warning, and four binary human-review notices.

## Capture review and current disposition

The owner cancelled the additional intermediate Claude review before capture; Claude was not invoked. The owner then explicitly confirmed native `Copy as Markdown` and authorized only safe capture and subsequent review. The raw scan found one private-term match confined to two machine-path occurrences; after the two categorical path substitutions there were zero private-term matches, zero email matches, and zero secret-assignment matches. The complete 571-line native reviewed layer was inspected and preserves the approval, chronology, failures, retries, commands, evidence, decisions, and final stop.

The repository owner approved this technically reviewed, privacy-safe coding-agent trajectory as eligible implementation evidence, and it is indexed in `actual_traces`. This eligibility is independent from scaling readiness. `SCALE_READY=false`; a separate coordination task owns the Codex acceptance matrix and any explicit scaling approval. No official/scored run, live product model, Chromium, BG-D02, methodology/candidate/oracle/freeze change, commit, or push occurred.

Post-capture control checksums passed `192/192`; safe control and implementation preflights again returned `READY_FOR_CLEAN_BRANCH` and `READY_FOR_IMPLEMENTATION` with zero contamination findings.
