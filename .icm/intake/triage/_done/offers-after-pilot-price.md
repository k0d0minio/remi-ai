# Stub: Show the price after the pilot on the offer cards

- lane: tweak
- found-by: Morgane, session request · 2026-11-11
- complexity: low
- priority: P2

## Problem

The offer cards in `apps/marketing/components/sections/offers-section.tsx` do not say what REMI
costs after the 8 pilot weeks.

## Proposed change

Add Morgane's after-pilot text to both cards, just above the "Je suis intéressé(e)" button.

## Acceptance criteria

- [ ] Both cards show "Après les 8 semaines incluses, continuez à profiter de REMI pour seulement 7 €/mois au lieu du prix commercial de 12 €/mois."
- [ ] "7 €/mois" has a light emphasis in the REMI primary colour.
- [ ] Below it, in smaller muted text: "Tarif préférentiel réservé aux participants pilotes · Abonnement facultatif, sans engagement."
- [ ] The text sits just above the button. The buttons stay at the bottom of the cards.
- [ ] The offer prices, the included items, the buttons and the other sections do not change.
- [ ] The cards read well on desktop and on mobile.
