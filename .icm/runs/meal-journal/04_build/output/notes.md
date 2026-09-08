# Build notes: meal-journal

- commits: `2fc938f` (services), plus the console commit below
- demo: none — Design was skipped for this run

## What changed

- `packages/services/src/db/schema.ts` + migration `0007_big_wendell_vaughn`:
  `patient_meal_entries` and `patient_observations`, both patient-scoped and
  cascading. Generated with `pnpm db:generate`, never hand-written.
- `db/models/meal-entry.ts`, `db/models/patient-observation.ts`: the two
  entities plus `PatientLearning`, a discriminated union over the two sources
  that the learnings view renders directly.
- `shared/patient.ts`: `mealSlots`, the four stable keys. Runtime constant in
  `shared/` rather than in the model, per the package's types-only rule.
- `db/services/meal-entries/`: create, list (active and archived), get, update,
  archive/restore, delete, and `countMealEntriesAwaitingFeedback` — the number
  the card marks the backlog with.
- `db/services/patient-observations/`: the same shape for observations, plus
  `listPatientLearnings`, which merges per-entry learnings with standalone
  observations. The merge lives here because the dependency runs one way:
  observations import meal entries, never the reverse.
- `shared/audit.ts` + `apps/admin/components/audit/vocabulary.ts`: twelve new
  actions (`meal.*`, `observation.*`) with French labels and intents. The
  vocabulary is a closed `Record`, so a missing label is a type error.
- `apps/admin/lib/patients/actions.ts`: nine actions, each re-asserting
  `requireOperator()` and auditing after the success branch.
- `apps/admin/components/patients/`: `meal-add-form`, `meal-entry-item`,
  `meal-journal`, `meal-slot-field`, `learnings-list`, `observation-add-form`,
  `observation-item`.
- `apps/admin/app/(admin)/patients/[id]/page.tsx`: the journal card, an archived
  card that appears only when there is something in it, and the « À retenir »
  card. Placed after the recipe cards and before Consultations — the content
  she hands over, then her own record.

## Decisions inside the spec's latitude

- **Feedback and its timestamp move together.** One helper writes both, because
  feedback without a stamp reads as unanswered forever and a stamp without
  feedback marks a meal nobody answered. Editing existing feedback keeps the
  first-answered moment; emptying it clears both.
- **Optional text is `NOT NULL DEFAULT ''`, not nullable.** That is the estate's
  existing shape for optional prose (`why`, `note`, `body`), so the journal
  matches its neighbours. `slot` and `feedback_written_at` are genuinely
  nullable, because for those two, null is a distinct state rather than "empty".
- **The slot is chips, not a select.** § 5's logging happens on a phone in the
  WhatsApp thread; a chip is one tap where a select is three. « Aucun » is a
  chip of its own, so leaving the slot blank is a choice she makes rather than a
  field she skips.
- **The learnings view lists only entries that carry a learning.** The journal
  is where every meal is read; a view padded with blanks is one nobody scrolls.

## Acceptance criteria status

- [x] Both tables in `schema.ts` with a generated, committed migration —
      cascade on `patient_id` for both.
- [x] Entry stores date, optional slot, description, comment, feedback,
      learning, archive timestamp. No photo or file column anywhere.
- [x] `slot` accepts the four keys or null; labels live in
      `components/patients/vocabulary.ts`.
- [x] Both behind the seam, exported from `@remi/services/server`, 22 unit tests
      against the in-memory client covering create, list, update, archive,
      restore, delete and the merge.
- [x] Listing returns newest meal first and excludes archived;
      `listArchivedMealEntries` returns the rest.
- [x] `feedback_written_at` set on first write, kept on edit, cleared on empty;
      an entry with no feedback is valid and listable.
- [x] Every create, update, archive and restore audits through `lib/audit.ts`
      with an action in the closed vocabulary and a French label.
- [x] Journal card: reverse-chronological, feedback inline, a « sans retour »
      badge and a count above the list.
- [x] Quick-add shows day and description, pre-fills today, backdates freely,
      and keeps comment, feedback and learning behind one disclosure.
- [x] Feedback and learning are written on an existing entry inline.
- [ ] Usable at 375px — built for it (single-column stacking below `sm`, 44px
      slot chips, no fixed widths), but not observed. **For Verify to confirm on
      the preview.**
- [x] Learnings view merges both sources newest-first and shows the meal a
      per-entry learning came from.
- [x] Observations are added, edited and archived from that view.
- [x] `/p/[token]` untouched — no file under `apps/web` is in this diff.
- [x] No patient-writable path: every mutation is a server action that calls
      `requireOperator()` before touching anything.

## Notes for Verify

- The 375px criterion above is the one thing to look at on the preview.
- The three open questions in `spec.md` stay open; none of them blocked a
  criterion. The slot vocabulary and whether Morgane wants a slot at all are
  still hers to confirm — both are one edit away, which is why the keys are
  stable and the labels are not in the schema.
- `pnpm db:migrate` runs in the admin build, so the preview creates both tables.
  Worth confirming the migration applied rather than assuming it.
- The service tests were run locally before pushing (22 passing). Format, lint,
  typecheck and the build belong to CI.

Context budget: within the Inputs table. One overrun worth naming — the pantry
and recipe implementations were read end to end as the pattern to follow, which
is more than the spec's `touches:` strictly named, and is what kept this
consistent with its neighbours.
