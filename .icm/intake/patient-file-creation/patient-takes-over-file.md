# Stub: A patient activates an account on the file their practitioner created, and finds their data in it

- feature-slug: patient-takes-over-file
- epic: patient-file-creation
- story: 1
- sequence: 5 of 5
- depends-on: practitioner-creates-file
- complexity: medium
- priority: P0

## Problem

Story 1: « Le profil créé par le praticien peut être repris et complété par le patient
lorsqu'il active son compte via une invitation ou le lien d'inscription du praticien. » A file
without an account must become a file with one, never a second file.

## Proposed change

Two paths into the same file. First: the activation e-mail (`care-activation`) carries a
one-time link that lets the patient set a password on the existing file. Second: the patient
follows the practitioner's sign-up link with the e-mail already on a practitioner-created
file. REMI offers « Un dossier existe déjà pour cette adresse » and a one-time e-mail to claim
it. In both paths the account is attached to the existing `patient_profiles` row and the data
entered by the practitioner stays.

## Acceptance criteria

- [ ] An activation link on a practitioner-created file sets a password and signs the patient into that file
- [ ] A sign-up with an e-mail of a practitioner-created file (no account yet) creates no new row and offers the claim e-mail
- [ ] The claim link expires and works once
- [ ] After takeover the questionnaire shows the practitioner's entries, editable where the patient may edit
- [ ] The takeover writes an audit event
- [ ] A takeover attempt on an e-mail with an existing account is refused with the sign-in link

## Out of scope

- The activation itself, the recapitulatif and « Votre espace REMI est prêt » (`care-activation`).

## Notes

- cross-epic: `patient-signup-account/auth-seam`, `patient-signup-account/duplicate-email-guard`, `care-activation` (sends the e-mail that carries the link).
- The claim e-mail goes through the email seam (Resend), from the address Morgane names.
