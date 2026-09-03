# Spec: The living summary — one patient-readable synthesis Morgane keeps current

- slug: living-summary
- apps: admin, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/patient-summary.ts, packages/services/src/db/models/index.ts, packages/services/src/db/services/patient-summaries, packages/services/src/db/adapters/neon.ts, packages/services/src/db/index.ts, packages/services/src/server/index.ts, packages/services/src/shared/audit.ts, apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients/summary-block.tsx, apps/admin/components/audit/vocabulary.ts, apps/admin/lib/patients/actions.ts
- complexity: standard
- demo: none

## Problem

Brainstorm § C describes PATIENT_SUMMARY as the synthesis of a patient — the context and the motif
for coming, the points of vigilance, the medications by name, the main difficulties, the useful
habits and constraints, what is already going well and what still needs clarifying. In the target
model an AI drafts it and Morgane validates. There is no AI, and there is no table: today that
synthesis lives in her head and in the prose of individual consultation notes, so re-reading a file
before a follow-up means re-reading a timeline instead of a current state.

Two things depend on its absence. Morgane re-orients herself at the start of every consultation by
scrolling notes that were written to record a moment, not to summarise a person. And the patient
half of the product has nothing to open with: `patient-surface`'s link spec makes the living summary
the first thing a patient reads on `/p/[token]`, replacing the § A profile extract, and cannot be
built until this table exists. This is stub 5 of 6 in `patient-record`, and it serves the current
initiative's **"A usable patient version for the partner clinic to test — testable by their team on
1 December 2026"** objective from the practitioner side: the summary is written once and read twice.

Decision of record #7 fixes its shape and is not reopened here: **one living summary per patient,
written by Morgane, revised at each consultation**, patient-visible on the link. There is no
per-consultation history — the consultation notes already carry history; this is the current state
of the file. "No AI anywhere" holds: every word is hers.

## Proposed change

A `patient_summaries` table, a service behind the storage seam, and one editing block near the top
of the admin patient page — labelled so she knows a patient will read it.

### Storage — a dedicated table, not a profile column

The stub leaves the choice to this spec. A dedicated table, shaped exactly like
`patient_instructions`: many rows per patient, **one active** (`archived_at` null), a replacement
archiving its predecessor rather than overwriting it. Two reasons. The AI round wants draft versus
validated states on this content, and on a table that is a column addition, where on
`patient_profiles` it would be a re-model. And archiving rather than overwriting means the wording
that was in force last month stays readable with the date it stopped applying, which is what makes
"revised at each consultation" safe to do quickly — she can replace a summary without losing the one
she is replacing. `patient-surface` already calls this "the active living summary".

The row is a patient, a body, an `archived_at`, and the standard timestamps. **No `reviewed_at`
column** (Jamie, 2026-09-03): `updated_at` is enough, and a re-read stamp stays a cheap column
addition if Morgane asks for one. No title, no section columns, no status enum.

### The service

Behind the seam in `packages/services/src/db/services/patient-summaries/`, following
`patient-instructions` exactly, exported through `server/index.ts`: read the active summary for a
patient, set it (archiving the current one), clear it, and list what it superseded. Tested against
the in-memory client like its siblings. Writes audit through the existing shared audit vocabulary,
which gains `summary.updated` and `summary.cleared` plus their French labels in the admin
vocabulary file.

### The admin block

One `SummaryBlock` on the patient page, above the recommendations and near the goals — she re-reads
it first, so it sits where her eye starts. One generous textarea, a save that replaces, and the
superseded wordings collapsed beneath with the dates they stopped applying, exactly as
`InstructionBlock` does today.

**Free text, with § C's checklist as helper text only** (Jamie, 2026-09-03). No headings seeded into
the field, no per-section fields: § 4's principle is that a background table must not become a
manual entry burden, and the stub is explicit that structure is confirmed with Morgane before it is
added. The checklist appears as placeholder or helper copy under the label — what a summary usually
covers, not fields to fill.

