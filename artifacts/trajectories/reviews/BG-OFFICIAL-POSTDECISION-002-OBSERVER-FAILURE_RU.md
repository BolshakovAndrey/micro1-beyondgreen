# BeyondGreen — отказ POSTDECISION-002 на первом observer

Статус: **PARTIAL_CREATE_ONCE_OBSERVER_FAILURE**<br>
Время read-only проверки: `2026-08-31T10:23:47Z`

## Выполненная команда

Владелец ровно один раз запустил утверждённую задачу
`evaluation:recover-post-decision` после checkpoint commit
`2a6d2469e3f3fb41ee4a308484c6e8c249df30c4`.

Результат:

```text
POST_DECISION_RECOVERY_FAILED OBSERVER_PROCESS_FAILURE:HANDLER_FAILURE
```

Команда не повторялась. Каталог результата не удалялся, не перезаписывался и не
регенерировался.

## Что успело сохраниться

Create-once writer создал только четыре control-файла:

- `source-manifest.json`;
- `source-execution-plan.json`;
- `provenance.json`;
- `recovery-manifest.json`.

Каталоги observer и evaluator существуют, но содержат 0 и 0 записей. Aggregate,
JSON/HTML report и offline replay отсутствуют.

Четыре сохранённых файла занимают 18 625 байт. Их SHA-256:

- `provenance.json`: `b4881881ddb129b02da60b28e56052ba615d6fb592e22213671f7fa6706cbb58`;
- `recovery-manifest.json`: `6c1fd03f35fe858ecb8b19f5fcd12feb973eb23e26983bf5f1ceaf28e31b9117`;
- `source-execution-plan.json`: `bbfb41f6656a48301ec28224c9f9244f7ce006474d47b94d0e18cb0dc49cb8c7`;
- `source-manifest.json`: `004852aaf66e25afb989a5ec29f1269edc497d3c64af426638fc881abd1c3f54`.

Provenance подтверждает:

- arm execution count: 0;
- model invocation count: 0;
- retries: 0;
- source inventory SHA-256:
  `4b9d4100667af58f7b995ff00d4c39b81922a8cf4656c0a93fa59c7ecc0a345c`;
- current inventory SHA-256:
  `9bffe4f104f09ff576fcb12e7a79d66b45a54a7306efbef332b4446dae849db2`;
- разрешённая причина drift: verifier repair SES-034.

RUN-002 повторно прошёл source-manifest проверку: 44 файла, bundle SHA-256
`5df68dc714d66ca44852d2487213ae5bb222f8444cedc734ccaabdf2abbe6d95`.

## Точная точка отказа

По детерминированному порядку frozen execution plan первым observer-вызовом является:

- slot: `BG-D01:candidate-a`;
- arm: `status-quo`;
- capture ordinal: 1.

Coordinator сначала получает все нейтральные сценарии в памяти, затем начинает
observer loop. Код ошибки относится к observer, а не scenario provider; следовательно,
provider-этап завершился, но ни один capture не был записан.

## Детерминированно найденный блокер

Нейтральный сценарий BG-D01 заканчивается шагом:

```text
dispose {}
```

`captureD01ObserverBridgeTranscript` сначала нормализовал весь список шагов. Его
`normalizeStep` поддерживает `observe`, `dispatch` и сокращённые D01 actions, но не
поддерживает `dispose`. Поэтому он категориально отклонял этот шаг до mount кандидата.
Старый process boundary намеренно заменял внутреннюю причину общим кодом
`HANDLER_FAILURE`, поэтому исходная попытка не позволяла доказать точную runtime-стадию
по сохранённому output. Тем не менее несовместимость была гарантированным блокером
первого BG-D01 observer.

Сам bridge уже вызывает `mounted.dispose()` в `finally`; следовательно, проблема —
несогласованный lifecycle vocabulary между provider и observer adapter, а не ошибка
кандидата или скрытого эталона.

## Перекрёстная read-only проверка остальных fixtures

Проверены action vocabularies всех десяти scenario providers и соответствующих
observer adapters. Общий dispatch observer поддерживает `observe`, `dispatch` и
`dispose`; специализированные D03, H01, H02 и H05 adapters покрывают свои frozen
actions. В представленном наборе единственная найденная статическая несовместимость —
терминальный `dispose` BG-D01. Последующая SES-036 подтвердила исправление
production-equivalent прогоном всех 80 observer captures.

## Рекомендованное снятие блокера

Нужна новая ограниченная граница:

1. Добавить в D01 observer bridge поддержку ровно одного терминального `dispose`,
   запретив действия после него и сохранив автоматический cleanup при его отсутствии.
2. Не менять frozen scenario, candidate, oracle, decisions или scoring.
3. Добавить regression test с точным production BG-D01 scenario.
4. До нового official continuation выполнить production-equivalent observer-only
   rehearsal всех 20 candidate slots под реальными capability rules, без arms,
   моделей, evaluator scoring и записи official output.
5. Сохранить `POSTDECISION-002` побайтово неизменным и использовать новый create-once
   root `POSTDECISION-003`.

Рекомендация была принята в SES-036. Исправление и observer rehearsal завершены;
continuation, commit и push по-прежнему требуют отдельных разрешений.
