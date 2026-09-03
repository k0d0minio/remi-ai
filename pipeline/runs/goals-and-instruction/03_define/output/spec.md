# Spec: Priority goals and the standing instruction — the practitioner's steering

- slug: goals-and-instruction
- apps: admin, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/patient-goal.ts, packages/services/src/db/models/patient-goal-check-in.ts, packages/services/src/db/models/patient-instruction.ts, packages/services/src/db/models/index.ts, packages/services/src/db/services/patient-goals, packages/services/src/db/services/patient-instructions, packages/services/src/db/adapters/neon.ts, packages/services/src/db/index.ts, packages/services/src/shared/patient.ts, packages/services/src/shared/audit.ts, packages/services/src/shared/index.ts, apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients, apps/admin/components/audit/vocabulary.ts, apps/admin/lib/patients/actions.ts
- complexity: complex
- demo: none

## Problem

Morgane steers an accompaniment with two things she currently has nowhere to put. The first is the
short list of what this patient is actually working on — "améliorer l'énergie", "calmer les
ballonnements" — two or three at a time, in priority order, each with a starting point she can
compare against later. The second is the standing line she would give a colleague taking over the
file: "priorité énergie et anti-inflammatoire, peu de changements la première semaine."

Today both live in her head, or dissolved into the profile's free-text `objective`. That costs her
twice. The goals have no evolution: at a follow-up she asks "et l'énergie ?", hears "un peu mieux",
and the answer lands in a consultation note where nothing can line it up against the last three
answers to the same question. And the steering line has no home at all, so the one sentence that
governs how every recommendation on the page was chosen is the one thing the page does not say.

The evolution trail is why this is data and not a note. § D's check-in — mieux / stable / moins
bien, a simple measure, a word — is the manual seed of the PROGRESS block: a per-goal, per-date row
Morgane writes by hand now, and the same row a later round drafts into from a meal journal or a
questionnaire. Written as prose in a note it is a paragraph to re-read; written as a row it is a
trail that can be shown, compared and eventually written into.

This is stub 4 of the `patient-record` epic — the manual record deep enough to run a consultation
from, built as permanent data layer now (`business/initiatives`: terrain-first, manual before AI).
The epic's decisions of record (`.icm/intake/patient-record/breakdown.md § Decisions`) bind it:
admin and data layer only, no AI, no patient-facing change.

## Proposed change

**Three tables, because the three things have three lifetimes.** A goal outlives the consultation
that set it; a check-in is a dated observation against one goal; an instruction is replaced whole.

**`patient_goals`** — one row per goal: the goal `title` in Morgane's words, an optional `baseline`
("énergie 3/10", "3 réveils par nuit") as free text, a `position` for her priority order, and an
`archivedAt`. Active goals are the ones with no `archivedAt`, ordered by position. Archiving is the
everyday exit and deletion is the mistake-only escape hatch — the same split as recommendations and
pantry essentials, for the same reason: "pourquoi on a arrêté celui-là" is answered by a row.

**The 2–3 cap is the service's, not the form's.** § D says two to three active goals maximum, and
that is a rule about the accompaniment, not a hint about the UI. `addPatientGoal` refuses a fourth
active goal with `conflict`, and so does restoring an archived one into a full list; the add form
disappears at three rather than offering a button that fails. The cap counts active goals only —
archiving one makes room immediately.

**`patient_goal_check_ins`** — one row per (goal, date): a `checkedOn` calendar date, an optional
`direction` from a closed set, an optional `measure`, and an optional `note`. The trail is the
goal's history, newest first.

- `checkedOn` is a plain calendar date (`mode: "string"`), not an instant, for the same reason
  `birth_date` and `consent_date` are: the day of a follow-up has no timezone, and storing one is
  how a check-in drifts across a border. It defaults to today, server-resolved, exactly as the
  consultation-note date already does.
- `direction` is `goalDirections` — `better` / `stable` / `worse` — as a `const` tuple in
  `packages/services/src/shared/patient.ts`, with the type derived from it, the same
  constants-derive-the-type pattern as `patientSexes` and `anamnesisCategories`. The French wording
  she reads (mieux / stable / moins bien) lives in `apps/admin/components/patients/vocabulary.ts`.
  No French string is hard-coded in a component.
