# Spec: Data care — consent on record, privacy on the link, a written retention answer

- slug: data-care
- apps: admin, web, packages, docs
- touches: packages/services/src/db/schema.ts, packages/services/src/db/services/patients, packages/services/src/db/models/patient-profile.ts, apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients/patient-form.tsx, apps/admin/lib/audit.ts, apps/web/app/[locale]/p/[token]/page.tsx, apps/web/lib/content/{en,fr}.ts, .icm/docs/data-retention.md, .icm/docs/README.md
- complexity: standard
- demo: none

## Problem

Real names, pathologies and medications already persist in Neon and render at a real URL behind a
share token, and the data-protection groundwork ticket was lost in the 28 Aug clean slate. Before
this epic adds an anamnesis and a supplement protocol to the record, the cheap non-negotiable part
lands: a recorded consent fact per patient, a patient-facing privacy note on the share link, and a
written retention answer Morgane can give to a patient who asks. This advances the current
initiative's "data question answered before the first real record exists" objective: the recorded-fact
layer is the foundation a larger consent-management process would later build on, and it is what
makes beta data-processing defensible.

## Proposed change

- **Consent on the profile.** Add a consent date and a consent channel to `patient_profiles`
  (schema + migration via `pnpm db:generate`), exposed through the patient service, added to the
  `PatientProfile` model and the `PatientInput` shape. Morgane records date + channel (in-consultation,
  WhatsApp, email) on the existing admin patient profile form; the fields are editable like the rest of
  the profile. Absence renders as a visible "not recorded yet" state on the admin patient page, not a
  silent blank. Admin writes go through `lib/audit.ts` as the other profile edits do.
- **Privacy note on the patient link.** Extend the existing disclaimer card on
  `apps/web/app/[locale]/p/[token]/page.tsx` (the `patientLink.disclaimer` block) with patient-facing
  copy — in both the French and English locale dictionaries via `apps/web/lib/content/` — stating what
  this page is, who can see it (anyone holding the share link), and who to contact about their data.
- **A written retention answer.** One short markdown section at `.icm/docs/data-retention.md` (beside
  ENV.md, not a new framework): what deleting a patient removes today (profile, recommendations, notes,
  link — cascade), what it does not (the audit trail, by design), and how long ended patients are kept —
  written so Morgane can answer a patient who asks. Add it to the `.icm/docs/README.md` index.

## Acceptance criteria

- [ ] `patient_profiles` has a consent date and a consent channel column, created via `pnpm db:generate` and captured in the checked-in migrations
- [ ] The patient service's read/write surface accepts and returns the two consent fields, and the `PatientProfile` model and `PatientInput` shape include them
- [ ] The admin patient profile form lets Morgane set (and edit) a consent date and a consent channel, an edit is audited through `lib/audit.ts`, and an unrecorded consent shows a visible "not recorded yet" state on the admin patient page
- [ ] The share-link disclaimer on `/[locale]/p/[token]` carries the privacy note — what this page is, that anyone holding the link can see it, and who to contact about their data — in both `en` and `fr`
- [ ] `.icm/docs/data-retention.md` states what deleting a patient removes (cascade), what it does not (audit trail), and the retention for ended patients, in terms Morgane can use to answer a patient; it is linked from `.icm/docs/README.md`

## Out of scope

- No consent-management vendor, cookie machinery, or legal review — this is the recorded-fact layer, per the epic's decision of record.
- No stored consent wording or version — the open question below defers that; this run ships date + channel only.
- No change to the patient link's view-only decision (breakdown decision #1) — the note is copy on the existing card, not a form or interaction.
- No automated retention/deletion prompting for ended patients — the open question below defers that; this run records the beta answer in the retention doc only.

## Open questions

- Does Morgane want a stored consent wording/version, or is date + channel enough for the beta? (Raised from the stub; not answered here — the beta scope ships date + channel.)
- Retention for `ended` patients: is there a period after which Morgane wants deletion prompted, or is indefinite-until-asked the beta answer? (Raised from the stub; not answered here — the retention doc records the current beta answer.)
