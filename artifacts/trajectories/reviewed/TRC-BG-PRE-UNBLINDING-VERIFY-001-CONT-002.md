# TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-002 — reviewed structural projection

**Boundary:** `SES-20260830-017`
**Capture kind:** automatic Codex CLI JSONL split simultaneously to the protected capture sink and the repository-local structural projector
**Promotion status:** pending separate repository-owner approval

## Scope and immutable identity

This read-only continuation repeated the instruction-defined verification of the
exact thirteen SES-015 implementation paths on HEAD
`cb51e7de1e9908088dbef4dbeb29946d1edbc16b`. Later SES-016/SES-017 and projector
files are service artifacts, not part of the implementation subject.

The capture receipt and independently computed projector identity match exactly:

- bytes: `290598`;
- SHA-256: `6f153ceab21a839daabdb41e6eca5c1a9eaa5395215a416c4bf847fa14e4c8c5`;
- JSONL events: `18`;
- raw intermediate file: none.

The original failed trace, CONT-001, the rejected pre-launch shell attempt, and the
failed external-wrapper patch remain retry records only. They are not evidence for
this continuation.

## Privacy contract

The projector retained only event number, immutable source order, allowlisted event
and item type, structural role, tool-call/tool-result presence, completion status,
and integer exit code. It omitted raw content, tool arguments, external paths,
environment values, runtime identifiers, and usage metadata by construction.

The owner-controlled raw scan reported zero private-term matches before and after
path redaction, zero email matches, zero secret-assignment matches, and zero absolute
user-path matches. Reviewer stderr was strict UTF-8 and independently reported zero
path, email, and secret-assignment matches.

## Complete structural event ledger

| # | Event | Item | Role | Tool call | Tool result | Item status | Exit |
| ---: | --- | --- | --- | --- | --- | --- | ---: |
| 1 | `thread.started` | `none` | `system` | no | no | `none` | — |
| 2 | `turn.started` | `none` | `system` | no | no | `none` | — |
| 3 | `item.completed` | `agent_message` | `assistant` | no | no | `none` | — |
| 4 | `item.started` | `command_execution` | `tool` | yes | no | `in_progress` | — |
| 5 | `item.completed` | `command_execution` | `tool` | no | yes | `completed` | 0 |
| 6 | `item.completed` | `agent_message` | `assistant` | no | no | `none` | — |
| 7 | `item.started` | `command_execution` | `tool` | yes | no | `in_progress` | — |
| 8 | `item.completed` | `command_execution` | `tool` | no | yes | `completed` | 0 |
| 9 | `item.started` | `command_execution` | `tool` | yes | no | `in_progress` | — |
| 10 | `item.completed` | `command_execution` | `tool` | no | yes | `completed` | 0 |
| 11 | `item.started` | `command_execution` | `tool` | yes | no | `in_progress` | — |
| 12 | `item.completed` | `command_execution` | `tool` | no | yes | `completed` | 0 |
| 13 | `item.started` | `command_execution` | `tool` | yes | no | `in_progress` | — |
| 14 | `item.completed` | `command_execution` | `tool` | no | yes | `completed` | 0 |
| 15 | `item.started` | `command_execution` | `tool` | yes | no | `in_progress` | — |
| 16 | `item.completed` | `command_execution` | `tool` | no | yes | `failed` | 1 |
| 17 | `item.completed` | `agent_message` | `assistant` | no | no | `none` | — |
| 18 | `turn.completed` | `none` | `system` | no | no | `none` | — |

The chronology is complete at the permitted structural level: all six tool calls
have one following tool result, and the turn ends after the recorded exit `1` and a
final assistant message. The projection intentionally does not expose which command
produced exit `1`; the instruction packet predeclared an expected checksum mismatch,
but this structural review does not claim that mapping as raw semantic evidence.

## Disposition and limitations

- Strict UTF-8 and line-by-line JSON-object parsing: passed by the projector.
- Source-order chronology and call/result cardinality: passed.
- Capture/projector byte and SHA-256 identity: passed.
- Automated raw and stderr privacy scan: passed.
- Frozen-surface semantics: unchanged by the capture process; the trace itself is
  read-only and created no product artifact.
- Tool content, arguments, and output excerpts: categorically omitted by owner
  design; exact command semantics therefore rely on the separate immutable
  instruction packet and post-capture repository checks.
- Promotion: prohibited until final checksums/preflights pass and the repository
  owner separately approves this bounded structural evidence.

No official/scored run, unblinding, product-model call, Chromium, browser/MCP,
Claude, commit, or push is claimed.
