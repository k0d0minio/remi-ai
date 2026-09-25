# Build notes: patient-profile-edit

- commits: d0fe237 feat (the feature) · 8290b03 fix (0024 idempotent against the shared database) · c90ca8b merge of main · 609568d fix (`.icm/CONTEXT.md` format from main, the nav's stale view-only note)
- ci: GREEN (full gate) on 609568d — web preview built there; admin preview built on c90ca8b (identical admin code); Quality (advisory) pass

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

- **0024 is already applied to production** — by this branch's admin preview, which migrates the shared database (`triage/previews-migrate-the-shared-database`). The operator accepted that in session before the push (`decisions.md`). The one production patient's free-text budget is now in `preferences` as « Budget : … » with the budget unset, as D-28 intends. The ledger has 0024, so the merge's production build finds nothing to apply.
- `.icm/CONTEXT.md` was formatted here because `main` leaves it failing the full format check (from #129). The change is table padding only and no-ops once `main` carries the same fix.

- **The shared database already carried part of this schema.** An abandoned earlier attempt at this stub (`claude/patient-profile-edit-define-rnkw88`, 20 Sept) had its preview add `cooking_time` and `preferences_updated_by_patient_at` to production and make `food_budget` nullable, without a ledger row. 0024 is written `IF NOT EXISTS` and idempotent for that reason. `preferences_updated_by_patient_at` is an orphan column no code reads — left in place; dropping it is a separate chore.
- **Forward-only migration** (`migrations.reversible: false`): `food_budget` loses its NOT NULL and default, and the old free text is rewritten. Reverting the code after it runs would leave pre-change code reading NULL where it expected a string — a revert needs a fix-forward, not a code rollback.
- The profile summary's food group now also shows « Aliments aimés / non aimés » (`preferences`), which it did not before — needed for the marker on all seven fields.
- The admin selects post `unset` for « Non renseigné »; the action narrows anything outside a set to `""`, which clears the column.
- The patient-side edit reuses `patient.updated` as its audit action under the `patient` actor (no new `AuditAction`, so no vocabulary change in the console journal).
- Context budget: read `.icm/docs/RETENTION.md` and the web/admin components the change touches beyond `touches:` (`segment-page.tsx`, `message-form.tsx` as the pattern, `choice-chip.tsx`, `field.tsx`, `typography.tsx`).
