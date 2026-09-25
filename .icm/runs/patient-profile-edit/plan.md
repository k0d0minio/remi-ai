# Plan: patient-profile-edit

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Vocabulary + schema + migration** — `packages/services/src/shared/patient.ts` (add
   `cookingTimes = ["low","medium","high"]`, `foodBudgets = ["economical","standard","comfort"]`),
   `db/schema.ts` (`cooking_time` nullable text; `food_budget` → nullable, default dropped; the
   per-field patient-edit dates — one nullable `jsonb` `patient_edited_at` mapping field → ISO
   date is the suggested shape), one migration that adds the columns and maps existing
   `food_budget` text (level words → level; any other non-empty text → appended to `preferences`
   as `Budget : <text>`, budget null). Load `.icm/skills/database-migration/SKILL.md` first. —
   done when: `check-migrations.sh` passes and a services test proves the mapping on « Économique »,
   « confort », « 50€/semaine » and "".
2. **Services: model, validation, patient write** — `db/models/patient-profile.ts`,
   `db/services/patients` (schemas take the enums; Morgane's save clears the patient-edit date of
   each field she changes), a new patient-profile write through `db/services/patient-link-writes`
   (the seven fields only, caps, no-op when nothing changed, audit actor = patient, stamps
   last-written and the per-field dates). — done when: in-memory tests cover the change, the
   no-op, the refused token, the cap, and Morgane clearing a marker.
3. **Generation context** — `packages/services/src/ai/context.ts` + `apps/admin/lib/patients/context.ts`
   and `apps/admin/components/patients/vocabulary.ts` (French labels for time and budget, the new
   « Temps disponible pour cuisiner » line). — done when: the context test shows the three labels.
4. **Patient link « Mon profil »** — `apps/web/lib/patient-link/segments.ts` + `load.ts`
   (segment `profil`, always present), `actions.ts` (thin server action over pass 2),
   `app/[locale]/p/[token]/profil/page.tsx`, a `profile-form` component in
   `components/patient-link` (seven fields + read-only name / age / height / weight; refusal
   rendered in place, typed values kept). — done when: the segment renders with a valid token,
   404s with a bad one, and a save round-trips.
5. **Console** — `apps/admin/components/patients/patient-form.tsx` (time select added, budget
   input → select, unset option each), `profile-summary.tsx` (the « modifié par la patiente le … »
   marker per field). — done when: both render from the new model and the marker follows the
   rules in the spec.
6. **RETENTION** — `.icm/docs/RETENTION.md` rows for `cooking_time` and the patient-edit dates,
   and the sentence that the patient writes the seven fields. — done when: the table matches the
   schema.

## Risks

- `food_budget` becoming nullable ripples into every reader that assumed `""` (context
  assembler, summary, copy-context) — signal: typecheck red on `string | null`.
- Parallel runs adding migrations — take the next journal index at Build time and merge `main`
  early; `check-migrations.sh` is the signal.
- The segment nav gains an eighth entry on a phone — check it still wraps on the preview.
