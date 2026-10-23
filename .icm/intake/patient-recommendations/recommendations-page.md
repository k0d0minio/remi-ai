# Stub: The patient reads « Mes recommandations » by category, as validated

- feature-slug: recommendations-page
- epic: patient-recommendations
- story: 23
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P0

## Problem

The patient must find every validated recommendation without searching through documents. The current link pages read live tables and can show a change the practitioner has not validated.

## Proposed change

A page « Mes recommandations » in `apps/web`, under Profil (cross-epic: `patient-home-navigation/profile-tab`). It reads `getValidatedProtocol` (cross-epic: `protocol-versions`) and renders, in this order: 1 « Compléments alimentaires, plantes et huiles essentielles » with nom, posologie, fréquence, moment and durée as entered, 2 « Conseils d'hygiène de vie » by sub-category, 3 « Recommandations alimentaires » (the next stub), 4 « Objectifs prioritaires » in the practitioner's order, 5 « Autres recommandations ». A line « Mis à jour le <date> » shows the version date. An empty field shows nothing or « Non renseigné », never a generated value. No control edits anything.

## Acceptance criteria

- [ ] The page is reachable only when the file is « Accompagnement actif ».
- [ ] The page shows the latest validated version and nothing from the working copy.
- [ ] Categories 1, 2, 4 and 5 appear with their headings, in Morgane's order.
- [ ] An intervention shows nom, posologie, fréquence, moment and durée exactly as entered.
- [ ] An empty value shows « Non renseigné » or is omitted, and is never invented.
- [ ] The page has no add, edit or delete control.
- [ ] A new validation shows on the next request, with its « Mis à jour le » date.

## Out of scope

- Category 3: `evictions-and-food-directives-view`.
- Push or e-mail on a new version.

## Notes

D-26, D-30. Replaces `apps/web/app/[locale]/p/[token]/recommandations/` and `complements/`. Files: `apps/web/app/[locale]/(app)/profil/recommandations/`. Cross-epic: `protocol-versions/working-copy-and-validate`, `patient-access/waiting-screen`.
