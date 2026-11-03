# Stub: An account is deleted one month after the pilot ends, after a notice, unless the patient continues

- lane: chore
- found-by: consent-and-data/inactive-account-deletion, Morgane's answer to question 6 (call of 2026-10-23) · 2026-11-03
- complexity: medium
- priority: P2

## Problem

Morgane said: at the end of the pilot the account continues if the patient wants it. Else REMI deletes it one month after the end, after an e-mail of notice. No code does this. The inactivity sweep (`packages/services/src/db/services/retention/`) covers only twelve months of inactivity.

## Proposed change

investigate. Decide the pilot's end date, how a patient says « I continue », and the notice text. Then reuse the sweep's notice and `deletePatient`.

## Acceptance criteria

- [ ] Jamie and Morgane record the end date and the patient's choice in a decision of record.
- [ ] A patient who does not continue receives one notice e-mail, and the account goes one month after the pilot's end.
- [ ] A patient who continues keeps the account. The inactivity rule still applies.
- [ ] `RETENTION.md` says what happens at the end of the pilot.