- `measure` is a first-class free-text field beside the note rather than folded into it. § D gives
  the two forms of check-in as alternatives — a direction *or* a simple measure — so a measure that
  can only be typed into prose would make the numeric half of § D unreadable by anything. Free text,
  not a number: "3/10", "2 réveils", "presque plus" are all measures she writes, and a numeric
  column would force a scale nobody has agreed. This is a design call on an open question, flagged
  below; it costs no migration to walk back, because an unused text column is an unused text column.
- A check-in with no direction, no measure and no note is rejected as `invalid_input` — a dated row
  saying nothing is not a record of anything.

**`patient_instructions`** — the standing consigne, replaced whole and archived on replace. At most
one active row per patient: `setPatientInstruction` archives the current one and inserts the new
one in that order, so the trail of what she was steering by in October survives the November
rewrite. Saving an empty body archives the current instruction and inserts nothing — "no standing
instruction" is a real state, and it is the same gesture as clearing an anamnesis category.

**The profile's `objective` column is untouched**, in the schema, in the form, in its position. It
is the narrative — the paragraph of what this accompaniment is about — and goals are the working
structure underneath it. Nothing is migrated out of it and nothing is parsed from it.

**One card on the admin patient page**, directly under "Lien patient" and above "Recommandations":
the steering sits above what it steers. Its content, top to bottom:

- Each active goal in priority order, numbered by that order, showing the title, the baseline when
  there is one, and its latest check-in at a glance — the date, the direction as a badge, the
  measure. Per-goal controls follow the page's established per-item idiom (`RecommendationItem`,
  `PantryItem`): a pencil to edit in place, up/down to reorder, an archive toggle, each with its own
  save, so one write never touches a sibling row and a phone mid-consultation never loses a form.
- Under each goal, its check-in trail, newest first, and a short add form — date, direction, measure,
  note.
- An add-goal form, present only while fewer than three goals are active.
- The standing instruction beneath the goals: the current text, a textarea that replaces it, and the
  superseded ones listed with their dates underneath. Its description says plainly what it is today
  — a reminder to herself, read by no AI — so the card does not imply a capability that does not
  exist yet.
- Archived goals and superseded instructions render inside this same card as subdued sections rather
  than as further conditional cards. The trail is the point of the card, and the patient page is
  already eight cards long.

**Every write audits** through `apps/admin/lib/patients/actions.ts` and `lib/audit.ts`, with the new
action names added to `auditActions` in `packages/services/src/shared/audit.ts` and their French
labels to `apps/admin/components/audit/vocabulary.ts` — the same closed vocabulary the pantry and
recipe writes already extend. Every write calls `touchPatient`, so the roster's `last_edited_at`
moves when she works on a goal.

**Nothing renders at `/p/[token]`.** § J will put the objectives in patient output, but that render
belongs to the `patient-surface` epic and this run does not anticipate it. The assertion lives where
the query would be — a service test on the patient-link read path proving no goal, check-in or
instruction travels with the profile — not only as a visual check on the page.

## Acceptance criteria

- [ ] A `patient_goals` table exists — `patient_id` (cascade delete), `title`, `baseline`,
      `position`, `archived_at`, timestamps — with a checked-in migration generated by
      `pnpm db:generate` that applies to a database holding existing rows without manual
      intervention.
- [ ] A `patient_goal_check_ins` table exists — `goal_id` (cascade delete), `checked_on` as a plain
      calendar date, `direction`, `measure`, `note`, timestamps — in the same migration, and
      deleting a patient removes their goals and every check-in beneath them.
- [ ] A `patient_instructions` table exists — `patient_id` (cascade delete), `body`, `archived_at`,
      timestamps — in the same migration.
- [ ] `goalDirections` in `packages/services/src/shared/patient.ts` is a `const` tuple of `better`,
      `stable`, `worse`, its type derives from it, and both are re-exported through
      `@remi/services/shared`; the French wording lives only in
      `apps/admin/components/patients/vocabulary.ts`.
- [ ] A `patient-goals` service behind the seam lists a patient's active goals in position order and
      their archived goals newest-archive-first, adds, updates, reorders, archives, restores and
      deletes a goal, and calls `touchPatient` on every write.
- [ ] Adding a fourth active goal fails with `conflict` and writes no row; restoring an archived goal
      into a list that already holds three active ones fails the same way; archiving one makes room
      for the next add immediately.
- [ ] The service lists a goal's check-ins newest first, adds, updates and deletes one; a check-in
      carrying no direction, no measure and no note is rejected as `invalid_input`; an unknown
      direction key is rejected as `invalid_input` rather than stored.
