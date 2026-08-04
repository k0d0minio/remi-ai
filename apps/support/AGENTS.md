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

Articles are structured data, not prose blobs. An `Article` is a list of `ArticleBlock`s from a
closed union — heading, paragraph, list, steps, columns, note, action — so the only shapes a page
can contain are the ones `components/article/article-body.tsx` knows how to draw. There is no
markdown parser and no MDX here: a help centre where anyone can author a new shape is a design
system with a second, undocumented half.

A category's `slug` is its route segment and an article's `slug` is the one below it —
`/[locale]/[category]/[slug]`. **Slugs are identical in both locales**: the locale switcher swaps
the prefix and keeps the rest of the path, so a translated slug would 404 a reader mid-article.
Everything derived from an article — its reading time, its table of contents, its neighbours — is
computed in `lib/articles.ts` rather than authored, because a hand-written "5 min read" is a number
that drifts the first time a paragraph lands.

`updated` is the day the article was last checked against the product, not the day the file
changed. Editing an article without re-verifying it means leaving that date alone.

## Everything links out, and links out correctly

Inside this app — home, category, article, status — links route through `next/link`. Everything
else leaves: the public site and the product are separate Vercel projects on their own origins, so
a cross-app link is a plain `<a>` built by `externalHref()` in `lib/links.ts` — a `next/link` to
`/contact` would resolve against this origin and 404. That helper is a thin wrapper over `appHref()`
from `@remi/services/shared`, which is where the six origins are catalogued; nothing in this app
spells one out. Both destinations ship in the same two languages, so the link carries the visitor's
locale with it.

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
app/[locale]/            the home page
  [category]/            a category and everything written in it
    [slug]/              one article
  status/                the six surfaces and their history — a static segment
                         beside `[category]`, which Next resolves in its favour
app/                     sitemap, robots, icon — the unprefixed metadata routes
components/              the chrome and the home page's sections, prop-driven so
                         both locales share them
components/article/      the article page's parts: body, contents, pagination,
                         the feedback row
components/status/       the status board and its uptime bar
lib/content/             one dictionary per locale (`en.ts`, `fr.ts`), typed by
                         `types.ts`; article bodies in `articles/{en,fr}.ts`
lib/articles.ts          every lookup and every derived value — the only module
                         that knows how a category and its articles relate
lib/status.ts            the status page's placeholder history
lib/                     metadata helpers, cross-app link building
public/                  static assets
proxy.ts                 redirects bare paths to the visitor's language
```

Every route is statically generated. `generateStaticParams` reads the English dictionary for both
locales — the slugs are the same — and `dynamicParams = false` makes an unknown category or article
a 404 rather than a page rendered from a half-valid param.

## Not built yet

Three things on this site are drawn but inert, and each says so where it stands. The rule is the
same in all three cases: **a control that quietly swallows what someone gives it is worse than no
control**, so the shape is shown, the control is disabled, and the note points at what does work.

- **Search** — the home page's field is disabled. There is no index, and no client-side substitute
  has been built. When search lands, the field becomes a client island and its note goes.
- **"Was this helpful?"** — the two buttons on every article are disabled. No storage vendor is
  committed, so a click would be discarded; the note routes the reader to the contact form instead.
- **The status page** — no monitoring is connected, so `lib/status.ts` is placeholder data and the
  page's own notice says so in the visitor's language. The board reads from that module and nothing
  else, so a real probe replaces it without touching markup.

Deleting one of those notes is only ever part of the change that makes the thing work.
