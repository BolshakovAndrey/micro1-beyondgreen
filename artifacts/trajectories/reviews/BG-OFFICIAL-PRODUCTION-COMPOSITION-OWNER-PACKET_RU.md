# Карточка SES-021: production composition перед официальным запуском

Граница: `SES-20260831-021`<br>
Ветка: `codex/beyondgreen-official-runner`<br>
Исходный HEAD: `3d916e73a13553583660bc88633366f5bc8eede9`

## Решение владельца

Владелец разрешил реализовать только физически разделённую production composition — рабочую сборку процессов `arm`, `observer`, `evaluator` и post-decision scenario handoff, то есть передачу нейтрального сценария только после неизменяемых решений. Разрешены исключительно синтетические тесты и тесты физических границ.

Это решение не разрешает импорт или запуск реальных candidates, чтение verifier/oracle content, live model, official/scored run, unblinding, commit или push.

## Проверяемая гипотеза

Доказанный в SES-020 coordinator можно подключить к отдельным процессам так, чтобы:

- arms никогда не читали verifier-only paths;
- scenario provider открывался только после всех 40 immutable decisions и не читал candidates;
- observers получали только нейтральные действия и не читали verifier-only paths;
- evaluators получали только immutable decisions и neutral transcripts и не читали candidate roots;
- ни один oracle verdict, expected value, diagnostic или ground truth не попадал обратно в arm;
- каждый процесс выполнялся один раз, без сети и без retry.

## Стоп-условие

Если production hooks требуют чтения или изменения замороженных verifier/oracle файлов, переноса hidden scenario details в arm-visible код либо ослабления физической границы, работа останавливается. Незавершённая команда `evaluation:run` не регистрируется как исполняемая.

## Текущий статус

`COMPOSITION_CONTRACT_READY_SCENARIO_PROVIDER_EXPORTS_MISSING`.

## Что реализовано

Coordinator теперь использует строгий порядок:

1. фиксирует все 40 arm decisions;
2. только после этого открывает post-decision stage;
3. изолированный `scenario-provider` выдаёт нейтральный список действий;
4. observer дважды независимо исполняет один scenario для каждой пары slot+arm;
5. совпадающие captures связываются в immutable pair;
6. только после успешной пары запускается evaluator.

`scenario-provider` — отдельная роль процесса. Она может получить verifier-owned scenario material, но физически не может читать candidates или arm-visible files. Observer может читать candidate и открытый harness, но физически не может читать verifier-only. Evaluator получает immutable decisions и neutral transcript, но не candidate root. Arms по-прежнему не читают verifier-only.

Neutral scenario schema — схема нейтрального сценария — рекурсивно запрещает поля, похожие на evaluator output: oracle, ground truth, expected value, verdict, diagnostic, diff, reason-correct, accepted и failure. Scenario release требует ровно 40 уникальных immutable arm decisions и SHA-256 всего decision set.

## Проверка

- targeted SES-020/SES-021 tests — 10/10 успешно;
- весь `tests/official` — 45/45 успешно;
- `npm run compile` — успешно;
- `npm run task -- official:preflight` — успешно: 10 fixtures, 20 candidates, 20 slots, 40 arm plans;
- `git diff --check` — успешно;
- реальные candidates не импортировались и не выполнялись;
- verifier/oracle content не читался;
- live model, official/scored run и unblinding не запускались.

После проверки два старых неоцениваемых D01 demo-файла повторно изменились в `22:45:57Z`. Ни одна команда SES-021 и ни один тест `tests/official` не вызывают записывающую команду `d01:demo`, поэтому источник классифицирован как неустановленный параллельный процесс. Эти байты не использовались как доказательство. По ранее выданному разрешению восстановлены ровно два затронутых файла из `3d916e73a13553583660bc88633366f5bc8eede9`; остальные файлы не откатывались. После восстановления оба файла совпадают с HEAD.

Три старых негативных теста один раз остановились из-за устаревшего ожидания порядка: они считали, что post-decision gate откроется после captures. В новой корректной схеме gate открывается после всех decisions, но до scenario release и captures. Изменены только три assertions; во всех случаях divergence, missing и malformed capture evaluator по-прежнему запускался ноль раз. Повтор прошёл.

## Оставшийся блокер

В frozen verifier packages D02–D04 и H01–H06 нет отдельных scenario-provider exports — экспортов, которые возвращают только нейтральные действия и не содержат ground truth. Сейчас существуют evaluator entrypoints, но их нельзя передать observer: evaluator нельзя давать candidate capability, а observer нельзя давать verifier capability.

В SES-021 запрещено читать или менять verifier/oracle content. Поэтому hidden actions не копировались, не угадывались и не переносились в arm-visible код. `evaluation:run` не подключена к незавершённому CLI.

Следующий безопасный шаг — отдельная independent verifier-authoring session: независимая сессия, которая единолично читает verifier-only packages, выделяет нейтральные scenario providers, повторно хеширует verifier manifests и возвращает только PASS/FAIL и digests. Evaluated arm implementation и live model не должны получать её hidden content. После этого coordinator сможет связать реальные D02–H06 role hooks без ослабления `K=0`.

Commit и push не выполнялись.
