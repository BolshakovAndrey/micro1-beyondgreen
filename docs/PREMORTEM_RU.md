# StateShift Guardian — cross-AI premortem

> **Архивный premortem:** это снимок рисков до утверждения BeyondGreen v1.1 и до
> реализации D01. Числа, имена и gate-статусы ниже не являются текущим состоянием;
> документ сохраняется как доказательство того, какие риски были обнаружены заранее.
> Актуальный checkpoint находится в
> `artifacts/trajectories/reviews/BG-D01-SCALE-READINESS-CHECKPOINT_RU.md`.

**Статус:** локальный управляющий анализ, не submission artifact
**Дата:** 2026-08-29
**Метод:** независимый Codex → независимый Claude Opus 5 → сверка Codex
**Решение:** текущую спецификацию v1.0 нельзя одобрять без rescope

Локальный `premortem-cross-ai` skill в clean-room-проекте отсутствовал. Его контракт
восстановлен из указанной пользователем задачи: предположить провал, назвать семь
причин, выбрать наиболее вероятную и наиболее опасную, указать скрытые допущения,
ранние сигналы и защитные проверки; провести независимые проходы Codex и Opus, затем
сопоставить. Приватный код в анализ не передавался. Raw-ответ Opus хранится только во
внешнем временном файле.

## 1. Итог

Концепция сильная, но v1.0 слишком велика для оставшегося времени: 12 фикстур, три
scored arms, generation, verifier, controls, mutation checks, eligible trajectories,
packaging и video при отсутствии product code и runs. Наиболее вероятный провал — не
успеть end-to-end vertical slice и submission. Наиболее опасный — сделать продукт,
но потерять scoring из-за отсутствующих eligible traces. Продуктовый риск: реальная
задача начинается с уже существующей signals-ветки, а v1.0 генерирует новую миграцию.

Рекомендация: до одобрения спеки перейти на один scored mode `verify-existing`, 10
synthetic fixtures, два scored arms и decision accuracy как primary metric. Targeted
repair оставить unscored demo follow-up. Performance оставить неблокирующим secondary
evidence и заявлять только после стабильных измерений.

## 2. Семь причин провала

### R1 — scope больше доступного времени

**Статус:** наиболее вероятная причина. Вероятность и влияние — критические.

- **Failure story:** к дедлайну готовы несколько fixtures, но нет полного verifier,
  ZIP или video; submission не проходит completeness.
- **Наблюдение:** меньше 59 wall-clock часов; нет product code, fixtures, lockfile,
  product runs и demo; v1.0 содержит 42 requirements, 12 fixtures, три arms и восемь
  фаз.
- **Скрытое допущение:** подробная спецификация автоматически ускоряет реализацию.
- **Ранний сигнал:** через четыре часа чистой implementation-задачи нет полного
  `input → verdict → evidence bundle`.
- **Предотвращение:** сначала один vertical slice; не создавать D02–D10 до D01.
- **Gate:** runnable one-case demo и полный evidence bundle не позднее T-40h.

### R2 — нет submission-eligible trajectories

**Статус:** наиболее опасная причина. Вероятность высокая, влияние максимальное.

- **Failure story:** code и video готовы, но product создан в ineligible task или
  `actual_traces: []`; QG-TRACE блокирует scoring.
- **Наблюдение:** current authoring transcript исключён, boundary approval pending,
  eligible representative trajectories отсутствуют.
- **Скрытое допущение:** trajectory можно восстановить перед упаковкой.
- **Ранний сигнал:** первое product-изменение раньше approved boundary и trace capture.
- **Предотвращение:** новая neutral task → boundary approval → test eligible trace →
  review pipeline → только потом product code.
- **Gate:** product paths нельзя менять, пока trajectory index не содержит eligible
  запись новой задачи.

### R3 — packaging и video впервые проверяются в финальные часы

- **Failure story:** clean extraction не запускается, video link требует permission
  или scanner требует пересоздать artifact после дедлайна.
