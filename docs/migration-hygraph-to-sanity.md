# Миграция CMS: Hygraph → Sanity

**Проект:** yashil-energiya.uz — Next.js 16 App Router, React 19, TS, next-intl (en/ru/uz), Vercel.
**Sanity:** проект `ljlv76fi`, датасет `production`, Studio — `studio/` (хостинг `yashil-energiya.sanity.studio`).
**Ветка:** `feature/sanity-migration`. `main` и прод работают на Hygraph до мержа этой ветки.
**Цель:** снять лимит бесплатного Hygraph в 2 локали и вести контент на uz в CMS.

> **Hygraph остаётся боевой CMS**, пока ветка не проверена на preview и не смержена. Скрипты миграции только читают Hygraph (AGENTS.md §9).

---

## Статус

| Этап | Статус |
|---|---|
| Инвентаризация реального контента | ✅ `extract.mjs`, `inventory.mjs` |
| Конвертер RichText → Portable Text | ✅ 160 полей, 0 ошибок, 0 потерь текста, 23 теста |
| Sanity Studio: схемы 8 типов, мультиязычный документ, русский интерфейс, табличный редактор | ✅ `studio/`, `sanity schema validate` — 0 ошибок |
| Трансформ в NDJSON + проверка ассетов | ✅ 161 документ, 0 ошибок; 448 ассетов доступны |
| Приложение на Sanity: сервисы GROQ, рендер PT, вебхук, SEO, конфиги | ✅ lint / typecheck / build; сервисы проверены на мигрированных данных (25 проверок) |
| Импорт в Sanity (модель «документ на язык») | ✅ 2026-09-23, проверен — **заменяется** новой моделью |
| **Пересоздание датасета под мультиязычные документы** | ⏳ владелец — «Регламент», шаг 3 |
| Деплой Studio, env в Vercel | ✅ Studio — передеплоить после смены схемы (шаг 5); env заданы |
| Preview-QA на 3 локалях → мерж → прод | ⏳ |
| Перевод контента на uz и включение индексации uz | ✅ 2026-10-03: 114 записей переведены, индексация uz включена |

---

## Ключевые решения

| Вопрос | Решение | Почему |
|---|---|---|
| i18n | **Field-level: один документ на запись**, вкладки «Общее» / English / Русский / Oʻzbekcha; одна кнопка Publish публикует все языки | Решение владельца (2026-09-24): контент публикуется сразу на 3 языках; обложки и фото загружаются один раз для всех языков (alt — по языкам) — в 2,4 раза меньше документов. Первый вариант (документ на язык, `@sanity/document-internationalization`) заменён |
| Studio | Русский интерфейс (`@sanity/locale-ru-kz`), таблицы — редактор-сетка `@sanity/table` | Удобство редакторов |
| Клиент | **Свой тонкий `fetch`** к Query API (`lib/sanity-client.ts`), без `next-sanity` | У `next-sanity` v13 обязательные peer-зависимости `sanity` + `styled-components` — ~900 пакетов в приложении, и styled-components запрещён AGENTS.md §1. Нужна была только обёртка с `next: { revalidate, tags }` — та же, что была для Hygraph |
| Запросы | **GROQ** | Без `graphql deploy` при каждом изменении схемы, произвольные проекции |
| Rich text | Portable Text, рендер `@portabletext/react` | Структурная конвертация без потерь |
| Ассеты | Перезалив **оригиналов** на `cdn.sanity.io` | Независимость от `graphassets.com`; OG-картинки режутся на CDN (`@sanity/image-url`) |
| URL | **Не меняются** | slug'и и id из Hygraph сохранены (см. «ID и роуты») |
| Studio | Отдельный пакет `studio/` (согласовано) | Не попадает в бандл сайта, не пересекается с маршрутизацией next-intl |
| Rollback | Vercel Instant Rollback на последний деплой с Hygraph | Hygraph не меняется, откат мгновенный |

Зависимости приложения: `+@portabletext/react`, `+@sanity/image-url`, `+@sanity/webhook` (всего 8 пакетов), `−graphql-request`, `−graphql`.

---

## Инвентаризация (снапшот 2026-09-23)

