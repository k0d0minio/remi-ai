# apps/demo — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

The Design stage's sandbox (`pipeline/stages/02_design/`). A feature is prototyped here first,
merged to the live demo URL through small demo PRs, and reviewed by the stakeholder on the real
deployed thing rather than a screenshot. Then it is either re-implemented in `apps/web` (a
throwaway) or used as reference material (a seed).

## It can never reach a backend

That is what makes merging demo work straight to a live URL safe. Three independent guards enforce
it, and all three stay:

1. `@remi/services` is absent from `package.json`.
2. `@remi/services` is absent from `transpilePackages` in `next.config.ts`.
3. ESLint blocks the import outright.

No auth, no database, no email, no secrets, no `app/api/` route that fetches anything real. A
feature that needs real data has outgrown the demo — that is a signal to move to Define, not to
punch a hole in one of the guards.

## Mock data

Lives in `lib/mock/`, one file per area, imported directly by the component that renders it. No
global state, no context, no fetch wrapper pretending to be a backend. Make it realistic — names,
dates and amounts that look like the real thing — because a prototype with `foo` / `123` in it
tells a stakeholder nothing about whether the design works.

## It shares the design system, and owns none of it

The demo exists to show what the product will look like, so it uses the same primitives and the
same tokens: `import { Card, Badge, Typography } from "@remi/ui"`, one import per file, no local
re-export layer. There is no `components/ui/` and no `components.json` here. Need a new primitive
or a new variant? Add it to `packages/ui` — the demo is not a place to fork the design system.

Colour, spacing and type come from tokens (`bg-card`, `text-muted-foreground`, `bg-success`), never
from raw palette classes (`bg-emerald-50`, `bg-white`). Intent-bearing props use the shared
vocabulary: `success | warning | error | info | neutral`.

## Structure

```text
app/
  (demo)/     the prototype routes and their shared layout
    practitioner/  the console: practice, clients, client detail, notes→plan, frame
    patient/       the daily surface: today, meals, steps, plan
components/   demo-specific composition — tiles, tables, flows
lib/mock/     mock data, one file per area, plus the local view shapes in types.ts
```

## Copy is in French

The first practitioners and the people they support are francophone, and a prototype a stakeholder
has to translate in their head is not showing them the product. Route slugs stay English, as the
marketing site's do. The demo gets no i18n layer — the copy lives in the `lib/mock/` fixtures
alongside the data, which is where the rest of a prototype's words already are.

## Its types are local, and that is deliberate

`lib/mock/types.ts` holds view shapes written for these screens. It does **not** mirror
`packages/services/src/db/models/` — the demo is lint-blocked from `@remi/services`, and a prototype
is exploring what a screen needs rather than committing to a schema. When a design graduates to
`apps/web`, the real model is what it gets written against.

## Demo PRs

A demo PR touches `apps/demo/**` plus its run's `pipeline/` files and nothing else. That path guard
is what makes autonomous merge safe — see `pipeline/_shared/github.md` → the front regime.
