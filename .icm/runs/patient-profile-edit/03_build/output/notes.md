# Build notes: patient-profile-edit

- commits: feat: patient-profile-edit — « Mon profil » on the patient link, three-level time and budget, the console marker
- ci: draft — nothing owed; `lint.sh` OK, `format.sh` clean, `security-check.sh` OK (full verdict after the ready flip)

## What changed

- `packages/services/src/shared/patient.ts`: `cookingTimes`, `foodBudgets`, `patientEditableProfileFields` — the closed sets and the seven fields the link may write.
- `packages/services/src/db/schema.ts` + migration `0024_patient_profile_edit.sql`: `cooking_time` (nullable), `food_budget` nullable three-level, `patient_edited_at` jsonb `{}`. The migration hand-maps the old free text: a value that is only a level's word (any case, accents or not: éco, économique, standard, confort, confortable) takes the level; any other non-empty text is appended to `preferences` as « Budget : <text> »; `""` → NULL. Proven on a scratch Postgres 16 with every earlier migration applied first (Économique → economical, « confort » → comfort, STANDARD → standard, « 50€/semaine » and « moyen » → preferences, "" → NULL).
- `db/services/patients`: `updatePatientProfileByPatient` — only the seven fields, a no-change save writes nothing, dates each changed field, never moves `lastEditedAt`. `updatePatient` (Morgane's save) now reads the row first and drops the patient's date from each field whose value she actually changed — her form posts every field, so "sent" is not "changed".
- `db/services/patient-link-writes`: optional `changedAnything(data)` on the request — a successful write that changed nothing records no audit event and no last-written stamp.
- `ai/context.ts`: « Temps disponible pour cuisiner » line; the console's `patientContextInput` passes French labels for time and budget.
- `apps/web`: segment `profil` (always visible, last in the nav), `saveProfileAction` (audit action `patient.updated` under the patient actor), `profile-form.tsx` (controlled, so a refused save keeps what was typed), fr/en strings.
- `apps/admin`: the patient form's time select (new) and budget select (was a text input), each with « Non renseigné »; the profile summary's food group shows all seven fields, each with « Modifié par la patiente le … » while the patient's change is the current value.
- `.icm/docs/RETENTION.md`: two table rows and a paragraph on what the patient edits.

## Acceptance criteria status

- [x] « Mon profil » segment, seven fields prefilled, name / age / height / weight read-only — `profil/page.tsx`, `visibleSegments`
- [x] Never shows birth date, constraints, referral, consent, anamnesis, medications or supplements — the page renders only the listed fields
- [x] A changed save persists and shows on the console summary — `updatePatientProfileByPatient` + revalidation; the summary reads the row
- [x] One patient-actor audit event + last-written stamp per accepted change; neither on a no-change save — `changedAnything` (unit-tested)
- [x] Rate limit / cap refused with a message, values kept, nothing persisted — the link write's ceilings; the form is controlled
- [x] Unknown or regenerated token → same not-found for page (loader) and save (`not_found` → « Ce lien n'est plus valable »)
- [x] Clearing an allergy is allowed and dated — unit-tested
- [x] Marker on each patient-changed field, cleared per field by Morgane's own change — unit-tested
- [x] Time and budget selects with an unset option on both surfaces
- [x] Migration mapping — proven on a scratch Postgres 16 (above)
- [x] Copy-context shows the three French labels — `context.test.ts`
- [x] RETENTION.md rows

## Notes for Release

- **Forward-only migration** (`migrations.reversible: false`): `food_budget` loses its NOT NULL and default, and the old free text is rewritten. Reverting the code after it runs would leave pre-change code reading NULL where it expected a string — a revert needs a fix-forward, not a code rollback.
- The profile summary's food group now also shows « Aliments aimés / non aimés » (`preferences`), which it did not before — needed for the marker on all seven fields.
- The admin selects post `unset` for « Non renseigné »; the action narrows anything outside a set to `""`, which clears the column.
- The patient-side edit reuses `patient.updated` as its audit action under the `patient` actor (no new `AuditAction`, so no vocabulary change in the console journal).
- Context budget: read `.icm/docs/RETENTION.md` and the web/admin components the change touches beyond `touches:` (`segment-page.tsx`, `message-form.tsx` as the pattern, `choice-chip.tsx`, `field.tsx`, `typography.tsx`).
