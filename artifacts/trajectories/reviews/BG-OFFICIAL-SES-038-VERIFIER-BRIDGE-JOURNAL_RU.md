# SES-038 — журнал исправлений verifier-мостов

## BG-D04: форма результата `dispose()`

- **Дефект:** evaluator ожидал `transcript.disposal.observation.subscribers`, хотя в
  транскрипте находится непосредственный результат публичного `dispose()`.
- **Определяющий замороженный контракт:**
  `evaluation/arm-visible/BG-D04/harness.ts:32` —
  `dispose(): Promise<Readonly<Record<"harbor" | "orchard", number>>>`.
- **Минимальное исправление:** значение `transcript.disposal.observation` передаётся
  неизменному `evaluateCanonicalObservations` напрямую. Scenario-provider, harness,
  canonical oracle, candidates, ground truth и scoring не изменялись.
- **Regression test:** `D04 evaluator consumes the public dispose result as the
  subscriber-count record` в
  `tests/official/verifier-runtime-exports/official-runtime-exports.test.ts`.
- **Проверка:** `npm run compile` — PASS; targeted tests — 7/7 PASS.
- **Производный артефакт:** согласован только SHA-256
  `evaluation/verifier-only/BG-D04/official-runtime-exports.manifest.json`.

## Обязательная остановка

Следующая production-equivalent evaluator rehearsal остановилась на
`Frozen ground-truth mismatch for BG-H03:candidate-a`. Условие владельца требует
остановиться при любом таком несовпадении и запрещает подгонку. BG-H03 не исследовался и
не изменялся на этом этапе.

## BG-H03: сохранение ссылочной идентичности

- **Дефект:** общий observer выполнял независимую JSON-сериализацию каждого кадра и
  тем самым терял публично наблюдаемое отношение ссылочной идентичности
  `selectionHandle` между шагами одного capture.
- **Определяющие замороженные контракты:**
  `evaluation/arm-visible/BG-H03/contract.ts` определяет ссылку как наблюдаемую часть
  результата и требует сохранять ту же ссылку при изменении заметки и повторном выборе
  того же идентификатора; замороженный публичный сценарий определяет порядок восьми
  наблюдений. Конкретный транспорт непрозрачных ordinal-токенов выбран владельцем.
- **Минимальное исправление:** один `WeakMap` живёт на протяжении всех `frames[]`
  одного capture. До `immutableJson` каждой впервые встреченной ссылке присваивается
  ordinal от 1. Evaluator удаляет служебный токен и восстанавливает одну и ту же
  замороженную ссылку для одинакового ordinal; разные ordinal получают разные ссылки.
  Candidate ID, ground truth, данные oracle и значения других capability-зон в токен
  не входят.
- **Regression tests:** подтверждены сохранение ссылки после `set-note`, после
  повторного `select` того же ID, различение новой ссылки, последовательность
  `1,1,1,2,2,2,3,3`, идентичность двух независимых captures и fail-closed отказ при
  расхождении captures. Отдельный evaluator-тест подтверждает восстановление ссылок
  перед неизменным canonical oracle и отказ при смене структурного snapshot одного
  токена.
- **Проверка:** `npm run compile` — PASS; targeted tests — 16/16 PASS;
  package-local manifest BG-H03 согласован с точными байтами runtime export.

## Единственный rehearsal после исправления H03

Разрешённая команда была запущена ровно один раз. После фонового yield процесс
завершился, однако управляющий PTY-транспорт не вернул финальную строку и код выхода в
задачу координатора. Сам rehearsal не создаёт repository-local receipt. Поэтому журнал
не заявляет ни PASS, ни FAIL и не восстанавливает результат догадкой. Повтор команды не
выполнялся, чтобы сохранить условие владельца «ровно один rehearsal».

Это транспортная потеря свидетельства координатора, а не доказанный runtime-дефект.
До отдельного решения владельца дальнейший обход verifier-мостов и подготовка
`POSTDECISION-004` остановлены.

Владелец отдельно разрешил один повтор только для восстановления результата. Повтор
корректно сохранил `session_id` и завершился на следующем детерминированном гейте:
`Frozen ground-truth mismatch for BG-H05:candidate-a`. BG-H03 тем самым перестал быть
точкой отказа.

## BG-H05: ссылочная идентичность store snapshot

- **Дефект:** каждый кадр независимо проходил JSON-сериализацию, поэтому одинаковая
  ссылка `observation.store` превращалась в разные объекты.
- **Определяющие замороженные контракты:**
  `evaluation/arm-visible/BG-H05/contract.ts:42-45` требует возвращать тот же объект
  snapshot до настоящего изменения; `BG-H05_BEHAVIOR.md:72-73` требует сохранять
  snapshot identity при повторной записи текущего значения.
- **Минимальное исправление:** один capture-wide `WeakMap` присваивает ссылкам store
  непрозрачные ordinal-токены до `immutableJson`. Последовательность восьми кадров —
  `1,2,3,3,4,4,4,4`. Evaluator строго проверяет токены, удаляет служебное поле и
  восстанавливает одинаковую замороженную ссылку для одинакового ordinal.
- **Regression tests:** два независимых capture дают одинаковые байты и указанную
  последовательность; изменение структурного snapshot под тем же токеном блокируется.

## BG-H05: финальное dispose-наблюдение

- **Дефект:** observer записывал результат `dispose()` восьмым кадром, но evaluator
  удалял все кадры с операцией `dispose` и передавал canonical oracle только семь
  наблюдений.
- **Определяющие замороженные контракты:**
  `evaluation/arm-visible/BG-H05/harness.ts:48` объявляет результат `dispose()` как
  полный `UnitStoreObservation`; `BG-H05_BEHAVIOR.md:78-79` требует после
  `unmount-all` наблюдать ноль подписчиков.
- **Минимальное исправление:** dispose-frame остаётся восьмым наблюдением без
  фильтрации и без повторного добавления `disposal.observation`.
- **Regression test:** полный публично определённый восьмикадровый transcript
  принимается неизменным canonical oracle как `preserving`.

## Итоговый evaluator rehearsal

После `npm run compile` и targeted suite 18/18 выполнен ровно один разрешённый
rehearsal. Результат:

```json
{"status":"PASS","slotCount":20,"scenarioCount":20,"captureCount":80,"pairCount":40,"evaluatorRecordCount":40,"schemaValidRecordCount":40,"frozenGroundTruthMatchCount":40,"armExecutionCount":0,"modelInvocationCount":0,"recordDigest":"90b14804aea1aa9fb48a46732eee158a7e52088df3becb10f5a3374fb9c653f9"}
```

Подгонка scenario, canonical oracle, candidates, ground truth или scoring не
выполнялась. `POSTDECISION-004`, commit и push не выполнялись.
