# Stub: Show the price after the pilot on the offer cards

- lane: tweak
- found-by: Morgane, session request · 2026-11-11
- complexity: low
- priority: P2

## Problem

The offer cards in `apps/marketing/components/sections/offers-section.tsx` do not say what REMI
costs after the 8 pilot weeks.

## Proposed change

Show Morgane's after-pilot text once, in one banner below the two offer cards and above the
"Aucun paiement à ce stade" note. Revised by Morgane on 2026-11-11: the first version put one box in each card.

## Acceptance criteria

- [ ] One banner below the two cards shows "Après les 8 semaines incluses, continuez à profiter de REMI pour seulement 7 €/mois au lieu du prix commercial de 12 €/mois."
- [ ] The cards hold no after-pilot box.
- [ ] The banner is very light blue, with its content centred.
- [ ] "7 €/mois" has a light emphasis in the REMI primary blue.
- [ ] Below it, in smaller muted text: "Tarif préférentiel réservé aux participants pilotes · Abonnement facultatif, sans engagement."
- [ ] The banner sits above the "Aucun paiement à ce stade" note, with clear space on each side.
- [ ] The cards are no taller than before the first version. The buttons stay at the bottom of the cards.
- [ ] The offer prices, the included items, the buttons and the other sections do not change.
- [ ] The cards and the banner read well on desktop and on mobile.
