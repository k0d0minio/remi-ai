# Stub: A patient enters three genotypes or none, and REMI keeps DEFAULT until all three are valid

- feature-slug: genotype-section
- epic: preparatory-questionnaire
- story: 4
- sequence: 4 of 5
- depends-on: questionnaire-flow
- complexity: medium
- priority: P0

## Problem

Story 4: the genetic personalisation « ne s'active que si les trois résultats sont renseignés
et correspondent à une entrée valide du tableau interne. Aucun calcul génétique partiel. »
Nothing on `main` stores a genotype.

## Proposed change

In Génétique: « Avez-vous réalisé un test génétique permettant de connaître vos génotypes
APOE, DIO2 et AMY1A ? » with « Non / Je ne sais pas » and « Oui ». « Oui » shows the genetic
consent (`consent-and-data/genetic-consent-and-optional-data`) and then three single-choice
lists: APOE (E2/E2, E2/E3, E3/E3, E3/E4, E4/E4, E2/E4), DIO2 (A, H, M), AMY1A (A, H, M). The
profile exposes `macroProfile()`: the DEFAULT split 45/30/25 unless all three are set and
match the internal table. Switching back to « Non / Je ne sais pas » clears the use of the
values and restores DEFAULT.

## Acceptance criteria

- [ ] The three lists are hidden until « Oui » is selected and the genetic consent is `given`
- [ ] Each list accepts one value. An unanswered list stays empty. No value is invented
- [ ] `macroProfile()` returns DEFAULT 45/30/25 when any of the three is empty or the trio has no table entry
- [ ] Switching to « Non / Je ne sais pas » makes `macroProfile()` return DEFAULT at once and keeps the stored values out of every calculation
- [ ] The patient can finish the questionnaire with the section empty
- [ ] The internal table is one data file with a test per entry. Until Morgane validates it (question 3), it holds only DEFAULT and the function returns DEFAULT for every trio
- [ ] Changing a genotype writes an audit event

## Out of scope

- The macronutrient proposal in recipes (`recipe-space`). The laboratory mapping's validation (Morgane).

## Notes

- D-30. cross-epic: `consent-and-data/genetic-consent-and-optional-data`, `recipe-space` reads `macroProfile()`.
- The 28 Aug rule stands: a doctor orders the test. REMI never suggests one.
