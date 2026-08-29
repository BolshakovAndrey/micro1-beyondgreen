# BG-D01 — карточка проверки поведения и происхождения

Владелец проверяет не код, а правила будущей синтетической фикстуры до появления
кода.

## Что подготовлено

- Новая clean boundary `SES-20260829-003` с точным разрешением владельца.
- Полные EN/RU описания пользователя, музейной области, действий, видимых тестов,
  скрытой границы evaluator и правил двух будущих кандидатов.
- Machine freeze record и provenance record с хешами текстов.
- План захвата и проверки траектории `TRC-BG-D01-001`.
- Changelog entry; никаких product/evaluation runs не было.

## Главное правило поведения

Одно действие `allocate twice` обязано накопить две прибавки: `старое + 2 * шаг`.
Видимые legacy-тесты проверяют только одиночную прибавку, поэтому будущий кандидат с
потерянной второй прибавкой сможет остаться зелёным и станет честным false green.
Словарь теперь явно разделяет разрешённые test actions `allocate once` / `remove
once` и canonical `allocate twice`; labels `allocate-1x2`, `allocate-3x2` и
`remove-3x1` однозначно кодируют step и multiplicity. Новых проверок или дефектов не
добавлено.

## Privacy и происхождение

Использованы только repository contracts и уже записанные публичные React anchors
про snapshot и очередь обновлений. Музейная область, 300 ID, действия, числа и
инварианты придуманы независимо. Home/shared memory, соседние или приватные
репозитории, browser state, connected apps и private MCP не читались. Значения и
пути private env variables не раскрывались.

Исключений или редакций содержимого packet нет. Raw trajectory ещё не экспортирована
и не представляется одобренным trace. Если будущий raw scan потребует удаления
machine/private metadata, это будет отдельный review.

## Ошибки, повторы и неопределённость

На момент составления карточки product code, candidates и oracle отсутствуют, поэтому
их корректность остаётся `UNKNOWN`. Phase 0.5 render result доказывает только
измеримость synthetic scenario. CPU improvement не доказано: средний `TaskDuration`
advanced был 5,0037 мс против 4,7071 мс baseline.

Codex CLI оплачивается фиксированной подпиской. Долларовая стоимость отдельного
запуска не вычисляется, не оценивается и не ограничивается cap; monetary cost будет
`not_applicable` или `not_measured`. Для воспроизводимости сохраняются billing mode,
monetary-cost status, модель/режим, число вызовов и технические лимиты. Tokens —
только если CLI сообщает их явно и стабильно.

## Оставшиеся блокеры

1. Владелец должен проверить EN/RU parity, точность поведения и независимое
   происхождение.
2. Текущая траектория должна пройти внешний raw capture, автоматический scan и
   отдельный human trace review до индексирования.
3. React/signals code требует отдельного явного implementation checkpoint.
4. Candidates, verifier-only oracle и official/scored runs требуют последующих gates.

## Что разрешит одобрение

Одобрение зафиксирует только D01 behavior/provenance packet и позволит запросить
отдельный implementation checkpoint. Оно **не** разрешит автоматически писать
React/signals components, строить candidates/oracle, вызывать model/Chromium,
запускать official benchmark, делать commit или push.

## Вопрос владельцу

`Подтверждаете BG-D01 EN/RU behavior/provenance packet как независимо созданный, точный и безопасный freeze и разрешаете после него отдельно запросить implementation checkpoint?`

## Решение владельца

- **Статус:** approved.
- **Время:** `2026-08-29T14:50:15Z`.
- **Точное подтверждение:** `Подтверждаю BG-D01 freeze`.
- **Разрешено:** считать EN/RU behavior/provenance packet замороженным и безопасным
  источником для будущей independently authored D01 реализации; перейти только к
  запросу отдельного implementation checkpoint.
- **Не разрешено:** React/signals component code, реализация fixture/candidate/oracle,
  model/Chromium, official/scored benchmark, commit или push.
