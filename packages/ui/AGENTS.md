# @remi/ui — package rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this package.

## What lives here

The single source of truth for every primitive shared across apps. shadcn/ui **New York** style,
RSC enabled, Tailwind 4, Radix under the hood.

```text
src/
  components/   primitives — one file per component, kebab-case
  compound/     multi-part components built from primitives (kanban, editors, …)
  hooks/        hooks shared across apps
  lib/utils.ts  cn() — the ONLY module built without the "use client" banner
  globals.css   the design tokens every app imports
  index.ts      the barrel — the public API
```

## The two build units

`tsup.config.ts` emits two entries, and the split is load-bearing:

| Entry            | Banner         | Import path        | Callable from     |
| ---------------- | -------------- | ------------------ | ----------------- |
| `src/index.ts`   | `"use client"` | `@remi/ui`         | client components |
| `src/lib/utils`  | none           | `@remi/ui/utils`   | server **and** client |

Merging them breaks `cn()` in every server component in the monorepo. Add a new server-safe
utility as its own entry rather than moving it into the barrel.

## Adding a component

1. `pnpm --filter @remi/ui exec shadcn@latest add <component>` — always from this package, never
   from an app.
2. Rewrite it to house style: arrow function, `type Props`, `cn()` from `../lib/utils`.
3. Intent-bearing props use the shared vocabulary — `success | warning | error | info | neutral`.
   Never a caller-supplied colour class.
4. Export it from `src/index.ts`.
5. It needs a consuming app in the same PR. A component with no consumer does not land here —
   there is no Storybook in this repo, and a story would not have counted as a consumer anyway.

## Tokens — two stylesheets, one source

Colour, radius and type scale live in `src/tokens.css` and nowhere else.

| Import                  | Is                                    | For                                           |
| ----------------------- | ------------------------------------- | --------------------------------------------- |
| `@remi/ui/tokens.css`   | raw tokens, **no** Tailwind           | apps — after their own `@import "tailwindcss"` |
| `@remi/ui/globals.css`  | built: Tailwind **+** tokens          | a consumer that runs no Tailwind pass of its own |

Every app in this repo takes the first. Importing the built sheet into an app that also imports
Tailwind compiles Tailwind twice and doubles the CSS — that is the mistake this split exists to
prevent. Apps never redefine a token; if a design needs a colour that isn't one, the answer is a
new token here, not a raw palette class in the app.
