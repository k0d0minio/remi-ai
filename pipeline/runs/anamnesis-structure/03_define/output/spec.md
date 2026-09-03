# Spec: Structured anamnesis — twelve categories replace the single blob

- slug: anamnesis-structure
- apps: admin, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/patient-anamnesis.ts, packages/services/src/db/models/index.ts, packages/services/src/db/services/patient-anamnesis, packages/services/src/db/index.ts, packages/services/src/shared/patient.ts, packages/services/src/shared/index.ts, apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients/anamnesis-block.tsx, apps/admin/components/patients/vocabulary.ts, apps/admin/components/patients/patient-form.tsx, apps/admin/lib/patients/actions.ts
- complexity: standard
- demo: none

## Problem

The anamnesis is one `text` column on `patient_profiles` — a single blob holding everything Morgane
learns about a patient's terrain. § B of the v2 brainstorm does not describe one field; it describes
twelve areas of enquiry (motif et attentes, santé, alimentation, hydratation, digestion,
élimination, sommeil/stress/énergie, immunité/ORL/respiration, cardiovasculaire/lymphatique,
ostéo-articulaire/activité, endocrinien/gynéco, contexte de vie). Held as prose, none of them is
addressable: nothing can say what a consultation touched, nothing can show which areas were never
explored, and nothing can be written into.

That last point is why the structure matters now rather than later. The eventual model is a
questionnaire and a consultation transcript filling these slots automatically, with Morgane
correcting rather than re-typing. A category that is a row can gain machine-drafted content as a new
writer; a category that is a paragraph in a blob cannot, and would cost a migration to become one.

This is stub 3 of the `patient-record` epic — the manual record Morgane runs a consultation from,
built as permanent data layer now (`business/initiatives`: terrain-first, manual before AI). The
epic's decisions of record (`.icm/intake/patient-record/breakdown.md § Decisions`) bind it: admin and
data layer only, no patient-facing change.

## Proposed change

**A new `patient_anamnesis` table** — one row per (patient, category) with a free-text `body`,
cascading on patient delete, unique on `(patient_id, category)`. Not twelve columns on the profile:
the categories are domain vocabulary that Morgane may still trim, and a per-category row makes
trimming a constants edit rather than a migration. It is also the shape the AI round writes into —
a row gaining drafted content pending her correction is a new writer, not a new table.

**`anamnesisCategories` in `packages/services/src/shared/patient.ts`** — the twelve § B categories as
a `const` tuple of stable English keys, with the `AnamnesisCategory` type derived from it, exactly as
`patientSexes` and `cookingAffinities` already work. The keys are what the database stores; the
French § B wording lives as labels in `apps/admin/components/patients/vocabulary.ts`. Order in the
constant is § B's order, and it is what the page renders in.

**A `patient-anamnesis` service behind the seam**, mirroring `patient-notes`: list a patient's
entries, upsert one category's body, and `touchPatient` on every write so the roster's
`last_edited_at` moves. Tested against the in-memory client like its siblings.

**Emptiness costs nothing, literally.** A category with no content has no row. Saving an empty body
deletes the row rather than storing `""`, so a patient Morgane has barely started carries two rows,
not twelve, and "never explored" and "explored, nothing to note" are the same state — which is what
she means by leaving a category blank.

**One editable block on the admin patient page**, between Consultations and Profil: the background
under the session timeline, above the profile fields. Each of the twelve categories is a row showing
its French label and its text, or the label alone when empty; a pencil opens a textarea for that
category with its own save — the same per-item edit pattern `NoteTimeline` and `RecommendationItem`
already use, and the one that survives a phone mid-consultation. One category saves at a time; the
other eleven are untouched by that write.

**The legacy `anamnesis` column stays**, on the profile, in the form, with its content intact. It is
the seed Morgane redistributes into the categories by hand; its form hint changes to say so. Its
retirement is a follow-up `tweak`, cut when she tells us she is done — not this run.

