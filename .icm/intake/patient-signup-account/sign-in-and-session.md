# Stub: A patient signs in with the account they created and stays signed in

- feature-slug: sign-in-and-session
- epic: patient-signup-account
- story: 2
- sequence: 3 of 4
- depends-on: auth-seam
- complexity: medium
- priority: P0

## Problem

Story 2: « Le compte créé à l'inscription reste le compte utilisé après activation ». No
sign-in exists on `apps/web`.

## Proposed change

Add `apps/web/app/[locale]/connexion/` and sign-out. The session lives in a cookie the app
owns. Add « Mot de passe oublié » by e-mail through the email seam (Resend), subject to
Morgane's question 2. The same account opens the questionnaire before activation and the
patient space after it.

## Acceptance criteria

- [ ] A patient signs in with e-mail and password and reaches their current page: the questionnaire before activation, the home after it
- [ ] A wrong password shows one message and does not say which field is wrong
- [ ] Sign-out ends the session on this device
- [ ] « Mot de passe oublié » sends one e-mail with a link that expires. The link sets a new password once
- [ ] A signed-in patient never sees another patient's data
- [ ] Sign-in and reset write audit events

## Out of scope

- Operator sign-in. The waiting screen's content (`patient-access`).

## Notes

- D-28. cross-epic: `patient-access/waiting-screen` renders what a signed-in, not yet activated patient sees.
- If Morgane answers « non » to question 2, the reset is dropped from this stub, not parked.
