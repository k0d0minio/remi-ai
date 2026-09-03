# Spec: The living summary — Morgane writes what the AI will one day draft

- slug: living-summary
- apps: admin, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/patient-summary.ts, packages/services/src/db/models/index.ts, packages/services/src/db/services/patient-summaries, packages/services/src/db/adapters/neon.ts, packages/services/src/db/index.ts, packages/services/src/shared/audit.ts, apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients/summary-block.tsx, apps/admin/components/patients/vocabulary.ts, apps/admin/components/audit/vocabulary.ts, apps/admin/lib/patients/actions.ts
- complexity: standard
- demo: none

## Problem

§ C's PATIENT_SUMMARY is the synthesis of a patient — context and motif, points of vigilance,
current medications by name, main difficulties, useful habits and constraints, what is already
going well, what still needs clarifying. It is the one thing Morgane re-reads first at the start of
a consultation, and today it lives nowhere: it is reconstructed each time from the profile, the
anamnesis, the goals and the last few notes, or it lives in her head.

In the target model the AI drafts this synthesis and Morgane validates it. The epic's decision of
record (`.icm/intake/patient-record/breakdown.md` § Decisions #7) makes it manual-first: **one
living summary per patient, written by Morgane, revised at each consultation** — no
per-consultation history, because the consultation notes already carry that; this is the current
state of the file, not a log of its versions.

It is also the first record block that is patient-visible _by design_: § J puts it on the patient
link alongside the goals. Writing one document that serves both readers is the point — writing it
_for_ the patient is what § C's "pas de ressaisie" becomes while there is no AI to do the
translating. This is stub 5 of 6 of the `patient-record` epic, built as permanent data layer now
(`business/initiatives`: terrain-first, manual before AI); the epic's decisions bind it — admin and
data layer only, no AI, and no patient-facing render this round (that render is the
`patient-surface` epic's).

## Proposed change

**One row per patient in a dedicated `patient_summaries` table, not a column on `patient_profiles`.**
The summary has one living value with no history (decision #7), so at first glance a column on the
profile would do. It gets its own table for two reasons the stub names. First, it needs its own
timestamp: the "reviewed at" / "updated at" question (open, below) is about *when the summary last
moved*, and a column on `patient_profiles` would have the summary's freshness tracked by a
`updated_at` that also bumps every time she edits an allergy or a budget. A row of its own carries
its own `updated_at`. Second, the AI round wants draft-vs-validated state on _this_ content; that
belongs beside the summary body, not spread across the profile table. Either shape supports the
future as a **column addition, not a re-model** (the stub's constraint) — the dedicated row keeps
that addition local to the summary.

**The table.** `patient_summaries` — `id`, `patient_id` (unique, cascade delete), `body` text,
timestamps. The `patient_id` unique constraint is the "one living summary per patient" rule
expressed in the schema: there is at most one row per patient, ever. No `archived_at`, no version
column — decision #7 is explicit that history is the consultation notes' job, and adding one later
is a column beside this one.

**A `patient-summaries` service behind the seam**, registered exactly as the other patient services
are (`packages/services/src/db/index.ts`, `adapters/neon.ts`, and the in-memory client):

- `getPatientSummary(patientId)` returns the patient's summary row or `null` — `null` is the real
  and common state of "not written yet".
- `setPatientSummary(patientId, body)` upserts the single row: it inserts when none exists and
  updates the `body` in place when one does, so revising at each consultation overwrites the living
  value rather than accumulating rows. A whitespace-only body **deletes** the row and returns
  `null` — "no summary" is a real state and the same gesture as clearing an anamnesis category or
  saving an empty instruction; storing a blank row would make `null`-means-unwritten a lie.
- Every write calls `touchPatient`, so the roster's `last_edited_at` moves when she works on the
  summary — the same contract every other patient write honours.

**No new shared vocabulary tuple.** The body is free text; there is no closed set to derive, so
`packages/services/src/shared/patient.ts` is untouched. (Contrast the sibling goals stub, which
added `goalDirections` — this one has nothing to add.)

**One card on the admin patient page, directly under "Lien patient" and above "Objectifs et
consigne"** — hence above "Recommandations". The synthesis sits at the top of the clinical content
because it is what she re-reads first; the steering and the recommendations sit beneath the thing
that summarises why they were chosen. The card holds:

- One generous textarea bound to the summary body, with its own save (a server action), following
  the page's established per-block idiom (`InstructionBlock`) so saving the summary never touches a
  sibling row.
- **A label that says it is patient-visible** — "visible sur le lien patient une fois les segments
  en ligne" — stated plainly on the card, because writing it _for_ the patient is the point and she
  should know a patient will read it. It also names honestly that the render is not live yet, so the
  card does not imply a capability that does not exist this round.
- **§ C's checklist as helper text, not fields.** The eight things a summary covers (context and
  motif, points of vigilance, current medications by name, main difficulties, useful habits and
  constraints, what is going well, what needs clarifying) appear as placeholder / helper guidance
  beside the textarea — § 4's principle that a background table must not become a manual entry
  burden. The body stays free text; the checklist steers without becoming structure (see the open
  question on typed sections).

All French wording the card shows — the patient-visible notice and the § C checklist guidance —
lives in `apps/admin/components/patients/vocabulary.ts`, not hard-coded in the component, the same
rule every sibling block follows.

**Every write audits** through `apps/admin/lib/patients/actions.ts` and `lib/audit.ts`, with the new
action name(s) added to `auditActions` in `packages/services/src/shared/audit.ts` and their French
labels to `apps/admin/components/audit/vocabulary.ts` — the closed vocabulary the pantry, recipe,
goal and instruction writes already extend.

**Nothing renders at `/p/[token]`.** § J will put the summary on the patient link, but that render
is the `patient-surface` epic's and this run does not anticipate it. The assertion lives where the
query would be — a service test on the patient-link read path proving no summary travels with the
profile — not only as a visual check on the page.

## Acceptance criteria

- [ ] A `patient_summaries` table exists — `id`, `patient_id` with a UNIQUE constraint and cascade
      delete, `body`, timestamps — with a checked-in migration generated by `pnpm db:generate` that
      applies to a database holding existing rows without manual intervention.
- [ ] Deleting a patient removes their summary row (cascade), proven by a service test.
- [ ] The `patient_id` unique constraint enforces at most one summary row per patient; a second
      `setPatientSummary` for the same patient updates the existing row rather than inserting a
      second.
- [ ] A `patient-summaries` service behind the seam exposes `getPatientSummary` (returns the row or
      `null`) and `setPatientSummary` (upsert), registered through `db/index.ts`, the neon adapter
      and the in-memory client like every other patient service.
- [ ] `getPatientSummary` returns `null` for a patient who has never had one written.
- [ ] `setPatientSummary` with a non-empty body inserts when none exists and updates the body in
      place when one does; calling it twice leaves exactly one row carrying the second body.
- [ ] `setPatientSummary` with a whitespace-only body deletes any existing row and returns `null`;
      calling it when none exists is a no-op that returns `null`.
- [ ] Every summary write calls `touchPatient`, moving the patient's `last_edited_at`, proven by a
      service test.
- [ ] The admin patient page shows one card directly under "Lien patient" and above "Objectifs et
      consigne" holding a single textarea for the summary body, its current stored value, and its
      own save action that re-renders without touching any sibling block's stored row.
- [ ] The card states, in French sourced from `apps/admin/components/patients/vocabulary.ts`, that
      the summary is visible on the patient link once the segments are online, and shows § C's
      coverage checklist as helper / placeholder guidance rather than as separate input fields.
- [ ] Saving an empty summary from the card clears it — the card then shows the unwritten state — and
      the patient keeps no blank row.
- [ ] Every summary write records an audit event through `apps/admin/lib/patients/actions.ts`, with
      each new action name in `auditActions` (`packages/services/src/shared/audit.ts`) and a French
      label in `apps/admin/components/audit/vocabulary.ts`.
- [ ] New service tests cover round-tripping through the in-memory client: unwritten returns `null`,
      insert-then-update keeps one row, clear-to-empty removes the row, `touchPatient` fires on
      write, and cascade on patient delete.
- [ ] `/p/[token]` renders exactly as it does today, and a test on that read path asserts no summary
      is fetched or rendered there.
- [ ] The profile's `objective` column, its stored content, its form field and its position are
      unchanged — the summary is a new synthesis beside the narrative, not a migration of it.

## Out of scope

- **Anything patient-facing.** No summary at `/p/[token]`; no token, routing or consent change —
  epic decision 4. § J's render of the summary on the link is the `patient-surface` epic's, and this
  run does not add the read path, the segment, or a hidden flag anticipating it.
- **Any AI reader or writer.** The AI drafts this summary and Morgane validates it in a later round;
  this run stores what she types and shows it to her, nothing more. No drafted body, no
  draft-vs-validated state, no generation prompt wiring.
- **Per-consultation history or versioning of the summary.** Decision #7: one living value, revised
  in place; the consultation notes carry history. No `archived_at`, no version rows, no diff view.
- **Migrating, parsing or retiring the profile's `objective`.** It stays as the accompaniment's
  narrative; the summary is the synthesis Morgane re-reads, and nothing is extracted from one into
  the other.
- **Typed section structure inside the body** (headings as fields). The body is free text with the
  § C checklist as guidance only — see the open question.
- **A "reviewed at" stamp distinct from the row's `updated_at`** — see the open question; built with
  `updated_at` alone this round.
- **A summary on `/patients/new`.** The summary is a row against a patient id; a profile being
  created has none, so the card appears on the detail page only.
- The supplement protocol — stub 6 of the epic.

## Open questions

Both are the stub's, raised rather than answered, and neither blocks a criterion above. Each is
designed to be cheap to change once Morgane answers it — the point of raising them here rather than
guessing quietly.

- **A lightweight "reviewed at" stamp she bumps when she re-reads without editing, or is
  `updated_at` enough?** Built with `updated_at` alone: the row's timestamp moves when the body
  changes, so a summary she read but did not touch does not _look_ refreshed. If she wants staleness
  to reflect _review_ and not just _edit_ — so an untouched-but-re-read summary stops reading as
  stale — that is one nullable `reviewed_at` column beside `body` and one "j'ai relu" control on the
  card. A column addition, not a re-model, which is exactly the room the dedicated table was chosen
  to leave. Worth confirming before the edit-only stamp is treated as settled.
- **Sections within the summary as headings she types, or truly free text?** Built as free text with
  § C's checklist as helper guidance, per the stub's _Worth knowing_ and § 4's no-manual-entry-burden
  principle. If she wants the eight § C areas as consistent typed headings (so the eventual patient
  render and the eventual AI draft can align to them), that is a UI-and-convention change over the
  same free-text column — a template she fills, or light structure in the render — not a migration.
  Confirm with her before adding any structure; a structure she finds fiddly mid-consultation is the
  kind of thing that sends her back to paper.
