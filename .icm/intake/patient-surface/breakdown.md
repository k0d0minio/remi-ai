# Epic: patient-surface — the content tools and the link the patient actually opens

The second batch cut from
[`.icm/docs/collaboration/remi-v2-structure-brainstorm.docx`](../../docs/collaboration/remi-v2-structure-brainstorm.docx),
after [`patient-record`](../patient-record/breakdown.md). That epic deepens what Morgane keeps;
this one builds what she _hands over_: the pantry essentials, the recipe library, the meal journal
she transcribes from WhatsApp — and the private link where her patients read it all, at the real
URL, in `apps/web`. Still **no AI anywhere**: Morgane authors every word; the tables are the
permanent ones the AI round will later write into.

The decisions of record (Jamie, 2026-09-01) live in
[`patient-record/breakdown.md § Decisions`](../patient-record/breakdown.md) and bind here too. The
ones this epic leans on hardest:

- **#1 — the link is view-only.** Patients read; WhatsApp stays the reply channel; Morgane
  transcribes. No forms at `/p/[token]`.
- **#3 — one token, multi-page.** `/p/[token]` grows sub-pages; the token in the path remains the
  whole credential; segments with nothing to show stay hidden.
- **#5 — recipes are a shared library with per-patient assignment.** Chosen over per-patient
  rows: Morgane reuses recipes across her 10–15 patients, personalising the _assignment_, not the
  recipe.
- **#6 — the meal journal is text-only.** Photos stay in WhatsApp until a blob-storage vendor is
  chosen — an owner decision, flagged where it gates, never made in passing.

## Block map — brainstorm § → stub

| Brainstorm block                                | Stub                    | Note                                                          |
| ----------------------------------------------- | ----------------------- | ------------------------------------------------------------- |
| H. PANTRY_ESSENTIALS                            | `pantry-essentials`     | short list, item + why, per patient                           |
| I. RECIPES + WEEKLY_ADAPTATION                  | `recipe-library`        | library + assignment; the weekly set is the adaptation record |
| § 5 loop + MEAL_FEEDBACK (+ PROGRESS learnings) | `meal-journal`          | text-only entries + Morgane's feedback                        |
| J. PATIENT_OUTPUT                               | `patient-link-segments` | the multi-page link — a rendering, not a table                |

PROGRESS is deliberately split across the two epics: goal check-ins live in `patient-record`
(`goals-and-instruction`); what-works/what-doesn't observations live here on the meal journal.
Consolidating them into one feed is the AI round's question, not this epic's.

## Build order

1. `pantry-essentials`
2. `recipe-library`
3. `meal-journal`
4. `patient-link-segments` — renders 1–3 plus the `patient-record` epic's summary, goals and
   supplement protocol, so it comes last and expects that epic shipped.

Cross-epic dependency, stated plainly: run this epic after `patient-record`, or accept that
`patient-link-segments` ships with its summary/goals/supplements segments dark until then. Every
stub carries open questions — **flag them on pickup, never answer them in code**; where an
assumption is unavoidable, state it in the PR body.
