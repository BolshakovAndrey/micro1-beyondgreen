# BG-H06 — отчёт дочернего агента о реализации

## Объём и результат

В изолированной ветке реализована только фикстура `BG-H06` класса `rollback` —
откат. Замороженные тексты поведения, происхождение и карточка владельца не
изменялись. Созданы публичный контракт контроллера сохранения, оснастка React/jsdom,
отрисовка, четыре видимых утверждения успешного пути, два нейтрально названных
кандидата `candidate-a` и `candidate-b`, закрытый канонический сценарий успеха и
ошибок, правильное соответствие кандидатов, самопроверка, взаимные проверки запрета
доступа и четыре манифеста с SHA-256.

Публичная часть не раскрывает правильное соответствие. Оно находится только в
`evaluation/verifier-only/BG-H06/ground-truth.json`. Сохраняющий вариант откатывает
отображаемую тему к значению, подтверждённому перед конкретным запросом. Вариант с
единственным посеянным дефектом завершает ошибочный запрос и показывает
`save_failed`, но сохраняет предварительно показанную тему. Успешное сохранение,
запрет второго запроса, завершение операции и остальные правила одинаковы.

## Границы и происхождение

Реализация создана только из утверждённой синтетической спецификации и
зарегистрированных публичных источников React `useOptimistic` и Preact Signals.
Внешние рабочие области, глобальная память, браузер, частные MCP-ресурсы, частные
данные и иные фикстуры не читались. Claude, Chromium, живая модель продукта,
официальный или оцениваемый запуск и раскрытие скрытых результатов не выполнялись.
Внутренние необработанные события дочернего агента не заявляются как экспортированная
трасса.

Публичный процесс физически лишён доступа к каталогу проверяющего, а процесс
проверяющего — к исходникам кандидатов. Проверены чтение, перечисление и метаданные.
Правило `K=0`, то есть ноль обратной связи от эталона до неизменяемого решения,
сохранено.

## Точные команды и результаты

1. `zsh -lic 'node --version'` — код 0, `v22.22.3`; оболочка отдельно сообщила о
   недоступном `monitor` и неудачной инициализации `gitstatus`, что не изменило
   результат проверки версии.
2. `zsh -lic 'npm ci --ignore-scripts'` — код 0; установлены 54 пакета, проверены 55,
   известных уязвимостей нет; повторились только сообщения инициализации оболочки.
3. Локальная для двух фикстур команда компиляции ниже завершилась с кодом 0;
   ошибок TypeScript нет.

   ```text
   zsh -lic './node_modules/.bin/tsc --noEmit --allowImportingTsExtensions --module NodeNext --moduleResolution NodeNext --target ES2024 --lib ES2024,DOM --jsx react-jsx --strict --skipLibCheck --types node candidates/BG-H05/candidate-a/UnitReadout.ts candidates/BG-H05/candidate-b/UnitReadout.ts evaluation/arm-visible/BG-H05/contract.ts evaluation/arm-visible/BG-H05/render.ts evaluation/arm-visible/BG-H05/harness.ts evaluation/arm-visible/BG-H05/visible-assertions.ts evaluation/arm-visible/BG-H05/visible.test.ts evaluation/arm-visible/BG-H05/isolation.test.ts evaluation/verifier-only/BG-H05/canonical-driver.ts evaluation/verifier-only/BG-H05/self-check.test.ts candidates/BG-H06/candidate-a/ThemePanel.ts candidates/BG-H06/candidate-b/ThemePanel.ts evaluation/arm-visible/BG-H06/contract.ts evaluation/arm-visible/BG-H06/render.ts evaluation/arm-visible/BG-H06/harness.ts evaluation/arm-visible/BG-H06/visible-assertions.ts evaluation/arm-visible/BG-H06/visible.test.ts evaluation/arm-visible/BG-H06/isolation.test.ts evaluation/verifier-only/BG-H06/canonical-driver.ts evaluation/verifier-only/BG-H06/self-check.test.ts'
   ```
4. `zsh -lic 'node --test evaluation/arm-visible/BG-H05/visible.test.ts evaluation/arm-visible/BG-H05/isolation.test.ts evaluation/verifier-only/BG-H05/self-check.test.ts evaluation/arm-visible/BG-H06/visible.test.ts evaluation/arm-visible/BG-H06/isolation.test.ts evaluation/verifier-only/BG-H06/self-check.test.ts'`
   — код 0, 14/14 проверок успешно; для BG-H06 успешны четыре видимых утверждения,
   одна проверка взаимной изоляции и две проверки эталона.
5. Локальная команда Node с SHA-256, читавшая только восемь перечисленных
   манифестов и их файлы, проверила восемь манифестов, каждый файл,
   привязку поведения и происхождения — `8/8 packages and all file hashes passed`.
6. После создания верхних манифестов та же точная команда компиляции и указанная в
   пункте 4 команда тестов выполнены повторно: код 0, компиляция без ошибок,
   14/14 проверок успешно. Верхняя проверка неизменяемости вернула
   `BG-H05/BG-H06 immutable implementation manifests: PASS`.

## Ошибки, исправления и решение

Одна составная операция `apply_patch` была отклонена до записи с сообщением
`invalid hunk ... Unexpected line found in update hunk`; патч разделён на безопасные
малые операции без смыслового изменения. До компиляции исправлено хранение ожидающей
операции между React-отрисовками: локальная переменная заменена на `useRef`, чтобы
детерминированное завершение запроса использовало исходное подтверждённое значение.
Первая компиляция и первый тестовый запуск затем прошли; тестовых падений и
повторных попыток не было.

Первая широкая поисковая маска возможной утечки соответствия вернула код 1 только
на слова `Preserves` и `preserves` в публичном описании сохранения инвариантов, а не
на закрытые метки. После сужения до точных значений `false_green`, `false-green`,
`behavior-preserving` и двух утверждённых имён дефектов проверка вернула
`Arm-visible candidate mapping leak scan: PASS`.

Решение: фикстура соответствует замороженному классу отката и готова к объединению
координатором после проверки commit. Изменения общих путей не требуются; запросов к
координатору на общий реестр, задачи, package.json, индекс контрольных сумм или
интеграционные тесты нет.
