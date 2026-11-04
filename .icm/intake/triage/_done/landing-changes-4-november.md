# Stub: Apply Morgane's four landing page changes of 4 November

- lane: tweak
- found-by: Morgane, `Modification_Siteweb.docx` · 2026-11-04
- complexity: low
- priority: P0

## Problem

Morgane sent four changes for the landing page (`apps/marketing`). Production needs them now.

1. The hero shows the drawn phone. She wants her photo of a smiling person with a phone instead.
2. In the genetic section, the DIO2 card has less space between its icon and its text than the two other cards.
3. The « Améliorez vos repas » card is too general. She wants a new title, a new description, three selectable meals (pâtes à la crème, pizza, sandwich), three concrete suggestions per meal with a short explanation each, a personalisation line under the demo and the message « Mangez ce que vous aimez. REMI vous aide à faire les bons ajustements. »
4. The practitioners' waiting-list button is white on white until the mouse is over it.

No other section changes.

## Proposed change

Put the photo under `public/hero/`, fix the card grid, make the improve preview a small client component with three tabs, and colour the button for the dark section. Copy in `lib/content/landing.ts`.

## Acceptance criteria

- [ ] On desktop the hero shows Morgane's photo in place of the drawn phone. The headline is unchanged.
- [ ] The three genetic cards show the same space between icon and text.
- [ ] The improve card reads « Améliorez vos repas, sans changer vos habitudes » and her new description.
- [ ] A visitor can pick pâtes, pizza or sandwich. The chosen meal shows as a message to REMI. Three suggestions follow, each with its short explanation.
- [ ] The change of meal has a smooth transition. The card is readable on a phone and on a computer.
- [ ] Under the demo the card shows « Avec REMI, chaque suggestion tient compte de votre profil, de vos objectifs et de vos besoins nutritionnels. » and the message « Mangez ce que vous aimez. REMI vous aide à faire les bons ajustements. »
- [ ] The practitioners' button is readable at rest and on hover.
- [ ] No other section changes.
