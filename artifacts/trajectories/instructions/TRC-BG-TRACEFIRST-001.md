# TRC-BG-TRACEFIRST-001 — Coordinator-issued clean-task instruction packet

The repository owner gave explicit authorization for the trace-first action in the
coordination task. Codex coordinator then issued the exact clean-task instruction
packet preserved below. This packet is not presented as a verbatim repository-owner
message, and no private coordination content is included. The later packaging
instruction is intentionally excluded.

```text
Продолжай одобренную чистую BeyondGreen implementation-сессию из checkpoint 4af1177. Это только trace-first gate; product implementation, Phase 0.5 spikes, dependencies, fixtures, candidates, hidden oracles, benchmark/model/solution-agent runs, commit и push запрещены.

Сначала повторно проверь:
- branch impl/beyondgreen;
- HEAD 4af117762fa15b02d81b75e23d9b22113caf48ea;
- clean working tree;
- одобренный SES-20260829-002;
- обязательные контракты из AGENTS.md остаются прочитанными и применимыми.

Разрешённые внешние capability-интерфейсы:
- micro1-safe-preflight probe
- micro1-safe-preflight control
- micro1-safe-preflight implementation
- micro1-safe-trace probe

Исполняй только эти command names/subcommands. Не выясняй их расположение, не читай launcher-файлы или внешние пути, не печатай значения environment variables. Владелец сообщает SHA-256 нового trace launcher: 0abf0e3aca018b2deea1f0877440bb8d0ae32eab2414cc385a1b7cd69b21c1bc; считай это owner-provided provenance, не независимо проверенным фактом этой задачи. Команда capture зарезервирована для координатора после экспорта transcript и этой задаче не разрешена.

Выполни один минимальный representative trace-first action:
1. В docs/PREFLIGHT_CHECKLIST.md исправь активный branch-status drift после rename на impl/beyondgreen. Исторические события не переписывай: где старое имя является историческим фактом handoff, явно зафиксируй последующий rename без history rewrite; текущий state должен однозначно указывать impl/beyondgreen и checkpoint 4af1177.
2. Актуализируй текущий clean-task status только проверенными фактами: SES-20260829-002 approved; real scanner-only contamination preflight passed; trace raw export/review ещё pending; Phase 0.5 всё ещё блокирует implementation.
3. Не меняй PROJECT_SPEC, EVALUATION, topic.yaml, boundary YAML или checksum manifest на этом шаге.
4. Запусти npm test, micro1-safe-preflight probe/control/implementation и micro1-safe-trace probe. Ожидаемый implementation result — BLOCKED только из-за Phase 0.5 и текущего docs-only dirty worktree; это не failure trace-first.
5. Проверь git diff --check и что изменён ровно docs/PREFLIGHT_CHECKLIST.md.
6. Верни точную хронологическую сводку instructions/actions/tool outcomes/retries и остановись. Не создавай reviewed trace в репозитории: координатор сначала сохранит неизменённый raw-export вне worktree, вычислит digest и проведёт review.

Не включай никакое содержимое других бесед. Не используй browser, connected apps, MCP, shared memory или пути вне clean root, кроме перечисленных owner-controlled command interfaces.
```
