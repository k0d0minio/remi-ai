# Stub: Use the logo mark as the favicon of web, admin and docs

- lane: tweak
- found-by: triage/morgane-transmission · 2026-11-03
- complexity: low
- priority: P2

## Problem

Morgane's logo is the brand mark (`packages/ui/brand/logo/`). The marketing site uses it as its
icon. The three other apps still use the serif « R » glyph from `packages/ui/src/lib/brand.ts`
as their favicon, and `@remi/ui`'s `Wordmark` still types the name in a serif.

## Proposed change

Make the mark in `packages/ui/brand/logo/remi-mark.png` the icon of `apps/web`, `apps/admin`
and `apps/docs`. Replace the typed `Wordmark` with the logo image where the apps show the
brand. Delete the glyph constant when nothing reads it.

## Acceptance criteria

- [ ] The four apps show the same mark in the browser tab.
- [ ] No app types the brand name in a serif as a logo.
- [ ] `brand.ts` holds no glyph constant that nothing reads.
