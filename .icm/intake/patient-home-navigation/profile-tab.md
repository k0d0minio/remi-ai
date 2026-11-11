# Stub: « Profil » opens on the recommendations, then the patient's own data, then the account

- feature-slug: profile-tab
- epic: patient-home-navigation
- story: 31
- sequence: 3 of 4
- depends-on: app-shell-and-nav
- complexity: medium
- priority: P0

## Problem

The patient must tell apart the practitioner's recommendations, which they cannot change, from their own data, which they can.

## Proposed change

The « Profil » tab in three parts, in this order: 1 « Recommandations », a visible entry to story 23's page with the evictions block as a summary (cross-epic: `patient-recommendations`), read-only; 2 « Mes informations personnelles », the profile fields the patient may edit (breakdown question 2), each write through `recordPatientChange` (cross-epic: `patient-change-signals/patient-change-table`); 3 the account settings: e-mail, password, sign out (cross-epic: `patient-signup-account`). Editable fields carry an edit control. Recommendations carry none.

## Acceptance criteria

- [ ] « Profil » shows « Recommandations » first, then « Mes informations personnelles », then the account settings.
- [ ] The recommendations part has no edit control and shows the validated version only.
- [ ] Each editable personal field is marked as editable and saves on its own.
- [ ] A saved personal change creates a change signal for the practitioner.
- [ ] A field the patient may not edit is shown without an edit control.

## Out of scope

- The recommendations page content: `patient-recommendations`.
- Password reset and e-mail change flows: `patient-signup-account`.

## Notes

D-26, D-30. Replaces `apps/web/app/[locale]/p/[token]/profil/`. Files: `apps/web/app/[locale]/(patient)/profil/`. Cross-epic: `patient-recommendations/recommendations-page`, `patient-change-signals/patient-change-table`, `patient-signup-account`.
