# Epic: practitioner-workflow — the console follows the consultation, not the schema

Cut 2026-09-10 from Morgane's feedback on the first version
([`.icm/docs/collaboration/remi-v2-feedback-on-first-version.docx`](../../docs/collaboration/remi-v2-feedback-on-first-version.docx),
precedence row 1, covering message in
[`correspondence/03`](../../docs/correspondence/03-feedback-on-first-version.md)). Her verdict on
the console as it stands: the data structure is right and stays; the interaction layer is built
around **encoding the database** — seventeen cards, one row per save, an open form under every
list — when it should be built around **her work with one patient**: comprendre → décider → agir →
suivre. As it stands she cannot use it: "cela prendrait beaucoup trop de temps d'encoder un profil
tel que demandé (un par un)".

This epic is the first of four because nothing downstream gets real data until she can encode a
patient in minutes. Its test is her § 9, verbatim:

1. Je peux ouvrir un patient et comprendre immédiatement sa situation actuelle.
2. Je peux mettre à jour les objectifs, la consigne du moment, les recommandations et les notes
   importantes sans parcourir un très long formulaire.
3. Je peux ajouter efficacement plusieurs recommandations, compléments ou essentiels — pas un à un.
4. Je peux générer des recettes et les attribuer sans navigation inutile (generation is
   `ai-assist`; the "without navigation" half is here).
5. _(meal suggestions — `patient-loop` + `ai-assist`)_
6. Le système fonctionne sans IA, mais chaque workflow est conçu pour que l'IA puisse ensuite
   préremplir, suggérer et automatiser.

**Her product rule, which binds every stub:** a practitioner never encodes the same information
twice, and updating a patient after a consultation takes a few minutes.

## What I understood

Jamie's brief (2026-09-10): take all of Morgane's feedback into account, retire the intake batches
that were heading elsewhere, cut tickets that head towards her vision, and interrogate before
assuming. The interrogation's answers are the decisions below. The
[`patient-workspace`](../_done/patient-workspace/breakdown.md) epic — a re-layout of the same page
with nothing changed in what it does — was dropped whole in favour of this one; its research
(R1–R30, primary sources on record-page layout, progressive disclosure, phone ergonomics) still
applies and is cited by slug below rather than repeated.

## Decisions of record (Jamie, 2026-09-10)

These bind all five epics cut that day (`practitioner-workflow`, `patient-loop`,
`nutrition-knowledge`, `ai-assist`, `beyond-december`). Where one supersedes a decision of
2026-09-01 ([`patient-record/breakdown.md § Decisions`](../_done/patient-record/breakdown.md)) it
says so; the rest of that list still stands, as does the brainstorm's § 7 what-not-to-build.

1. **The practitioner space is the admin console, reorganised.** No second signed-in surface before
   the open day. Morgane stays an operator. Her § 3's A/B split ("console admin" vs "espace
   praticien") is _console pages vs the patient page_ inside `apps/admin`, not two apps.
2. **The patient link becomes read + write on the same token.** Supersedes 2026-09-01 #1 (view-only,
   WhatsApp carries the loop). The token in the URL is still the whole credential; patient accounts
   are parked in `beyond-december`.
3. **AI vendor: Mistral, EU-hosted, behind the existing `TextProvider` seam.** Supersedes "AI
   deliberately unchosen". One adapter file; nothing above the seam names it.
4. **Order: `practitioner-workflow` → `patient-loop` → `ai-assist`.** `nutrition-knowledge` runs
   alongside the first two and is a dependency of recipe generation. Her § 9 order.
5. **Recipes: the library stays.** Generation writes into it and assigns in the same step; a recipe
   can be created from the patient page and assigned at creation; duplicate-as-variant exists.
   Extends 2026-09-01 #5 rather than replacing it. Patient groups are parked.
6. **Meal suggestions go straight to the patient** — no practitioner gate. Every exchange is visible
   in the journal in admin and Morgane can correct after the fact. Generated recipes pass an
   _automated_ check (allergies, intolerances, diet, active recommendations, time and difficulty)
   and reach the patient without a manual gate; she can archive any of them.
7. **Knowledge layer now: CIQUAL + Morgane's own nutrition rules as text.** Genotype (Fagron / Dr
   Mouton) parked until the rights question is answered.
8. **First AI round: meal suggestions, recipe generation, consultation notes → summary draft.**
   "Free text → structured rows" is _explicitly excluded_ from the first round; it sits P2 at the
   end of `ai-assist` so it is not lost.
