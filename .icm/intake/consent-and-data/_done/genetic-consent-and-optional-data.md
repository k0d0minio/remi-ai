# Stub: Optional data is collected only under its consent, and a refusal collects nothing

- feature-slug: genetic-consent-and-optional-data
- epic: consent-and-data
- story: 3
- sequence: 3 of 6
- depends-on: consent-texts-and-records
- complexity: medium
- priority: P0

## Problem

Story 3: « Aucune collecte facultative (génotype, médicaments, compléments, poids souhaité)
n'est effectuée sans consentement applicable. » The genotype needs its own consent.

## Proposed change

In the questionnaire (`preparatory-questionnaire/genotype-section`), the genetic consent text
is shown when the patient answers « Oui » to the genetic test question. Without a `given`
genetic consent, the three genotype fields stay hidden and empty. A refusal is stored as
`refused` and hides the fields. The other optional data are gated by the `care` consent, per
Morgane's question 2. The file view shows the genotype only when the consent is `given`.

## Acceptance criteria

- [ ] Without a `given` genetic consent, no genotype value is written
- [ ] A refusal is stored as `refused` with its version. The fields stay hidden. Nothing else changes
- [ ] Every read of the questionnaire returns the genotype as null when the genetic consent is not `given`
- [ ] Withdrawing the genetic consent later clears the three genotype fields and writes an audit event
- [ ] Médicaments, compléments and poids souhaité are stored only when the `care` consent is `given`
- [ ] The console form locks médicaments and compléments when the `care` consent is not `given`
- [ ] Only the patient records the genetic consent. An operator gets `not_permitted`

## Out of scope

- The genotype fields themselves and the DEFAULT profile (`preparatory-questionnaire/genotype-section`).
- The consent screen after « Oui ». It moved to `preparatory-questionnaire/genotype-section`.
- The file view's genotype. It moved to `patient-file-view/file-page-frame`.
- The prescribed protocol (`patient_supplements`). It is Morgane's prescription, not collected data.

## Notes

- cross-epic: `preparatory-questionnaire/genotype-section`, `patient-file-view/file-page-frame`.
- D-30: a hidden field is « Non renseigné », never a default value.
- Jamie, 2026-11-03, on the pull request's questions (the defaults hold):
  1. The rules go in the services only. The questionnaire is a holding page.
  2. The console locks médicaments and compléments until the patient gives the care consent.
  3. A patient with no `care` row loses the edit of those fields. Morgane records the care consent again.
  4. The prescribed protocol stays outside the gate.
  5. Only the patient records the genetic consent.
  6. Ready to merge waits on Morgane's validation of the genetic text version 1.
