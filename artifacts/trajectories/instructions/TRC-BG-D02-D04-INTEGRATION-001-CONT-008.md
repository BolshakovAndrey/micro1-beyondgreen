# TRC-BG-D02-D04-INTEGRATION-001-CONT-008 — authorized continuation

You are executing the owner-authorized continuation trajectory TRC-BG-D02-D04-INTEGRATION-001-CONT-008 inside the current isolated BeyondGreen worktree under session boundary SES-20260830-009. Stay inside this worktree for every Codex action. Do not inspect, read, or modify the primary checkout or any external state. Do not print environment-variable values or absolute machine paths.

Before acting, read AGENTS.md and every mandatory repository contract it names in full, including current product projections. Preserve all existing integration records and evidence from TRC-BG-D02-D04-INTEGRATION-001 and CONT-001 through CONT-007.

This continuation has exactly this authorized scope:

1. Correct the repository-local scanner so that every absolute-user-path finding safely enumerates all non-overlapping absolute-path spans on its line in a machine-readable array containing only objects of the exact shape {start, end, patternId}. Do not include matched text, line text, path values, prefixes, suffixes, or equivalent raw data.
2. Preserve the existing singular start, end, and patternId fields as the first deterministic match for backward compatibility.
3. Ensure deterministic ordering and deduplication of spans. The scanner must genuinely enumerate all applicable non-overlapping matches, rather than returning only the first match by construction.
4. Add focused repository-local tests covering:
   - multiple paths on one line;
   - deterministic order and deduplication;
   - backward-compatible singular fields selecting the first span;
   - absence of any raw path value in serialized findings.
   Run only the minimum focused scanner tests needed to validate these changes. Do not run npm test, the repository-wide preflight self-check, compile, replay, regression, documentation parity, checksum checks, or any other integration verification.
5. Then run the scanner in exactly-one-file mode only on evaluation/manifests/BG-D02/SUBAGENT_REPORT_RU.md. The diagnostic may read that one report in memory, but no command, tool output, JSON, message, instruction artifact, or owner report may reveal matched values, line fragments, raw absolute paths, prefixes, suffixes, or offsets paired with text.
6. Require exactly three absolute-user-path findings with line numbers exactly 72, 80, and 97. Report for each of those lines only:
   - the number of spans;
   - the list of patternId values;
   - the number of spans containing exactly one /micro1.hackerearth/ marker;
   - whether the cryptographic hashes of the prefixes of those marker-spans are equal across all applicable marker-spans.
   Do not output the hashes themselves. Do not output offsets from the target-file diagnostic, even though they exist in the scanner's safe machine schema.
7. Do not modify evaluation/manifests/BG-D02/SUBAGENT_REPORT_RU.md in this continuation. Do not normalize any paths. Do not update unrelated or derived integration manifests/checksums/indexes.
8. Record this exact continuation instruction and a complete natural-Russian owner-facing result or stop report. Code, JSDoc, and comments must remain English. The report must include only the safe aggregate diagnostic fields permitted above.
9. Stop on the first unexpected failure.

Hard prohibitions: no npm test or remaining integration checks; no commit or push; no official/scored run; no Claude; no Chromium; no live product model; no browser or private MCP; no second nested Codex CLI; no primary-checkout or external-state access; no new trajectory beyond CONT-008. Never reveal the target file's raw absolute-path values.
