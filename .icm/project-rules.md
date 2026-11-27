# Project rules

This file belongs to the repo. Build and the lanes read it. The rules live once: this file
points at them.

- dev server: pnpm install --frozen-lockfile && pnpm packages:build && pnpm --filter @remi/web exec next dev -p {port}

## Stack

- A Turborepo 2 monorepo, pnpm 10, Node 22. Four Next.js 16 apps (React 19, TypeScript 5
  strict, Tailwind CSS 4) over three packages. The table of apps and packages is in
  `CLAUDE.md`.
- `apps/web` is the product (Vercel `app`). `apps/admin` is the operator console (Vercel
  `admin`). `apps/marketing` and `apps/docs` are the public site and the reference site.
- The database is Neon Postgres, with Drizzle. The schema is
  `packages/services/src/db/schema.ts`. A migration is a file of
  `packages/services/src/db/migrations/` (`.icm/_system/features/database.md`).
- The dev server above serves `apps/web`. The packages export `dist/`, so they build first.
  For another app, use its filter and its port.

## Code conventions

- `CONVENTIONS.md` is the one home of the code style, the design system and the git rules.
  Then the `AGENTS.md` of the subtree.
- Text that a user reads is French (`fr-BE`) only. Code, commits and notes are in English.
- Screens and their text follow `packages/ui/brand/charte-graphique.md`.
- A new environment variable: the three edits of `CONVENTIONS.md` § "Environment
  variables". The names are in `.icm/docs/ENV.md`, never a value.

## Names

- The Linear team is `REM`. The Vercel team is `remi21`.
- The request button of BAXTER is in `apps/web` and `apps/admin`. Their CSS variables are
  in `app/globals.css` of each app.
- The test accounts of the checktest are `test+remi-ai-<role>@jamienisbet.com`. The seed
  `pnpm seed:test-roles` gives a role of `operators` (`admin` or `practitioner`).