- **Наблюдение:** нет Makefile, `submission/`, `dist/`, public video и extraction run.
- **Скрытое допущение:** packaging — механический последний шаг.
- **Ранний сигнал:** submission command и placeholder video не проверены к T-30h.
- **Предотвращение:** ранний delivery dry run с временным содержимым.
- **Gate:** T-30h — archive → clean extract → setup/test/demo → signed-out video test.

### R4 — judge не воспроизводит model-backed результат

- **Failure story:** нет lockfile или `eval` требует авторизованный Claude/network.
- **Наблюдение:** stack, model adapter и offline fallback не зафиксированы.
- **Скрытое допущение:** disclosure модели и cost достаточно для reproducibility.
- **Ранний сигнал:** первый live model run раньше record/replay cassette.
- **Предотвращение:** pin stack и lockfile; model calls через cassette adapter; offline
  replay — judge default, live — opt-in.
- **Gate:** evaluation без network/credentials даёт тот же functional digest.

### R5 — primary metric не соответствует verify mode

- **Failure story:** Guardian верно отклоняет false greens, но BPMR считает правильный
  reject нулём; safety растёт, headline metric — нет.
- **Наблюдение:** BPMR требует delivered accepted patch; реальный workflow проверяет
  существующий candidate.
- **Скрытое допущение:** safety gate автоматически улучшает throughput metric.
- **Ранний сигнал:** Guardian ловит defects, но BPMR равен или ниже baseline.
- **Предотвращение:** для `verify-existing` сделать decision accuracy primary, BPMR —
  supporting только для repair path.
- **Gate:** arithmetic metric sanity pilot на двух dev cases до freeze.

### R6 — baseline выглядит намеренно слабым

- **Failure story:** Arm B получил visible contract, но ему предписано остановиться на
  зелёных legacy tests; judge считает margin эффектом искусственного stop rule.
- **Скрытое допущение:** распространённая ошибка автоматически делает coding-agent
  baseline честным.
- **Ранний сигнал:** prompt ограничивает использование доступных сведений или effort.
- **Предотвращение:** baseline для verify mode — реальный status quo:
  `visible tests pass → accept`; дополнительный coding-agent ablation только после
  critical path.
- **Gate:** red-team review baseline policy до scored runs.

### R7 — продукт решает benchmark-задачу, а не рабочую задачу

- **Failure story:** инженер приходит с неполной signals-веткой, но quick start требует
  новую generation и benchmark manifests; продукт не внедряется.
- **Наблюдение:** v1.0 generation-first; реальный пользователь хочет audit существующей
  branch, затем targeted repair.
- **Скрытое допущение:** generation benchmark и candidate review имеют один task shape.
- **Ранний сигнал:** quick start нельзя выразить одной командой с sample candidate.
- **Предотвращение:** один primary mode `verify-existing`; repair — human-approved
  follow-up, сначала unscored demo.
- **Gate:** новый пользователь получает verdict одной командой без authoring manifests.

## 3. Взаимодействия рисков

- **Scope × traces:** schedule pressure провоцирует код в уже открытой ineligible task.
  Trace-first gate должен существовать до product code.
- **Metric × one-shot unblinding:** ошибку метрики после held-out уже нельзя исправить
  без потери честного v1 claim. Нужен dev-only sanity pilot.
- **Model × deadline × reproduction:** flaky live run одновременно тратит время,
  создаёт fail-closed zeros и ломает judge reproduction. Нужен cassette-first.
- **Private legacy × last mile:** параллельные контуры допустимы при физической
  изоляции; перенос private artifacts в public demo в конце требует пересоздания.
- **Два режима × fixture freeze:** добавление второго task shape после freeze ломает
  hashes. До дедлайна реалистичен ровно один scored mode.

## 4. Сверка Codex и Opus