| Hygraph | Sanity | Локализован | Записей (en / ru) | Роут |
|---|---|---|---|---|
| `Article` | `article` | да | 7 / 7 | `/{locale}/articles/{slug}` |
| `New` | `news` | да | 71 / 71 | `/{locale}/news/{slug}` |
| `Plant` | `plant` | да | 20 / 20 | `/{locale}/plants/{id}` |
| `Vacancy` | `vacancy` | да | 2 / 2 | `/{locale}/vacancies/{id}` |
| `Manager` | `manager` | да | 14 / 14 | `/ceo` |
| `EvCharge` | `evCharge` | нет | 15 | карта |
| `Mhp` | `mhp` | нет | 18 | карта |
| `PlantStatus` | `plantStatus` | нет | 14 | карта |
| компонент `Seo` | объект `seo` | да | — | в article/news |
| `DemoComponent` | — | — | — | не переносится (не используется) |

**275 записей-локалей → 161 документ Sanity** (114 многоязычных записей + 47 записей для карт). «513» в Hygraph включали ассеты.

**Находки** (часть — дефекты текущего прода, миграция их исправляет):

1. Переводы en↔ru — 100%; дублей slug нет; **slug'и одинаковы в en и ru** у всех статей и новостей (uz-переводы получают тот же slug).
2. **Ассеты в Hygraph локализованы**: запрос с `locales: [ru]` возвращает `null` для ассета без ru-перевода. Поэтому **на ru-сайте у 10 СЭС видно 1 фото вместо 2–4, у одной новости нет обложки**. Экстрактор берёт ассеты по цепочке `[локаль, остальные]`; в Sanity ассеты не локализуются — у ru все фото.
3. **`heading-four` (6 шт.) сейчас не выводится** (`ThePageContent` → `default: null`): скрыты подзаголовки «Renewable Energy», «Green Energy», «Conclusion:» (en+ru). После миграции видны как `h3`.
4. **4 битые ссылки** в ru-версии `when-does-a-solar-plant-pay-off` (без `https://` → 404). Исправлены при конвертации.
5. **alt**: у 146 из 153 ассетов и 312 из 376 картинок в тексте нет `altText`; сейчас в `alt` попадает имя файла («en.png»). В Sanity `alt` пустой, пока его не заполнят (Studio показывает предупреждение).
6. Таблицы: 4, строка-заголовок выведена явным флагом «Первая строка — заголовок» (`hasHeaderRow`). **На ревью**: во 2-й таблице en-версии `when-does-a-solar-plant-pay-off` нет строки «Показатель | Значение», которая есть в ru, — заголовком стала первая строка данных (как и сейчас на проде).
7. `Plant.power/production/coal/…` — строки (как в Hygraph); `region6` подписан по-разному («Jizzakh» / «Jizakh»).
8. Порядок по умолчанию в Hygraph — `createdAt asc`. Трансформ переносит `_createdAt`, запросы сортируют по нему — списки и «последние СЭС» на главной совпадают.
9. Бесплатный Hygraph ограничивает частоту запросов (429), прод делит этот лимит — экстрактор работает с паузой и backoff.
10. Ассетов к импорту: **448 уникальных, 604 МБ** (оригиналы; картинки в тексте раньше отдавались пережатыми).

---

## Схемы Sanity (`studio/schemaTypes`)

**Мультиязычный документ** (`news`, `article`, `plant`, `vacancy`, `manager`): общие поля в корне (вкладка «Общее»), каждый язык — объект `en` / `ru` / `uz` (своя вкладка).

| Тип | Общее для всех языков | На каждом языке |
|---|---|---|
| `news` | `slug`, `date`, `cover` | `title`, `excerpt`, `description`, `seo` |
| `article` | `slug`, `publishedAt`, `cover` | `title`, `excerpt`, `content`, `seo` |
| `plant` | `date`, `trees`, `coords`, `pictures` | `title`, `address`, `power`, `production`, `coal`, `gases` (значения с единицами) |
| `vacancy` | `attachments` | `title`, `references`, `excerpt`, `description` |
| `manager` | `email`, `queue`, `photo` | `name`, `jobTitle` |

