# Disclosures, Provenance, and Limits

## Provenance

BeyondGreen, its synthetic museum/parcel/tray/bulletin/astronomy/seed/unit/theme fixtures,
candidates, evaluation runtime, reports, and tests were created during the hackathon.
They do not contain employer or client source, tests, data, screenshots, or traces.
Public React/signals concepts informed the problem; fixture prose was frozen before code.

External inputs are the official micro1 brief and public organizer clarifications. Four
human-reviewed binary reference copies are intentionally excluded from the submission;
their redistributable text projections are `docs/CHALLENGE.md` and
`docs/HACKATHON_RULES.md`. Submitted data is synthetic.

The external demo video contains a short, deliberately and irreversibly blurred context
fragment to establish that the user problem is real. No right to publish an identifiable
recording of the underlying product is claimed or required for the submission: the
product interface must remain unrecognizable, and any legible values in the public cut
must be synthetic. If any frame permits identification of the product or reveals a real
value, that fragment must be removed rather than disclosed. No product screenshot,
private source, identifier, or local media path is included in the repository or ZIP;
only the eventual public video URL is submitted.

## Tools and third parties

- Coding/orchestration: Codex Desktop and Codex CLI, including isolated Codex subagents.
- Independent read-only review: Claude CLI / Opus alias at explicit checkpoints.
- Official solution engine: `gpt-5.6-sol` through locally authenticated Codex CLI.
- Runtime libraries: React, React DOM, `@preact/signals-react`, jsdom, and Zod.
- Build tooling: Node.js 22.22.3 and TypeScript 5.9.3.

Exact versions are lockfile-pinned. `THIRD_PARTY_NOTICES.md` and the license audit record
the dependency licenses. No `node_modules` content ships in the archive.

## Safety and approval boundaries

BeyondGreen advises a merge decision but performs no repository mutation, deployment, or
other consequential action during scoring. `reject` and `abstain` block merge and require
a human decision. The candidate is immutable. Oracle access is physically isolated, and
no evaluator-derived feedback reaches an arm before its decision.

## Known limitations

- The benchmark is synthetic; production generalization is not demonstrated.
- v1 covers React state-to-signals migrations only.
- Production isolation is macOS-specific (`sandbox-exec` plus Node permissions) and
  fails closed on Linux. Offline replay is cross-platform.
- The official BeyondGreen result is 19/20 correct, but reason-correct defect recall is
  only 3/10, below the frozen 8/10 target. The frozen implementation is a strict lexical
  proxy over verifier-owned tokens, not a semantic grader; the score remains unchanged.
- One preserving candidate (`BG-H06`) abstained, so completion is 19/20.
- Seven of 20 immutable BeyondGreen rationales are in Russian because the model responded
  under the operator locale. They were not translated post hoc. The lexical scorer removes
  Cyrillic during normalization, but language is not the dominant cause of the `3/10`
  result: six of the seven uncredited false-green rationales are English.
- The official run required post-decision infrastructure recovery. The 40 arm decisions
  were never repeated; failed and partial roots remain disclosed.
- Fixed-subscription marginal USD and stable token totals were not measured.
- The successful post-decision provenance discloses an inventory-hash drift caused only by
  owner-approved transcript-cardinality and identity-transport bridge repairs. Candidates,
  decisions, oracle semantics, and scoring stayed frozen; the predeclared status-quo
  construction control still reproduced exactly 10/20 with the same 10/10 truth split.
- The primary YouTube video passed signed-out playback in a clean browser profile; a
  public Vimeo mirror is also recorded. The locally verified media file itself is not
  included in the archive.
