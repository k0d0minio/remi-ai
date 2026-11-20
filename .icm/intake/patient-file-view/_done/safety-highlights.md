# Stub: Allergies, intolerances, avoided foods and medications stand out at the top of the file

- feature-slug: safety-highlights
- epic: patient-file-view
- story: 6
- sequence: 2 of 5
- depends-on: file-page-frame
- complexity: low
- priority: P0

## Problem

Story 6: « Mettre en évidence les allergies, intolérances, aliments évités et médicaments. »
Today they sit in prose columns.

## Proposed change

One block under the header, « Sécurité », with four rows: Allergies, Intolérances, Aliments
évités (per Morgane's question 2), Médicaments. Each row lists the structured values with
their French labels and sub-choices, « Aucune connue » when declared so, or « Non renseigné ».
The strict gluten flag from celiac disease shows as « Gluten — exclusion stricte (maladie
cœliaque) ».

## Acceptance criteria

- [ ] The block is above the questionnaire sections and visible without scrolling on a laptop screen
- [ ] A family stored as `all` reads « Fruits à coque — tous ». A sub-choice reads its label
- [ ] « Aucune allergie connue » and « Non renseigné » are shown differently and never confused
- [ ] Celiac disease shows the strict gluten line
- [ ] Médicaments shows the patient's text as entered

## Out of scope

- Editing from the block. Interaction checks.

## Notes

- cross-epic: `preparatory-questionnaire/allergy-intolerance-lists`. « Aliments évités » reads `food-directives` (story 13) once it exists. Until then the row shows allergies and intolerances only.
