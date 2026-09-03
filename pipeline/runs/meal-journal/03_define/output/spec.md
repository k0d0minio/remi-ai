# Spec: Meal journal — the WhatsApp loop, transcribed and answered in one place

- slug: meal-journal
- apps: admin, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/meal-entry.ts, packages/services/src/db/models/patient-observation.ts, packages/services/src/db/models/index.ts, packages/services/src/db/services/meal-entries, packages/services/src/db/services/patient-observations, packages/services/src/db/adapters/neon.ts, packages/services/src/db/test-helpers.ts, packages/services/src/server/index.ts, packages/services/src/shared/index.ts, packages/services/src/shared/audit.ts, apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients/meal-journal.tsx, apps/admin/components/patients/meal-add-form.tsx, apps/admin/components/patients/meal-entry-item.tsx, apps/admin/components/patients/learnings-list.tsx, apps/admin/components/patients/observation-add-form.tsx, apps/admin/components/patients/vocabulary.ts, apps/admin/components/audit/vocabulary.ts, apps/admin/lib/patients/actions.ts
- complexity: complex
- demo: none

## Problem

Brainstorm § 5 is the loop the whole product bends toward: a patient sends a photo or a message,
Morgane answers with what was good and one or two things to change, and what she learns from the
week feeds next week's recipes. All of it happens in WhatsApp today, which means it evaporates —
the correction she wrote three weeks ago is somewhere in a scroll, and the pattern she noticed
across four patients ("elle prend toujours des yaourts sucrés le matin") lives only in her head.
§ 8's MEAL_FEEDBACK and the observation half of PROGRESS have no home.

This is stub 3 of the `patient-surface` epic — the epic that builds what Morgane _hands over_. It
ladders up to the current initiative's **"The database and accounts under it"** objective: real
records behind the surfaces, built manual-first so the AI round later changes read and write sites
rather than migrations. Two decisions of record
([`patient-record/breakdown.md § Decisions`](../../../../../.icm/intake/patient-record/breakdown.md))
bind it and are not reopened here: **#1** — the patient link is view-only, so patients never write
into the journal and Morgane transcribes what they send; **#6** — the journal is **text-only**
until a blob-storage vendor is chosen, so there is no photo column and no upload path. "No AI
anywhere" holds: she writes every entry, every piece of feedback and every learning.

## Proposed change

Two tables behind the storage seam, a phone-first journal card on the admin patient page, and a
per-patient learnings view that makes the memorisation worth typing.

### The entry — `patient_meal_entries`

One row per meal, carrying both halves of the exchange:

- `eaten_on` — the date of the meal, not of the transcription. Required, defaults to today in the
  form, freely backdated: she logs Tuesday's lunch on Thursday evening.
- `slot` — **nullable**, one of `petit_dejeuner` | `dejeuner` | `diner` | `collation`. Stored as
  the four stable keys; the French labels live in `components/patients/vocabulary.ts`, so Morgane's
  words can change without a migration. Leaving it empty is a first-class state — an entry with no
  slot renders and sorts exactly like one with a slot.
- `description` — what was eaten, her transcription of the photo or the message. Required,
  ≤ 2000 characters, free prose. No ingredient list, no portions, no structure imposed: § 7's
  warning about the form she stops filling in applies hardest to the field she types most.
- `patient_comment` — the patient's own words when there were any ("j'avais très faim ce
  soir-là"). Nullable, ≤ 1000 characters. Distinct from `description` because it is the patient's
  voice, not hers, and the learnings often sit in it.
- `feedback` — her answer, § 5 step 3's shape: what is already good, plus one or two priority
  improvements, short. Nullable, ≤ 2000 characters. An entry with no feedback yet is the normal
  state of a fresh transcription, not an error.
- `feedback_written_at` — set when feedback is first written, cleared when it is emptied. It is
  what lets the journal show "3 entries waiting for an answer" and what the
  `patient-link-segments` stub will read to decide what a patient sees.
- `learning` — the per-entry "mémorisation utile" of § 5 step 4: an aliment souvent choisi, a
  recette appréciée, a difficulté récurrente, noticed on this meal. Nullable, ≤ 500 characters.
- `archived_at` — nullable. Archive, never delete, as with pantry essentials and recipes: a meal a
  patient was given feedback on cannot leave the record.

**Entry and feedback are one row, not two tables.** The feedback is 1:1 with the meal and always
Morgane's; a second table would buy a draft/published distinction that nothing in this stub needs.
When the AI round wants to draft feedback it adds a nullable draft column or a drafts table beside
this one — an additive change either way, the same call the living summary will make.

### The standalone observation — `patient_observations`

Not every learning is attached to a meal. Reviewing a week, Morgane notices things that belong to
the patient rather than to any one entry, and forcing them onto an arbitrary meal would falsify
where they came from. So a second, small table:

- `body` — the observation, ≤ 1000 characters, required.
- `observed_on` — date, defaults to today, backdatable.
- `archived_at` — nullable, same archive-never-delete rule.

Both write paths feed **one** learnings view. Per-entry learnings carry their meal with them;
standalone observations stand alone. That is the whole difference, and it is visible in the view.

### The service layer

`meal-entries` and `patient-observations`, each behind the storage seam alongside
`pantry-essentials` and `recipes`, tested against the in-memory client. Reads are per-patient and
reverse-chronological (`eaten_on` desc, then `created_at` desc); archived rows are excluded unless
asked for, matching `listArchivedPantryEssentials`. Every mutation is audited through the closed
vocabulary in `shared/audit.ts`, extended with: `meal.logged`, `meal.updated`, `meal.archived`,
`meal.restored`, `meal.feedback_written`, `meal.feedback_cleared`, `observation.added`,
`observation.updated`, `observation.archived`, `observation.restored`.

