> Dropped: `patient-home-navigation/retire-token-link` removes the page that this stub fixes (« Mon profil »). The plan ships that stub in phase 3 (2026-11-26), before the pilot starts on 2026-12-15. Question 1 of the pull request asks for an interim fix, 2026-11-12.

# Stub: « Mon profil » on the token link stops editing the free-text diet, allergies and intolerances

- lane: chore
- found-by: preparatory-questionnaire/questionnaire-flow · 2026-11-03
- complexity: medium
- priority: P1

## Problem

The questionnaire now asks the diet as a radio group and the allergies and intolerances as checkbox lists. « Mon profil » on the token link (`apps/web/components/patient-link/profile-form.tsx`) still edits the old free-text `dietaryRegime`, `allergies` and `intolerances`. The patient can give two different answers to one question. The breakdown of `preparatory-questionnaire` says this epic replaces that form.

## Proposed change

Remove the three free-text fields from « Mon profil », or point the patient to the questionnaire. Jamie decides which.

## Acceptance criteria

- [ ] « Mon profil » no longer edits the diet, the allergies or the intolerances
- [ ] The practitioner's file shows one answer per question
