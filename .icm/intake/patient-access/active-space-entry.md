# Stub: After activation the same account opens the active space

- feature-slug: active-space-entry
- epic: patient-access
- story: 22
- sequence: 3 of 3
- depends-on: waiting-screen
- complexity: low
- priority: P0

## Problem

The patient must not create a second account and must not depend on the e-mail to get in.

## Proposed change

Sign-in with the account from sign-up lands on the home (cross-epic: `patient-home-navigation`) when the file is « Accompagnement actif ». The sign-in link in the e-mail opens the same sign-in page. A patient who signs in with no e-mail received sees the same active space. The space shows only the validated version (cross-epic: `protocol-versions`).

## Acceptance criteria

- [ ] The credentials from sign-up open the active space.
- [ ] The e-mail's link and a direct visit land on the same sign-in page and the same home.
- [ ] A patient who never received the e-mail sees the active space after sign-in.
- [ ] No route in the patient space reads an unvalidated recommendation.

## Out of scope

- Password reset: `patient-signup-account`.

## Notes

D-26, D-30. Files: `apps/web/app/[locale]/(app)/`. Cross-epic: `patient-signup-account/sign-in`, `patient-home-navigation/app-shell-and-nav`.
