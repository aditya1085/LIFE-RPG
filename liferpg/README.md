# 🕯️ Ledger & Blade

A Life RPG web app: pin real-life tasks to a tavern quest board, complete them to earn
XP, gold, and stat growth, then spend gold at the Trading Post. Built as a full-stack
app with real authentication and a real database — no localStorage, no fake persistence.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Next.js API Routes (Server-side, same repo)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js (Credentials provider, bcrypt-hashed passwords, JWT sessions)
- **Deployment target:** Railway (Docker) — also works on any Node host

## Features

- Email/password signup & login, sessions via NextAuth, full user data isolation
  (every query is scoped to `session.user.id`; middleware guards `/dashboard`)
- Quest Board: create / complete / delete quests (full CRUD), each quest tied to
  an attribute (Intellect, Strength, Discipline, Agility, Wisdom) and a difficulty
  (Easy → Boss) that sets its XP/gold reward
- **Non-linear leveling**: `xpRequiredForLevel(level) = 100 * 1.42^(level-1)` — see `lib/xp.ts`
- **Streaks**: consecutive-day tracking with a growing XP bonus (up to +50%)
- **Trading Post**: spend gold on cosmetic badges/themes/trinkets
- Optimistic UI on quest creation, completion, and purchases, with rollback +
  inline error messaging if a request fails or the connection drops
- Level-up celebration modal with confetti (Framer Motion + canvas-confetti)
- Responsive layout, visible keyboard focus states, ARIA roles/labels on
  progress bars, tabs, and alerts; respects `prefers-reduced-motion`

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start a Postgres database.** Easiest with Docker:

   ```bash
   docker run --name liferpg-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=liferpg -p 5432:5432 -d postgres:16
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # generate a secret for NEXTAUTH_SECRET:
   openssl rand -base64 32
   ```

4. **Push the schema and seed the shop**

   ```bash
   npx prisma db push
   npm run seed
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`, register a character, and start questing.

## Deploying to Railway

1. Push this repo to GitHub.
2. On [railway.app](https://railway.app), **New Project → Deploy from GitHub repo**.
3. **Add a PostgreSQL plugin** to the project — Railway will inject `DATABASE_URL`
   automatically into your service's environment.
4. In your app service's **Variables** tab, add:
   - `NEXTAUTH_SECRET` — a random string (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` — your public Railway URL, e.g. `https://ledger-and-blade.up.railway.app`
5. Railway will detect the `Dockerfile` and build automatically. If it doesn't,
   set the build method to "Dockerfile" in service settings.
6. After the first deploy, open a **Railway shell** (or a one-off run command) for
   the service and run:

   ```bash
   npx prisma db push
   npm run seed
   ```

   This creates the tables and seeds the Trading Post inventory against the
   production database.
7. Visit the deployed URL, register, and confirm a page refresh keeps your
   character's progress (proves database persistence, not localStorage).

## Project structure

```
app/
  api/                 API routes: auth, register, quests, shop
  dashboard/           Protected dashboard (server page + client UI)
  login/ register/     Auth pages
components/            HeroSheet, QuestBoard, QuestCard, Shop, LevelUpModal, ...
lib/
  auth.ts              NextAuth config (Credentials provider)
  xp.ts                The RPG Progression Engine (leveling, streaks, rewards)
  prisma.ts            Prisma client singleton
prisma/
  schema.prisma        Users, Quests, ShopItem, Purchase
  seed.ts              Seeds the Trading Post inventory
middleware.ts          Protects /dashboard routes
```

## Notes on design decisions

- **Non-linear XP curve** lives in one place (`lib/xp.ts`) so the economy can be
  retuned without touching API routes.
- **Streak bonus** is computed server-side at quest-completion time from
  `lastActiveOn`, comparing calendar days rather than raw 24h windows, so
  finishing a quest late one night and again early the next morning still
  counts as two consecutive days.
- **Ownership checks** happen on every mutating quest/shop route — a user ID
  mismatch returns 404, not 403, so the existence of other users' data is
  never leaked.
- Optimistic updates always keep a snapshot of prior state and roll back on
  a non-2xx response or a thrown network error, with the result surfaced to
  the user rather than silently discarded.
