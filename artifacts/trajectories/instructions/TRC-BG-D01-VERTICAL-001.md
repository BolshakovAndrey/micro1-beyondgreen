# TRC-BG-D01-VERTICAL-001 — approved implementation packet

Status: excluded with SES-005 under `EXC-003`; do not use as an eligible trajectory.

Implement only the repository-owner-approved `SES-20260829-005` BG-D01 vertical
slice. Work inside the clean repository root and use only repository-relative
contracts. Preserve candidate sources, the five frozen visible tests, verifier
behavior, candidate hashes, and the single seeded stale-snapshot defect family.

Required implementation: immutable ingestion and before/after hashing; status-quo
baseline; typed risk inventory; visible gate; oracle-free ProbePlan and internal
checks; immutable accept/reject/abstain decision; independent post-decision evaluator
with physical isolation and K=0; Zod-validated JSON; static HTML generated from only
validated JSON; deterministic offline replay without network, subprocess, or
workspace writes; CLI; and one unscored D01 E2E demonstration.

Keep the root package scripts stable and add discoverable typed tasks under
`scripts/tasks/`. Record tests, failures, evidence, manifests, provenance,
changelog, checksums, and a complete natural-Russian owner card.

Forbidden: official/scored runs, model or Codex exec calls, Chromium, browser, GUI,
repair, other fixtures, commit, and push. Billing is fixed subscription; do not
calculate, estimate, or cap per-run USD. Do not claim an exact configured model name
without machine-exported evidence.