Because a patient will read it, the block says so where she edits it: « visible sur le lien patient
une fois les segments en ligne ». That wording is deliberately future-tense — the segments are not
live until `patient-surface` ships — and it is the point of the block. One summary serving both
readers is what § C's "pas de ressaisie" becomes without an AI to do the translating.

### What this run does not render

The patient-facing render is `patient-surface`'s (`patient-link-segments`, PR #78, spec approved and
waiting on this run). This run ships the table, the service and the admin surface; nothing on
`/p/[token]` changes.

## Acceptance criteria

- [ ] A `patient_summaries` table exists with a Drizzle schema entry and a checked-in migration,
      keyed to `patient_profiles` with `on delete cascade`.
- [ ] A row carries the patient, the body, a nullable `archived_at`, and the standard timestamps —
      and no other columns.
- [ ] A patient has at most one active summary: setting a new one archives the current row rather
      than updating it in place.
- [ ] The service reads the active summary, sets it, clears it, and lists the superseded ones newest
      first, behind `@remi/services/server`.
- [ ] Every write path is covered by tests against the in-memory client, including the
      set-archives-the-previous behaviour.
- [ ] Setting and clearing a summary each write an audit event, with French labels in the admin
      audit vocabulary.
- [ ] The admin patient page shows a summary block above the recommendations, rendering the active
      summary when one exists and an empty editable state when none does.
- [ ] Saving from the block replaces the active summary and the page reflects it without a manual
      reload.
- [ ] The superseded summaries are readable beneath the editor, each with the date it stopped
      applying.
- [ ] The block is a single free-text area: § C's checklist appears only as helper or placeholder
      copy, and no heading is written into the field for her.
- [ ] The block carries copy telling her the summary will be visible on the patient link once the
      segments are live.
- [ ] Clearing a summary leaves the patient with no active summary and the superseded list intact.
- [ ] Nothing under `apps/web` changes: `/p/[token]` renders exactly as it does today.
- [ ] No `reviewed_at` column and no section columns exist anywhere in the diff.

## Out of scope

- **The patient-facing render.** `/p/[token]` showing the summary is `patient-link-segments`
  (PR #78), which is specced and waiting on this table. This run touches no `apps/web` file.
- **A re-read / "reviewed at" stamp.** Decided out for this run (Jamie, 2026-09-03): `updated_at`
  carries it. A stamp is a later column addition, not a re-model.
- **Sections, headings or per-category fields** inside the summary. Free text until Morgane says
  otherwise; § C's checklist is guidance in the UI, never structure in the table.
- **Draft versus validated states.** The AI round's concern. The table is shaped so it arrives as a
  column, and this run adds no status enum in anticipation of it.
- **Any AI drafting, summarising or suggestion.** Manual-first is the epic's premise.
- **Per-consultation summary history.** Decision #7: the consultation notes carry history. Archived
  rows exist to make replacement safe, not to build a timeline UI.
- **Migrating existing prose into summaries.** There is nothing to migrate — the synthesis has never
  been stored. Morgane writes each patient's first summary at their next consultation.
- **The supplement protocol** (`patient-record/supplement-protocol`, stub 6) — its own run, and the
  other half of what `patient-link-segments` waits on.

## Open questions

- **Whether Morgane wants a re-read stamp after living with the block.** Raised by the stub,
  answered for this run as "updated-at is enough". Non-blocking and cheap to revisit: a nullable
  column plus one button, no re-model.
- **Whether she starts typing her own headings into the free-text field.** If she does, that is the
  signal that § C's sections want to be real structure, and the evidence will be in her own
  summaries rather than in a guess made now.
- **The exact French helper copy under the editor** — seeded from § C's own vocabulary, pending her
  confirmation. A copy change with no build consequence.
- **Whether "visible sur le lien patient une fois les segments en ligne" is the right phrasing**
  while the segments are still unshipped. It is accurate today and becomes stale the day
  `patient-link-segments` merges; that PR is the natural place to drop the future tense.
