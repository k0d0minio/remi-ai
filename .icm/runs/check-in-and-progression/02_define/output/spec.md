# Spec: Check-in and progression — « comment ça se passe ? », and what it adds up to

- slug: check-in-and-progression
- personas: patient, practitioner
- touches: apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/admin/app/(admin), apps/admin/app/(admin)/patients/[id], apps/admin/components/patients, packages/services/src/db (schema + migration), packages/services/src/db/services/patient-goals, packages/services/src/db/services/patient-recommendations, packages/services/src/shared/patient.ts
- complexity: complex

## Problem

The pilot has one question to answer: **does REMI help people apply their recommendations between
two consultations?** (`patient-loop/breakdown.md`, Morgane's feedback § 6). The link now carries
today's goals, the recommendations, the essentials and the meal loop — but between two
consultations it asks the patient nothing and shows them nothing of their own evolution. The old
version asked « comment ça se passe ? » every day or two and promised a « Ma progression » page it
never built; without either, a patient opening the link twice a week sees the same page twice and
Morgane learns nothing until they are in front of her.

This is the last stub of the epic that makes the loop close on itself, and it serves the initiative
directly — a patient experience validated on real terrain, in time for the December open day —
because an experience nobody records is one nobody can validate. **D-9** binds it: the check-in is
**in-page, with no outbound channel**, and a simple progression view exists **on both sides**.

## Proposed change

Two halves, both computed at render — no scheduler, no cron, no job.

### 1. The check-in prompt, on the patient home

When the patient has written no check-in **dated today**, the home shows one question and one tap,
above the existing blocks. Answered, it disappears until tomorrow. This is the interval Morgane
settled: **every visit** — at most one answer per calendar day, asked again the next day the link
is opened.

- **Subject.** One subject per prompt, drawn from a single ordered rotation: the patient's active
  goals, plus the first active recommendation of each of the **`habit`, `activity` and
  `monitoring`** categories (`firstRecommendationPerCategory` in `shared/patient.ts` — the same
  "principales" rule the home already uses). `nutrition` and `supplement` are excluded: the meal
  loop and the compléments segment already carry those. The order is **least-recently-answered
  first** — a subject never answered leads, then the oldest `checked_on`, ties broken by the
  subject's existing display order. That rotates across days without storing a cursor.
- **The question** is generated from the data, never authored per patient: the goal's own title, or
  the recommendation's title with a verb taken from a small per-category map kept beside the
  categories in `packages/services/src/shared/patient.ts`, so both apps read one copy.
- **The answer** is three faces → `better | stable | worse` (`goalDirections`, which already exists
  and is what the console's own check-in form writes), plus an optional word in a single free-text
  field.
- **« Passer »** moves the prompt to the next subject in the rotation rather than hiding it. It is
  presentation state in the client component only — nothing is written, and a reload returns to the
  head of the rotation. There is no "dismiss for today".
- **Where the answer lands.** A goal answer writes `patient_goal_check_ins` with
  `written_by: "patient"`, `checked_on` = today, the chosen `direction`, the optional word in
  `note`, and `measure` left at its default `""` — the measure is Morgane's field, taken in
  consultation. A recommendation answer writes a new `patient_recommendation_check_ins` table.
- The write goes through the patient link's existing write path (`lib/patient-link/actions.ts` and
  `db/services/patient-link-writes`), so token attribution, rate limiting and the audit trail that
  `link-writes` established apply unchanged. Nothing new is invented for this feature's writes.

### 2. « Ma progression » — the same view on both sides

- **For the patient:** a new segment at `/p/[token]/progression`, added to `patientLinkSegments`
  and so to the segment navigation, appearing under the same data-driven rule as the others — when
  there is at least one active goal or at least one check-in to show. It carries, per active goal:
  the check-ins over time as a **simple strip** (the faces on a timeline, built from the design
  system's primitives — **no chart library**); the current instruction Morgane wrote to the patient
  (`patientBody`, exactly as the home renders it — never the line written to REMI); and the count
  of **meals logged this week**. The strip shows the last **eight weeks** of check-ins; older rows
  stay in the database and are simply not drawn.
- **For the practitioner:** the same strip fills the goals slot on the console's patient page
  (`apps/admin/app/(admin)/patients/[id]`), beside the goal rows that already render there, so the
  patient's own answers and Morgane's consultation check-ins appear on one timeline. `written_by`
  is what tells them apart, and the strip marks the patient's own answers visibly.

### 3. A « moins bien » is surfaced, and cleared by hand

A `worse` answer written by the patient is **awaiting attention** until Morgane marks it seen.

- Both check-in tables carry an `acknowledged_at` timestamp. A **« Vu »** action on the console
  stamps one answer; only patient-written `worse` answers with `acknowledged_at` null are counted.
  This mirrors the meal journal's existing rule — an explicit act clears the mark, and the number
  means "you have not looked at this yet" rather than "this happened recently".
- **On the patient page:** a count in the goals slot, in the shape the journal already uses
  (« N réponse(s) à regarder », beside « N repas attendent un retour »).
- **On the console home (`Accueil`):** a roll-up naming the patients who have unacknowledged
  `worse` answers, in the style that page already holds — real rows in a list, never a fixture
  tile.

### Data

One new table and one additive column pair, in a single Drizzle migration:

- `patient_recommendation_check_ins` — `id`, `recommendation_id` (FK → `patient_recommendations`,
  `on delete cascade`), `checked_on` (date), `direction` (a `goalDirections` key), `note` (text,
  default `""`), `acknowledged_at` (nullable timestamp), plus the standard timestamps. It carries
  **no `written_by`**: only the patient writes a recommendation check-in, and a column nothing
  varies is a promise the schema cannot keep. It becomes additive the day the console gets a
  recommendation check-in of its own.
- `patient_goal_check_ins` — add `acknowledged_at` (nullable timestamp). Existing rows keep null,
  which is correct: they are Morgane's own and never counted.

## Acceptance criteria

- [ ] On the patient home, when no check-in dated today exists for this patient, one question with three faces (mieux / pareil / moins bien) and an optional free-text word is shown; once answered it does not reappear until the next calendar day
- [ ] The prompt's subject is drawn from the active goals plus the first active recommendation of each of the `habit`, `activity` and `monitoring` categories, least-recently-answered first; `nutrition` and `supplement` recommendations are never asked about
- [ ] « Passer » shows the next subject in the rotation without writing anything and without hiding the prompt
- [ ] A goal answer writes a `patient_goal_check_ins` row with `written_by: "patient"`, today's `checked_on`, the chosen direction and the optional note; a recommendation answer writes a `patient_recommendation_check_ins` row with the same fields
- [ ] The check-in write goes through the patient link's existing write path, so it is rate-limited, attributed to the token's patient and audited exactly as a meal entry is
- [ ] `/p/[token]/progression` exists, appears in the segment navigation only when there is a goal or a check-in to show, and renders per active goal: a strip of the last eight weeks' check-ins as faces on a timeline, the current patient-facing instruction, and the count of meals logged this week — with no chart library added to the workspace
- [ ] The console's patient page renders the same strip in its goals slot, showing Morgane's consultation check-ins and the patient's own answers on one timeline, visibly distinguished by `written_by`
- [ ] A patient-written `worse` answer raises a count on the console's patient page and lists that patient on the console home until a « Vu » action stamps `acknowledged_at`, after which it is counted nowhere
- [ ] Nothing schedules, polls or sends: the prompt's visibility and every count are computed at render from the stored dates
- [ ] One migration adds `patient_recommendation_check_ins` and `patient_goal_check_ins.acknowledged_at`, and existing check-in rows are unaffected

## Out of scope

- **« Recettes essayées cette semaine »** on the progression view. The stub asks for it, but nothing
  records that a recipe was tried until `patient-loop/recipe-feedback-and-favourites` ships; it
  lands with that run rather than being approximated here from assignment dates, which would answer
  a different question. The rest of « Ma progression » ships now.
- Email or push nudges of any kind — D-9, and parked in `beyond-december`.
- Any model call: no generated question wording, no interpretation of a note (`ai-assist`).
- Any chart library, and any charting beyond the faces-on-a-timeline strip.
- A patient-facing view of Morgane's `measure` values, and any patient ability to edit or delete a
  check-in already written.
- A recommendation check-in form in the console, and therefore `written_by` on the new table.
- Notifying on a `stable` run or on silence — only an explicit `worse` raises anything.
- Configuring the interval per patient: it is every visit, for everyone.

## Open questions

None. The stub's two **Open for Define** points were settled with the operator on 2026-09-18:
the interval is **every visit** (one answer per calendar day), and a `worse` answer raises **both**
a per-patient count and a console-home roll-up, cleared by an explicit **« Vu »**. Two residues
raised in the same session were settled with them: the rotation covers `habit`, `activity` and
`monitoring` only, and « Passer » rotates rather than dismisses. The « recettes essayées » gap is
under **Out of scope** above, by the operator's decision, not left open.
