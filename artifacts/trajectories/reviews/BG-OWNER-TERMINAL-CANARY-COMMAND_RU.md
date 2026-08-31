# SES-029 — команда owner-terminal transport canary

Статус: **OWNER-TERMINAL CANARY PASS**.

Добавлена repo-local задача `transport:canary`. Она использует тот же production adapter `codex-exec-jsonl-v1`, модель `gpt-5.6-sol`, read-only sandbox, ephemeral Git root, строгую output schema, один invocation и ноль retries.

Canary prompt является фиксированным публичным transport-only health check. Он не содержит evaluation identity, candidate bytes, fixture content, verifier/oracle data, приватных путей или repository context.

Задача печатает только одну безопасную JSON-сводку: `PASS/FAIL`, adapter, model, invocation count, retry count, duration, schema-valid flag и безопасный failure code. Raw model JSONL и final response не печатаются. Временный runtime root удаляется в `finally`.

## Проверки без live model

- TypeScript compile: **PASS**.
- Builder/parser/transport/canary fake-runner tests: **9/9 PASS**.
- Успешный fake transport даёт только safe `PASS` summary.
- Nonzero fake transport не выпускает raw stdout и даёт только safe `FAIL` summary.
- Task registry содержит `transport:canary`.
- Official output root отсутствует.
- Live model calls в SES-029: **0**.

## Выполненная команда

```bash
npm --prefix <clean-repository-root> run task -- transport:canary
```

Владелец однократно выполнил эту команду из обычного Terminal. Получен безопасный результат:

- `status`: `PASS`;
- `invocationCount`: `1`;
- `retryCount`: `0`;
- `durationMs`: `9325`;
- `schemaValid`: `true`;
- `failureCode`: `null`;
- `officialOrScoredRun`: `false`;
- `unblindingPerformed`: `false`;
- `rawOutputPublished`: `false`.

Canary повторять не нужно. Различие с SES-027 указывает на nested Codex Desktop environment как наиболее вероятную причину предыдущего `NONZERO_EXIT`, хотя полностью исключить временный provider-сбой невозможно. Official run следует выполнять только из обычного Terminal после финального preflight, checkpoint commit и новой approved official boundary. Official run, unblinding, commit и push пока остаются запрещены.
