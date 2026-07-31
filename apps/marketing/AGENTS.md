# apps/marketing — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

The public site: unauthenticated, indexable, content-led. It is the first thing a visitor sees, so
it is measured differently from the product — on load time, on Core Web Vitals, and on whether the
copy is true.

## Performance is the feature

- Server components by default; a client component needs a real interaction to justify it.
- Every route sets `metadata` (title, description, canonical, OG image). A page with no metadata is
  incomplete, not merely unpolished.
- Images go through `next/image` with explicit dimensions; fonts through `next/font`. No layout
  shift, no render-blocking third-party script.
- Heavy visual work (animation libraries, 3D, video) loads dynamically and never blocks first paint.

## Copy

Sentence case everywhere — headings, buttons, labels, badges. Claims must be true and checkable:
if the product cannot do it today, the page does not say it can. When a claim involves a number,
the number comes from somewhere real, and the page says where.

## Imports

Primitives from `@remi/ui`, `cn()` from `@remi/ui/utils`, `@/*` for app-local paths.
`@remi/services/server` is available for the few server-side needs a public site has — a contact
form submission, a newsletter signup — and nothing else. This app holds no customer data.

## Structure

```text
app/          routes — one folder per page, `page.tsx` + local components
components/   sections and blocks composed from @remi/ui
lib/          content, constants, metadata helpers
public/       static assets
```
