# Stub: A patient declares allergies and intolerances from standard lists, and an unanswered list is not an absence

- feature-slug: allergy-intolerance-lists
- epic: preparatory-questionnaire
- story: 4
- sequence: 3 of 5
- depends-on: questionnaire-flow
- complexity: medium
- priority: P0

## Problem

Free text cannot drive a safe exclusion. Story 4 defines two checkbox lists, four sub-lists
with « Tous », exclusive « Aucune connue » options, « Autre » with text, and celiac disease as
a strict gluten exclusion.

## Proposed change

Allergies: gluten, crustacés, œufs, poissons, arachides, soja, lait / protéines de lait,
fruits à coque, céleri, moutarde, sésame, sulfites, lupin, mollusques, blé, autre.
Sub-lists for fruits à coque, poissons, crustacés and mollusques, shown when the family is
ticked, each with « Tous ». A family ticked without a sub-choice excludes the whole family.
« Tous » disables the individual boxes. Intolerances: lactose, gluten, protéines de lait /
caséine, œuf, fructose, sorbitol, polyols, histamine, FODMAP, sulfites, autre. « Aucune
allergie connue » and « Aucune intolérance connue » untick and disable the rest of their list.
« Autre » opens a text field. « Maladie cœliaque » in Santé sets a strict gluten exclusion
flag that includes cross-contamination.

## Acceptance criteria

- [ ] Each list is checkboxes. Each box toggles alone. No search field, no tags
- [ ] Ticking fruits à coque, poissons, crustacés or mollusques shows its sub-list with « Tous »
- [ ] « Tous » disables the sub-list's individual boxes. A family with no sub-choice is stored as `all`
- [ ] « Aucune allergie connue » unticks and disables every other allergy box. The same for intolerances
- [ ] An untouched list is stored as unanswered, not as « aucune ». The file shows « Non renseigné »
- [ ] The file cannot become « Prêt pour consultation » until both lists carry an explicit answer
- [ ] « Autre » stores its text as an `other` row
- [ ] « Maladie cœliaque » ticked stores `celiac_disease` and the strict gluten exclusion flag
- [ ] Blé is its own box in the gluten sub-list

## Out of scope

- How recipes apply the exclusions (`eviction-safety`, `recipe-space`).

## Notes

- D-30. The enums come from `questionnaire-fields`. The strict gluten flag is read by `eviction-safety` (story 14).
- Jamie accepted the defaults of the pull request's questions on 2026-11-03:
  1. Blé stays the `wheat` key of the gluten sub-list (`questionnaire-fields`, answer 6). Criterion 9 reads « Blé is its own box in the gluten sub-list ».
  2. The gluten sub-list shows like the four others.
  3. A category ticked with no sub-choice is stored as `all`. An older null `sub_key` reads as `all`.
  4. `celiac_disease = true` is the strict gluten exclusion flag. No second column.
  5. « Maladie cœliaque »: a tick stores `true`, an untick stores `false`, an untouched box stays null.
  6. A sub-list « Autre » stores its text on the `<family>/other` row.
  7. The intolerance list has no sub-list.
