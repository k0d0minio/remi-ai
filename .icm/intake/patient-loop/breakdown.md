# Breakdown: patient-loop — the link the patient writes into

- scope-slug: patient-loop · story: none — cut 2026-09-10 from Morgane's feedback § 6 and § 8 (then precedence row 1), with the old version's patient flows as flows to learn from; amended 2026-09-23 from the 11 Sept call and her 14 Sept « Ce que les consultants doivent voir » (`runs/september-sources/01_scope/`, now row 1)
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- personas: patient, practitioner

Cut 2026-09-10 from Morgane's feedback § 6 and § 8
([`remi-v2-feedback-on-first-version.docx`](../../docs/collaboration/remi-v2-feedback-on-first-version.docx),
precedence row 1, now row 2), with the old version's patient flows
([`remi-v2-explication-systeme.docx`](../../docs/collaboration/remi-v2-explication-systeme.docx),
row 6) as the flows to learn from. "C'est là que REMI tient sa promesse principale : aider la
personne à appliquer concrètement les recommandations dans sa vie quotidienne." For the pilot she
wants to test one thing: **does REMI help people apply their recommendations between two
consultations?** A static rendering of the protocol cannot answer that; a page the patient writes
into can.

Today `/p/[token]` is six read-only segments (home, recommandations, compléments, placard-frigo,
recettes, repas) and the token is the whole credential. Decision D-2 of 2026-09-10
([`README.md § Decisions of record`](../README.md)) makes
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

Plus, from the old version and decision D-9: quick feedback on recipes with favourites, an in-page
check-in, and a simple progression view.

**Amended 2026-09-23 (decision D-19).** Her 14 Sept document — written for the people she follows
now, three days after the 11 Sept call asked her for « le truc le plus basique » — adds three
things before any model and reorders one: personalised **challenges** with « Challenge acquis » /
« Prêt(e) pour le prochain », her recipe **PDFs and personal documents** on the page (through a
files seam, D-18), and **one general feedback box**; and « pas besoin pour l'instant d'un système
complexe de notation recette par recette », so the four-button recipe feedback drops to P2.

## What I understood

Same brief and same decisions as `practitioner-workflow`. The ones this epic leans on: D-2 (token
read + write), D-6 (suggestions straight to the patient — the slot is built here, the model arrives
in `ai-assist`), D-9 (check-ins in-page, no outbound channel), D-12 (text-only meals).

## Feedback § / V2 flow → stub

| Source                                                                                      | Stub                             |
| ------------------------------------------------------------------------------------------- | -------------------------------- |
| decision D-2 · RETENTION                                                                    | `link-writes`                    |
| § 6 "Aujourd'hui / cette semaine", recommandations, essentiels                              | `patient-home-today`             |
| § 6 « Je vais manger » / « J'ai mangé » · § 8                                               | `meal-entry`                     |
| § 7 patient feedback (J'aime / Pas pour moi / Trop long / À refaire) · V2 favourites        | `recipe-feedback-and-favourites` |
| V2 patient onboarding (profile the patient completes) · § 7 profile inputs                  | `patient-profile-edit`           |
| V2 "feedback régulier" + "Ma progression" · decision D-9 · 14 Sept § 1 (0–5 weekly score)   | `check-in-and-progression`       |
| 14 Sept § 2 and § 7 · call [27:34] (« les challenges que j'ai déjà donnés ») · D-19         | `challenges`                     |
| 14 Sept § 3 option 2, § 4, § 7 · call [28:21] (« figer des documents ou des liens ») · D-18 | `patient-documents-and-links`    |
| 14 Sept § 6 and § 7 · call [28:21] (« un commentaire ou un feedback de leur part ») · D-19  | `general-feedback`               |

## Where it sits

The patient link (`/p/[token]`) — home, meals, challenges, documents, feedback, recipes, profile, progression — the console's journal, assignment rows, at-a-glance goals slot and patient list, and the services package's fourth seam (files).

## Build order

1. `link-writes` — the token accepts writes: actions, attribution, rate limits, audit, the privacy
   note and RETENTION — depends-on: none
2. `patient-home-today` — the home becomes today / this week, with the meal entry point —
   depends-on: link-writes
3. `meal-entry` — « Je vais manger » / « J'ai mangé » into the journal, response slot ready —
   depends-on: link-writes
4. `challenges` — a patient-facing challenge with a lifecycle, the two taps, the console signals
   — depends-on: link-writes
5. `patient-documents-and-links` — the files seam (Vercel Blob), her PDFs and links on the page,
   « voir comme la patiente » — depends-on: link-writes
6. `general-feedback` — one free-text box in her words, listed and answered in the console —
   depends-on: link-writes
7. `check-in-and-progression` — the in-page « comment ça se passe ? » (or her 0–5 score) and a
   progression view on both sides — depends-on: patient-home-today
8. `patient-profile-edit` — the patient edits diet, allergies, intolerances, likes / dislikes,
   likes cooking, time available (new), budget — depends-on: link-writes
9. `recipe-feedback-and-favourites` — **P2** (D-19) — four-button feedback, favourites list —
   depends-on: link-writes

## Parallelizable

`link-writes` is the trunk; 1–3 have shipped. 4, 5 and 6 each add a table (`patient_challenges`,
`patient_documents`, `patient_messages`), so they touch `schema.ts` and the migrations journal and
are **sequenced, not parallel**; 5 also touches the lockfile and the env lists (the files seam), so
it sits between the two lighter ones rather than first only because 4 is the ask she leads with and
carries no dependency. 7 waits for 2 (it sits on the home) and reads what 4 stores. 8 is independent
of 4–7 and can run beside any of them. 9 is P2 and waits for an owner's move. This epic shares only
tables with the console epics, so a console run can sit beside any of these.

## Out of scope (whole epic)

- Any model call (`ai-assist`); photos on meals (decision D-12 — the seam now exists, the stub
  stays parked); accounts, email nudges, push (`beyond-december`, decision D-9).
- Her § 5 « Mes ressources » — struck by her: « pas prioritaire je peux envoyer sur whatsapp ».
- Comments on individual recipes or recommendations — her § 6: one general place is enough.
- Anything in `apps/admin` beyond what a write here needs to show up there (the journal already
  renders entries; a "patient-written" marker is in scope, a redesign is not).
