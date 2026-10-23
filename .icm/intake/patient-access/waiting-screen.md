# Stub: Before activation the patient sees « Votre praticien prépare votre accompagnement »

- feature-slug: waiting-screen
- epic: patient-access
- story: 22
- sequence: 1 of 3
- depends-on: none
- complexity: medium
- priority: P0

## Problem

A signed-in patient whose file is not active must not reach recipes, suggestions or recommendations. Today the link shows everything from the first visit.

## Proposed change

In `apps/web`, the signed-in layout reads the file status (D-31). When the status is not « Accompagnement actif », every route except the questionnaire renders the waiting screen: « Votre praticien prépare votre accompagnement », the practitioner's name, the appointment date when known, and a link to the questionnaire. The layout re-reads the status on each request, so activation shows without a sign-out.

## Acceptance criteria

- [ ] A signed-in patient at « Dossier à compléter », « Prêt pour consultation » or « Recommandations à valider » sees the waiting screen on every route except the questionnaire.
- [ ] The waiting screen shows « Votre praticien prépare votre accompagnement ».
- [ ] The questionnaire stays reachable from the waiting screen.
- [ ] No recipe, suggestion or recommendation route returns content before activation.
- [ ] After activation the next request shows the home, with no sign-out.

## Out of scope

- The sign-in itself: `patient-signup-account`.

## Notes

D-26, D-31. Files: `apps/web/app/[locale]/(app)/layout.tsx` and a `waiting` route. Cross-epic: `patient-signup-account/sign-in`, `patient-list-and-status` (the status enum), `preparatory-questionnaire`.
