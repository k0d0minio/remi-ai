# Epic: patient-record — the manual patient record, deepened

Morgane is treating 10–15 beta patients by hand, today, with the admin console as her tool and
WhatsApp as the interaction channel. This epic makes the record she keeps in the console complete
enough that a consultation can be run from REMI alone: the structured profile, the anamnesis, the
goals, the living summary and the supplement protocol her v2 brainstorm describes — entered
manually, by her, with **no AI anywhere**.

The source is
[`.icm/docs/collaboration/remi-v2-structure-brainstorm.docx`](../../docs/collaboration/remi-v2-structure-brainstorm.docx)
(Morgane's v2 structure document), read through the terrain-first lens of
[`.icm/docs/new-development-direction.docx`](../../docs/new-development-direction.docx): build the
tables and the manual tools now, add the AI later. Every table cut here is **permanent data
layer** — Drizzle schema + migration in `@remi/services`, service behind the seam, tested against
the in-memory client — never a scratch structure. Design each one so the AI round changes read and
write sites, not migrations (the way `schema.ts` already splits pseudonym from full name).

## Decisions of record (Jamie, 2026-09-01)

Settled in the session that cut this epic — do not relitigate them at build time:

1. **The patient link stays view-only this round.** WhatsApp deliberately carries the interaction
   loop; Morgane transcribes what patients send her. No forms on the public page.
2. **All 12 brainstorm blocks become permanent tables, manual-first.** The AI-shaped ones
   (practitioner instruction, progress, weekly adaptation) land as manual tools now, not later.
3. **One token, multi-page**: `/p/[token]` grows sub-pages in the `patient-surface` epic; the token
   remains the whole credential.
4. **This epic is admin + data layer only** (one deliberate exception: `data-care` adds a privacy
   note to the existing link page). The patient-facing segments are the `patient-surface` epic.
5. **Recipes will be a shared library with per-patient assignment** (patient-surface epic).
6. **The meal journal is text-only** until a blob-storage vendor is chosen (patient-surface epic).
7. **The summary is a living per-patient document**, revised at each consultation, and will be
   patient-visible on the link.
8. **Data care ships in this epic**, first: consent capture, link privacy note, a written
   retention answer.

## Block map — brainstorm § → stub

| Brainstorm block                   | Stub                    | Note                                            |
| ---------------------------------- | ----------------------- | ----------------------------------------------- |
| A. PATIENT_PROFILE                 | `profile-fields`        | regime, allergies/intolerances, cooking, budget |
| B. ANAMNESIS                       | `anamnesis-structure`   | her 12 categories, structured                   |
| C. PATIENT_SUMMARY                 | `living-summary`        | manual now; the AI drafts into it later         |
| D. PRIORITY_GOALS + E. INSTRUCTION | `goals-and-instruction` | one stub — both are practitioner steering       |
| G. SUPPLEMENTS                     | `supplement-protocol`   | must settle the `supplement` category overlap   |
| (consent / data protection)        | `data-care`             | replaces what purged REMI-015 covered           |

F. RECOMMENDATIONS already exists (`patient_recommendations`). H. PANTRY_ESSENTIALS,
I. RECIPES, J. PATIENT_OUTPUT and the §5 meal loop are the `patient-surface` epic.
PROGRESS materialises as goal check-ins here plus meal-journal observations there;
WEEKLY_ADAPTATION as the dated recipe/pantry refreshes there. J is a rendering of validated
content, not a table.

## Build order

1. `data-care` — consent exists before more health data lands.
2. `profile-fields`
3. `anamnesis-structure`
4. `goals-and-instruction`
5. `living-summary`
6. `supplement-protocol`

2–6 are independent of each other in the data layer; the sequence orders the patient page top-down
by how Morgane works. Every stub carries open questions — **flag them on pickup, never answer them
in code**; where an assumption is unavoidable, state it in the PR body.
