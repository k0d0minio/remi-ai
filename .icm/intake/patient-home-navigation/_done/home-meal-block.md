# Stub: The home asks « Qu'as-tu prévu de manger ? » and leads to one suggestion

- feature-slug: home-meal-block
- epic: patient-home-navigation
- story: 31
- sequence: 2 of 4
- depends-on: app-shell-and-nav
- complexity: medium
- priority: P0

## Problem

The patient must understand REMI's value on the first screen and start a meal improvement without searching a menu.

## Proposed change

The « Accueil » page: first and before any other content, the block « Qu'as-tu prévu de manger ? » with a text field and the one primary button « Obtenir une suggestion d'amélioration ». The patient types what they plan to eat. The button submits to story 28's flow (cross-epic: `meal-improvement/suggest-from-meal`), which owns the two blocks, the feedback buttons and the limit of two suggestions. Below the block, a secondary entry « Je suis au restaurant » renders only when `restaurant-menu` has shipped, behind one flag in the env catalogue. No second suggestion logic lives here.

## Acceptance criteria

- [ ] The meal block is the first content on « Accueil », above everything else.
- [ ] The text field accepts a description of what the patient plans to eat.
- [ ] « Obtenir une suggestion d'amélioration » is the only primary button on the page and opens the `meal-improvement` flow with the text.
- [ ] « Je suis au restaurant » is absent until the restaurant feature ships, and the page works without it.
- [ ] The page does not render a second suggestion flow or any result of its own.

## Out of scope

- The suggestion itself, « Ça me convient », « Pas pour moi » and the limit of two: `meal-improvement`.
- The restaurant flow: `restaurant-menu`.

## Notes

D-30. Story 33 removed the photo on 2026-10-27. Files: `apps/web/app/[locale]/(patient)/accueil/page.tsx`, `.icm/docs/ENV.md` for the restaurant flag. Cross-epic: `meal-improvement/suggest-from-meal`, `restaurant-menu`.
