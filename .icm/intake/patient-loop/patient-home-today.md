# Stub: Patient home — today and this week, then the way in to the meal loop

- feature-slug: patient-home-today
- sequence: 2 of 6
- depends-on: link-writes
- priority: P1
- size: M
- sources: feedback § 6 ("Accueil patient — éléments essentiels") · V2 explication (« Accueil » :
  dialogue à tout moment, recommandations page as the reference) · brainstorm § J ·
  `apps/web/app/[locale]/p/[token]/page.tsx` · `apps/web/lib/patient-link/segments.ts`

## What this is

The link's home today shows the living summary and the goals. Her § 6 wants the home to be the
patient's **today**:

- **Aujourd'hui / cette semaine** — the current goal(s) and the "challenge du moment": the active
  instruction, rendered to the patient as this week's consigne. (Today the instruction is
  withheld from the link — Morgane's consigne is written _to REMI_ in the brainstorm's sense, but
  her § 4 and § 6 now name a "challenge / consigne de la semaine" the patient sees. Open question
  below: same field or a second, patient-facing one.)
- **Mes recommandations** — simple, readable, **prioritised**: the top few, with a link to the
  full segment; the category vocabulary rendered in her words.
- **Mes recettes** — the recipes currently assigned, newest first, favourites first when
  `recipe-feedback-and-favourites` lands.
- **Mes essentiels** — the placard / frigo list, compact.
- **The meal entry point** — the « Je vais manger » / « J'ai mangé » control, prominent, that
  `meal-entry` wires; here it is the layout slot and the phrasing.

The summary moves down the page or into its own segment; the goals stay in "Aujourd'hui". The
segment nav keeps the existing segments; "Accueil" is renamed to whatever she calls it.

Phone-first, since that is where a patient opens a link from a message: one column, the meal
control within thumb reach, targets ≥ 44 px.

## Worth knowing

- The loader already fetches everything the home needs except the instruction; adding it is one
  more read on the same patient, guarded by the same visibility rules.
- Copy is the patient's register (« tu » vs « vous » is hers to decide — the link uses one today;
  keep it).
- The docs' `business/roles` page says what the patient sees; update in the same PR.

## Open questions — flag these on pickup

- "Challenge de la semaine": is it the practitioner instruction shown to the patient, or a
  separate patient-facing sentence she writes? The brainstorm's `PRACTITIONER_INSTRUCTION` was
  addressed to REMI, not the patient.
- Which recommendations are "prioritised" — the same answer as the console's "principales"
  (`practitioner-workflow/at-a-glance-page`), one decision for both.

## Prompt

Run `/pipeline new .icm/intake/patient-loop/patient-home-today.md` in the remi-ai repo and follow
the pipeline from there. Read the stub, its epic's `breakdown.md` and the `link-writes` run's
notes first. Scope: the link's home becomes "today / this week" — active goals and this week's
consigne, the prioritised recommendations, current recipes, essentials, and a prominent meal
entry-point slot; summary demoted; phone-first. Reads only, no model call. Raise the stub's open
questions rather than answering them.
