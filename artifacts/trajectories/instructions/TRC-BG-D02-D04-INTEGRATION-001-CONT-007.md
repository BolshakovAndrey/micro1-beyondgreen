# TRC-BG-D02-D04-INTEGRATION-001-CONT-007 — safe scanner-span continuation

The repository owner authorized this continuation inside the isolated BeyondGreen
worktree under `SES-20260830-009`. It extends the repository-local preflight scanner
only with safe machine-readable `start`, `end`, and `patternId` fields, then uses an
exactly-one-file scan of `evaluation/manifests/BG-D02/SUBAGENT_REPORT_RU.md` without
emitting matched text, source values, full lines, prefixes, suffixes, or replacement
strings.

The report may be saved only after all owner-specified cardinality, line, span,
cryptographic common-prefix, marker, suffix, repository-containment, existence, and
exact-replacement preconditions pass. All three edits must be prepared in memory and
saved together. Any failed precondition stops the continuation without a partial
report edit and permits only safe aggregate reporting.

After a successful normalization, only directly derived manifests, registries,
indexes, projections, checksums, provenance/trajectory records, and Russian owner
evidence may change. The continuation must then run the unchanged ordinary tests,
replay/regression and integration invariants, documentation parity, checksum
verification, and both preflights. It must not perform an official/scored run,
Claude, Chromium, live-model, browser, private-MCP, nested-Codex, commit, or push
operation.

