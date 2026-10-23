# Stub: The patient photographs a menu and REMI lists the dishes it can read

- feature-slug: menu-photo-reading
- epic: restaurant-menu
- story: 29
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P2

## Problem

At the restaurant the patient has a menu and no way to ask REMI about it.

## Proposed change

A « Je suis au restaurant » entry under the home block (story 31), shown only when this epic ships. The patient takes a photo. It goes through the files seam like a meal photo. One vision call returns the dishes it can read: name, description when printed, a confidence. A menu with no readable dish returns « Je n'arrive pas à lire la carte. Peux-tu reprendre une photo ? ». The photo follows the same retention as meal photos.

## Acceptance criteria

- [ ] The entry appears on the home only when this stub is merged.
- [ ] A readable menu returns the list of dishes with their printed description.
- [ ] An unreadable menu returns the new-photo message and no dish.
- [ ] The call is one row in `ai_generations`.
- [ ] The photo is private and deleted with the meal photos.

## Out of scope

- The judgement. Handwritten menus in languages other than French, Dutch and English.

## Notes

D-18, D-29. Files: `apps/web/app/[locale]/(patient)/restaurant/page.tsx`, `prompts/menu-read.ts`. Cross-epic: `recipe-space/ai-gateway-adapter`, `meal-improvement/meal-capture` (the upload path), `patient-home-navigation` (the conditional entry).
