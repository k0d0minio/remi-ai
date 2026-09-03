# Ship: meal-journal

- pr: [#74](https://github.com/k0d0minio/remi-ai/pull/74) · merged: yes —
  2026-09-03, squash `ba60c7a`
- CI: green on the merged head — Pipeline gates, Format/lint/typecheck, Spec
  structure, Project run labels, Vercel Preview Comments. One earlier red was
  this run's own doing (Prettier normalises `*em*` to `_em_` in `spec.md`,
  fixed in `559aa94`); the standing `Pipeline gates` red before the tick was the
  gate working, not a failure.
- technical docs: no impact — `technical/applications` lists apps rather than
  the console's cards, `architecture` covers structure and stack, and `packages`
  covers entrypoints and seams. None of those moved.
- business docs: no impact.
- release notes: both — changelog entry live at
  `/changelog/2026-09-03-meal-journal`, ship note below.
- sent: **not sent** — none of `RESEND_API_KEY`, `SHIP_NOTE_RECIPIENTS`,
  `SHIP_NOTE_FROM` or `EMAIL_FROM` is set in this session's environment, so
  `send-ship-note.sh --send` had nothing to send with and was not run. The note
  is written and its links are live; sending it is one command once those are
  configured. Claiming a delivery that did not happen is the one thing the
  mail rules forbid.

## Acceptance check (vs spec)

- [x] Both tables in `schema.ts` with migration 0007, patient-scoped, cascading
      — verified in Verify against the diff.
- [x] Entry stores date, optional slot, description, comment, feedback,
      learning, archive timestamp; no photo or file column.
- [x] `slot` is the four keys or null, labels in `components/patients/vocabulary.ts`.
- [x] Behind the seam, exported from `@remi/services/server`, 22 unit tests
      against the in-memory client.
- [x] Newest meal first, archived excluded, archived retrievable separately.
- [x] `feedback_written_at` set on first write, kept on edit, cleared on empty.
- [x] Every create/update/archive/restore audited through the closed vocabulary.
- [x] Journal card: reverse-chronological, feedback inline, waiting entries
      marked and counted.
- [x] Quick-add: two fields, today pre-filled, backdating, one disclosure.
- [x] Feedback and learning written inline on an existing entry.
- [x] Usable at 375px — demonstrated by the operator (2026-09-03, "it is
      working"), recorded in `verify.md` as a global confirmation rather than a
      line-by-line preview demonstration. The preview could not have carried one:
      `migrate.mjs` refuses to migrate from a non-production Vercel deploy, so
      the preview database has neither table.
- [x] Learnings view merges both sources newest-first, showing each per-entry
      learning's meal.
- [x] Observations added, edited and archived from that view — plus an archived
      section added in Verify, without which « Réactiver » was unreachable.
- [x] `/p/[token]` unchanged — no `apps/web` file in the diff.
- [x] Every mutation behind `requireOperator()` — verified mechanically.

## Carried forward

Three things this run leaves behind deliberately, all recorded in `verify.md`:

- **No migration has a `down`** — true of all eight in the estate, because
  `drizzle-kit generate` does not produce one. Worth a chore of its own.
- **Four reads of `patient_meal_entries` per patient-page render**, collapsible
  into one when the page is next touched.
- **The 500-row cap is applied before the archived/active split**, so the oldest
  archived meals would drop out past roughly six months of daily logging. The
  honest fix is pagination.

The stub's three open questions stay open and are Morgane's: the slot
vocabulary and whether she wants a slot at all; whether the patient link should
show unanswered meals; and whether the two learning shapes both earn their keep.

Context budget: within the Inputs table.
