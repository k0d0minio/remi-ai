# Stub: Practitioner text over 2 000 characters blocks every « Mon profil » save

- lane: bug
- found-by: `patient-profile-edit` Release code review (PR #131) · 2026-09-25
- size: S

## Problem

« Mon profil » posts all four text fields (régime, allergies, intolérances, aliments aimés / non
aimés) prefilled with what is stored, and `saveProfileAction` (`apps/web/lib/patient-link/actions.ts`)
declares all four as link bodies, capped at `PATIENT_LINK_BODY_MAX` (2 000). The console accepts up
to 10 000 per field, and migration 0024 appends « Budget : … » to `preferences`. So once Morgane's
text in any one field passes 2 000 characters, every patient save — even one that only changes the
budget select — is refused with « un champ dépasse 2000 caractères », and the only way through is
for the patient to cut her text. Production's one patient is at ~690 characters today.

## Proposed change

Apply the link's cap only to the text the patient actually changed: compare each posted field
with the stored value after the token resolves (e.g. declare as bodies only the fields that
differ, which needs the resolved patient — a `text` callback or a check inside the write), so an
unchanged long field never blocks a save.

## Acceptance criteria

- [ ] A patient whose stored preferences exceed 2 000 characters can change the budget and save
- [ ] A field the patient edits to more than 2 000 characters is still refused
