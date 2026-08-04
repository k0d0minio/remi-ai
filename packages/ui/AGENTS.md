# @remi/ui — package rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this package.

## What lives here

The single source of truth for every primitive shared across apps. shadcn/ui **New York** style,
RSC enabled, Tailwind 4, Radix under the hood.

```text
src/
  components/       INTERACTIVE primitives — Radix-backed or stateful. Client only.
  server/           PRESENTATIONAL primitives — markup and classes, no hooks.
  server/compound/  multi-part components built from presentational primitives
  motion/           the animation layer — lazy shells over a deferred chunk
  hooks/            hooks shared across apps
  lib/brand.ts      the brand — names, tagline, hex, glyph. One home, five apps
  lib/utils.ts      cn()
  tokens.css        the design tokens every app imports
  index.ts          the client barrel — @remi/ui
  server.ts         the server barrel — @remi/ui/server
```

The tree splits by **render boundary**, not by kind. `components/` and `server/` both hold
primitives; what separates them is whether the thing needs the client.

## The four build units

`tsup.config.ts` emits four entries, and every split is load-bearing:

| Entry              | Banner         | Import path       | Callable from         |
| ------------------ | -------------- | ----------------- | --------------------- |
| `src/index.ts`     | `"use client"` | `@remi/ui`        | client components     |
| `src/server.ts`    | none           | `@remi/ui/server` | server **and** client |
| `src/lib/utils`    | none           | `@remi/ui/utils`  | server **and** client |
| `src/motion/index` | `"use client"` | `@remi/ui/motion` | client components     |

Merging the utils entry into the barrel breaks `cn()` in every server component in the
monorepo. Merging the server entry into it gives up RSC on the marketing site. Add a new
server-safe utility as its own entry rather than moving it into the barrel.

### The rule that keeps the split honest

tsup **bundles** each entry, so every module an entry can reach is inlined into it. Two
failures follow, both silent:

- **`src/server/**` importing `src/components/**`** inlines a client component into a bundle
  that carries no banner. A server compound that needs a `<Button>` takes it as a `ReactNode`
  prop (`actions`, `cta`) — the app's server page renders the button and passes it down.
- **Anything reachable from `index.ts` or `server.ts` importing `motion/react`** puts the
  whole animation library in that bundle, and every app pays for it on first paint.

`eslint.config.ts` has a `no-restricted-imports` zone for each direction. It is the only thing
standing between you and a regression nothing else reports. Before merging a change to this
package, grep `dist/index.js` and `dist/server.js` for `motion`, and check `dist/server.js`
does not begin with `"use client"`.

## Adding a component

0. **Decide which side it lives on.** Does it need a hook, an event handler, or a browser API?
   Yes → `src/components/`, exported from `src/index.ts`. No → `src/server/`, exported from
   `src/server.ts`. Default to `server/` and move it only when you actually reach for state —
   a primitive in the client barrel costs every consuming page bytes it may not need.
1. `pnpm --filter @remi/ui exec shadcn@latest add <component>` — always from this package, never
   from an app. Recent CLI versions want to install the `radix-ui` umbrella package; reject it
   and pin the individual `@radix-ui/react-*` instead, or the apps' `@radix-ui/*` import ban
   stops matching. If it edits `src/globals.css`, revert that — tokens live in `tokens.css`.
2. Rewrite it to house style: arrow function, `type Props`, `cn()` from `../lib/utils`, and no
   in-source `"use client"` — the tsup banner does that, and esbuild drops the directive inside
   a bundle anyway, so leaving one in is misleading rather than harmful.
3. Intent-bearing props use the shared vocabulary — `success | warning | error | info | neutral`.
   Never a caller-supplied colour class. Each intent has four tokens: the bare fill,
   `-foreground` for text on it, `-subtle` for a tinted surface, `-border` for a border on that
   surface, and `-text` for the intent rendered as text on `--background`. Rendering an intent
   as a word means `-text`; the bare token fails contrast there.
4. Export it from the barrel that matches step 0.
5. It needs a consuming app in the same PR. A component with no consumer does not land here —
   there is no Storybook in this repo, and a story would not have counted as a consumer anyway.

### When the shared part needs something only an app can supply

Some chrome is identical across apps except for one value the design system cannot know — the
current pathname, the router, a translated label. Copying the component into each app is a review
blocker (`CONVENTIONS.md` → "Keeping the codebase lean"), so split it instead: the markup and
classes become a pure primitive in `src/server/`, and each app keeps a thin client wrapper that
reads the value and passes it down.

`LocaleSwitcher` is the worked example. It takes `locales`, `current`, a `hrefFor(locale)` and an
`as` for the app's router link; each app's wrapper is the four lines that call `usePathname()`. The
switcher itself renders on the server in every app, and the client cost is the wrapper alone.

The same shape covers a callback the primitive should not own: take it as a prop rather than
reaching for the hook here, which would move the whole component to the client barrel and put it in
every consuming page's bundle.

## Tokens — two stylesheets, one source

Colour, radius, type scale, fonts, containers, elevation and motion live in `src/tokens.css`
and nowhere else. Its three layers are documented in the file header; the short version is that
anything which must differ between light and dark has to sit in the `@theme inline` block behind
a raw var overridden in `.dark` — a literal value there silently keeps its light-mode appearance
in dark mode.

| Import                 | Is                           | For                                              |
| ---------------------- | ---------------------------- | ------------------------------------------------ |
| `@remi/ui/tokens.css`  | raw tokens, **no** Tailwind  | apps — after their own `@import "tailwindcss"`   |
| `@remi/ui/globals.css` | built: Tailwind **+** tokens | a consumer that runs no Tailwind pass of its own |

Every app in this repo takes the first. Importing the built sheet into an app that also imports
Tailwind compiles Tailwind twice and doubles the CSS — that is the mistake this split exists to
prevent. Apps never redefine a token; if a design needs a colour that isn't one, the answer is a
new token here, not a raw palette class in the app.

## Dark mode — one class, two halves

`tokens.css` already carries a full `.dark` block, so switching theme is a single class on
`<html>` and nothing else. Turning it on in an app is two imports, and both are needed:

| Half          | Import            | Where it goes                          |
| ------------- | ----------------- | -------------------------------------- |
| `themeScript` | `@remi/ui/server` | first child of `<body>` in root layout |
| `ThemeToggle` | `@remi/ui`        | wherever the app keeps its preferences |

The script runs before first paint and reads the stored choice; the toggle writes it. They share
`src/lib/theme.ts` — the storage key, the class name and the three state names — because one is a
string in the HTML and the other is React, so they can agree on constants but never call each
other. The layout's `<html>` also needs `suppressHydrationWarning`: the script mutates the class
React is about to reconcile.

Only `apps/web` and `apps/admin` opt in today. The public sites stay light because a brand page has
one intended look, and a dark screenshot of it is not that look.

An app that opts in must be token-clean first. A raw `bg-white` survives the class change untouched
and produces white text on white — dark mode is what turns "use the semantic token" from a
preference into a correctness rule.