- English обязателен (ошибка), нет ru/uz — **предупреждение** «Нет перевода»: старые непереведённые записи можно править и публиковать. Внутри начатого языка заголовок обязателен.
- Общие картинки (обложка, фото СЭС и руководства): одна картинка, `alt` — объект `{ en, ru, uz }` (предупреждение о пустых). Картинки внутри текста — `alt` строкой (текст и так на своём языке).
- `plantStatus`, `evCharge`, `mhp` — без языков (`region` / `condition` — списки значений бывших enum).
- `richText`: стили `normal/h2/h3/h4/blockquote`, списки, `strong/em/underline/sup`, аннотация `link { href, openInNewTab }`, блоки `imageBlock` и **`dataTable`** = `{ hasHeaderRow, table }`, где `table` — сетка `@sanity/table` (ячейки — текст; в данных Hygraph форматирования в ячейках нет, кроме жирных строк-заголовков — их передаёт флаг).
- Координаты — `geopoint`, во фронт отдаются как `[lat, lng]`.
- Structure: у каждого типа «Все» и очереди «Без перевода: Русский / Oʻzbekcha». В списке у документа видно, какие языки заполнены: `EN ✓ · RU ✓ · UZ —`.

### ID и роуты

- `_id`: `<type>-<hygraphId>`. Без точек (id с точкой в Sanity приватный).
- **`entryId`** — публичный id записи: у перенесённых = id Hygraph, у новых генерируется (только чтение). Отдаётся как `id`, поэтому `/plants/{id}`, `/vacancies/{id}` и статистика просмотров новостей в Redis остаются валидными.
- `slug` — один на все языки (как и было в Hygraph у всех статей и новостей), генерируется из английского заголовка.
- Язык в запросах — `@[$locale]` (объект языка); `$locale` пропускается только из `en/ru/uz` (`cmsLocale` в `services/fragments.ts`). «Есть перевод» = заполнен заголовок языка.

---

## Приложение

| Область | Что сделано |
|---|---|
| Данные | `lib/sanity-client.ts` (`fetchData` с прежней сигнатурой), `services/*` на GROQ, общие проекции `services/fragments.ts`; формы ответов сохранены |
| Кэш | Все запросы с тегами `lib/cache-tags.ts` + прежний предел 300 с. Данные карт — без кэша (`no-store`, как сейчас: `revalidateTag` на Next 16 оказался ненадёжным, коммит `ef2e027`); они идут через API CDN Sanity, чтобы не расходовать квоту |
| Rich text | `ThePageContent` на `@portabletext/react` с прежними классами стилей; `TheTable` рендерит сетку `@sanity/table` и флаг `hasHeaderRow`; `TheImageModal` без изменений |
| uz | Страницы записей: вкладка Oʻzbekcha не заполнена → редирект на en (как сейчас); списки: нет ни одной записи с uz → редирект на en; виджеты, поиск, популярное, ассистент — откат на en (`loadWithFallback` в `src/lib/cms-locale.ts`) |
| SEO | hreflang записи = её реальные языки ∩ `cmsContentLocales` (`cmsAlternateLocales`); sitemap так же; OG-картинки режутся на Sanity CDN |
| Вебхук | `/api/revalidate` проверяет подпись Sanity (`SANITY_REVALIDATE_SECRET`), сбрасывает тег по `_type` |
| Конфиг | `next.config.js`: `images` → `cdn.sanity.io/images/**` (настройки оптимизации прежние), CSP `img-src` → `cdn.sanity.io`, домены Hygraph убраны; preconnect в layout; allowlist `/api/og-image` |

**Выключатель индексации uz** (включён 2026-10-03): добавить `"uz"` в `cmsContentLocales` (`src/lib/seo.ts`) и удалить правило `X-Robots-Tag: noindex` для `/uz/(news|articles|plants|vacancies)` в `next.config.js`. До этого uz-страницы CMS уже работают, но не индексируются и не попадают в hreflang/sitemap.

---

## Регламент: импорт → preview → прод

Все команды — из корня репозитория, Node 24.

### 1. Доступ на запись в Sanity (один раз, владелец)

Любой из вариантов:
- `cd studio && npx sanity login` — интерактивный вход в браузере (достаточно для импорта с этой машины);
- или токен: sanity.io/manage → проект → API → Tokens → **Editor** → в `.env.local` как `SANITY_API_WRITE_TOKEN` (только локально, **не** в Vercel). Для CLI передать как `SANITY_AUTH_TOKEN`.

