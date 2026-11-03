# Stub: An e-mail on a file without an account opens no file with a second practitioner

- lane: bug
- found-by: patient-signup-account/duplicate-email-guard · 2026-11-03
- complexity: medium
- priority: P1

## Problem

Jamie decided on 2026-11-03: one practitioner has many patients, and one patient never has two practitioners. The sign-up refuses an e-mail that holds an account (`patient_accounts.email`, unique). It does not refuse an e-mail that sits only on a file a practitioner created, with no account. With another practitioner's link, that e-mail gets a second file under the second practitioner.

## Proposed change

Jamie decided on 2026-11-03: the creation of a patient invitation link also creates a minimal user row, and the invitation attaches to it. The e-mail then holds a row from the first moment, so a second practitioner's link finds it. Build this with `patient-file-creation/patient-takes-over-file`, or before it.

## Acceptance criteria

- [ ] The creation of a patient invitation link writes one minimal user row for its e-mail, and the invitation names that row
- [ ] A sign-up on another practitioner's link with that e-mail creates no row and names no data of the existing file
- [ ] The check is case-insensitive on the e-mail
