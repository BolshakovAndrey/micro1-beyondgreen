# BeyondGreen — гейт восстановительного RUN-002

Статус: **одобрено владельцем 31 августа 2026 года в 08:40:04 UTC**. Разрешён
ограниченный checkpoint commit из 21 recovery-файла без push, после которого
владелец лично запускает RUN-002 ровно один раз.

## Почему RUN-002 допустим

RUN-001 завершился до первого arm decision, candidate execution и live-model call.
Ни один из 20 кандидатов не израсходовал свою единственную оцениваемую попытку,
unblinding не происходил. RUN-001 сохраняется неизменным и не скрывается.

Причина была инфраструктурной: production role entrypoint пытался загрузить модуль вне
своего точного filesystem allowlist. Исправление не меняет candidates, verifier
behavior, visible assertions, ground truth, scoring, модель или retry policy.

## Доказательства исправления

- compile: PASS;
- ordinary tests: 220/220;
- D01 vertical slice: 19/19;
- production-equivalent physical role process: все четыре роли PASS;
- synthetic coordinator: 20 slots, 40 decisions, 80 captures, 40 evaluations;
- freeze self-test, development и held-out verification: PASS;
- обе clean-room preflight-проверки: PASS;
- RUN-001 SHA-256 повторно подтверждены;
- RUN-002 отсутствует.

## Команда владельца

После checkpoint commit владелец выполняет ровно один раз из обычного Terminal:

```bash
MICRO1_OFFICIAL_SESSION_BOUNDARY=SES-20260831-033 npm run task -- evaluation:run --evaluation-version eval-v1.1.0
```

Агент не запускает команду. При любом исходе повтор, удаление, перезапись, починка или
регенерация RUN-001/RUN-002 запрещены. Unblinding разрешается только после фиксации всех
40 arm decisions.
