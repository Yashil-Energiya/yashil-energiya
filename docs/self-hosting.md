# Развёртывание на своём сервере (Coolify + Cloudflare)

Сайт собирается в Docker-образ (`Dockerfile` в корне, `output: "standalone"` в `next.config.js`).
Схема: **Cloudflare (CDN, HTTPS, защита) → Cloudflare Tunnel → Coolify (Traefik) → контейнер Next.js**.
Sanity, Upstash, Microsoft Graph, Turnstile и Gemini — внешние сервисы, они не переезжают.

## 1. Сервер

- Ubuntu 22.04 / 24.04, минимум **2 vCPU, 4 GB RAM, 30 GB диска** (сборка Next.js берёт 2–3 GB RAM).
- Наружу открыт **только SSH**. Порты 80/443 на роутере/в панели хостинга **не пробрасывать** — весь
  веб-трафик приходит через Cloudflare Tunnel (исходящее соединение).
  Это обязательно: rate limit форм доверяет заголовку `cf-connecting-ip` (`src/lib/client-ip.ts`),
  и при открытом сервере его можно подделать. Внимание: `ufw` не закрывает порты, которые публикует
  Docker, — закрывать надо на уровне роутера/фаервола хостинга.

## 2. Coolify

1. По SSH: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash`
2. Открыть `http://<IP-сервера>:8000` (с машины в той же сети или через `ssh -L 8000:localhost:8000 user@сервер`),
   создать администратора, включить 2FA.

## 3. Cloudflare

1. Домен `yashil-energiya.uz` добавлен в Cloudflare (NS у регистратора указывают на Cloudflare).
2. Zero Trust → Networks → Tunnels → **Create tunnel** (Cloudflared) → скопировать команду установки
   коннектора и выполнить её на сервере.
3. В туннеле → Public Hostnames (основной домен — на шаге 6, до этого только `coolify.` и `new.`):
   - `yashil-energiya.uz` → `HTTP` → `localhost:80`
   - `www.yashil-energiya.uz` → `HTTP` → `localhost:80`
   - `app.yashil-energiya.uz` → `HTTP` → `localhost:80` (если поддомен используется)
   - `coolify.yashil-energiya.uz` → `HTTP` → `localhost:8000` — панель Coolify, нужна для вебхуков GitHub.
4. SSL/TLS → режим **Full**. Turnstile-ключи остаются прежними.

## 4. Приложение в Coolify

1. Sources → **GitHub App** → подключить организацию `Yashil-Energiya`, доступ к репозиторию `yashil-energiya`.
2. Projects → New → Resource → репозиторий, ветка `main`, Build Pack: **Dockerfile**, порт **3000**.
3. Domains: `http://yashil-energiya.uz,http://www.yashil-energiya.uz` (именно `http://` — HTTPS делает Cloudflare).
4. Environment Variables — все из `.env.example` с реальными значениями (взять из Vercel → Settings →
   Environment Variables). У пяти переменных `NEXT_PUBLIC_*` поставить галочку **Build Variable**:
   они вшиваются в сборку.
5. Включить **Auto Deploy** (деплой при пуше в `main`) и, по желанию, **Preview Deployments** для PR.
6. Deploy. Первая сборка — 5–10 минут.

## 5. Проверка до переключения DNS

Пока основной домен смотрит на Vercel (его записи в Cloudflare — серое облако, DNS only), добавить
временный хост туннеля `new.yashil-energiya.uz` → `localhost:80`, дописать `http://new.yashil-energiya.uz`
в Domains приложения и проверить там:

- `/ru`, `/en`, `/uz`, новости, карта станций, поиск, переключатель языков;
- формы (Turnstile + письмо приходит), виртуальный ассистент отвечает;
- `/api/og-image?...` отдаёт картинку, `robots.txt`, `sitemap.xml`;
- если ассистент пишет «User location is not supported» — Gemini не обслуживает страну сервера,
  тогда нужен прокси или сервер в другой стране.

## 6. Переключение

1. Удалить домен из проекта Vercel (Settings → Domains), чтобы Vercel не перехватывал его.
2. Удалить в Cloudflare DNS старые A/CNAME на Vercel и только потом добавить в туннель хосты
   `yashil-energiya.uz` / `www` / `app` (шаг 3) — Cloudflare создаст записи сам. Временный `new.` убрать.
3. Вебхук Sanity (`/api/revalidate`) идёт на тот же домен — ничего менять не нужно. Проверить: правка
   новости в Studio появляется на сайте за минуту.

**Откат:** вернуть DNS-записи на Vercel (если аккаунт разблокирован).

## Обслуживание

- Обновления ОС: `sudo apt update && sudo apt upgrade` раз в месяц; Coolify обновляется из панели.
- Логи и перезапуск контейнера — в Coolify → приложение → Logs.
- Кэш ISR и оптимизированных картинок живёт внутри контейнера и сбрасывается при каждом деплое —
  это нормально: Cloudflare держит свою копию.
