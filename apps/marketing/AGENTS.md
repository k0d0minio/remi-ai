# apps/marketing — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

The public site: unauthenticated, content-led, and indexable on production only (`isProduction` in
`lib/metadata.ts`: uat and previews serve `Disallow: /` and `noindex`). It is the first thing a visitor sees, so
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

The copy is Morgane's, from her transmission of 2 November 2026, and it lives in
`lib/content/landing.ts` and `lib/content/legal.ts`. A wording change is a change there, never in
a component, and her text wins over any earlier copy. Sentence case everywhere — headings, buttons,
labels, badges. Claims must be true and checkable: if the product cannot do it today, the page does
not say it can. The pilot prices on the page are hers (349 € and 119 € for 8 weeks, beside the
commercial prices of 399 € and 149 €), and the CGV read them from the same list.

## Imports

Primitives from `@remi/ui`, `cn()` from `@remi/ui/utils`, `@/*` for app-local paths.
The locale vocabulary — `locales`, `Locale`, `isLocale`, `localePath`, `pickLocaleFromHeader` —
comes from `@remi/services/shared`, because the product app ships in the same two languages and a
cross-app link has to build the path this site actually serves. So do `appHref()` / `appOrigin()`,
the catalogue of where the four apps answer: this site's own `metadataBase` and every link that
leaves it come from there, and no origin is written out in this app.
`@remi/services/server` is available for the few server-side needs a public site has, and this
site has one: the waiting-list forms call `submitLead` (`lib/leads/actions.ts`), which stores a
lead with `createLead` and emails `morgane@remiai.be`. The site reads nothing back. `lib/database.ts`
and `lib/mailer.ts` are the two registration points, both conditional on their variables.

## Structure

```text
app/[locale]/          `fr` only: the landing page, `[legal]/` for the four legal pages,
                       the holding page, the OG image
components/sections/   the eight sections of the landing page, in Morgane's order
components/            header, footer, logo, the sign-up flow, the practitioner dialog,
                       the sticky button, the form helpers under `forms/`
lib/content/           `landing.ts` (her copy) and `legal.ts` (her legal texts)
lib/site.ts            the pilot date, the contact details, the consent version, the publisher
lib/leads/             the server action, its types and the browser-side checks
lib/                   metadata helpers, the database and mailer registrations, the lead email
public/brand/, public/team/   the logo and the three portraits
proxy.ts               redirects bare paths and /en to /fr
```

## Language and truthfulness

The site is French only (Jamie, 2026-11-03). The `[locale]` segment stays so every address keeps
the `/fr` prefix the other apps link to. The product is pre-launch: the site sells the pilot
programme and what is being built, and never presents a capability as live. The two previews in
the features section are drawings, and the section says so.
