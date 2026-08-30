# TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-002 — проверенная структурная проекция

**Граница:** `SES-20260830-017`
**Вид захвата:** один автоматический JSONL-поток Codex CLI одновременно передан в защищённый capture и репозиторный структурный projector
**Продвижение:** ожидает отдельного точного решения владельца

## Объём и неизменяемая идентичность

Read-only continuation — продолжение только для чтения — повторило заданную
инструкцией проверку ровно тринадцати файлов `SES-015` на HEAD
`cb51e7de1e9908088dbef4dbeb29946d1edbc16b`. Более поздние файлы `SES-016`,
`SES-017` и projector являются служебными и не входят в проверяемую реализацию.

Квитанция защищённого capture и независимо вычисленная projector-идентичность
совпали:

- размер: `290598` bytes;
- SHA-256: `6f153ceab21a839daabdb41e6eca5c1a9eaa5395215a416c4bf847fa14e4c8c5`;
- событий JSONL: `18`;
- промежуточный raw-файл не создавался.

Первоначальная неудачная трасса, `CONT-001`, отклонённая до запуска shell-команда и
неудачный patch внешнего wrapper сохранены только как retry records — записи
повторных попыток. Они не являются доказательством этой continuation.

## Контракт конфиденциальности

Projector сохранил только номер события, порядок в неизменяемом исходном потоке,
тип события/элемента из закрытого списка, структурную роль, наличие tool-call и
tool-result, статус завершения и целочисленный exit code. Raw content, аргументы
инструментов, внешние пути, значения environment, runtime-идентификаторы и данные
об использовании исключены конструктивно.

Owner-controlled raw scan — автоматическая проверка владельца — сообщил ноль
совпадений private terms до и после обезличивания путей, ноль адресов электронной
почты, присваиваний секретов и абсолютных пользовательских путей. Stderr проверяющего
является строгим UTF-8 и отдельно дал нули по путям, email и секретам.

## Полный структурный журнал событий

| № | Событие | Элемент | Роль | Вызов инструмента | Результат инструмента | Статус | Exit |
| ---: | --- | --- | --- | --- | --- | --- | ---: |
| 1 | `thread.started` | `none` | `system` | нет | нет | `none` | — |
| 2 | `turn.started` | `none` | `system` | нет | нет | `none` | — |
| 3 | `item.completed` | `agent_message` | `assistant` | нет | нет | `none` | — |
| 4 | `item.started` | `command_execution` | `tool` | да | нет | `in_progress` | — |
| 5 | `item.completed` | `command_execution` | `tool` | нет | да | `completed` | 0 |
| 6 | `item.completed` | `agent_message` | `assistant` | нет | нет | `none` | — |
| 7 | `item.started` | `command_execution` | `tool` | да | нет | `in_progress` | — |
| 8 | `item.completed` | `command_execution` | `tool` | нет | да | `completed` | 0 |
| 9 | `item.started` | `command_execution` | `tool` | да | нет | `in_progress` | — |
| 10 | `item.completed` | `command_execution` | `tool` | нет | да | `completed` | 0 |
| 11 | `item.started` | `command_execution` | `tool` | да | нет | `in_progress` | — |
| 12 | `item.completed` | `command_execution` | `tool` | нет | да | `completed` | 0 |
| 13 | `item.started` | `command_execution` | `tool` | да | нет | `in_progress` | — |
| 14 | `item.completed` | `command_execution` | `tool` | нет | да | `completed` | 0 |
| 15 | `item.started` | `command_execution` | `tool` | да | нет | `in_progress` | — |
| 16 | `item.completed` | `command_execution` | `tool` | нет | да | `failed` | 1 |
| 17 | `item.completed` | `agent_message` | `assistant` | нет | нет | `none` | — |
| 18 | `turn.completed` | `none` | `system` | нет | нет | `none` | — |

Хронология полна на разрешённом структурном уровне: у всех шести tool-call есть один
последующий tool-result; после exit `1` записано финальное сообщение, затем
`turn.completed`. Проекция намеренно не раскрывает, какая команда вернула `1`.
Инструкция заранее допускала ожидаемое несовпадение checksum, но эта структурная
проверка не выдаёт такое сопоставление за raw semantic evidence — смысловое
доказательство из исходного содержимого.

## Итог и ограничения

- Строгий UTF-8 и построчный разбор JSON-объектов: пройдены projector.
- Исходный порядок и соответствие вызовов/результатов: пройдены.
- Размер и SHA-256 capture/projector: полностью совпали.
- Автоматическая privacy-проверка raw и stderr: пройдена.
- Frozen surface — замороженные продуктовые данные и методика — не менялась
  процессом захвата; verifier работал только для чтения.
- Содержимое команд, аргументы и выдержки ответов исключены по решению владельца;
  точный смысл команд опирается на отдельную неизменяемую инструкцию и последующие
  репозиторные проверки.
- Продвижение запрещено до успешных итоговых checksums/preflight и отдельного
  решения владельца по этой ограниченной структурной доказательной записи.

Official/scored run, unblinding, вызов продуктовой модели, Chromium, browser/MCP,
Claude, commit и push не выполнялись и не заявляются.
