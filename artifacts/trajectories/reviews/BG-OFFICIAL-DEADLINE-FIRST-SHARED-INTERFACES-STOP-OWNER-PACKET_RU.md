# Остановка shared-first реализации официального слоя

**Граница:** `SES-20260830-018`
**Ветка:** `codex/beyondgreen-official-runner`
**Исходный и текущий HEAD:** `fcfa5a88dce7683c629318266835995d0bfa05ee`
**Итог:** остановлено до fixture-потоков из-за новой детерминированной ошибки проверки физической границы ролей

## Что было разрешено

Владелец одобрил SES-018 фразой «Хорошо! Вперед с учетом изменений!». Разрешение охватывало только pre-unblinding infrastructure — инфраструктуру до раскрытия held-out результатов — и synthetic/test-only проверки. `src/d01`, замороженные candidates, manifests, visible assertions, oracle semantics, evaluation v1.1, targets, two-arm policy и `codex-exec-jsonl-v1` должны были остаться неизменными. Реальные candidates, официальный запуск, раскрытие результатов, модели, Claude, Chromium, browser/MCP, trace promotion, commit и push были запрещены.

## Выполненный объём

Сначала успешно создана собственная ветка `codex/beyondgreen-official-runner` строго от `fcfa5a88dce7683c629318266835995d0bfa05ee`. `--force` не использовался, существующая ветка не переключалась и не перемещалась, другая worktree не читалась и не менялась.

До fixture-потоков создан только новый независимый shared core под `src/official/`:

- полностью явный fixture descriptor с candidate module/export, mount-function либо class-constructor binding, arm-visible contracts/invariants/actions/observations/visible assertions и отдельными observer/evaluator entrypoints;
- физически разнесённые фабрики планов arm, observer и evaluator;
- безопасный pre-unblinding runner plan, в котором `candidateExecutionAllowed=false`, `officialOrScoredRun=false`, `unblindingPerformed=false` и `runRecordCreated=false`;
- чистые функции aggregation, JSON/HTML report и offline replay;
- test-only fixture bytes и тесты явного descriptor, агрегации, отчёта, replay и Node permission boundary.

Новый слой не импортирует `src/d01`. `src/d01` не менялся и не обобщался.

## Проверки и точные результаты

Подготовка зависимостей:

```text
npm ci --ignore-scripts
```

Результат: установлено 54 замороженных пакета, найдено 0 уязвимостей.

Компиляция:

```text
npm run compile
```

Результат: PASS.

Новые synthetic/test-only проверки:

```text
node --test tests/official/shared-interfaces.test.ts tests/official/role-capability-boundary.test.ts tests/official/aggregation-report-replay.test.ts
```

Результат: 6 тестов, 4 PASS, 2 FAIL.

Прошли:

- пересчёт замороженных числителей evaluation v1.1 на синтетических записях;
- точное воспроизведение JSON, статического HTML и offline replay;
- обязательность всех явных descriptor bindings и запрет D01;
- отсутствие candidate executor и run record в pre-unblinding runner plan.

Не прошли:

1. В arm/observer boundary test положительная проверка чтения test-only arm-visible файла вернула отказ вместо разрешения.
2. В evaluator boundary test положительная проверка чтения test-only oracle файла также вернула отказ.

Обе ошибки воспроизводимы в одном запуске и относятся к самой новой capability test/configuration surface. Из-за раннего падения положительных утверждений последующие проверки запрета в соответствующих тестах не завершили полную матрицу. Поэтому нельзя заявлять, что физическая граница нового официального слоя доказана, даже если deny-направление могло бы работать.

После ошибки не выполнялись диагностическая команда, повтор теста, изменение capability plan или обход permission model. Это соблюдает прямое стоп-условие владельца для нового детерминированного блокера.

## Что намеренно не начиналось

- три fixture-only потока `BG-D02+BG-D04`, `BG-H01`–`BG-H03` и `BG-H04`–`BG-H06`;
- специальный coordinator-owned adapter `BG-D03` для class `TrayPlanner`;
- импорт или исполнение любого реального candidate;
- evaluator self-check, official/scored run, unblinding или создание run record;
- live model, Claude, Chromium, browser/MCP, connected apps или private state;
- trace capture/promotion, commit или push.

## Риски и неизвестность

Точная причина отказа разрешённого test-only чтения намеренно не диагностировалась после стопа. Возможны ошибка формирования Node permission arguments, неполный разрешённый путь либо иной дефект test harness; ни одна версия пока не подтверждена. Исправлять код до выяснения причины нельзя, поскольку ошибочная «зелень» могла бы скрыть отсутствие реальной capability isolation.

Frozen surface не менялась, oracle leakage не обнаружена, реальные candidate bytes не открывались через новый runner. Однако полный repository-wide regression и safe preflight ещё не запускались: остановка произошла раньше.

## Возможный следующий ограниченный шаг

Для продолжения потребуется отдельное решение владельца на один bounded diagnostic/correction cycle — ограниченный цикл диагностики и исправления — только для test-only role capability plan/harness. Такой цикл должен сохранить запрет на fixture-потоки до PASS, не исполнять реальные candidates и повторить только compile и те же три новых test files. Любое изменение frozen surface, oracle leakage или необходимость candidate execution снова немедленно остановит работу.
