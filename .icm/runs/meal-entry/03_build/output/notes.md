# Build notes: meal-entry

- commits: see the branch — services (`intent` + the flip), web (the entry control, the always-on
  segment), ui (`ChoiceChip`), admin (the marker + the four-part placeholder)
- ci: pending — recorded below once `ci-status.sh` settles

## What changed

### `packages/services`

- `shared/patient.ts` · `db/models/meal-entry.ts` · `db/schema.ts` — a new `intent` column
  (`planned | eaten`), defaulting to `eaten`. The stub said `written_by` was new too; it is not —
  `link-writes` (#98) already shipped it, so only `intent` is.
- `db/migrations/0017_meal_entry_intent.sql` + its snapshot and journal entry. Written by hand, not
  by `pnpm db:generate`: the session started with no `node_modules`. The snapshot is 0016's with
  the chain ids advanced and the one column added, which `diff <(jq -S .)` proves. The `ALTER` is
  `IF NOT EXISTS`, and the journal's `when` sits ahead of 0016's — drizzle never revisits a
  timestamp it has passed, the failure mode `triage/parallel-migrations-journal-ordering.md`
  already records.
- `db/services/meal-entries/` — `intent` joins the validated input (a claimed intent forges
  nothing, unlike a claimed `writtenBy`, so it does not need to be a code-path argument);
  `updateMealEntry` **omits** it so the transition has exactly one writer; `markMealEntryEaten`
  is that writer and only moves `planned → eaten`; `mealEntryOwner` answers the ownership
  question `writeThroughPatientLink` needs before it lets a token touch a row by id.
- `shared/format.ts` — `todayAtPractice()`. `toISOString().slice(0, 10)` reads UTC, so a meal
  entered after midnight in Brussels would be dated the day before, on a journal whose date the
  patient can see and has no field to correct.

### `packages/ui`

- `ChoiceChip` — the slot chip, lifted out of `apps/admin` rather than copied into `apps/web`
  (CONVENTIONS § Keeping the codebase lean). Both apps consume it in this PR.

### `apps/web`

- `lib/patient-link/actions.ts` (new) — the link's first two write endpoints, both through
  `writePatientLink`. The flip passes `ownerOf`, so a posted meal id that belongs to someone else
  is refused as "no such patient link". Service error *codes* map to dictionary keys; no English
  service message reaches a patient.
- `lib/patient-link/load.ts` — `repas` joins `home` as always-visible. It had to: the segment 404s
  when a patient has no meals, and it is now where the first one is written.
- `components/patient-link/meal-entry-form.tsx` (new) — the two sentences as two submit buttons on
  one form, so the intent is the press rather than a mode to set first.
- `components/patient-link/meal-mark-eaten.tsx` (new) — the only interactive thing on the journal,
  so `MealList` stays a server component.
- `components/patient-link/meal-list.tsx` — the intent badge, and the response area now renders
  whether or not it has been answered.
- `app/[locale]/p/[token]/repas/page.tsx` — entry control first, history second.
- `lib/content/{types,fr,en}.ts` — the copy, with `mealWriteErrors` keyed by `PatientWriteError`
  so a new failure cannot ship unworded.

### `apps/admin`

- `meal-entry-item.tsx` — « écrit depuis le lien » on a patient-written entry (`written_by` has
  been stored since #98 and rendered nowhere), and the four-part shape as the feedback
  placeholder. The badge names the act rather than the person: `apps/admin/AGENTS.md` rules out
  gendered French role nouns, so « écrit par la patiente » — the wording the `writtenBy` comment
  in `shared/patient.ts` anticipated — would have been wrong for half the people it describes.
- `meal-slot-field.tsx` — now composes `ChoiceChip`; the markup it used to own moved to the
  design system unchanged.

## Acceptance criteria status

- [x] `intent` column (`planned | eaten`), not null, migration in the repo, existing rows `eaten` —
      `0017_meal_entry_intent.sql`, `DEFAULT 'eaten'`
- [x] Entry control on `repas`: the two sentences, a text field, an optional slot over the four
      existing `mealSlots` keys, defaulting to none
- [x] One row through the `link-writes` path, `written_by: patient`, `eaten_on` = today,
      `intent` from the button — `logMealAction`
- [x] Cap and ceilings from `link-writes`; a refusal reads in the patient's language —
      `mealWriteErrors`, keyed by service error code
- [x] The entry appears with its empty response slot straight after submitting — the action
      revalidates the token subtree; the form resets only on success
- [x] `planned` offers « je l'ai mangé »; the flip keeps description, slot and feedback, and is
      offered once — `markMealEntryEaten`, one-way, proven by test
- [x] Every entry renders a response slot: her feedback, else `mealAwaitingResponse`
- [x] Newest first, planned and eaten told apart, no author shown to the patient — the ordering is
      the service's, unchanged
- [x] `repas` reachable and in the navigation for every patient, including one with no entries
- [x] Patient-written entries marked in the console's journal card
- [x] The four-part shape is the admin feedback textarea's placeholder

## Notes for Release

- **Nine service tests ride along**, written from the criteria: the default intent, a planned
  entry, an intent outside the vocabulary, the flip keeping everything else, the one-way rule, a
  flip of a never-planned or unknown row, an ordinary edit failing to move the intent, and
  `mealEntryOwner` both ways. The UI composition is exempt per CONVENTIONS § Testing.
- **The migration was hand-written.** It is the one artefact in this diff a generator normally
  produces; the snapshot diff against 0016 is the check worth repeating.
- **`apps/admin`'s two `today` call sites still read UTC** — parked as
  `triage/console-today-is-utc.md` rather than absorbed. Morgane can correct both fields; the
  patient cannot, which is why only the patient side moved.
- `visibleSegments` changed behaviour for a **shipped** segment. A patient with no meals now sees
  « Repas » in their navigation where they did not before. That was forced by the placement
  settled at Define, and the spec says so.
