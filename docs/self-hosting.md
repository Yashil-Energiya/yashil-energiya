# Хостинг на своём сервере (Dokploy)

Схема: **посетитель → openresty (внешний прокси, `198.163.205.74`, HTTPS) → Dokploy (Traefik) → контейнер Next.js**.
DNS — в Cloudflare (записи сейчас без проксирования, «серое облако»).
Sanity, Upstash, Microsoft Graph, Turnstile и Gemini — внешние сервисы.

## Как идёт деплой

1. Пуш/мерж в `main` → workflow **CI** (`.github/workflows/ci.yml`): lint, typecheck, test, build.
2. После успешного CI → workflow **Deploy** (`.github/workflows/deploy.yml`): собирает образ по `Dockerfile`
   и кладёт в `ghcr.io/yashil-energiya/yashil-energiya` с тегами `latest` и SHA коммита.
3. Тот же workflow вызывает API Dokploy (`application.deploy`) — Dokploy забирает `latest` и перезапускает контейнер.

Ручной запуск: GitHub → Actions → Deploy → Run workflow.

## Настройки в GitHub (Settings → Secrets and variables → Actions)

- **Variables** (публичные, вшиваются в клиентский JS при сборке): `NEXT_PUBLIC_SANITY_PROJECT_ID`,
  `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_TURNSTILE_ASSISTANT_SITE_KEY`,
  `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Новая `NEXT_PUBLIC_*` → добавить сюда, в `ARG` в `Dockerfile` и в `build-args` в `deploy.yml`.
- **Secrets**: `DOKPLOY_URL`, `DOKPLOY_API_KEY`, `DOKPLOY_APP_ID`.

Серверные секреты (`TURNSTILE_*_SECRET_KEY`, `MS_*`, `UPSTASH_*`, `GEMINI_API_KEY`, `SANITY_REVALIDATE_SECRET`)
задаются **только в Dokploy** (приложение → Environment), не в GitHub. Полный список — `.env.example`.
Сборка проходит без них: клиенты Gemini и MSAL создаются при первом запросе.

## Требования к прокси (openresty)

- **IP посетителя.** Rate limit форм и ассистента берёт IP из `cf-connecting-ip`, затем `x-real-ip` / `x-forwarded-for`
  (`src/lib/client-ip.ts`). Пока Cloudflare не проксирует трафик, openresty обязан **перезаписывать** этот заголовок,
  иначе посетитель подделает его и обойдёт лимит:
  `proxy_set_header CF-Connecting-IP $remote_addr;`
  Если включить проксирование Cloudflare («оранжевое облако»), эту строку убрать, а openresty пускать только с IP Cloudflare.
- **www.** openresty пропускает `www.yashil-energiya.uz` в Dokploy (сертификат `*.yashil-energiya.uz` покрывает www).
  301 на основной домен делает Dokploy: приложение → Domains (`www`, HTTPS выключен) → Redirects:
  regex `^https?://www.yashil-energiya.uz/(.*)` → `https://yashil-energiya.uz/${1}`, Permanent.
- HTTP → HTTPS — 301 (настроено).

## Проверка после деплоя

- `/ru`, `/en`, `/uz`, новости, карта станций, поиск, переключатель языков;
- формы (Turnstile + письмо приходит), виртуальный ассистент отвечает;
- OG-картинка страницы (`og:image` → `/api/og-image?...`), `robots.txt`, `sitemap.xml`;
- правка в Sanity Studio появляется на сайте за минуту (вебхук → `/api/revalidate`).

## Откат

GitHub → Actions → Deploy → Run workflow на нужном коммите, либо в Dokploy указать образ с тегом прошлого SHA.

## Особенности

- Кэш ISR и оптимизированных картинок живёт внутри контейнера и сбрасывается при каждом деплое.
- `Dockerfile` явно копирует `node_modules/@img` — standalone-трассировка не забирает нативные файлы `sharp`,
  без них падают `/api/og-image` и `next/image`.
