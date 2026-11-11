# Stub: Show the commercial price on the two offer cards

- lane: tweak
- found-by: Morgane, chat request · 2026-11-11
- complexity: low
- priority: P1

## Problem

The two cards in the « Offres » section show only the pilot price, and the pilot prices are out of date.
The cards live in `apps/marketing/components/sections/offers-section.tsx`. The copy lives in `apps/marketing/lib/content/landing.ts`.

## Proposed change

Set the pilot prices to 349 € and 119 €. Change « 4 objectifs » to « 3 objectifs » on the consultation card. Add the commercial price (399 € and 149 €) in smaller text, not struck through. Add the pilot-tariff note under the prices.

## Acceptance criteria

- [ ] The card « REMI + analyse génétique » shows 349 € large and blue, with « prix pilote · 8 semaines ».
- [ ] The same card shows « Prix commercial : 399 € » in smaller muted text, not struck through.
- [ ] The card « REMI + consultation nutritionnelle » shows 119 € large and blue, with « prix pilote · 8 semaines ».
- [ ] The same card shows « Prix commercial : 149 € » in smaller muted text, not struck through.
- [ ] Each card shows « Tarif réservé aux 30 premiers participants pilotes » under the prices.
- [ ] The card « REMI + consultation nutritionnelle » lists « 3 objectifs nutritionnels personnalisés ».
- [ ] The includes, the buttons and the other sections keep their design. The layout holds on desktop and on mobile.
