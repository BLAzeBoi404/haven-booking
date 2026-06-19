# HAVEN — веб-портал бронювання послуг

Високонавантажений транзакційний веб-портал, спроектований навколо
**гарантованої відсутності подвійного бронювання** (Race Condition).
Повна переделка під дипломну записку: Next.js 15 + TypeScript + Prisma +
PostgreSQL + Server Actions + `FOR UPDATE NOWAIT` + JWT/Edge RBAC +
Optimistic UI.

---

## Стек (точно за дипломом)

| Шар | Технологія |
|---|---|
| Мета-фреймворк | **Next.js 15 (App Router)** — модульний моноліт, Serverless |
| UI | **React 19** — `useOptimistic`, `useTransition`, RSC |
| Типізація | **TypeScript (strict)** — наскрізна |
| Дані | **PostgreSQL + Prisma ORM** |
| RPC | **Server Actions** (замість REST API) |
| Валідація | **Zod** (`safeParse` на вході кожного action) |
| Авторизація | **JWT** (jose) у http-only cookie + **Edge middleware** RBAC |
| Блокування | **`SELECT ... FOR UPDATE NOWAIT`** у `$transaction` |
| Стилі | **Tailwind CSS** + `cn()` (clsx + tailwind-merge) |
| Email | **nodemailer** (no-op без SMTP) |

---

## Швидкий старт

### 1. Встановити залежності
```bash
npm install
```

### 2. Налаштувати `.env`
```bash
cp .env.example .env
# Відредагуйте DATABASE_URL (Supabase/Postgres) та JWT_SECRET
```

### 3. Створити схему БД та наповнити демонстраційними даними
```bash
npm run db:push     # застосувати схему Prisma до PostgreSQL
npm run db:seed     # 60 фахівців + послуги + адмін/клієнт
```

**Демо-акаунти після сиду:**
- 🔑 `admin@haven.ua` / `admin123` (адмін)
- 👤 `client@haven.ua` / `client123` (клієнт)
- 🛠 `provider1@haven.ua` / `provider123` (фахівець)

### 4. Запустити
```bash
npm run dev
# → http://localhost:3000
```

---

## Як перевірити відсутність подвійного бронювання (стрес-тест)

Це головна інженерна теза диплома. Див. `scripts/stress-test.sql`:

1. Відкрийте **2+ вкладки** Supabase SQL Editor (або psql) одночасно.
2. У кожній виконайте блок «СЦЕНАРІЙ А» з однаковим слотом (напр. `2026-06-20 14:00`).
3. Перевірте «СЦЕНАРІЙ Б» — у таблиці буде **лише 1 запис**.
   Другий конкурентний INSERT відхилено ядром PostgreSQL (`FOR UPDATE NOWAIT`).

Або відкрийте сайт у 2 браузерах і спробуйте забронювати однаковий слот
в одного фахівця одночасно — другий отримає тостер «Слот перехоплено».

---

## Структура проекту

```
haven/
├── prisma/
│   ├── schema.prisma          # CUID, FK Cascade, @@unique, @@index
│   └── seed.ts                # 60 фахівців + послуги + адмін
├── scripts/
│   └── stress-test.sql        # демонстрація FOR UPDATE NOWAIT
├── src/
│   ├── middleware.ts          # Edge: JWT + RBAC (відсіює неавторизований трафік)
│   ├── app/                   # сторінки (layout, home, auth, services, providers, bookings, dashboard, admin, статичні)
│   ├── components/            # Header, Footer, ServiceCatalog, BookingForm (useOptimistic), ...
│   ├── server/
│   │   ├── db.ts              # PrismaClient singleton
│   │   ├── session.ts         # JWT (jose), http-only cookie
│   │   ├── auth-guard.ts      # requireUser / requireRole (RBAC)
│   │   ├── email.ts           # nodemailer (no-op без SMTP)
│   │   ├── queries.ts         # server-side reads (RSC)
│   │   └── actions/           # Server Actions: auth, bookings, services, reviews, admin, prefs
│   ├── lib/                   # i18n, currency, validations (Zod), utils (cn), useDebounce
│   └── types/
├── next.config.ts  tsconfig.json  postcss.config.mjs
└── package.json  .env.example
```

---

## Відповідність розділам диплома

| Розділ диплома | Де реалізовано |
|---|---|
| §2.4 / §3.3 Пессимістичне блокування `FOR UPDATE NOWAIT` | `src/server/actions/bookings.ts` |
| §2.4 ACID, `@@unique`, `@@index` | `prisma/schema.prisma` |
| §2.5 Prisma singleton (анти connection exhaustion) | `src/server/db.ts` |
| §2.3 / §3.3 Server Actions (RPC, замість REST) | `src/server/actions/*.ts` |
| §3.3 Zod `safeParse` валідація | `src/lib/validations.ts` |
| §3.5 JWT + http-only cookie + Edge RBAC | `src/server/session.ts`, `src/middleware.ts` |
| §2.6 / §3.4 Optimistic UI (`useOptimistic`) | `src/components/BookingForm.tsx` |
| §3.4 Skeleton + Error Boundary | `src/app/loading.tsx`, `src/app/error.tsx` |
| §3.6 `cn()` (tailwind-merge) | `src/lib/utils.ts` |
| §3.5 CUID замість автоінкремента (анти-IDOR) | `prisma/schema.prisma` |
| §3.7 Email-сповіщення з Server Action | `src/server/email.ts` |

---

## Деплой на Vercel

1. Залейте проект на GitHub.
2. Vercel → **Import Git Repository** (авто-визначення Next.js).
3. **Environment Variables:** додайте `DATABASE_URL`, `JWT_SECRET`, (опц.) `SMTP_*`.
4. Deploy.
5. Після першого деплою виконайте сид:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

> **Важливо:** у Supabase для Serverless використовуйте **connection pooler** (порт 6543),
> щоб уникнути вичерпання з'єднань (§2.5).

---

## Скрипти

| Команда | Призначення |
|---|---|
| `npm run dev` | Розробка (HMR) |
| `npm run build` | Продакшн-збірка |
| `npm run start` | Запуск продакшн-збірки |
| `npm run typecheck` | Перевірка TypeScript (`tsc --noEmit`) |
| `npm run db:push` | Застосувати схему до БД |
| `npm run db:seed` | Демонстраційні дані |
| `npm run db:generate` | Перегенерувати Prisma-клієнт |
| `npm run db:studio` | Prisma Studio (GUI для БД) |
| `npm run db:validate` | Валідація схеми |
