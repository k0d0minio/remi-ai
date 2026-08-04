# apps/support — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

The public help centre, on `:3004`. Unauthenticated, indexable, content-led — the same posture as
[`apps/marketing`](../marketing/AGENTS.md), a different job. The public site persuades someone to
try REMI; this one un-sticks someone who is already using it, or is about to be. It is measured on
whether a stuck person finds the answer without writing to anyone.

It reads no customer data and shows no signed-in state. A visitor here is anonymous, always: an
answer that would need to know who is asking belongs in the product, not in the help centre.

## Performance is the feature

- Server components by default; a client component needs a real interaction to justify it. Today
  the locale switcher is the only one.
- Every route sets `metadata` (title, description, canonical, hreflang). A help centre lives in
  search results — a page with no metadata is a page nobody reaches, so it is incomplete, not
  merely unpolished.
- Every route joins `app/sitemap.ts` in the same change that adds it.
- Images go through `next/image` with explicit dimensions; fonts through `next/font`. No layout
  shift, no render-blocking third-party script.

## Copy

Sentence case everywhere — headings, buttons, labels, badges, placeholders. Plain words over
product vocabulary: someone reads a help centre because something did not work, and a sentence they
have to decode is a second failure.

Claims must be true and checkable. The product is pre-launch, so an article describes what REMI
does today or says plainly that a capability is not there yet. Two things this app must never do:
present an unwritten article as if it exists, or head a list "popular" when nothing has been
measured. The home page's `popular.note` is the pattern — say what the list actually is.

## Article content lives in typed content modules

Copy lives in `lib/content/`, never in a component: one dictionary per locale (`en.ts`, `fr.ts`)
typed by `types.ts`, so a missing translation is a type error rather than an English sentence
appearing on the French site. Rewording an answer is an edit to a dictionary and nothing else.

Articles are structured data, not prose blobs — `Category` and `Article` carry the `slug` their
route will use, so wiring a card to a real page later is one `href`, not a content rewrite. When
article routes land they read from the same modules; a category's `slug` is its route segment.

## Everything links out, and links out correctly

This app has one page of its own. The public site and the product are separate Vercel projects on
their own origins, so a cross-app link is a plain `<a>` built by `externalHref()` in `lib/links.ts`
— a `next/link` to `/contact` would resolve against this origin and 404. Both destinations ship in
the same two languages, so the link carries the visitor's locale with it.

There is one contact route for the whole product, on the public site. This app never grows a second
one; a second front door quietly becomes the unread one.

## Imports

Primitives from `@remi/ui`, `cn()` from `@remi/ui/utils`, `@/*` for app-local paths. The locale
vocabulary — `locales`, `Locale`, `isLocale`, `localePath`, `pickLocaleFromHeader` — comes from
`@remi/services/shared`, so a link into the product builds the path the product actually serves.
Nothing here reaches `@remi/services/server`: the help centre has no server-side work to do, holds
no customer data, and should stay that way.

Never import from another app. Shared chrome belongs in `packages/ui` — `LocaleSwitcher` is the
worked example: the pure part is a server-safe primitive there, and each app keeps only the
one-line client wrapper that supplies `usePathname`.

## Structure

```text
app/[locale]/ routes — one folder per page, `page.tsx` + local components;
              every page exists under /en and /fr
app/          sitemap, robots, icon — the unprefixed metadata routes
components/   the chrome and the home page's sections, prop-driven so both
              locales share them
lib/content/  one dictionary per locale (`en.ts`, `fr.ts`), typed by `types.ts`
lib/          metadata helpers, cross-app link building
public/       static assets
proxy.ts      redirects bare paths to the visitor's language
```

## Not built yet

The search field on the home page is disabled and says so underneath: there is no index to search,
and a box that swallows what a stuck person types is worse than no box. Category cards and the
article list do not link, for the same reason — the routes do not exist. When articles land, those
three become links and the note goes, in one change.
