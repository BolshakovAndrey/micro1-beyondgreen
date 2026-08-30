# Итог pre-unblinding волны fixture adapters

**Граница:** `SES-20260830-018`
**Ветка:** `codex/beyondgreen-official-runner`
**HEAD:** `fcfa5a88dce7683c629318266835995d0bfa05ee`
**Статус:** статические adapters и synthetic boundaries прошли; остановка до исполнения candidates

## Что реализовано

После read-only acceptance общий descriptor/factory API зафиксирован как worker contract `beyondgreen-official-fixture-worker@1.0.0`. Он требует явно задавать candidate module/export, `mount_function` либо `class_constructor`, arm-visible bindings, observer/evaluator entrypoints и role capability plans. Автоматический вывод имён запрещён; workers не могли менять shared paths.

Три настоящих параллельных Codex subagents создали непересекающиеся fixture-only adapters:

1. `BG-D02` + `BG-D04`;
2. `BG-H01`–`BG-H03`;
3. `BG-H04`–`BG-H06`.

Координатор отдельно создал `BG-D03` adapter. Он явно связывает class `TrayPlanner`, два candidate module/export, `class_constructor`, фабрику constructor arguments и observer без обычного mount harness. Ни один adapter не импортирует candidate module: пути и export names являются только статическими строковыми bindings.

Для D02, D04 и H01–H06 evaluator entrypoint — только `evaluateCanonicalObservations`, а не scenario-функция, способная получить candidate. D03 статически связывает существующий verifier-only `assertDerivedStateOracle`; это честно отражает текущий замороженный D03 oracle API, но до official execution потребует отдельного решения о совместимости его constructor signature с evaluator capability, которая запрещает чтение candidate modules.

## Владение и неизменность

Ownership review — проверка владения файлами — прошла:

- workers меняли только назначенные fixture adapter/test files;
- shared interfaces/factories/runner/report/replay оставались coordinator-owned;
- `src/d01`, candidates, manifests, arm-visible assertions, verifier semantics, package files и task registry не менялись;
- в fixture adapters/tests нет candidate imports, D01 references или `evaluateCanonicalScenario`;
- реальное исполнение candidate или held-out probe отсутствует.

## Ошибки и повторы

### Лишний `tsx` loader

Worker H04–H06 сначала запустил test-only файл через `node --import tsx`. Пакет `tsx` не входит в frozen dependencies, поэтому Node вернул `ERR_MODULE_NOT_FOUND`. Dependencies, adapters и package files из-за этого не менялись. После отдельного одобрения тот же файл запущен штатно:

```text
node --test tests/official/fixtures/bg-h04-h06-adapters.test.ts
```

Результат: 2/2 PASS. Это no-change operational retry, а не product failure.

### Shell quoting

Одна составная read-only команда D02+D04 scope review не была разобрана `zsh` из-за `unmatched quote`. Её тело не запускалось, файлы не менялись. По разрешению владельца review разделён на простые `sed`, затем отдельный `rg`; scope/API review прошёл. Это также no-change operational retry.

### D03 duplicate path

Первый D03 test дал 1/2: у законного `class_constructor` candidate module path и constructor binding path совпадают, а arm factory передала оба значения в `stableUnique`. Fail-closed ошибка:

```text
Role capability paths must be explicit and unique.
```

Владелец разрешил единственное исправление: arm factory добавляет constructor binding path только если он отличается от candidate module path. `stableUnique` не менялся и по-прежнему отклоняет настоящие дубликаты из разных полей. Descriptor schema/API, D03 semantics и worker adapters не менялись. Единственный D03 повтор прошёл 2/2.

## Последовательные проверки

До итогового compile отдельно прошли:

- H04–H06: 2/2;
- D02+D04 после scope/API review: 2/2;
- H01–H03: 2/2;
- D03 после разрешённого исправления: 2/2.

Затем выполнен ровно один:

```text
npm run compile
```

Результат: PASS.

Полный fixture-adapter synthetic suite:

```text
node --test tests/official/worker-contract.test.ts tests/official/fixtures/bg-d02-d04-adapters.test.ts tests/official/fixtures/bg-d03-adapter.test.ts tests/official/fixtures/bg-h01-h03-adapters.test.ts tests/official/fixtures/bg-h04-h06-adapters.test.ts
```

Результат: 9/9 PASS.

Общий synthetic role-boundary/report/replay suite:

```text
node --test tests/official/shared-interfaces.test.ts tests/official/role-capability-boundary.test.ts tests/official/aggregation-report-replay.test.ts
```

Результат: 6/6 PASS. Arm/observer читают test-only public surface и физически не читают verifier-only bytes; evaluator читает test-only oracle и физически не читает candidate/arm-visible bytes. Aggregation, JSON/HTML report и offline replay воспроизводятся на синтетических записях.

## Что эти PASS не доказывают

Проверки статические и синтетические. Они не исполняют реальные candidates, не открывают held-out oracle results и не создают official run record. Поэтому они ещё не доказывают end-to-end работу настоящего official runner, корректность D03 post-decision evaluator path или итоговые score/targets.

## Запреты и следующий гейт

Не выполнялись official/scored run, unblinding, live model, Claude, Chromium, browser/MCP, trace promotion, commit или push. Следующий шаг требует отдельного owner scope. До него особенно нельзя исполнять реальные candidates или ослаблять физическую evaluator boundary ради D03 constructor API.
