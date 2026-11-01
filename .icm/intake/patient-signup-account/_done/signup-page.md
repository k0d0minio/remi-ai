# Stub: A patient signs up from their practitioner's link on their phone

- feature-slug: signup-page
- epic: patient-signup-account
- story: 2
- sequence: 2 of 4
- depends-on: auth-seam
- complexity: medium
- priority: P0

## Problem

There is no sign-up page. A patient today receives a link to a token page and cannot create an
account.

## Proposed change

Add `apps/web/app/[locale]/inscription/[token]/`. The token is the practitioner's permanent
link (`patient-file-creation/practitioner-signup-link`). The form asks nom, prénom, date de
naissance, e-mail, téléphone and a password. The consent screen (story 3) comes before the
account is created. On success the account is attached to the practitioner and the
questionnaire opens.

## Acceptance criteria

- [ ] Nom, prénom, date de naissance, e-mail and téléphone are mandatory. An empty one blocks the form and names itself
- [ ] An e-mail that is not a valid address is refused with a message
- [ ] An invalid or unknown token shows a message and creates nothing
- [ ] After the account is created, the patient lands on the questionnaire
- [ ] The new `patient_profiles` row carries the practitioner id from the link
- [ ] The form works on a phone screen: one column, large targets, no horizontal scroll
- [ ] Account creation writes an audit event

## Out of scope

- The consent screen's content (`consent-and-data/consent-gate-at-signup`).
- The questionnaire pages (`preparatory-questionnaire/questionnaire-flow`).

## Notes

- cross-epic: `patient-file-creation/practitioner-signup-link` (the token), `consent-and-data/consent-gate-at-signup` (the gate), `patient-file-creation/care-relationship` (the column).
- Status after sign-up follows Morgane's answer to question 1. Default: the questionnaire sets it.