- [ ] A `patient-instructions` service behind the seam returns the one active instruction or `null`,
      lists the superseded ones newest first, and on replace archives the current row before
      inserting the new one — so a patient never has two active instructions, and every superseded
      body is still readable with the date it was replaced.
- [ ] Saving an empty or whitespace-only instruction archives the current one and inserts nothing;
      the patient is then left with no active instruction and their superseded trail intact.
- [ ] The admin patient page shows one card between "Lien patient" and "Recommandations" holding the
      active goals in priority order — each with its baseline, its latest check-in and its trail —
      and the standing instruction beneath them, with archived goals and superseded instructions in
      subdued sections of that same card.
- [ ] Editing, reordering, archiving or checking in on one goal saves through a server action and
      re-renders without touching any sibling goal's stored row; the add-goal form is absent while
      three goals are active.
- [ ] Every goal, check-in and instruction write records an audit event through
      `apps/admin/lib/patients/actions.ts`, with each new action name in `auditActions` and a French
      label in `apps/admin/components/audit/vocabulary.ts`.
- [ ] The profile's `objective` column, its stored content, its form field and its position are
      unchanged.
- [ ] New service tests cover round-tripping through the in-memory client: the cap at three, the
      restore-into-a-full-list refusal, per-goal isolation, the check-in trail's order, the empty
      check-in refusal, replace-and-archive on the instruction, clearing to no active instruction,
      and cascade on patient delete.
- [ ] `/p/[token]` renders exactly as it does today, and a test on that read path asserts no goal,
      check-in or instruction is fetched or rendered there.

## Out of scope

- **Anything patient-facing.** No goal, check-in or instruction at `/p/[token]`; no token, routing or
  consent change — epic decision 4. § J's rendering of the objectives is the `patient-surface`
  epic's.
- **Any AI reader or writer.** The instruction becomes the generation prompt's practitioner line in
  a later round; this run stores it and shows it to Morgane, nothing more. No drafted check-ins, no
  suggested goals.
- **Migrating, parsing or retiring the profile's `objective`.** It stays as the narrative; goals do
  not replace it and nothing is extracted from it.
- **A charted or graphed check-in trail.** The trail is a list. Whether three dated rows per goal are
  worth a sparkline is a question to ask once there are three months of them.
- **A numeric check-in scale.** `measure` is free text; no scored field, no 0–10 column, no
  aggregation over measures. Introducing one later is a column beside this one, not a reshape.
- **Linking a check-in to a consultation note.** A check-in carries its own date and stands alone;
  tying the two records together is a relation to design once the consultation record itself is
  settled.
- **Goals on `/patients/new`.** Goals are rows against a patient id, and a profile being created has
  none; the card appears on the detail page only.
- **Several concurrent standing instructions.** One active instruction per patient, replaced whole —
  see the open question below.
- **Reordering archived goals, or a position on the archived list.** Archived goals render by archive
  date; priority is a property of the active list.
- The living summary and the supplement protocol — stubs 5 and 6 of the epic.

## Open questions

All three are the stub's, raised rather than answered, and none blocks a criterion above. Each is
designed to be cheap to change once Morgane answers it — that is the point of raising them here
rather than guessing quietly.

- **Is mieux / stable / moins bien enough, or is the numeric measure a first-class field?** Built as
  though the answer is "both, and free text": `direction` and `measure` are separate optional
  columns and a check-in needs only one of them. That is an assumption, and it is the one place this
  spec goes beyond the stub. If she never uses the measure, an unused column costs nothing; if she
  wants a real scale, it is a column beside `measure`, not a reshape. What her answer cannot cheaply
  change is the decision to give the measure its own field at all — folding it back into the note
  later would mean rewriting rows.
- **Hard cap at three active goals, or warn-but-allow?** Built as the refusal the stub's *Worth
  knowing* directs — the service returns `conflict` and the form disappears at three. If she wants a
  warning instead, it is one branch in `addPatientGoal` and one line in the form; no migration, no
  data to fix. Worth confirming with her before the refusal is treated as settled, because a refusal
  she disagrees with mid-consultation is the kind of thing that sends her back to paper.
- **One standing consigne, or a dated log of several concurrent ones?** Built as standing-and-
  replaced, per the stub's prompt and § E's "ponctuelle". The table already holds many rows per
  patient — the "one active" rule lives in the service, not in a unique index — so a concurrent log
  is a service change and a read-site change, not a migration. Her answer decides whether it is
  worth one.
