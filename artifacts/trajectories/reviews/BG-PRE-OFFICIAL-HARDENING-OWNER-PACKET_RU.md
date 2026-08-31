# SES-026 — пакет проверки pre-official hardening

Статус: **PASS; READY FOR SEPARATE TRANSPORT CANARY GATE**.

## Исправленный блокер

Production-команда создавала временный рабочий каталог в системном каталоге, тогда как OS-isolated launcher допускает рабочий каталог только внутри clean repository root. До исправления официальный запуск создал бы create-once evidence root и затем детерминированно остановился при первом process launch.

Теперь временный runtime root создаётся непосредственно внутри clean repository root, проверяется как вложенный путь и удаляется в `finally`. Regression test подтверждает расположение и очистку.

## Полный synthetic rehearsal

- Slots: **20**.
- Immutable arm decisions: **40**.
- Independent captures: **80**.
- Finalized observation pairs: **40**.
- Evaluator records: **40**.
- Offline replay parity: **PASS**.
- На десятом слоте искусственно создан BeyondGreen transport failure. Он дал ровно один `abstain`; выполнение всех последующих слотов, наблюдений, оценок и replay завершилось.
- Divergent, missing и malformed capture по-прежнему fail closed до evaluator.

## Проверки

- `npm run compile`: **PASS**.
- Bounded test suite: **12/12 PASS**.
- Физический запрет verifier-read и network: **PASS**.
- `git diff --check`: **PASS**.
- Control checksums: **720/720 PASS**.
- Остаточных `.official-runtime-*` каталогов: **0**.
- Official output root после rehearsal: **отсутствует**.

## Честно сохранённый повтор

Первый запуск нового rehearsal-теста завершился одним test-only assertion failure: synthetic evaluator пытался сравнить `ordinal`, которого намеренно нет в process slot. Сам coordinator уже создал один правильный `abstain` и завершил runtime до проверки. Исправлена только тестовая привязка: утверждённый ordinal 10 заранее разрешается в публичный `slotId`. Повтор прошёл 12/12.

## Что не выполнялось

- Real candidates executed: **0**.
- Live model calls: **0**.
- Official/scored runs: **0**.
- Unblinding: **false**.
- `evaluation:run`, commit и push не выполнялись.

Следующий шаг отделён от official attempt: один публичный non-scored transport canary с фиксированным синтетическим prompt и точной production JSONL/output-schema командой. Он не должен содержать candidate ID, candidate bytes, verifier/oracle data, создавать official output или выполнять unblinding.
