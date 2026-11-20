# Stub: The patient withdraws a consent from the account settings, and the consequence applies at once

- feature-slug: consent-withdrawal-in-app
- epic: consent-and-data
- story: 3
- sequence: 5 of 6
- depends-on: consent-texts-and-records
- complexity: medium
- priority: P0

## Problem

The pilot privacy policy (Drive, section 4) promises « une option de retrait dans votre espace
personnel ». No story asks for it and no screen offers it. Only the genetic consent has a
withdrawal rule (`genetic-consent-and-optional-data`), and that rule has no control the patient
can use. Jamie decided on 2026-10-23 to build the option.

## Proposed change

A section « Mes consentements » in the account settings of the patient's space
(`patient-home-navigation/profile-tab`). It lists each consent with its decision, its date and
the version of the text, and a « Relire » link that opens the text accepted. Each withdrawable
consent has a « Retirer mon consentement » control. The control opens a confirmation that names
the consequence in one sentence. Confirming writes a `patient_consents` row `withdrawn` with the
timestamp and the version, writes an audit event, and applies the consequence: `genetic` clears
the three genotypes, `care` stops every generation and suggestion for the patient and shows
« Consentement retiré » on the practitioner's file (Morgane's question 5). Deletion of the
account stays a request by e-mail.

## Acceptance criteria

- [ ] « Mes consentements » lists each consent with decision, date, text version and a « Relire » link
- [ ] Each withdrawable consent has a « Retirer mon consentement » control with a confirmation that names the consequence
- [ ] A withdrawal writes one `patient_consents` row `withdrawn` with timestamp and version. No earlier row changes
- [ ] Withdrawing `genetic` clears the three genotypes and `macroProfile()` returns DEFAULT at once
- [ ] Withdrawing `care` stops every generation and suggestion for the patient at once and the practitioner's file shows « Consentement retiré »
- [ ] Each withdrawal writes an audit event (D-32)
- [ ] The section works on a phone screen. The texts are in French

## Out of scope

- Self-service deletion or export of the account. Re-consent on a new text version.
- The settings page itself (`patient-home-navigation/profile-tab`). This stub adds one section to it.

## Notes

- D-32. The `withdrawn` decision is in the enum from `consent-texts-and-records`.
- cross-epic: `patient-home-navigation/profile-tab` hosts the section and merges first.
  `genetic-consent-and-optional-data` owns the genotype consequence. `recipe-space` and
  `meal-improvement` read `consentsOf(patient)` before any generation.
- The privacy policy says the withdrawal takes effect at once and does not affect past processing.
