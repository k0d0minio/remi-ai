# Stub: The patient space has one shell: greeting, three tabs, phone first

- feature-slug: app-shell-and-nav
- epic: patient-home-navigation
- story: 31
- sequence: 1 of 4
- depends-on: none
- complexity: medium
- priority: P0

## Problem

The patient space has no signed-in shell. The token link has ten pages and no fixed navigation. The patient must know where they are and reach the three destinations from anywhere.

## Proposed change

A layout for `apps/web/app/[locale]/(app)/`, behind sign-in (cross-epic: `patient-signup-account`) and the activation gate (cross-epic: `patient-access/waiting-screen`). Top: the REMI logo, small, « Bonjour [Prénom] », a link to Profil. Bottom, fixed on small screens: « Accueil », « Recettes », « Profil », the active tab marked. Sign-in lands on « Accueil ». Shared rules in the layout and the design system: one dominant button per screen, explicit labels, contrast, large touch targets, keyboard reachable, no automatic carousel. The Recettes tab renders `recipe-space`'s page.

## Acceptance criteria

- [ ] An active patient who signs in lands on « Accueil » with « Bonjour [Prénom] ».
- [ ] « Accueil », « Recettes » and « Profil » are reachable from every main page, and the active tab is marked.
- [ ] The bottom bar stays fixed on a 375 px wide screen and does not cover content.
- [ ] Every tab is reachable with the keyboard, and each has a visible label.
- [ ] Only one primary button appears per screen.
- [ ] From any screen, one tap on « Accueil » returns the patient to the home.
- [ ] Every essential action is visible on its screen. No essential action sits in a hidden menu.
- [ ] Text and controls meet the WCAG AA contrast ratio.
- [ ] No screen asks the patient for anything the flow does not need.

## Out of scope

- The home content: `home-meal-block`.
- The Recettes content: `recipe-space`.

## Notes

D-26, D-30. Files: `apps/web/app/[locale]/(app)/layout.tsx`, `packages/ui/` for the bottom bar. Cross-epic: `patient-signup-account/sign-in`, `patient-access/waiting-screen`, `recipe-space`.
