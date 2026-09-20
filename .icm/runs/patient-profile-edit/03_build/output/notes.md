# Build notes: patient-profile-edit

- commits: see the branch — services (vocabularies, schema, migration, the write
  service and its tests), web (the « Mon profil » segment), admin (the console
  form, summary and context), docs (RETENTION)
- ci: GREEN on the full gate, ready head `b354ec3`. Three rounds: the first
  push was RED on `@remi/services#typecheck` (a missing barrel re-export, a
  stale `foodBudget: "moyen"` in the tests, and a union-indexed label map in the
  profile form), the second RED on the console's audit vocabulary, which is
  exhaustive over `AuditActionName` by design.

## What changed

- `packages/services/src/shared/patient.ts`: `cookingTimes` (`low` / `medium` /
  `high`) and `foodBudgets` (`economical` / `standard` / `comfort`) — stable
  English keys, the split this package already uses for every closed set.
- `packages/services/src/db/schema.ts` + `migrations/0020_aspiring_grandmaster.sql`:
  `cooking_time` and `preferences_updated_by_patient_at` added; `food_budget`
  loses its `NOT NULL`/default and is blanked. Generated with `pnpm db:generate`
  **after** merging `main`, per CONVENTIONS' migration-order rule; the one
  hand-written statement is the `UPDATE` that blanks the column, which
  drizzle-kit cannot infer because it is the data half of the decision.
- `db/services/patients/index.ts`: `updatePatientPreferences` — the link's
  write, restricted to the seven fields by `patientFields.pick` rather than by a
  runtime check, so a posted `medications` cannot typecheck. It does not touch
  `lastEditedAt`: that orders Morgane's roster by who *she* last worked on.
- `shared/audit.ts`: `profile.preferences_updated`, distinct from
  `patient.updated` so the trail can tell her edit from the patient's.
- `ai/context.ts`: a « Temps disponible » line; `ContextProfile` takes both
  values already in French, as it already did for « Aime cuisiner ».
- `apps/web`: the `profil` segment — always in the nav, the form island, the
  action, and the fr/en strings.
- `apps/admin`: `cookingTimeLabels` / `foodBudgetLabels`, a cooking-time Select,
  the budget Input turned into a Select, the « Profil modifié par la patiente
  le … » line, and both enums mapped into the copy-context block.
- `.icm/docs/RETENTION.md`: the seven patient-writable fields and the new column.

## Acceptance criteria status

- [x] A « Mon profil » segment at `/p/[token]/profil`, always in the navigation — `segments.ts`, `load.ts` → `visibleSegments`, and the page itself
- [x] Every save goes through the `link-writes` path — the action calls `writePatientLink`, so attribution, `audit_events` with `actor_kind: patient`, the rate limits and the shared refusal wording all come from the one helper rather than being re-implemented
- [x] A patient can both add and remove an allergy, each change in the audit trail — full edit, per the Define answer; asserted in `patients/index.test.ts`
- [x] `cooking_time` exists as a three-level column with a migration, editable on the link and in the console, read by the context assembler
- [x] `food_budget` is a three-level enum read by the same assembler; the migration blanks every existing value and the console offers a Select
- [x] The French labels read « Pressé(e) / Normal / Tranquille » and « Économique / Standard / Confort » in both surfaces
- [x] Name, age, height, weight, medication and supplements read-only on the segment; birth date, referral, anamnesis and consent absent from it
- [x] The console's profile summary shows one « Profil modifié par la patiente le … » line when the patient has written, and nothing when they have not
- [x] `.icm/docs/RETENTION.md` names the patient-writable fields and `cooking_time`

## Notes for Release

- **Two schema changes, not the one the stub predicted.** The stub said
  `cooking_time` was "the one schema change"; the operator's answer on
  attribution — one line for the whole segment — needs a timestamp column to
  drive it. The spec says so, and this is it.
- **`likes_cooking` needed no normalising.** The stub asked Define to check
  whether it was an enum or text; it was already
  `cookingAffinities = ["yes","somewhat","no"]`, validated and rendered as a
  Select. Only `food_budget` was free text, and only it was migrated.
- **The two label vocabularies are deliberately two files.** `apps/admin`'s
  `vocabulary.ts` is French-only for Morgane; `apps/web`'s content dictionaries
  carry fr *and* en for the patient. That is the split `mealSlotLabels` /
  `content.mealSlots` already lives in, and the French strings match. Lifting
  them into `@remi/services/shared` would put rendered copy in a package whose
  own `AGENTS.md` keeps French wording out.
- **The migration blanks `food_budget` unconditionally.** That is the operator's
  answer ("blank them; Morgane re-picks") and the column holds only French prose
  today, so nothing that could have been mapped is lost. She re-picks the handful
  she holds — worth saying out loud in the release note, since it is visible data
  loss by choice rather than by accident.
- **Preview check worth doing:** the profile segment on a phone. The three chip
  groups are the control the patient meets most, and « Pressé(e) » is the longest
  label in any of them.
- **The ready head has no preview of its own, and the previews to test are two
  commits back.** `vercel.json` carries
  `ignoreCommand: npx turbo-ignore <pkg> --fallback=HEAD^1`, so the contract's
  post-flip *empty* commit diffs to nothing and every project answers
  "Skipped - Not affected". The verdict is a real GREEN — nothing failed — but
  `ci-status.sh` prints "no preview URL to test against". The builds that do
  cover the final code:
  - `apps/web` on `bd35208` — nothing after it touches web, so it is the final
    web code: https://app-git-claude-patient-profile-edit-define-rnkw88-remi21.vercel.app
  - `apps/admin` on `32ea8fa`, the last non-empty commit:
    https://admin-git-claude-patient-profile-edit-define-rnkw88-remi21.vercel.app

  Both branch-alias URLs serve the newest successful deployment for the branch.
  Parked as `intake/triage/ready-flip-empty-commit-builds-no-preview.md`: it
  hits every spine PR, not this one, and **Ready to merge** attests a preview
  smoke-test, so it is worth settling before the next Release.
- **The `food_budget` blanking has already run — read this before the smoke.**
  The admin build runs `db:migrate` first, and the preview guard in
  `migrate.mjs` is not in force on that project (`project-rules.md` → The
  factory, and the open stub
  `intake/triage/previews-migrate-the-shared-database.md`), so a
  migration-bearing branch's preview writes its schema into the **shared**
  database. The admin preview on `32ea8fa` completed, which means migration
  `0020` — `ALTER`s plus `UPDATE patient_profiles SET food_budget = NULL` — is
  applied there already, before any merge.

  The blanking is the operator's own decision and the column held only French
  prose, so nothing mappable was lost. What is worth knowing is the timing: any
  budget values in the shared database are gone now rather than at merge, and
  re-picking them is Morgane's to redo whenever she next opens those profiles.
  Nothing else in `0020` is destructive.