### 2. Свежий снапшот и сборка датасета

```bash
node --env-file=.env.local scripts/sanity-migration/extract.mjs
node scripts/sanity-migration/inventory.mjs
node scripts/sanity-migration/convert-richtext.mjs
node scripts/sanity-migration/transform.mjs
node scripts/sanity-migration/check-assets.mjs
```

Каждый шаг завершается с ненулевым кодом при ошибке. Отчёты — `scripts/sanity-migration/.data/reports/`.

### 3. Импорт

**Однократно, при смене модели на мультиязычные документы (2026-09-24):** датасет пересоздаётся, потому что прежние документы «один на язык» имеют другие `_id` и `--replace` их не удалит. В датасете нет ничего, кроме импорта (проверено: 0 черновиков, 0 созданных вручную документов). Ассеты загрузятся заново — одинаковые файлы Sanity хранит один раз.

```bash
cd studio
npx sanity dataset delete production
npx sanity dataset create production --visibility public
npx sanity dataset import ../scripts/sanity-migration/.data/transformed/dataset.ndjson production --replace
```

**Дальше (финальная синхронизация при переходе)** — только последняя команда. Импорт идемпотентен (детерминированные `_id` и `_key`) — его можно перезапускать. Внимание: `--replace` **перезаписывает** документы, изменённые в Sanity после предыдущего импорта, и **не удаляет** документы, удалённые в Hygraph (сверять счётчики).

### 4. Проверка после импорта

- Счётчики по типам и языкам совпадают с `reports/transform.json` (например, `count(*[_type == "news" && defined(ru.title)])`).
- `_createdAt` перенёсся: `*[_type == "plant"] | order(_createdAt asc)[0...4].entryId` = первые 4 id из `extracted/plant.en.json`.
- `npx sanity documents validate -y` (из `studio/`) — без ошибок (предупреждения про alt и «Нет перевода: Oʻzbekcha» ожидаемы).
- Выборочно в Studio: статья с таблицами, новость с картинками, СЭС с галереей, вакансия.

### 5. Studio

```bash
cd studio
npm run deploy
```

Studio будет доступна на `https://yashil-energiya.sanity.studio`. Для локального `npm run dev` в Manage → API → CORS origins нужен `http://localhost:3333` (с credentials).

### 6. Vercel (Preview для ветки, затем Production)

| Переменная | Значение |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `ljlv76fi` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_REVALIDATE_SECRET` | случайная строка (та же — в вебхуке) |

`NEXT_PUBLIC_HYGRAPH_ENDPOINT` и `HYGRAPH_REVALIDATE_SECRET` новой версии не нужны — удалить из Production **после** мержа (старый деплой для отката использует свои значения).

### 7. Вебхук Sanity (Manage → API → Webhooks)

- URL: `https://yashil-energiya.uz/api/revalidate` (для проверки на preview — URL preview-деплоя)
- Dataset: `production`; триггеры: create, update, delete; только опубликованные документы
- Filter: `_type in ["article","news","plant","vacancy","procurement","manager","evCharge","mhp","plantStatus"]`
- Projection: `{ _type, _id, "slug": slug.current }`
- Method: POST; Secret: значение `SANITY_REVALIDATE_SECRET`

На время массового импорта вебхук выключать.

### 8. Preview-QA (AGENTS.md §7.6, §8)

На preview-деплое ветки, на `/en`, `/ru`, `/uz`: главная (последние новости и СЭС), списки и детальные страницы новостей/статей/СЭС/вакансий, таблицы и галереи в статьях, `/ceo`, карты (зарядные станции, микроГЭС, СЭС по регионам), поиск, формы с Turnstile, метатеги и OG-картинки, `sitemap.xml` / `news-sitemap.xml` / `image-sitemap.xml`, отсутствие ошибок `next/image`. Проверить, через сколько правка в Studio видна на сайте (вебхук сбрасывает кэш по тегам; списки и статичные страницы — ISR с `revalidate` 5 мин по умолчанию, детальные страницы, карты, `/news`, `/plants` и поиск рендерятся динамически без CDN-кэша).

### 9. Cutover

1. Content-freeze в Hygraph.
2. Шаги 2–4 (финальный импорт).
3. Env Production (шаг 6), вебхук на прод-домен (шаг 7).
4. PR → ревью → мерж в `main` (агент не мержит) → прод на Sanity.
5. Краулинг: старые URL отвечают 200, canonical и hreflang корректны.

