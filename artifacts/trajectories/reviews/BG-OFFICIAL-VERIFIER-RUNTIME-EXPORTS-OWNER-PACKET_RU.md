# SES-025 — безопасный отчёт о verifier runtime exports

Статус: **PASS для изолированного verifier-пакета; интеграция с production root остаётся отдельным шагом координатора.**

Этот отчёт намеренно не содержит скрытых значений сценариев, ожидаемых результатов, oracle-диагностик или необработанных различий. `Verifier` — независимый проверяющий контур. `Runtime export` — стандартизованная функция, которую production-процесс загружает по явному имени. `Scenario provider` — источник только нейтральных действий после фиксации всех решений. `Evaluator` — независимый вычислитель результата после получения неизменяемого observer-транскрипта.

## Что создано

- Для всех десяти verifier-пакетов создан `official-runtime-exports.ts`.
- Каждый модуль имеет ровно два runtime-экспорта:
  - `OFFICIAL_SCENARIO_PROVIDER_HANDLER(request: OfficialScenarioProviderProcessRequest): OfficialScenarioProviderHandlerOutput`
  - `OFFICIAL_EVALUATOR_HANDLER(request: OfficialEvaluatorProcessRequest): OfficialEvaluatorHandlerOutput`
- Для BG-D01 создан отдельный нейтральный `scenario-provider.ts` и его локальный manifest — файл привязки пути, имени экспорта и SHA-256.
- Девять существующих SES-022 providers обёрнуты без изменения их байтов и вызываются через `NEUTRAL_SCENARIO_PROVIDER_EXPORT`.
- Для каждого из десяти wrapper-модулей создан локальный `official-runtime-exports.manifest.json` с точными двумя именами экспортов и SHA-256 исходного файла.

## Безопасная структурная особенность BG-D03

Публичная observer-категория `render-summary` безопасно нормализуется shared observer-адаптером в read-only операцию `snapshot`. Эта операция читает только публичное свойство `planner.snapshot`; в transcript записывается имя операции `snapshot`. Verifier-wrapper воспроизводит последовательность публичных операций через transcript-backed адаптер и передаёт её существующей verifier-only проверке. Ни категория, ни значения ожидаемого результата не переносятся в shared-код.

## Хэши и количества

| Артефакт | Количество | SHA-256 |
| --- | ---: | --- |
| `official-runtime-exports.ts`, объединение байтов в порядке BG-D01…BG-H06 | 10 | `17da0f4b4a91bc040549b4d82797c65c04cb96e28889a115387ba976920ddc78` |
| `official-runtime-exports.manifest.json`, тот же порядок | 10 | `8c2929c321f89c2ba2729b649899bc66ca5bb363ab2c7686cdac5146bcfdc890` |
| BG-D01 `scenario-provider.ts` | 1 | `6bcae3cc9098aa922f028fdec79b5f75a764b7d6d4f9d09ef2e31f487b3a106d` |
| Новый boundary-test | 1 | `cfaaf0962da7fa7d313b6859a5d8d81bed3348410cba292969e6910419be68b9` |

Package-local SHA-256 wrapper-файлов:

| Fixture | SHA-256 |
| --- | --- |
| BG-D01 | `1632c86be03ba4fda63dd3e6bdfac91bcfd98dcb94c1af569f1a715cb5141871` |
| BG-D02 | `22649ff0354c9fcbc392c699674076e0b7f94ad19686c326f8e5d0f7907171dc` |
| BG-D03 | `e5ce3e9f83a8a0612cc28a1d8d97e2b32f7d001b6c3d87987d0e9f61f5edd191` |
| BG-D04 | `24a32cf846cb468a2f49c0641f4f8913be33e4fe96da913250496c32c1abf1f8` |
| BG-H01 | `725b9bcdf553ab0663ec28090df79c6927239ceb31e3db4c24b659bd97978b9b` |
| BG-H02 | `715d520216bff985b554e02c5fa0b7fa7d68b3b55e7fa59803238bc8616bd1cb` |
| BG-H03 | `8690aedf01d79c32917d9adb387707b5af4d485e5224c5592267b9d0ca02cd58` |
| BG-H04 | `464e61fc4a2d8d23538876b0096721e7a8af4436bc50ab8651840cbf3cb66ea0` |
| BG-H05 | `78d0b8af7cab44731e4ef42b3f1795b1afd1318965cbf1825a724d1aaae36bd2` |
| BG-H06 | `b66c0dba575d60981f10ca77e1fe4a6d058eb1c7b5d9491fa6b63c94cc3f6a2f` |

## Проверка и повторы

- `npm run compile`: **PASS** после одного локального исправления типизации. Первый compile корректно выявил, что объединённые литеральные типы SES-022 providers могли содержать TypeScript-only необязательные поля со значением `undefined`. Wrapper теперь пропускает provider через строгую публичную `OfficialScenarioProviderHandlerOutputSchema`; значения сценария не печатались.
- Первый целевой запуск через отсутствующий локальный loader `tsx`: **FAIL до выполнения тестового или product-кода**. Повтор выполнен штатным TypeScript-режимом Node.js 22 без установки зависимостей.
- Новый verifier runtime export test: **PASS 6/6**, включая schema-проверку evaluator output на полностью синтетическом публичном transcript.
- Новый тест вместе с унаследованным SES-022 provider boundary test: **PASS 18/18**.
- Manifest/hash reconciliation: **PASS 10/10 wrappers и 1/1 BG-D01 provider**.
- Проверка точного набора экспортов: **PASS 10/10**.
- Проверка строгой схемы нейтрального scenario output: **PASS 10/10**.
- Проверка отсутствия `console.log`, `console.error`, `console.warn`, `console.info` и `console.debug` в wrappers и отсутствия console writes при вызове provider handlers: **PASS**.

## Границы и оставшийся риск

- Реальные кандидаты не импортировались и не выполнялись; live model, official/scored run, unblinding, browser, MCP, сеть, Chromium, Claude, commit и push не использовались.
- Evaluator handlers проверены компилятором и структурными boundary-тестами. Их полный production-вызов намеренно не выполнялся, потому что он требует observer-транскриптов реального official-процесса и мог бы потребить запрещённый запуск.
- Координатору остаётся подключить явные module/export bindings, public BG-D03 alias и production root, затем выполнить только разрешённые synthetic/physical-isolation tests. Эта сессия не авторизует и не выполняет official/scored run.

Итог: изолированная verifier-часть готова к безопасной shared-интеграции; скрытые значения не раскрывались в отчёте или shared-коде.