### The admin surfaces

**The journal card** on `patients/[id]`, placed with the content tools rather than the record:

- Reverse-chronological entries, each showing date, slot when set, description, the patient's
  comment when there is one, and her feedback inline beneath — the exchange readable as an
  exchange, not as two lists.
- **Quick-add tuned for the phone**, because she logs straight from the WhatsApp thread: date
  (pre-filled today) and description are the only two fields on screen; slot chips sit inline;
  patient comment, feedback and learning are behind one disclosure. Two taps and a paste is the
  common path.
- Feedback and learning are written on an existing entry, inline, without leaving the page — the
  entry arrives at transcription time and the answer arrives later.
- Entries awaiting feedback are marked, so a week's backlog is visible at a glance.

**The learnings view**, a per-patient section on the same page: per-entry learnings and standalone
observations merged into one reverse-chronological list by date, each per-entry learning showing
the meal it came from, each standalone observation addable inline. This is the epic's half of
PROGRESS; the goal check-ins in `patient-record/goals-and-instruction` are the other half, and
consolidating the two into one feed stays the AI round's question.

**Nothing renders on the patient link in this run** — `/p/[token]` is untouched. The journal's
appearance there is `patient-link-segments`, which will read `feedback_written_at`.

## Acceptance criteria

- [ ] `patient_meal_entries` and `patient_observations` exist in `schema.ts` with a generated,
      committed Drizzle migration; both are patient-scoped and cascade with the patient.
- [ ] A meal entry stores date, optional slot, description, optional patient comment, optional
      feedback, optional learning and an archive timestamp; there is no photo or file column.
- [ ] `slot` accepts only `petit_dejeuner`, `dejeuner`, `diner`, `collation` or null, and its
      French labels come from a vocabulary file, not from the schema.
- [ ] Both tables are reachable only through services behind the storage seam, exported from
      `@remi/services/server`, with unit tests against the in-memory client covering create, list,
      update, archive and restore.
- [ ] Listing a patient's entries returns them newest meal first and excludes archived rows;
      archived rows are retrievable through a separate call.
- [ ] Writing, changing or clearing feedback sets and clears `feedback_written_at` correctly, and
      an entry with no feedback is a valid, listable entry.
- [ ] Every create, update, archive and restore on either table writes an audit event whose action
      is in the closed audit vocabulary and is labelled in the admin journal filter.
- [ ] The patient page shows a journal card: reverse-chronological entries with feedback inline,
      entries awaiting feedback visibly marked.
- [ ] Quick-add shows date and description only by default, pre-fills today's date, allows
      backdating, and keeps comment, feedback and learning behind one disclosure.
- [ ] Feedback and learning can be added to an existing entry from the card without a page
      navigation.
- [ ] The journal card and quick-add are usable at 375px wide — no horizontal scroll, tap targets
      at least 44px.
- [ ] A per-patient learnings view lists per-entry learnings and standalone observations together,
      newest first, showing for each per-entry learning the meal it came from.
- [ ] A standalone observation can be added, edited and archived from the learnings view.
- [ ] `/p/[token]` renders exactly as it does today — no journal content, no new segment.
- [ ] No patient-writable path exists to either table: every mutation is behind operator auth.

## Out of scope

- **Photos and any upload path.** Decision #6: text-only until a blob-storage vendor is chosen.
  That choice creates a new **files seam** in `@remi/services` and is the owner's to make — flagged
  here, never made in passing. Photos then become an additive migration (a nullable reference on
  the entry), not a reshape.
- **Anything on the patient link.** Rendering entries and feedback at `/p/[token]` is
  `patient-link-segments`, the next stub in this epic.
- **Patient-side input of any kind.** Decision #1: the link is view-only, WhatsApp stays the reply
  channel, Morgane transcribes.
- **AI-drafted feedback or learnings.** The AI round changes write sites; this run creates them.
- **Merging the learnings with `patient-record`'s goal check-ins** into one progress feed.
- **Cross-patient learnings.** Everything here is scoped to one patient; a library of patterns
  across her 10–15 patients is a different question and a different table.
- **Reminders, streaks or any nudge** for entries left without feedback. The card marks them; it
  does not chase her.
- **Editing the WhatsApp import.** No parsing, no paste-a-thread splitter — one entry, one form.

## Open questions

- **Slot vocabulary — pending Morgane's confirmation.** The four keys are the brainstorm's, and
  Jamie chose the optional-fixed-vocabulary shape (2026-09-03). Whether *petit-déjeuner /
  déjeuner / dîner / collation* are the words she uses, and whether she wants a slot at all, is
  still hers to confirm. Non-blocking: the labels are a vocabulary file, adding a fifth key is a
  one-line change, and null is already a first-class value if she never fills it.
- **Should the patient see all entries, or only entries where she wrote feedback?** Raised by the
  stub, and Morgane's call — an unanswered meal on the patient's own page may read as neglect.
  Non-blocking here because nothing renders on the link in this run; `feedback_written_at` is
  written so `patient-link-segments` can implement either answer without a migration.
- **Learnings shape — how she actually thinks reviewing a week.** Jamie chose both write paths
  (2026-09-03): per-entry where noticed, standalone where not. If terrain shows she only ever uses
  one, the other is a surface to remove, not a migration to reverse.
- **Blob-storage vendor.** Gates photos, which gate the journal being the whole loop rather than
  its text half. Owner decision, not this run's.