**Rollback:** Vercel Instant Rollback на последний деплой с Hygraph. Hygraph держим в режиме read-only (freeze) на время окна отката, например 2 недели; правки, сделанные за это время в Sanity, при откате в Hygraph не попадут.

---

## Открытые вопросы (владельцу / редакции)

1. Заполнение alt-текстов (146 ассетов, 312 картинок в тексте).
2. ~~Перевод контента на uz и включение индексации uz~~ — сделано 2026-10-03.
3. Таблица в en-версии `when-does-a-solar-plant-pay-off` без строки-заголовка (находка 6).
4. После окончания Growth Trial проект перейдёт на Free — проверить в Manage, что лимитов хватает (≈390 документов, 448 ассетов / ~600 МБ, 1 датасет, 1 вебхук).
5. ~~`src/components/CeoComponent/TheCeo.tsx` нигде не используется~~ — удалён 2026-10-03 вместе с другим неиспользуемым кодом.

---

## Скрипты миграции (`scripts/sanity-migration/`)

> Скрипты удалены после закрытия окна отката (2026-10-08) и перевода всех записей на uz; восстановить их можно из истории git (`git log -- scripts/sanity-migration`).

Plain ESM `.mjs`, без зависимостей, Node 24. Данные — в `.data/` (в `.gitignore`: полный экспорт контента).

| Скрипт | Что делает |
|---|---|
| `extract.mjs` | Read-only снапшот Hygraph (8 моделей × локали, ассеты по цепочке локалей, паузы и backoff на 429) |
| `inventory.mjs` | Счётчики, переводы, узлы RichText, ассеты, slug'и → `reports/inventory.json` |
| `convert-richtext.mjs` | RichText → PT для всего контента, валидация и проверка сохранности текста → `reports/richtext.json` |
| `transform.mjs` | Документы Sanity + связи переводов → `transformed/dataset.ndjson`, валидация (обязательные поля, уникальность, ссылки, null) |
| `check-assets.mjs` | HEAD-проверка всех ассетов (доступны, не пустые, тип) → `reports/assets.json` |
| `richtext-to-portable-text.test.mjs` | `node --test scripts/sanity-migration/richtext-to-portable-text.test.mjs` |
| `uz-export.mjs` | Записи без `uz` (экспорт `.data/uz/source.json` через `sanity documents query`) → сегменты для перевода `.data/uz/segments/NN.txt`; PT-блоки — в разметке `<b>`/`<i>`/`<u>`/`<sup>`/`<aN>` (`lib/pt-markup.mjs`) |
| `uz-build.mjs` | Переводы `.data/uz/translations/NN.txt` → проверки (все сегменты, теги, ссылки, нет кириллицы, валидный PT) → `.data/uz/patches.json`; `--check` — для частичной проверки |
| `pt-markup.test.mjs` | `node --test scripts/sanity-migration/pt-markup.test.mjs` |

**Перевод на uz (2026-10):** 114 записей без `uz` переведены через `uz-export` → перевод → `uz-build`, запись — миграцией `studio/migrations/add-uz-translations` (из папки `studio/`: `npx sanity migration run add-uz-translations`, затем с `--no-dry-run`). Миграция трогает только документы с `!defined(uz)` и пишет `setIfMissing`, поэтому правки редакторов не перезаписываются. Тот же конвейер подходит для новых записей без uz. Единые термины во всех uz-текстах CMS — миграция `studio/migrations/fix-uz-terms` (только перечисленные фрагменты, повторный запуск безопасен). Термины: QFES — quyosh fotoelektr stansiyasi, EQS — elektromobillarni quvvatlash stansiyasi; «SES», «EV», «Solar PV» в узбекских текстах не используются.

---

## Трудозатраты (осталось)

| Этап | Дни |
|---|---|
| Импорт, проверки, деплой Studio, env и вебхук | 0,5–1 |
| Preview-QA на 3 локалях, правки по результатам | 1–2 |
| Cutover и наблюдение | 0,5 |
| **Итого** | **≈ 2–3,5** |

Перевод контента на uz и заполнение alt — редакционная работа, в оценку не входит.
