# Итог shared-first этапа официального слоя

**Граница:** `SES-20260830-018`
**Ветка:** `codex/beyondgreen-official-runner`
**HEAD:** `fcfa5a88dce7683c629318266835995d0bfa05ee`
**Статус:** shared interfaces/factories и synthetic role boundary прошли; остановка перед fixture-потоками

## Результат

Создан независимый pre-unblinding слой `src/official/`, который пока не умеет исполнять candidates и не может создать официальный run record. Он не импортирует и не меняет замороженный `src/d01`.

Готовы следующие общие контракты:

- полностью явный descriptor для `BG-D02`–`BG-D04` и `BG-H01`–`BG-H06`;
- явные candidate module/export и mount-function либо class-constructor binding;
- явные arm-visible contracts, invariants, actions, observations и visible assertions;
- явные observer и evaluator entrypoints без автоматического вывода имён;
- физически разнесённые arm, observer и evaluator capability factories;
- pre-unblinding runner plan с неизменяемыми значениями `candidateExecutionAllowed=false`, `officialOrScoredRun=false`, `unblindingPerformed=false` и `runRecordCreated=false`;
- чистые aggregation, schema-validated JSON, статический HTML и deterministic offline replay;
- test-only fixture, не связанная ни с одним реальным evaluation candidate.

## Физическая граница ролей

Synthetic boundary test запускает отдельные Node-процессы с permission model — моделью разрешений файловой системы:

- arm и observer читают только test-only candidate/arm-visible поверхность и получают отказ на verifier-only файл;
- evaluator читает только test-only verifier-only поверхность и получает отказ на candidate и arm-visible файлы;
- для всех ролей `networkAllowed=false`;
- evaluator plan не содержит candidate execution capability.

Это доказательство относится только к общей test-only инфраструктуре. Оно ещё не доказывает правильность будущих fixture adapters и не является официальным запуском.

## Команды и доказательства

Первоначальная подготовка:

```text
npm ci --ignore-scripts
```

Результат: 54 пакета, 0 уязвимостей.

Первая компиляция прошла. Первый запуск трёх synthetic test files дал 4/6: положительное разрешённое чтение не сработало для arm/observer и evaluator. Работа остановилась, а ошибка была зафиксирована в отдельном stop packet.

После отдельного разрешения владельца выполнен ровно один ограниченный цикл диагностики. Без печати stderr или путей получены безопасные коды:

```text
single --allow-fs-read path: 0
repeated --allow-fs-read flags: 0
comma-joined --allow-fs-read list: 1
```

Причина подтверждена: test harness объединял несколько разрешённых путей запятой, тогда как текущий Node принимает их отдельными повторяемыми флагами. Исправлен только `tests/official/role-capability-boundary.test.ts`; вместо одного comma-list теперь передаётся один `--allow-fs-read` на каждый путь. Capability plan, descriptor и product semantics не менялись.

Разрешённый единственный повтор компиляции:

```text
npm run compile
```

Результат: PASS.

Разрешённый единственный повтор прежних test files:

```text
node --test tests/official/shared-interfaces.test.ts tests/official/role-capability-boundary.test.ts tests/official/aggregation-report-replay.test.ts
```

Результат: 6/6 PASS, 0 FAIL.

Первая packet-only попытка проверить отсутствие D01-imports завершилась после успешного разбора SES-018, но до `rg`, frozen-path и diff checks из-за ошибки shell quoting в самом шаблоне команды. Файлы и product state не менялись. Совместимый read-only повтор прошёл: в `src/official` нет ссылок `d01`, frozen product paths неизменны, `git diff --check` — PASS.

## Неизменённые поверхности

- `src/d01` не менялся, не обобщался и не импортируется новым слоем;
- frozen candidates/manifests, visible assertions, oracle packages и ground truth не менялись;
- evaluation v1.1, формулы, targets, `K=0`, two-arm policy, one-attempt/180-second policy и `codex-exec-jsonl-v1` не менялись;
- real candidates не импортировались и не исполнялись;
- official/scored run, unblinding и run record не выполнялись и не создавались.

## Не начатый следующий этап

Три fixture-only потока не запускались:

1. `BG-D02` + `BG-D04`;
2. `BG-H01`–`BG-H03`;
3. `BG-H04`–`BG-H06`.

Специальный coordinator-owned adapter `BG-D03` для class `TrayPlanner` также не начинался. Worker-потоки не создавались и shared paths им не передавались.

## Риски и следующий гейт

Shared interface проверен только на synthetic/test-only descriptor. Реальные fixture bindings ещё могут выявить несовместимые mount signatures, type-only exports, evaluator observation signatures или D03 constructor requirements. Любая такая несовместимость должна решаться fixture-only adapter, а не изменением frozen fixtures или переносом D01 semantics.

До отдельного решения владельца запрещены fixture-потоки, реальные candidates, official/scored run, unblinding, live model, Claude, Chromium, browser/MCP, trace promotion, commit и push. Следующее разрешение, если оно будет дано, должно явно открыть только fixture-adapter этап и сохранить coordinator ownership shared core и `BG-D03`.
