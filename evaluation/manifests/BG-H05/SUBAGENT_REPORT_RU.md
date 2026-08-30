# BG-H05 — отчёт дочернего агента о реализации

## Объём и результат

В изолированной ветке реализована только фикстура `BG-H05` класса
`external_store` — внешнее хранилище состояния. Замороженные тексты поведения,
происхождение и карточка владельца не изменялись. Созданы публичный для обеих
оцениваемых сторон контракт, оснастка React/jsdom, отрисовка, четыре видимых
утверждения, два нейтрально названных кандидата `candidate-a` и `candidate-b`,
закрытый для оцениваемых сторон канонический проверяющий сценарий, правильное
соответствие кандидатов, самопроверка, взаимные проверки запрета доступа и четыре
манифеста с SHA-256.

Публичная часть не раскрывает, какой кандидат сохраняет поведение. Соответствие
находится только в `evaluation/verifier-only/BG-H05/ground-truth.json`. Сохраняющий
вариант поддерживает одну согласованную ревизию и подписки всех подключённых
индикаторов. Вариант с единственным посеянным дефектом отражает собственную запись
панели, но не получает изменения от внешнего производителя. Вторых дефектных
семейств не добавлено.

## Границы и происхождение

Реализация создана только из утверждённой синтетической спецификации и уже
зарегистрированных публичных источников React `useSyncExternalStore` и Preact
Signals. Внешние рабочие области, глобальная память, браузер, частные MCP-ресурсы,
частные данные и иные фикстуры не читались. Claude, Chromium, живая модель продукта,
официальный или оцениваемый запуск и раскрытие скрытых результатов не выполнялись.
Внутренние необработанные события дочернего агента не заявляются как экспортированная
трасса.

Проверка возможностей файловой системы запускает публичный процесс без разрешения
читать, перечислять, проверять метаданные или открывать закрытый пакет. Обратная
проверка запускает процесс проверяющего без разрешения читать кандидатов. Обе стороны
получили только нужные каталоги; правило `K=0`, то есть ноль обратной связи от
эталона до решения, сохранено.

## Точные команды и результаты

1. `zsh -lic 'node --version'` — код 0, `v22.22.3`. Перед полезным выводом оболочка
   сообщила, что не может включить `monitor` и инициализировать `gitstatus`; версия
   среды при этом подтверждена.
2. `zsh -lic 'npm ci --ignore-scripts'` — код 0; установлены 54 пакета, проверены 55,
   известных уязвимостей нет. Оболочка повторила те же два сообщения инициализации.
3. Локальная для двух фикстур команда компиляции ниже завершилась с кодом 0;
   ошибок TypeScript нет.

   ```text
   zsh -lic './node_modules/.bin/tsc --noEmit --allowImportingTsExtensions --module NodeNext --moduleResolution NodeNext --target ES2024 --lib ES2024,DOM --jsx react-jsx --strict --skipLibCheck --types node candidates/BG-H05/candidate-a/UnitReadout.ts candidates/BG-H05/candidate-b/UnitReadout.ts evaluation/arm-visible/BG-H05/contract.ts evaluation/arm-visible/BG-H05/render.ts evaluation/arm-visible/BG-H05/harness.ts evaluation/arm-visible/BG-H05/visible-assertions.ts evaluation/arm-visible/BG-H05/visible.test.ts evaluation/arm-visible/BG-H05/isolation.test.ts evaluation/verifier-only/BG-H05/canonical-driver.ts evaluation/verifier-only/BG-H05/self-check.test.ts candidates/BG-H06/candidate-a/ThemePanel.ts candidates/BG-H06/candidate-b/ThemePanel.ts evaluation/arm-visible/BG-H06/contract.ts evaluation/arm-visible/BG-H06/render.ts evaluation/arm-visible/BG-H06/harness.ts evaluation/arm-visible/BG-H06/visible-assertions.ts evaluation/arm-visible/BG-H06/visible.test.ts evaluation/arm-visible/BG-H06/isolation.test.ts evaluation/verifier-only/BG-H06/canonical-driver.ts evaluation/verifier-only/BG-H06/self-check.test.ts'
   ```
4. `zsh -lic 'node --test evaluation/arm-visible/BG-H05/visible.test.ts evaluation/arm-visible/BG-H05/isolation.test.ts evaluation/verifier-only/BG-H05/self-check.test.ts evaluation/arm-visible/BG-H06/visible.test.ts evaluation/arm-visible/BG-H06/isolation.test.ts evaluation/verifier-only/BG-H06/self-check.test.ts'`
   — код 0, всего 14/14 проверок успешно; для BG-H05 успешны четыре видимых
   утверждения, одна проверка взаимной изоляции и две проверки эталона.
5. Локальная команда Node с `createHash("sha256")`, прочитавшая только восемь
   перечисленных манифестов и их файлы, проверила восемь манифестов двух
   фикстур, каждый перечисленный файл, привязку замороженного поведения и
   происхождения — `8/8 packages and all file hashes passed`.
6. После создания верхних манифестов та же точная команда компиляции и указанная в
   пункте 4 команда тестов выполнены повторно: код 0, компиляция без ошибок,
   14/14 проверок успешно. Верхняя проверка неизменяемости вернула
   `BG-H05/BG-H06 immutable implementation manifests: PASS`.

## Ошибки, исправления и решение

Одна составная операция `apply_patch` была отклонена до изменения файлов из-за
неверной границы нескольких блоков обновления: `invalid hunk ... Unexpected line
found in update hunk`. Операция была безопасно разделена на меньшие патчи; смысл
фикстуры не менялся. До первой компиляции также были исправлены две локально
обнаруженные детерминированные ошибки реализации: сохранение последнего наблюдения
после отключения индикатора и хранение ожидающей операции React между отрисовками.
После этого первая компиляция и первый тестовый запуск прошли без отказов; повторов
тестов из-за падения не было.

Первая поисковая проверка возможной утечки соответствия была намеренно широкой и
вернула код 1 на обычные слова `Preserves` и `preserves` в публичных описаниях
инвариантов. Закрытых меток она не обнаружила. Маска была сужена до точных значений
`false_green`, `false-green`, `behavior-preserving` и двух утверждённых имён
дефектов; повторная проверка вернула `Arm-visible candidate mapping leak scan: PASS`.

Решение: фикстура соответствует утверждённой заморозке и готова к объединению
координатором после проверки commit. Запросов на изменение общих реестров, задач,
сценариев package.json, общего индекса контрольных сумм или интеграционных тестов
нет.
