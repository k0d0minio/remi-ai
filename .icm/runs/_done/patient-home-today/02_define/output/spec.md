# Spec: Patient home — today and this week, then the way in to the meal loop

- slug: patient-home-today
- personas: patient, operator
- touches: apps/web, apps/admin, packages/services/src/db, apps/docs/app/business/roles
- complexity: standard

## Problem

The link's home (`/p/[token]`) renders the living summary and the priority goals and stops there.
Morgane's § 6 asks the home to be the patient's **today** — the current goal and this week's
consigne, the prioritised recommendations, the recipes she has assigned, the essentials to keep in,
and the way in to the meal loop. A static rendering of the protocol cannot answer the one question
the December pilot is trying to move: does REMI help a patient apply their recommendations between
two consultations? That question is the current initiative's measure, and its objective — the
patient loop working end to end for one real patient — needs a home that leads with what the
patient is being asked to do this week, not with a summary of where they have been.

`link-writes` (#98, D-2) made the token read + write; the home is where the writing starts.

## Proposed change

The home becomes « Aujourd'hui », in her order, on one phone-first column.

### 1. Aujourd'hui / cette semaine

The active goals, then **this week's consigne**.

The consigne is a **new, nullable, patient-facing field on the same `patient_instructions` row**
(operator decision, 2026-09-18). `body` stays what it is — Morgane's standing consigne addressed
to REMI, brainstorm § E, never shown to the patient and the line the `ai-assist` round will read.
The new field is what she writes **to the patient**. Both are optional; the archiving semantics are
unchanged (a replacement archives the whole row, so the pair travels together and « what was she
steering by in October » still answers with both halves).

The home renders the patient-facing field when it is non-empty and renders no consigne block at
all when it is empty. It never falls back to `body` — a line written to REMI is not a line written
to a patient.

Both console write paths gain the second field, labelled and hinted so the difference between the
two is legible in the form itself:

- `apps/admin/components/patients/instruction-block.tsx` — the standing consigne block.
- `apps/admin/components/patients/consultation-form.tsx` — the one-screen consultation save, which
  already writes the instruction.

### 2. Mes recommandations

The **first active recommendation of each category**, by `position` — the same rule the console's
at-a-glance shipped (#93), one decision for both surfaces (operator decision, 2026-09-18). Up to
five rows, each showing the title, its category rendered in the patient's vocabulary (the existing
`patientLink.categories` labels), and the detail when there is one. Below them, a link to the full
`recommandations` segment. Hidden entirely when the patient has no active recommendation.

### 3. Mes recettes

The recipes currently assigned, **newest first**. Favourites-first is `recipe-feedback-and-
favourites`'s to add and is not built here. A compact list with a link to the `recettes` segment.
Hidden when there are none.

### 4. Mes essentiels

The placard / frigo list, compact, with a link to the `placard-frigo` segment. Hidden when empty.

### 5. The meal entry point

A prominent, single control carrying the two phrasings — « Je vais manger » and « J'ai mangé ».
**This run builds the slot and the copy only**: the control renders in its final position with its
final wording and is inert (no navigation, no write, no form). `meal-entry` wires it. Rendered for
every patient, including one whose record is otherwise empty — it is the invitation, not a
data-driven section.

### 6. The summary moves down

The living summary stays on the home and is rendered **below** the four sections above (operator
decision, 2026-09-18). No new segment, no change to `segments.ts`, no change to the
empty-segment hiding rule.

### 7. The nav label

The home's nav label becomes **« Aujourd'hui »** (today: « Synthèse »), in `fr.ts` and its English
counterpart in `en.ts`. The segment key stays `home` and the URL stays the token root — no route
moves and no link anyone has already sent breaks.

### 8. Phone-first

One column at every width. The meal control sits within thumb reach — after « Aujourd'hui », not
at the foot of the page behind the summary. Every interactive target is at least 44 px.

### 9. Register

The link says **« vous »** today; that is kept throughout, including the new copy. Whether it
becomes « tu » is Morgane's to decide and is not this run's.

### 10. Docs

`apps/docs/app/business/roles` — the Patient section's "What they can see" — is updated in the same
PR to say what the home now leads with.

## Acceptance criteria

- [ ] `patient_instructions` carries a second nullable patient-facing text column, with a migration, the model and service updated, and the existing `body` unchanged in meaning and in what reads it
- [ ] Both console write paths — the instruction block and the consultation form — write the patient-facing field, each labelled so an operator can tell the REMI-facing line from the patient-facing one
- [ ] The link's home opens on « Aujourd'hui / cette semaine »: the active goals, then the patient-facing consigne when one is written
- [ ] The home renders no consigne block when the patient-facing field is empty, and never falls back to `body`
- [ ] The home shows « Mes recommandations » as the first active recommendation of each category by `position`, in the patient's category vocabulary, with a link to the full segment; the section is absent when there is no active recommendation
- [ ] The home shows « Mes recettes » (assigned recipes, newest first) and « Mes essentiels » (the placard/frigo list, compact), each linking to its segment and each absent when empty
- [ ] The meal entry point renders prominently after « Aujourd'hui » for every patient, carrying « Je vais manger » and « J'ai mangé », and performs no action in this run
- [ ] The living summary renders below those sections on the home; `segments.ts` and the segment-visibility rule are unchanged
- [ ] The home's nav label reads « Aujourd'hui » in both locales; the segment key stays `home` and the token-root URL is unchanged
- [ ] The home is one column at every width, every interactive target is ≥ 44 px, and the meal control sits above the summary
- [ ] All new patient-facing copy uses « vous », matching the rest of the link
- [ ] `business/roles` says what the patient now sees on the home, updated in the same PR

## Out of scope

- The meal control's behaviour — navigation, form or write. `meal-entry` wires it; this run ships the slot and the phrasing.
- Favourites-first ordering of the recipes (`recipe-feedback-and-favourites`).
- Any model call (D-6: the slot is built here, the model arrives in `ai-assist`); photos (D-12).
- Changing « vous » to « tu ».
- Any change to `body`'s meaning, to who reads it, or to the instruction archiving semantics.
- Moving the summary into a segment of its own, or any other change to `segments.ts`.
- Re-opening the console's at-a-glance "principales" rule, or adding an explicit priority flag to recommendations.

## Open questions

- None.
