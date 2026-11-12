# Stub: The hero shows the lowest pilot price

- lane: tweak
- found-by: the UAT audit · 2026-11-12
- complexity: low
- priority: P1

## Problem

The marketing hero says « À partir de 129 € ». The lowest offer is 119 €, the pilot price of
« REMI + consultation nutritionnelle ». The other offer is 349 €. Production and UAT show the
wrong price. The literal is in `apps/marketing/lib/content/landing.ts` (`HERO.pilotInfo`).

## Proposed change

Read the lowest pilot price from `OFFERS`. Format it with `formatPrice`.

## Acceptance criteria

- [ ] The hero on the marketing preview reads « À partir de 119 € ».
- [ ] The hero price comes from `OFFERS`, so a change of an offer price changes the hero too.
