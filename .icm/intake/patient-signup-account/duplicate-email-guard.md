# Stub: An e-mail already known to this practitioner leads to sign-in, never to a second file

- feature-slug: duplicate-email-guard
- epic: patient-signup-account
- story: 2
- sequence: 4 of 4
- depends-on: signup-page
- complexity: low
- priority: P0

## Problem

Story 2: « Étant donné une adresse e-mail déjà inscrite chez ce praticien, le patient est
invité à se connecter au lieu de créer un doublon. »

## Proposed change

On sign-up, look the e-mail up among this practitioner's patients. An existing account gets
« Vous avez déjà un compte. Connectez-vous. » with a link to sign-in. A file the practitioner
created without an account continues as the takeover path
(`patient-file-creation/patient-takes-over-file`).

## Acceptance criteria

- [ ] A second sign-up with an e-mail already holding an account with this practitioner creates no row and shows the sign-in link
- [ ] The same e-mail with another practitioner's link creates a separate file (one file per care relationship)
- [ ] The message does not reveal any data of the existing file
- [ ] The check is case-insensitive on the e-mail

## Out of scope

- Merging two files. The takeover of a practitioner-created file.

## Notes

- cross-epic: `patient-file-creation/patient-takes-over-file`.