**Nothing renders at `/p/[token]`.** The anamnesis is the practitioner's working record, under the
same rule as consultation notes. The assertion lives where the query would be — a test on the
patient-link read path that no anamnesis service is called and no category text reaches the page —
not only as a visual check on the page.

## Acceptance criteria

- [ ] A `patient_anamnesis` table exists — `patient_id` (cascade delete), `category`, `body`,
      timestamps — unique on `(patient_id, category)`, with a checked-in migration generated by
      `pnpm db:generate` that applies to a database holding existing rows without manual
      intervention.
- [ ] `anamnesisCategories` in `packages/services/src/shared/patient.ts` lists § B's twelve
      categories in § B's order as stable English keys, `AnamnesisCategory` derives from it, and both
      are re-exported through `@remi/services/shared` — the same constants-derive-the-type pattern as
      `patientSexes` and `cookingAffinities`.
- [ ] `apps/admin/components/patients/vocabulary.ts` maps every category to its French § B label, and
      the admin block renders those labels — no French string is hard-coded in the component.
- [ ] A `patient-anamnesis` service behind the seam lists a patient's entries in category order and
      upserts one category's body; a write to one category leaves the other eleven rows byte-for-byte
      unchanged, and every write calls `touchPatient`.
- [ ] Saving an empty or whitespace-only body removes that category's row; a patient with no
      anamnesis has zero rows, and listing returns the twelve categories as empty without a row
      existing for any of them.
- [ ] An unknown category key is rejected by the service as `invalid_input` rather than stored.
- [ ] The admin patient page shows the anamnesis block between Consultations and Profil, listing all
      twelve categories in § B's order, each with its label and body or the label alone when empty.
- [ ] Editing one category from that block opens a textarea for it alone, saves through a server
      action, and re-renders with the new text — the other categories' displayed text is unaffected.
- [ ] The `anamnesis` column, its stored content and its position in the profile form are unchanged;
      only its French hint changes, to name it as the seed to redistribute into the categories.
- [ ] The patients-service tests still pass unchanged, and new `patient-anamnesis` tests cover
      round-tripping through the in-memory client: upsert, per-category isolation, clearing to
      deletion, unknown category, and cascade on patient delete.
- [ ] `/p/[token]` renders exactly as it does today, and a test on that read path asserts no
      anamnesis entry is fetched or rendered there.

## Out of scope

- **Retiring the `anamnesis` column or removing its form field.** It stays until Morgane says she has
  emptied it; the removal is a follow-up `tweak` with its own migration.
- **Migrating, splitting or parsing the existing `anamnesis` prose.** No backfill, no heuristic
  distribution across categories. She redistributes by hand, patient by patient.
- **Rendering a per-category "last touched" date.** Every row carries `updated_at` from the shared
  `timestamps` helper, so the fact is recorded either way and surfacing it later is a read-site
  change with no migration. Whether she wants to see it is her question, raised below.
- **Any patient-facing change.** Nothing at `/p/[token]`, no token, routing or consent change — epic
  decision 4.
- **The anamnesis on `/patients/new`.** Categories are rows against a patient id, and a profile
  being created has none; the block appears on the detail page only.
- **A per-category structure richer than free text** — no sub-questions, no scored items, no
  questionnaire schema. The AI round writes into these same text bodies.
- **Any AI writer.** This run lands the slots the later round writes into; it writes nothing itself.
- Goals, living summary and supplement protocol — stubs 4–6 of the epic.

## Open questions

Both are the stub's, raised rather than answered, and neither blocks a criterion above.

- **Are § B's twelve categories, and their French wording, final?** The list here is § B verbatim.
  The wording is Morgane's to trim, and this design is what makes that cheap: the labels live in one
  admin `vocabulary.ts` map, and dropping or renaming a category is an edit to the constant plus its
  label — no migration, because the key is stored per row rather than as a column. Worth confirming
  with her before the vocabulary is treated as settled, but nothing in this run waits on it.
- **Does she want a per-category "last touched" date visible?** An anamnesis ages block by block,
  and `updated_at` per row already answers it in the data. Rendering it is a later read-site change,
  out of scope above; her answer decides whether it is worth one.
