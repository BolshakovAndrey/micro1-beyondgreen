# TRC-BG-D01-RECOVERY-001 — clean-recovery implementation packet

Start submission-eligible session `SES-20260829-007` from baseline
`f0418bc6051002d8d42ccf84822d2e1f2e25b02e`. Treat the repo-local D01 draft as
untrusted input and independently prove or rewrite every retained fragment from the
repository contracts. Do not import any SES-006 change.

Formally exclude SES-005 under `EXC-003` for an outside-repository temporary write
during replay comparison and SES-006 under `EXC-004` for a public package-cache read
before explicit owner authorization. Record no external name or path and attempt no
cleanup.

Implement one unscored BG-D01 verify-existing vertical slice: immutable path/hash
ingestion; status-quo and BeyondGreen arms; separate compilation, visible-test, and
operational outcomes; a full independent 180-second deadline for each arm with zero
retries; immutable abstention on arm crash, timeout, invalid JSON, or invalid
evidence; run invalidation on evaluator integrity failure; typed risk inventory and
TypeScript-symbol structural analysis without candidate-identifier heuristics;
provider-neutral typed reasoning; strict frozen offline replay; K=0 and physical
oracle isolation; validated escaped JSON/HTML reports; and moderate reviewer-critical
English JSDoc/comments.

The replay core must own no filesystem, network, subprocess, clock, random, or write
capability. Artifact comparison occurs in memory. Disclose synthetic/offline mode,
zero model calls, fixed-subscription accounting, and all limitations.

Only `npm ci` driven by `package-lock.json` may use the public npm registry/cache and
system Node/npm runtime. Every other outside-root content read or write is forbidden.
Do not use browser, connected apps, MCP resources, Claude, Chromium, live model,
official/scored runs, repair, other fixtures, commit, or push. Stop at the
repository-owner review checkpoint.

