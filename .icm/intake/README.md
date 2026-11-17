# Intake — this repo's backlog

> This file has the decisions and the epics of the build. Since 2026-11-17 the pipeline is the
> BAXTER blueprint (`.icm/_system/ROUTER.md`), and a ticket is a Linear key of the team `REM`.
> The markdown stubs of the epics and of `triage/` are the backlog of before that date:
> `.icm/local/ROUTES.md` says how one becomes a ticket.

## The backlog

Re-cut on 2026-10-23 from Morgane's thirty user stories. She wrote them on 12 and 15 October
2026, in French, one document per story, numbered 1 to 32 (27 does not exist). They live in
the client's Drive folder,
[`remi-ai/user-stories/`](https://drive.google.com/drive/folders/1Dsa6QvCLwBTn5jnI7ubrccnY0HUn4D-7),
and never in this repo. Jamie decided on 2026-10-23 that they **replace the open backlog whole**
and **win over anything the platform contradicts**. One story is one epic. Each epic's
`breakdown.md` restates the story, lists the questions it leaves open, and maps every one of her
acceptance criteria to a stub in its `Criteria → stubs` table. Story 30 states rules for the whole
product. It is not an epic. Its rules are decisions D-30 and D-31 below.

Two stories arrived after that cut. Story 10 « Répartition des macronutriments selon le génotype »
reached the Drive `remi-ai/` root on 23 October 2026, with the genotype table it rests on. It is the
epic `genotype-macro-split`. Story 33 « Suppression de la photo » arrived on 27 October 2026 as an
attachment on the e-mail thread « Update: REMI AI ». It re-cuts `meal-improvement`: the patient types
the meal, no photo. Jamie files both in `user-stories/`.

The order is her « Parcours général » (story 30): sign-up link → preparatory profile →
consultation → practitioner validation → activation and e-mail → the patient's space.

| #   | Story (her title)                                                     | Epic                                                                     | Phase       |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------- |
| 2   | « Inscription et compte patient »                                     | [`patient-signup-account/`](_done/patient-signup-account/breakdown.md)   | 1           |
| 3   | « Consentement et données personnelles »                              | [`consent-and-data/`](consent-and-data/breakdown.md)                     | 1           |
| 1   | « Création du dossier patient »                                       | [`patient-file-creation/`](_done/patient-file-creation/breakdown.md)     | 1           |
| 4   | « Questionnaire préparatoire du patient »                             | [`preparatory-questionnaire/`](preparatory-questionnaire/breakdown.md)   | 1           |
| 5   | « Liste des patients et statuts du dossier »                          | [`patient-list-and-status/`](patient-list-and-status/breakdown.md)       | 1           |
| 6   | « Consultation du dossier patient avant le rendez-vous »              | [`patient-file-view/`](patient-file-view/breakdown.md)                   | 1           |
| 7   | « Calcul de l'IMC »                                                   | [`bmi/`](_done/bmi/breakdown.md)                                         | 1           |
| 8   | « Calcul des besoins protéiques »                                     | [`protein-needs/`](protein-needs/breakdown.md)                           | 1           |
| 9   | « Calcul énergétique »                                                | [`energy-needs/`](energy-needs/breakdown.md)                             | 1           |
| 10  | « Répartition des macronutriments selon le génotype »                 | [`genotype-macro-split/`](genotype-macro-split/breakdown.md)             | 1           |
| 13  | « Aliments, nutriments et composés »                                  | [`food-directives/`](food-directives/breakdown.md)                       | 2           |
| 14  | « Sécurité des évictions totales »                                    | [`eviction-safety/`](eviction-safety/breakdown.md)                       | 2           |
| 15  | « Demande d'ajout d'un élément »                                      | [`knowledge-base-requests/`](knowledge-base-requests/breakdown.md)       | 2           |
| 16  | « Objectifs prioritaires du patient »                                 | [`priority-goals/`](priority-goals/breakdown.md)                         | 2           |
| 17  | « Conseils d'hygiène de vie »                                         | [`lifestyle-advice/`](lifestyle-advice/breakdown.md)                     | 2           |
| 18  | « Compléments, plantes, huiles essentielles et autres interventions » | [`supplement-interventions/`](supplement-interventions/breakdown.md)     | 2           |
| 11  | « Chrononutrition : organisation des repas »                          | [`meal-structure/`](meal-structure/breakdown.md)                         | 2           |
| 12  | « Jeûne intermittent »                                                | [`intermittent-fasting/`](intermittent-fasting/breakdown.md)             | 2           |
| 19  | « Validation et activation de l'accompagnement »                      | [`care-activation/`](care-activation/breakdown.md)                       | 3           |
| 20  | « Mise à jour du profil et des recommandations, historique »          | [`protocol-versions/`](protocol-versions/breakdown.md)                   | 3           |
| 21  | « Modifications du patient après validation »                         | [`patient-change-signals/`](patient-change-signals/breakdown.md)         | 3           |
| 22  | « Accès du patient à son espace activé »                              | [`patient-access/`](patient-access/breakdown.md)                         | 3           |
| 31  | « Accueil et navigation de l'espace patient »                         | [`patient-home-navigation/`](patient-home-navigation/breakdown.md)       | 3           |
| 23  | « Espace Recommandations »                                            | [`patient-recommendations/`](patient-recommendations/breakdown.md)       | 3           |
| 24  | « Espace Recettes »                                                   | [`recipe-space/`](recipe-space/breakdown.md)                             | 4           |
| 25  | « Fiche recette, portions et favoris »                                | [`recipe-card/`](recipe-card/breakdown.md)                               | 4           |
| 26  | « Liste de courses »                                                  | [`shopping-list/`](shopping-list/breakdown.md)                           | 4           |
| 28  | « Suggestion d'amélioration »                                         | [`meal-improvement/`](meal-improvement/breakdown.md)                     | 4           |
| 33  | « Suppression de la photo »                                           | re-cuts [`meal-improvement/`](meal-improvement/breakdown.md)             | 4           |
| 32  | « Consultation des recettes du jour (praticien) »                     | [`practitioner-daily-recipes/`](practitioner-daily-recipes/breakdown.md) | 4           |
| 29  | « Je suis au restaurant (bonus MVP) »                                 | [`restaurant-menu/`](restaurant-menu/breakdown.md)                       | 5           |
| 30  | « Règles transversales de priorité et de sécurité »                   | decisions D-30 and D-31                                                  | every phase |

The phases are a build order, not a promise of dates. The dates are under Milestones. One-off
findings sit in [`triage/`](triage/), finished ones in its `_done/`. The triage stubs of
September describe bugs in code that still runs. They stay until the epic that rebuilds their
surface drops them.

## Order

Set by Jamie on 2026-10-27. The epics follow the table above. `triage` comes last.

1. consent-and-data
2. preparatory-questionnaire
3. patient-list-and-status
4. patient-file-view
5. protein-needs
6. energy-needs
7. food-directives
8. eviction-safety
9. knowledge-base-requests
10. priority-goals
11. lifestyle-advice
12. supplement-interventions
13. meal-structure
14. intermittent-fasting
15. care-activation
16. protocol-versions
17. patient-change-signals
18. patient-access
19. patient-home-navigation
20. patient-recommendations
21. recipe-space
22. recipe-card
23. shopping-list
24. meal-improvement
25. practitioner-daily-recipes
26. restaurant-menu
27. genotype-macro-split
28. triage

`genotype-macro-split` (story 10) comes after the recipe and analysis epics (Jamie, 2026-10-28).

## Decisions of record

D-1 to D-25 were taken between 2026-09-10 and 2026-09-26 for the September backlog. The stories
supersede the ones below. The rest stand. D-26 to D-34 were taken by Jamie on 2026-10-23 from the
stories, as defaults a breakdown may rest on and a question for Morgane may overturn. D-34 is
Jamie's own decision, not a default.

### Superseded by the stories (2026-10-23)

- **D-1** as "no practitioner space". The console is the practitioner space (D-27), with roles.
- **D-2** the token as the whole credential. Patient accounts replace it (D-26).
- **D-9** in-page check-ins and the progression view. Story 30: « Aucun écran du MVP ne propose
  de points, de badges ni de questionnaire de feedback périodique. »
- **D-10** accounts and the practitioner flow parked. They are the first phase.
- **D-13** `copy-context` as a product feature. The context assembler stays as code behind the
  prompts. The button leaves the console when `meal-improvement` ships.
- **D-19** the September patient page: challenges, the general feedback box, the weekly 0–5
  score, « Je vais manger / J'ai mangé ». None is in the stories. They leave `apps/web` when
  `patient-home-navigation` ships. The tables stay until a migration drops them.
- **D-20** the seed base of ~20 recipes as an open question. Closed by D-34 on 2026-10-23.
- **D-25** one Neon database for preview and production, and previews never migrate. D-36
  replaces it (2026-10-28).

### Standing from September

- **D-6** suggestions reach the patient with no manual gate. Story 28 agrees. The automated check
  is the compatibility gate of `eviction-safety`.
- **D-7** CIQUAL and her rules are the knowledge layer. Story 13 widens it (D-33).
- **D-12** text-only meals. Story 33 confirms it for story 28 (2026-10-27).
- **D-16** AI through the Vercel AI Gateway, cheapest capable model first, structured JSON output,
  every generation logged, safety checks in code after generation. EU-hosted inference later.
- **D-18** files through the files seam, Vercel Blob, EU region.

### New (2026-10-23)

26. **D-26 — Patient accounts.** E-mail and password on `apps/web`. The account is created once,
    from the practitioner's link or by the practitioner, and is the same account after
    activation (stories 1, 2, 22). The token link `[locale]/p/[token]` is retired by
    `patient-home-navigation`.
27. **D-27 — The practitioner space is `apps/admin`, with two roles.** `admin` is the REMI team
    (story 15's review list, story 3's logged access). `practitioner` sees only their own
    patients (stories 1, 3, 5, 6). Morgane holds both roles. About a dozen practitioners before the
    open day (Morgane, call of 2026-10-23).
28. **D-28 — One auth seam for both apps.** The adapter is Jamie's decision in
    `patient-signup-account`. Default: Neon Auth. The operator scrypt code of September is
    replaced, not extended.
29. **D-29 — Photos.** The menu photo of story 29 goes through the files seam (D-18) to a
    vision-capable model behind the gateway (D-16). The photo is stored with the entry and
    deleted with the patient (`.icm/docs/RETENTION.md`). Story 28 takes text only (story 33,
    D-12).
30. **D-30 — Story 30's priority order binds every generation and every suggestion.** In this
    order: 1 allergies, intolerances, total evictions and contra-indications; 2 the patient's
    declared diet and the practitioner's validated imperative recommendations; 3 foods to limit
    and other validated restrictions; 4 validated nutritional parameters (energy, macros,
    chrononutrition, fasting, foods to favour); 5 the main goal; 6 secondary goals. Missing data
    is « Non renseigné », never invented. A calculation is an « estimation » until validated.
    Only validated recommendations reach generation. Allergies, intolerances, evictions and diet
    declared by the patient apply at once and are signalled. Unknown composition is never
    presented as safe. No points, no badges, no periodic feedback questionnaire. Compatible
    validated recommendations apply together. The order decides only on a conflict. A conflict
    that involves a practitioner's recommendation is signalled to the practitioner. An unconfirmed
    allergen or a cross-contamination risk is never presented as safe, and the patient is invited
    to check the ingredients. Missing data is « Non renseigné » or asked for. A recipe or a
    suggestion whose composition is uncertain is not shown (`eviction-safety/compatibility-gate`).
    A menu dish of story 29 is listed as « Composition inconnue » and never suggested.
31. **D-31 — Four file statuses, one enum, one home.** « Dossier à compléter » →
    « Prêt pour consultation » → « Recommandations à valider » → « Accompagnement actif »
    (stories 5, 30). `patient-list-and-status` owns the enum. Every surface reads it.
    « Dossier à compléter » is story 5's label and the default of `patient-list-and-status`
    question 1. Story 30 says « inscription à compléter ».
    The status « Recommandations à valider » triggers on the first saved recommendation of any
    kind, food, goal, supplement or lifestyle advice, food recommendations foremost (Morgane, call
    of 2026-10-23).
32. **D-32 — Audit events.** A status change, a consent, a validated protocol version and a
    patient change after validation each write to `audit_events`, with who, when and what
    (stories 3, 19, 20, 21).
33. **D-33 — The term base.** CIQUAL covers foods and nutrients. Story 13's compounds and
    families (polyphenols, I3C, phytoestrogens, oxalates, purines, histamine, crucifers, FODMAP
    sources) need a terms-and-associations table with a provenance and a confidence level per
    row, seeded from sources Morgane names and validated by her. An association that is not in
    the table does not exist (story 13: « REMI ne génère aucune association aliment–composé
    absente de sa base validée »).
34. **D-34 — Template recipes, not pure generation.** REMI generates every recipe from a
    verified template recipe. It never generates a recipe from nothing. The template base holds
    more than twenty recipes. Only a verified template feeds generation. The generated recipe
    still passes the compatibility gate (story 24, D-30). Jamie decided this on 2026-10-23 and
    removed the question from the list for Morgane. It closes D-20 and the September question
    « une base de ~20 recettes comme canevas, ou génération pure contrôlée ? ». `recipe-space`
    says where the templates live and who writes them.
35. **D-35 — The genotype table.** The reference table of « Recommandations alimentaires.docx »
    (24 October 2026: 28 genotype rows and DEFAULT, with an orientation, three ranges and a
    « Validation médicale » mode each) is the one lookup behind
    `macroProfile()`. `genotype-macro-split/genotype-reference-table` holds it as data with a test
    per row. Until Morgane validates the laboratory mapping (story 4, question 3) the lookup
    returns DEFAULT for every trio. No row is derived from a nearby one.
36. **D-36 — Two Neon projects, and UAT on `admin` and `app`.** Production's project serves
    production only. The UAT project's default branch serves `uat` and is the base of previews.
    A preview migrates only on its own Neon branch. The admin `uat` build migrates the base.
    Production migrates in `promote.yml` only. `admin` and `app` have the custom environment
    `uat`. `marketing` and `documentation` follow `main`. The UAT Neon project is `uat-remi-ai`.
    No Actions variable names a Vercel project or a Neon project: the blueprint finds them
    (house `blueprint-uat-several-projects`). Until it does, `promote.yml` migrates production
    and its promote step fails, Jamie then promotes `admin` and `app` by hand, and a pull request
    with a migration gets no migrated preview. Jamie decided this on 2026-10-28
    (`triage/set-up-uat-environment`). It replaces D-25.
37. **D-37 — `remiai.be` is the only domain, and `marketing` has `uat`.** Jamie retired
    `remi-ai.tech` on 2026-11-03 and said on 2026-11-17 that it is discontinued. Each address
    is under `remiai.be`: `.icm/environments.md` has the table. This amends D-36: `marketing`
    has the custom environment `uat` at `https://uat.remiai.be`, and it follows `main`.
    Production of `marketing` also follows `main`: each merge moves it, with no promotion.
    `documentation` has no `uat` and follows `main`. The bare domain redirects to
    `https://www.remiai.be`: `triage/marketing-canonical-www` chooses the primary address.

## Material beside the stories

Morgane filed these in the Drive `remi-ai/` root between 23 and 25 October 2026. None is a story.
Each one answers a question a breakdown asks, or is reference for a build. The story and D-30 win
where one differs.

| File                                                                                                     | Read by                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| « Genotyp Tabs.xlsx », « Genotyp Last version .xlsx »                                                    | `genotype-macro-split` (the table, informative beside the story's own)                                                                                                                                                               |
| « Recommandation alimentaire.docx », « Recommandations alimentaires.docx »                               | `bmi`, `protein-needs`, `energy-needs`, `genotype-macro-split`. The 24 October version carries the complete 28-row genotype table and the definition of « Validation médicale »                                                      |
| « Calendrier fruits et légumes de saison.xlsx »                                                          | `recipe-space` (the season table, question 2)                                                                                                                                                                                        |
| « Résumé du Livre du Docteur Mouton.docx »                                                               | `genotype-macro-split` (the biology behind the table, never a rule)                                                                                                                                                                  |
| « Prompt.docx », `01-weekly-planner.md`, `02-single-meal.md`                                             | `recipe-space`, `meal-improvement` (the v1 prompts, reference for tone and structure)                                                                                                                                                |
| « Questions pour Morgane — user stories REMI — 23 octobre 2026 »                                         | every breakdown. Her answers return to the breakdowns in the pull request that acts on them                                                                                                                                          |
| The e-mail thread « REMI & Fagron \| contact », 3 to 24 September 2026 (Gmail, label `projects/remi-ai`) | `preparatory-questionnaire`, `genotype-macro-split`. Fagron NutriGen is a candidate laboratory, not decided. Its sample reports show what a laboratory report looks like. The laboratory choice is `genotype-macro-split` question 6 |

## Milestones

Two fixed points from the direction letter: **FunMedDev's team tests on 1 December 2026** and
**the open day is 19 December 2026**. Jamie keeps the horizon at 19 December (2026-10-23). The
dates below are derived backwards, one person, agents in parallel where the epics allow it. Jamie
is on site for another client from 2 to 6 November. The September plan assumed one stub a day
(D-15). Twenty-nine epics are more than one stub a day fits before 1 December, so Jamie asked
Morgane what 1 December must show. She answered on the call of 2026-10-23 (recorded by Jamie,
2026-11-01): **as much as possible, and at the least working accounts and the protocol in its
simplest form**, phases 1 and 2. The P0 set follows that answer. A missed date
is reported on the Friday call, not absorbed.

| By          | Phase                                                                                                  | Epics                                                                                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 14 November | **1 — The file.** A practitioner creates or receives a patient, reads the file, sees the calculations. | `patient-signup-account`, `consent-and-data`, `patient-file-creation`, `preparatory-questionnaire`, `patient-list-and-status`, `patient-file-view`, `bmi`, `protein-needs`, `energy-needs`, `genotype-macro-split` (its place is the pull request's question 1) |
| 21 November | **2 — The protocol.** The practitioner writes the recommendations REMI will apply.                     | `food-directives`, `eviction-safety`, `knowledge-base-requests`, `priority-goals`, `lifestyle-advice`, `supplement-interventions`, `meal-structure`, `intermittent-fasting`                                                                                     |
| 26 November | **3 — Activation and the patient's space.** The patient signs in and reads.                            | `care-activation`, `protocol-versions`, `patient-change-signals`, `patient-access`, `patient-home-navigation`, `patient-recommendations`                                                                                                                        |
| 1 December  | **4 — Recipes and the suggestion.** REMI proposes. FunMedDev's team tests.                             | `recipe-space`, `recipe-card`, `shopping-list`, `meal-improvement`, `practitioner-daily-recipes`                                                                                                                                                                |
| 12 December | **Freeze.** Fixes only until the open day.                                                             | triage                                                                                                                                                                                                                                                          |
| 19 December | **5 — Open day.** The bonus if time allows.                                                            | `restaurant-menu`                                                                                                                                                                                                                                               |

`recipe-space/ai-gateway-adapter` does not wait for phase 4. It starts beside phase 1, so the
model has a slot on day one of phase 4 and the prompts are proven on real protocols before then.

## Open points are deliberate

Every breakdown carries `### Questions for Morgane` and `### Questions for Jamie`, numbered, each
with a default. A session that starts a stub asks them in the pull request before Spec approved
and builds on no guess. The questions of the 23 October call are collected in French in the
client's Drive folder. Her answers return to the breakdowns in the same pull request that acts on
them.

Jamie and Morgane went through that agenda on the call of 2026-10-23. The call's Gemini notes
hold no usable transcript, so Jamie recorded her answers on 2026-11-01, under « Questions for
Morgane » of each breakdown they touch. The answers that bind every epic:

- 1 December shows as much as possible, and at the least working accounts and the protocol in
  its simplest form.
- About a dozen practitioners before 19 December.
- The patient space is in French only.
- REMI's e-mails show « REMI » as the sender, from no-reply@mail.jamienisbet.com until
  remiai.be is verified in Resend.
- « Recommandations à valider » triggers on the first saved recommendation of any kind.

A question the call did not touch keeps its default.

## Where the previous backlogs went

- **September 2026, dropped on 2026-10-23:** `ai-assist`, `beyond-december` and the open rest of
  `patient-loop` sit in [`_done/`](_done/), every stub and breakdown with a `> Dropped:` line.
  The stories cover their ground differently: the gateway adapter is `recipe-space`'s first stub,
  meal suggestions are `meal-improvement`, recipe generation is `recipe-space`, accounts are
  `patient-signup-account`, the practitioner space is D-27, the menu photo is D-29, export and
  send-link are inside `care-activation` and `patient-access`. Genotype is inside
  `preparatory-questionnaire` (story 4), with the laboratory mapping as a blocker.
- **Shipped in September:** `patient-record`, `patient-surface`, `nutrition-knowledge`,
  `practitioner-workflow`, the shipped part of `patient-loop`, in `_done/`. Their tables and
  screens are the ground the stories rebuild on. A breakdown says what it keeps.
- **August 2026:** the numbered REMI-NNN tickets, purged on 28 August. Git history holds them.

## Four facts that keep getting re-invented

1. **There is no signed pilot.** ~15 practitioners is a beta recruitment target.
2. **There is no billing date and no revenue.** The « 24,50 € » was fixture data.
3. **The database is Neon.** Settled 27 August 2026, connected.
4. **The stories are the spec.** Every older document (the braindump, the feedback of 10
   September, the 11 September call) is context. Where one disagrees with a story, the story
   wins. The precedence table in [`.icm/docs/README.md`](../docs/README.md) is updated by the
   pull request that merges this file.
