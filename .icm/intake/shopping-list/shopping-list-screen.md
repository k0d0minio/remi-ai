# Stub: The patient finds the current list from « Recettes » and ticks what is bought

- feature-slug: shopping-list-screen
- epic: shopping-list
- story: 26
- sequence: 2 of 3
- depends-on: shopping-list-build
- complexity: low
- priority: P0

## Problem

A built list is only useful in the shop, on a phone, with a tick per item.

## Proposed change

A list screen on `apps/web` under « Recettes », reachable from the « Liste en cours » entry of story 31. Each item has a checkbox that persists. The screen shows the recipes the list came from and the number of people. « Nouvelle liste » starts over. No extra tab is added.

## Acceptance criteria

- [ ] The current list is reachable from « Recettes » without a new tab.
- [ ] A tick persists across reloads and devices.
- [ ] The screen names the recipes and the number of people the list was built for.
- [ ] Items read in a stable order with ticked items last.
- [ ] The screen is usable on a phone with one hand.

## Out of scope

- Editing quantities by hand. Adding free items.

## Notes

Files: `apps/web/app/[locale]/(patient)/recettes/courses/page.tsx`. Cross-epic: `patient-home-navigation`.
