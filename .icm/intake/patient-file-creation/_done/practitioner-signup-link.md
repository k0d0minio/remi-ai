# Stub: A practitioner copies one permanent sign-up link that attaches each new patient to them

- feature-slug: practitioner-signup-link
- epic: patient-file-creation
- story: 1
- sequence: 2 of 5
- depends-on: care-relationship
- complexity: medium
- priority: P0

## Problem

Story 1: « Chaque praticien dispose d'un lien d'inscription unique et permanent, copiable et
réutilisable dans ses confirmations de rendez-vous (Calendly, Doctolib, etc.). » No such link
exists. Today's invitation token is per operator account, single use.

## Proposed change

Add `signup_link_token` to `operators`, generated once, unguessable, never expiring. Show the
link with « Copier le lien » on the account page and on the patient list (Morgane's question
3). `apps/web/app/[locale]/inscription/[token]` resolves the token to the practitioner. An
unknown token shows « Ce lien n'est pas valide » and writes nothing.

## Acceptance criteria

- [ ] Each practitioner has one token. The token resolves to that practitioner on every visit. `patient-signup-account/signup-page` proves that two sign-ups attach two patients to the same practitioner
- [ ] « Copier le lien » puts the full URL on the clipboard and confirms in place
- [ ] An unknown or malformed token renders the invalid-link page. No row is written
- [ ] The token is not shown to another practitioner
- [ ] The link survives a password change and a sign-out

## Out of scope

- Regenerating a link. Expiring one.

## Notes

- cross-epic: `patient-signup-account/signup-page` consumes the token. Merge this stub first.
- Morgane's question 1, answered on the call of 2026-10-23: about a dozen practitioners before 19 December. The structure still issues one token per operator.
