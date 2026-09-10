# Epic: patient-loop — the link the patient writes into

Cut 2026-09-10 from Morgane's feedback § 6 and § 8
([`remi-v2-feedback-on-first-version.docx`](../../docs/collaboration/remi-v2-feedback-on-first-version.docx),
precedence row 1), with the old version's patient flows
([`remi-v2-explication-systeme.docx`](../../docs/collaboration/remi-v2-explication-systeme.docx),
row 5) as the flows to learn from. "C'est là que REMI tient sa promesse principale : aider la
personne à appliquer concrètement les recommandations dans sa vie quotidienne." For the pilot she
wants to test one thing: **does REMI help people apply their recommendations between two
consultations?** A static rendering of the protocol cannot answer that; a page the patient writes
into can.

Today `/p/[token]` is six read-only segments (home, recommandations, compléments, placard-frigo,
recettes, repas) and the token is the whole credential. Decision #2 of 2026-09-10
([`practitioner-workflow/breakdown.md § Decisions`](../practitioner-workflow/breakdown.md)) makes
the same link **read + write**: patient accounts wait (`beyond-december`), so the token stays the
credential and everything a patient writes is attributed to the token's patient.

Everything here works **without AI**: a meal the patient enters lands in the journal and gets
Morgane's feedback exactly as today; the response slot is designed so `ai-assist/meal-suggestions`
fills it instantly later. Her § 6's list is the scope, verbatim:

- Aujourd'hui / cette semaine : objectif actuel et challenge du moment.
- Mes recommandations : simples, lisibles et priorisées.
- Mes recettes : recettes actuellement suggérées ou attribuées.
- Mes essentiels : aliments à avoir à la maison.
- Interaction repas : « Je vais manger » et « J'ai mangé ».

Plus, from the old version and decision #9: quick feedback on recipes with favourites, an in-page
check-in, and a simple progression view.

## What I understood

Same brief and same decisions as `practitioner-workflow`. The ones this epic leans on: #2 (token
read + write), #6 (suggestions straight to the patient — the slot is built here, the model arrives
in `ai-assist`), #9 (check-ins in-page, no outbound channel), #12 (text-only meals).

## Feedback § / V2 flow → stub

| Source                                                       | Stub                             |
| ------------------------------------------------------------ | -------------------------------- |
| decision #2 · RETENTION                                      | `link-writes`                    |
| § 6 "Aujourd'hui / cette semaine", recommandations, essentiels | `patient-home-today`           |
| § 6 « Je vais manger » / « J'ai mangé » · § 8                | `meal-entry`                     |
| § 7 patient feedback (J'aime / Pas pour moi / Trop long / À refaire) · V2 favourites | `recipe-feedback-and-favourites` |
| V2 patient onboarding (profile the patient completes) · § 7 profile inputs | `patient-profile-edit`  |
| V2 "feedback régulier" + "Ma progression" · decision #9      | `check-in-and-progression`       |

## Build order

1. `link-writes` — the token accepts writes: actions, attribution, rate limits, audit, the privacy
   note and RETENTION — depends-on: none
2. `patient-home-today` — the home becomes today / this week, with the meal entry point —
   depends-on: link-writes
3. `meal-entry` — « Je vais manger » / « J'ai mangé » into the journal, response slot ready —
   depends-on: link-writes
4. `recipe-feedback-and-favourites` — four-button feedback, favourites list — depends-on:
   link-writes
5. `patient-profile-edit` — the patient edits diet, allergies, intolerances, likes / dislikes,
   likes cooking, time available (new), budget — depends-on: link-writes
6. `check-in-and-progression` — the in-page « comment ça se passe ? » and a progression view on
   both sides — depends-on: patient-home-today

## Parallelizable

`link-writes` is the trunk. 2–5 are independent once it lands; 6 waits for 2 because it sits on the
home. This epic shares no component with `practitioner-workflow` (admin vs web) and only the
tables, so the two can run side by side; `meal-entry` and `practitioner-workflow/at-a-glance-page`
both read the journal but neither changes its shape.

## Out of scope (whole epic)

- Any model call (`ai-assist`); photos (decision #12); accounts, email nudges, push
  (`beyond-december`, decision #9).
- Anything in `apps/admin` beyond what a write here needs to show up there (the journal already
  renders entries; a "patient-written" marker is in scope, a redesign is not).
