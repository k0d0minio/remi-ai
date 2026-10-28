# Stub: REMI holds the genotype reference table and proposes the split of the patient's row, or DEFAULT

- feature-slug: genotype-reference-table
- epic: genotype-macro-split
- story: 10
- sequence: 1 of 3
- depends-on: none
- complexity: medium
- priority: P0

## Problem

`macroProfile()` (story 4) returns DEFAULT for every trio because no table exists. Story 10
supplies the table. The procedure of 24 October completes it: 28 genotype rows and the DEFAULT
row, each with an orientation, three ranges and a « Validation médicale » value.

## Proposed change

Add the table as one data file, `packages/services/src/shared/genotype-macro-table.ts`. Each
row holds APOE, DIO2, AMY1A (a value, or `any` for « A/H/M »), the index, the orientation in
French, the carbohydrate range, the fat range, the protein range and the medical-validation mode
(`required`, `practitioner`, `none`). E2/E4 carries empty carbohydrate and fat ranges.
`macroProfile()` looks the trio up and returns the row. It returns DEFAULT with
`reason: 'absent'` when no row matches, and DEFAULT with `reason: 'mapping-unvalidated'` while
the laboratory-mapping flag is off (Morgane's question 3). The proposal is written to the
`macro` row of `patient_calculations` as the estimate, with the row's parameters.

## Acceptance criteria

- [ ] The data file holds the 28 genotype rows of the 24 October table and the DEFAULT row, with a test per row
- [ ] A patient with no genotype gets DEFAULT 45 / 30 / 25 and the orientation « Méditerranéen équilibré »
- [ ] A trio that matches a row returns that row's three ranges, its orientation and its validation mode
- [ ] A trio absent from the table returns DEFAULT with `reason: 'absent'`. Nothing is derived from a nearby row
- [ ] While the mapping flag is off, every trio returns DEFAULT with `reason: 'mapping-unvalidated'`
- [ ] E2/E4 returns empty carbohydrate and fat ranges and the protein range 20 to 25 %
- [ ] The `macro` estimate row keeps the trio, the row's index and the reason

## Out of scope

- The console summary and « Modifier » (stub 2). Generation (stub 3).

## Notes

- D-30 (nothing invented), D-35. Shared files first: this stub adds the `macro` kind to the enum of `bmi/calculations-table`. Files: `shared/genotype-macro-table.ts` and its tests, `shared/calculations.ts`, the calculations service.
- cross-epic: `preparatory-questionnaire/genotype-section` (the three values and `macroProfile()`), `bmi/calculations-table` (the table).
- Source rows: the table of « Recommandations alimentaires.docx », 24 October 2026 (Morgane's question 1). « Genotyp Last version .xlsx » is informative.
