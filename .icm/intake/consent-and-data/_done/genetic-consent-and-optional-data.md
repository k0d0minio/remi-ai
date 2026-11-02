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

- [ ] The genetic consent appears only after « Oui » to the test question
- [ ] Without a `given` genetic consent, no genotype value is written
- [ ] A refusal is stored as `refused` with its version. The fields stay hidden. Nothing else changes
- [ ] The practitioner's file view hides the genotype when the consent is not `given`
- [ ] Withdrawing the genetic consent later clears the three genotype fields and writes an audit event
- [ ] Médicaments, compléments and poids souhaité are stored only when the `care` consent is `given`

## Out of scope

- The genotype fields themselves and the DEFAULT profile (`preparatory-questionnaire/genotype-section`).

## Notes

- cross-epic: `preparatory-questionnaire/genotype-section`, `patient-file-view/file-page-frame`.
- D-30: a hidden field is « Non renseigné », never a default value.
