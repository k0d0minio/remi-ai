# Spec: Nouvelle consultation — one screen after the consultation, one save

- slug: consultation-update
- apps: admin, packages, docs
- touches: apps/admin/app/(admin)/patients/[id]/consultation, apps/admin/components/patients/, apps/admin/lib/patients/actions.ts, packages/services/src/db/adapters/neon.ts, packages/services/src/db/services/consultations, packages/services/src/shared/audit.ts, apps/docs/app/technical/applications, apps/docs/app/technical/decisions
- complexity: complex

## Problem

After a consultation Morgane updates five things: the note, each goal's check-in, the consigne of
the week, the living summary, and what to prepare next time. Today those are five cards in five
places with five saves, and three of them sit in different phone segments of the patient page. Her
product rule — a practitioner never encodes the same information twice, and updating a patient
after a consultation takes a few minutes — is the one the current console fails hardest: her § 9.2
is "je peux mettre à jour les objectifs, la consigne du moment, les recommandations et les notes
importantes sans parcourir un très long formulaire".

This is the initiative's first objective, the one every other brick waits on: _the patient loop
working end to end for one real patient_, whose measure is "a profile, the practitioner's
recommendations, and a first micro-action inside a minute". A loop nobody can afford to feed does
not run. `at-a-glance-page` (#93) made the patient page readable at a glance and put a
_Nouvelle consultation_ quick action on it; the action currently scrolls to the consultations
section, because the screen it should open did not exist yet. This spec is that screen.

## Proposed change

A **Nouvelle consultation** screen at `/patients/[id]/consultation`, reached from the working
view's quick action, laid out in the order Morgane works — comprendre → décider → agir → suivre —
and saved once. It writes through **one server action**, in **one transaction**, recorded as **one
audit event**, and returns to the at-a-glance page, which reads as updated.

Nothing on this screen calls a model, and nothing it writes reaches the patient link.

### 1. Comprendre — the note

- **Date** (`occurredAt`), prefilled with today, editable — she may write up yesterday's session.
- **Title** and **body**, free text, the body the working record of the consultation.
- The body is the raw-notes zone of the V2 explication: kept forever, never replaced by anything
  generated. The later `ai-assist/summary-draft` round reads it; this run does not.
- The note is **required** — a save with an empty body and an empty title is refused. It is the one
  thing on this screen that has no other home.

### 2. Décider — check-ins, consigne, résumé

- **Each active goal**, in its display order, with its check-in fields inline: direction
  (mieux / stable / moins bien, or none), measure, note. A goal whose three fields are all empty
  writes **no check-in** — a dated row saying nothing records nothing, which is already the
  service's rule (`addGoalCheckIn`). Archived goals do not appear.
  Each goal shows its **last check-in** (date, measure, direction) as read-context above the
  fields, so she can see what she is moving from.
- **Consigne** — a textarea prefilled with the current instruction's body. Saving a changed text
  supersedes the current row exactly as `setPatientInstruction` does today; an unchanged text
  writes nothing. Emptying it clears the consigne, as today.
- **Résumé vivant** — a textarea prefilled with the current summary body, revised in place. Same
  no-op rule. The summary stays one living row (owner decision #7).

### 3. Agir — links into the protocol, not forms

Three links out to the recommendation, supplement and essentials sections of the patient page,
each carrying a return link back to this screen. They open those sections as they are **today**
(one row per save); the day `bulk-entry` ships they open the grid in edit mode with no change here.
No protocol row is written by this screen or by its save.

### 4. Suivre — à préparer pour la prochaine consultation

The `next_consultation_prep` field `at-a-glance-page` added, prefilled with its current value and
edited here. The value she is replacing is the note she wrote **for this consultation**, so it is
shown as read-context above the field before it is overwritten.

### The save

One button. One server action. In order, inside one transaction:

1. the note (insert),
2. the check-ins that carry something (insert, one per goal),
3. the instruction if its text changed (supersede + insert),
4. the summary if its text changed (upsert),
5. the prep note if its text changed (update).

Then **one audit event**, `consultation.recorded`, whose detail lists what changed — the counts and
the field names, not the content. The individual actions (`addNoteAction`, `addCheckInAction`,
`setInstructionAction`, `setSummaryAction`, `updateNextConsultationPrepAction`) and their own audit
rows are untouched: they remain the between-consultation edit path from the patient page.

On success the screen redirects to `/patients/[id]`. On failure nothing is written, the screen
stays, and the message names what refused.

### The transaction is real — the adapter moves to the WebSocket driver

`transaction()` in `packages/services/src/db/adapters/neon.ts` is a pass-through today
(`fn(client)`): the Neon **HTTP** driver has no interactive transactions, and the adapter's own
comment says the first service writing across tables in one unit must move it to the WebSocket
driver. This is that service, and this run makes the move (owner decision, this spec's Define):

- `drizzle-orm/neon-http` + `neon()` → `drizzle-orm/neon-serverless` + `Pool`, so `transaction(fn)`
  issues a real `BEGIN` / `COMMIT` / `ROLLBACK` and every service that already calls the seam gets
  the guarantee it was written against.
- The seam (`DatabaseClient` in `db/client.ts`) does not change shape — `transaction` already takes
  `(tx: DatabaseClient) => Promise<T>` and hands the callback a client. What changes is that the
  client it hands over is bound to the transaction's connection instead of being the same pooled
  client, so a service inside the callback must take its collections from the `tx` it is given.
- Connection lifetime on Vercel: the pool is created once per process alongside the existing
  `registerDatabase()` call and is not closed per request.

Today's services reach the database through `getDatabase()` inside each function, so none of them
can be run on a caller's transaction as written. Rather than thread an optional client through
sixteen service folders, the composed write is **one new service**,
`db/services/consultations/recordConsultation()`, which takes the whole payload and performs the
five writes against the `tx` client it is handed. The single-field services stay exactly as they
are; nothing above the seam learns a new shape.

- This is an estate-wide change behind one file, so it is proven the way everything else here is:
  CI green, plus the six previews exercised by the owner's own testing before the merge gate.

### Draft autosave — local, whole screen, no table

Every field on this screen is kept in `localStorage` under a key carrying the patient id, written
on a short debounce while she types. The draft is restored when the screen opens and **cleared on a
successful save**. A restored draft says so on screen, with a "repartir de zéro" control.

It covers the whole form, not only the note, because the "Agir" links take her off the screen and
back: a draft that only held the note would lose the check-ins she had already typed. It is
deliberately local and deliberately not a table — a lost tab is the failure this prevents, and the
beta does not need cross-device drafts.

### The quick action

`QuickActions`' _Nouvelle consultation_ stops scrolling to the consultations section and navigates
to `/patients/[id]/consultation`.

## Acceptance criteria

- [ ] `/patients/[id]/consultation` renders, operator-only, in the four steps: note (date prefilled
      today, title, body), each active goal's check-in fields with its last check-in shown,
      consigne prefilled, résumé prefilled, the three protocol links, and the prep field prefilled.
- [ ] The working view's _Nouvelle consultation_ quick action navigates to that screen.
- [ ] One save writes the note, every check-in that carries a direction, a measure or a note, the
      instruction only if its text changed, the summary only if its text changed, and the prep note
      only if its text changed — and writes nothing else.
- [ ] The save runs inside one transaction: a failure part-way through leaves the database exactly
      as it was, and the screen keeps the typed values.
- [ ] The save records exactly one audit event, `consultation.recorded`, whose detail names what
      changed; no per-field audit row is written by this screen.
- [ ] A successful save returns to `/patients/[id]`, which shows the new note, check-ins, consigne,
      summary and prep note.
- [ ] A save with no note body and no note title is refused with a message, and nothing is written.
- [ ] The whole form is autosaved to `localStorage` keyed by patient, restored on reopen with a
      notice and a way to discard it, and cleared once a save succeeds.
- [ ] The three protocol links reach the recommendation, supplement and essentials sections and
      return to this screen with the draft intact.
- [ ] `packages/services/src/db/adapters/neon.ts` uses the WebSocket driver and its `transaction()`
      commits and rolls back for real, proven by a test that rolls back.
- [ ] `consultation.recorded` is in the `auditActions` vocabulary and the journal filters on it.
- [ ] Nothing on the patient link (`/p/[token]`) changes, and no model is called.
- [ ] The `apps/docs` pages for `technical/applications` and `technical/decisions` record the screen
      and the driver move (Release responsibility, same PR).

## Out of scope

- **Editing a past consultation from this screen.** It creates one; the note timeline keeps the
  edit and delete path.
- **Archiving recommendations marked "fait" in passing** — the second stub question, raised below
  rather than answered. If the answer is yes it comes back as its own stub; this screen links to
  the protocol sections and writes no protocol row.
- **A history of the living summary.** It stays one row revised in place. "What the summary said at
  the last consultation" is a history table and an owner decision, not something this run adds.
- **Bulk entry in the protocol sections** — `bulk-entry`. This screen links to whatever those
  sections are on the day it runs.
- **Anything the patient sees** — `patient-loop` — and **anything AI** — `ai-assist`, including the
  `summary-draft` round that will read these notes.
- **A cross-device or server-side draft.** Local only, by the stub's own call.
- **Any change to the five single-field actions and their audit rows.** They stay the
  between-consultation path.

## Open questions

- **Does she write the note during the consultation (phone, live) or after (desk)?** Non-blocking:
  the screen is built phone-usable either way and the autosave is specified either way. The answer
  changes emphasis at Build — how aggressive the debounce is, whether the note step opens expanded
  on phone — not what is built.
- **Should the screen archive recommendations she marks "fait" in passing, or is that the grid's
  job?** Raised, not answered, and parked under Out of scope so it cannot block approval. If the
  answer is "here", it is a stub of its own; if it is "the grid's", `bulk-entry` already covers it.
