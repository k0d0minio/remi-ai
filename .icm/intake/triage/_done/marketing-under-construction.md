# Stub: Show an under-construction page on marketing production until the site opens

- lane: tweak
- found-by: Jamie, the remiai.be domain setup · 2026-11-03
- complexity: low
- priority: P0

## Problem

`remiai.be` goes to the `marketing` project. Production must show an under-construction page
until the site opens. The `uat` environment of `marketing` builds the same `main` and must
show the full site.

## Proposed change

Add the variable `UNDER_CONSTRUCTION`. When its value is `1`, `apps/marketing/proxy.ts` rewrites
every page to `/<locale>/under-construction`, the layout hides the header and the footer, and
`robots.txt` disallows all. Set the variable on the production target only.

## Acceptance criteria

- [ ] With `UNDER_CONSTRUCTION=1`, every page path of `/en` and `/fr` shows the under-construction page.
- [ ] With the variable unset, the site is unchanged, and `/<locale>/under-construction` shows the page for review.
- [ ] The page is in `fr` and `en`, has `noindex` metadata, and shows the founders' contact addresses.
- [ ] With `UNDER_CONSTRUCTION=1`, `robots.txt` disallows all paths.
- [ ] `.icm/docs/ENV.md`, `turbo.json` and `apps/marketing/.env.example` name `UNDER_CONSTRUCTION`. No value enters git.
