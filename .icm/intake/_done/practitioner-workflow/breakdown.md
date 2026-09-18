# Breakdown: practitioner-workflow — the console follows the consultation, not the schema

- scope-slug: practitioner-workflow · story: none — cut 2026-09-10 from Morgane's feedback on the first version (precedence row 1, covering message in `correspondence/03`)
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: a usable patient version for the partner clinic to test on 1 December
- personas: practitioner, operator

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

## Decisions of record

The fifteen decisions that bind all five epics cut in September 2026 — D-1 … D-12 (2026-09-10) and D-13 … D-15 (2026-09-11) — live in [`README.md § Decisions of record`](../README.md), where they outlast this epic's archival.

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

## Where it sits

The console's patient page — the working view, the protocol grids, the recipe forms, the consultation screen — and the services functions behind them.

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
- "Free text → structured rows" — decisions D-8 and D-14. `copy-context` is not it: the text goes
  out to a model of her choosing and nothing comes back into a field.