| Область | Итог |
| --- | --- |
| Scope vs deadline | Оба назвали критическим; принято |
| Eligible traces | Оба назвали qualification blocker; первый следующий gate |
| Packaging/video | Принят T-30h delivery dry run |
| Lockfile/model replay | Принят offline replay до scored runs |
| BPMR vs safety | Принят пересмотр при выборе verify mode |
| Baseline fairness | Принят strawman-risk |
| Existing candidate | Принят `verify-existing` как рекомендуемый single mode |
| Остановить private legacy task | Отклонено: изоляции достаточно |
| Fold Phase 0.5 into D01 | Отклонено: нарушает pre-fixture separation |
| Использовать `claude-sonnet-5` | Отклонено: модель не подтверждена и не выбрана |
| Полностью удалить performance | Частично отклонено: оставить optional secondary |
| Считать 4 fixtures qualification-safe fallback | Отклонено |
| Текущий numeric rubric score `4/100` | Отклонено: при gate FAIL score неприменим |

## 5. Рекомендуемый v1.1 rescope

### Оставить

- один mode: `verify-existing`;
- 10 synthetic fixtures: 4 development + 6 held-out;
- preserving и seeded false-green candidate для каждой fixture;
- два scored arms на одинаковых candidates:
  - baseline: `visible legacy tests pass → accept`;
  - Guardian: risk inventory → generated probes/contracts → independent verdict;
- primary metric: decision accuracy по 20 фиксированным candidates;
- supporting: defects caught из 10, false alarms из 10, completion, runtime, human
  time и cost;
- один frozen seed и один scored attempt;
- process/filesystem oracle isolation и access-denial test;
- fail-closed verdict, evidence bundle, eligible trajectories, changelog,
  reproduction, public video и clean ZIP.

### Targeted repair

После rejected candidate Guardian может предложить минимальный repair в отдельной
human-approved demo iteration. Repair показывает путь к useful result, но не входит в
primary scored comparison и не получает verifier feedback внутри scored attempt.

### Отложить

- `generate-migration` как scored mode;
- третье scored coding-agent arm;
- полный mutation catalog — оставить один smoke control;
- GUI до работающего CLI/evidence bundle;
- performance как central claim;
- новые control-plane документы, не закрывающие qualification gate.

### Не сокращать

- минимум 10 cases и один challenging case;
- runnable baseline и advanced solution на одних cases;
- live-captured eligible trajectories;
- clean-room/provenance;
- end-to-end demo с реальным output;
- README, Improvement Changelog и exact reproduction commands;
- public video до пяти минут;
- ZIP, manifest, checksums и clean extraction;
- negative results и limitations;
- oracle access-denial test.

## 6. Предлагаемые v1.1 метрики

```text
correct_decision = (accept AND preserving) OR (reject AND non_preserving)
decision_accuracy = correct_decisions / 20
defect_recall = rejected_false_green_candidates / 10
false_alarm_rate = rejected_preserving_candidates / 10
completion_rate = complete_evidence_bundles / 20
```

Предлагаемые, но ещё не утверждённые gates:

- Guardian decision accuracy `>=18/20`;
- Guardian превышает baseline минимум на `8/20`;
- defect recall `>=9/10`;
- false alarm rate `<=1/10`;
- completion `>=19/20`.

Перед freeze обязателен arithmetic sanity check и development pilot без held-out.

## 7. Следующие пять действий

1. Андрей принимает либо отклоняет v1.1 rescope до одобрения v1.0.
2. В новой neutral task обновляются normative spec/projections, boundary, stack,
   lockfile и offline replay contract.
3. Одна настоящая eligible trajectory проходит raw digest, scanner, human review и
   index до product code.
4. Один D01 vertical slice проходит candidate → baseline → Guardian → verifier →
   evidence bundle → replay.
5. До масштабирования выполняются package stub, clean extraction и signed-out
   placeholder video check.

## 8. Qualification readiness сейчас

| Gate | Статус | Причина |
| --- | --- | --- |
| Eligibility | UNKNOWN | Репозиторий не доказывает регистрацию/возраст/payout; human check |
| Completeness | FAIL | Нет product code, runs, ZIP и public video |
| Integrity/originality | UNKNOWN | Controls есть, submission artifacts ещё нет |
| Agent traces | FAIL | `actual_traces: []`, текущие tasks ineligible |
| Reproducibility | FAIL | Нет lockfile, product commands, offline run и extraction |

До qualification числовой rubric score — `not_applicable`. Verdict относится к
readiness v1.0: **FAIL — требуется rescope**, а не к ценности концепции.