9. **Check-ins are in-page, with no outbound channel**; a simple progression view on both sides.
10. **FunMedDev's team tests on 1 December as patients Morgane creates.** Practitioner sign-up,
    admin approval, Stripe, the 3-months-free rule, patient accounts and PDF import are all parked
    in `beyond-december`.
11. **Her feedback ranks 1** in [`.icm/docs/README.md § Precedence`](../../docs/README.md).
12. **The meal journal stays text-only** (2026-09-01 #6 stands); photos are parked pending a blob
    vendor — an owner decision, never made in passing.

## Decisions of record (Jamie, 2026-09-11 — before the call with Morgane and Arnaud)

The twelve above were taken the day the feedback arrived and had not left the repository; the
call of 11 September is where Morgane and Arnaud confirm or overturn them. Three more, from the
preparation of that call:

13. **A bridge for "tester dès maintenant" that calls no model: `copy-context`.** Her § 9.4 aside
    — she already generates with ChatGPT from a hand-typed profile — becomes one button that
    exports the patient's pseudonymous context as a prompt. Its assembler is the context block
    every `ai-assist` prompt opens with, built first and reused, so the bridge is not throwaway.
    Sequence 2 of this epic; the rest renumbered.
14. **The AI order stands, with its reason written down.** Grids and slots first so the model has
    somewhere to fill; `free-text-to-rows` stays P2 for that reason and is re-examined at the
    31 October milestone, not before. Mistral starts mid-October, once `patient-loop/link-writes`
    and `meal-entry` exist for suggestions to land in. Not "AI later" — "AI into slots that exist".
15. **The backlog carries dates.** Five milestones to 1 December are in
    [`.icm/intake/README.md § Milestones`](../README.md); a stub's epic tells the milestone it
    serves. One person runs the agents, in parallel where the epics allow it and serially where
    they do not; the dates assume yesterday's pace, one stub a day.

## Feedback § → stub

| Feedback section                                            | Stub                  | Note                                                               |
| ----------------------------------------------------------- | --------------------- | ------------------------------------------------------------------ |
| § 4 first screen · § 9.1                                    | `at-a-glance-page`    | the page opens on the working view; details behind it              |
| § 9.4 aside · covering message "dès maintenant"             | `copy-context`        | the patient's context as a prompt, one button, no model            |
| § 5 bulk entry · § 2 row 2 · § 9.3                          | `bulk-entry`          | several rows per save for recommendations, supplements, essentials |
| § 2 row 5 · § 7 "attribuer directement" · § 9.4             | `recipe-in-place`     | create + assign from the patient page; duplicate as variant        |
| § 5 "duplication / réutilisation"                           | `reuse-and-duplicate` | copy a protocol block from another patient or a personal template  |
| § 4 quick actions · § 9.2 · product rule "quelques minutes" | `consultation-update` | one post-consultation screen, one save                             |
| § 4 last paragraph · § 2 row 1                              | `secondary-sections`  | anamnesis, profile, consent, admin data out of the working view    |

## Build order

1. `at-a-glance-page` — the working view Morgane opens on; the frame every other stub lands in —
   depends-on: none — **shipped 2026-09-10 (#93)**
2. `copy-context` — the patient's context exported as a prompt, one button; the context assembler
   `ai-assist` reuses — depends-on: none
3. `bulk-entry` — multi-row editing with one save per section — depends-on: none
4. `recipe-in-place` — create, adapt and assign a recipe from the patient page — depends-on: none
5. `reuse-and-duplicate` — copy recommendations, supplements, essentials and recipes across
   patients — depends-on: bulk-entry, recipe-in-place
6. `consultation-update` — the "Nouvelle consultation" flow: note, check-ins, instruction, summary
   revision, next-time prep in one screen — depends-on: at-a-glance-page
7. `secondary-sections` — anamnesis, full profile, consent, sensitive zone behind the working view;
   archived rows folded with counts — depends-on: at-a-glance-page

Milestone: the whole epic by **30 September** (README § Milestones).

## Parallelizable

2, 3 and 4 are independent and can run in three sessions at once; they touch different components
(a quick action + a services function; the three add forms + batch actions; the recipe forms). 5
waits for 3 and 4 because it reuses their multi-row and variant surfaces. 6 and 7 wait for 1,
which has shipped.

## Out of scope (whole epic)

- Anything the patient sees (`patient-loop`), anything AI (`ai-assist`).
- A practitioner app, practitioner accounts, sign-up, billing (`beyond-december`).
- The roster (`/patients`) beyond a link into the new first screen.
- "Free text → structured rows" — decisions #8 and #14. `copy-context` is not it: the text goes
  out to a model of her choosing and nothing comes back into a field.
