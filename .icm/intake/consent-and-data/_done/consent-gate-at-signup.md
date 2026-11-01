# Stub: The patient reads the data notice and ticks the mandatory consents before the account exists

- feature-slug: consent-gate-at-signup
- epic: consent-and-data
- story: 3
- sequence: 2 of 6
- depends-on: consent-texts-and-records
- complexity: medium
- priority: P0

## Problem

Story 3: « Afficher au patient, avant la création du compte, les informations relatives au
traitement de ses données. » Story 2: the account cannot be created until the mandatory boxes
are ticked.

## Proposed change

A consent step inside the sign-up flow (`patient-signup-account/signup-page`), before the
account is created. It shows the current text of each mandatory consent in full, one checkbox
per consent, and a « Relire » control that reopens the full text. Submission records every
decision with the version shown.

## Acceptance criteria

- [ ] The step appears before any account or profile row is written
- [ ] An unticked mandatory box blocks the submit control and names the missing consent
- [ ] The patient can open and read the full text of each consent from the step
- [ ] On submit, one `patient_consents` row per consent is written with the version shown
- [ ] The step works on a phone screen
- [ ] The texts are in French. The page's `lang` is `fr`

## Out of scope

- The optional genetic consent (next stub). Re-consent on a new text version.

## Notes

- cross-epic: `patient-signup-account/signup-page` hosts the step. Build that stub's form first, this stub inserts the step.
