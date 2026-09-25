# Tasks: patient-profile-edit

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] The patient link lists a « Mon profil » segment; opening it with a valid token shows the seven editable fields prefilled with the current values, and name, age, height and weight read-only
- [x] The segment never shows the birth date, constraints, referral, consent, anamnesis, medications or supplements
- [x] Saving changed values through « Mon profil » persists them, and the change appears on the console's profile read summary on reload
- [x] Each accepted save records one audit event whose actor is the patient and stamps the profile's last-written timestamp; a save with no change records neither
- [x] A save over the link rate limit or over a length cap is refused with a message on the segment, the typed values stay in the form, and nothing is persisted
- [x] An unknown or regenerated token on `/p/[token]/profil` returns the same not-found as every other segment, for both the page and the save
- [x] The patient can clear or remove an allergy, and the console then shows « modifié par la patiente le <date> » on Allergies
- [x] The console's profile read summary shows « modifié par la patiente le <date> » on each of the seven fields the patient last changed, and not on fields Morgane saved after the patient
- [x] « Temps disponible pour cuisiner » (faible / moyen / important) and « Budget alimentaire » (économique / standard / confort) are selects on both the patient segment and the admin patient form, each with an unset option
- [x] After the migration, an existing `food_budget` naming a level holds that level, and any other existing non-empty value appears in `preferences` as « Budget : <original text> » with the budget unset
- [x] The copy-context export shows « Aime cuisiner », « Temps disponible pour cuisiner » and « Budget » as their French three-level labels
- [x] RETENTION.md lists `cooking_time` and the per-field patient-edit dates, with what reaches the link

## Queue

- [x] Vocabulary + schema + migration 0024 (`shared/patient.ts`, `db/schema.ts`, `migrations/0024_patient_profile_edit.sql`) — mapping proven on a scratch Postgres 16
- [x] Services: model, validation, `updatePatientProfileByPatient`, Morgane's save clearing markers, `changedAnything` on the link write (`db/services/patients`, `db/services/patient-link-writes`) + tests
- [x] Generation context: the time line and French labels (`ai/context.ts`, `apps/admin/lib/patients/context.ts`, `vocabulary.ts`)
- [x] Patient link « Mon profil » (`apps/web` segment, loader, action, `profile-form.tsx`, fr/en content)
- [x] Console: time + budget selects with « Non renseigné », the per-field marker, the preferences row (`patient-form.tsx`, `profile-summary.tsx`, `actions.ts`, the patient page)
- [x] RETENTION.md rows and the patient-edits paragraph
