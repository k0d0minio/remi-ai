# Stub: The file shows the calculations summary under the patient data, or names the datum each one lacks

- feature-slug: calculations-summary-slot
- epic: patient-file-view
- story: 6
- sequence: 4 of 5
- depends-on: file-page-frame
- complexity: low
- priority: P0

## Problem

Story 6: « Afficher le résumé des calculs nutritionnels sous les données du patient. »
Stories 7, 8 and 9 each say: when a datum is missing, no calculation, and the missing datum is
named.

## Proposed change

A « Calculs » section under the questionnaire data with three rows: IMC, Besoins protéiques,
Besoins énergétiques. Each row renders what its epic provides, or « Non calculé — <donnée
manquante> » from the shared missing-data helper. Each row carries the « estimation » label
until the practitioner validates (story 30). The three calculation epics fill the rows.

## Acceptance criteria

- [ ] The section exists with three rows before any calculation epic ships, each reading « Non calculé » with the missing data named
- [ ] A row shows « estimation » until its value is validated
- [ ] The missing-data helper is one function the three epics reuse
- [ ] The section sits under the questionnaire data and above the protocol sections

## Out of scope

- The formulas (`bmi`, `protein-needs`, `energy-needs`).

## Notes

- D-30. cross-epic: `bmi`, `protein-needs`, `energy-needs` render into this slot.
