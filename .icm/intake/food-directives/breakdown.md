# Breakdown: food-directives — « À favoriser », « À limiter », « Éviction totale » in one line each

- epic-slug: food-directives
- source: story 13 « Aliments, nutriments et composés alimentaires à favoriser, à limiter ou à exclure », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1cWkwKZR1zaMHAxlAwOD75JKB8Y-UxHLl/view
- story: 13

## What I understood

The practitioner writes three free-text lines on the patient file: « À favoriser », « À limiter », « Éviction totale ». Each line splits on « ; » into terms. A term is a food, a nutrient, a micronutrient, a bioactive compound or a food family. REMI checks each term against a validated base, shows the official name, offers a correction the practitioner must accept, and flags an unknown or uncertain term. An unknown term is never validated and opens « Demander l'ajout » (story 15). The same term in « À favoriser » and « Éviction totale » blocks the save. An eviction needs a period or a durable status (story 14). Only validated directives reach recipes and suggestions (stories 19 and 20).

On main, `foods` and `food_nutrients` hold CIQUAL: foods and their nutrient values. CIQUAL has no polyphenols, I3C, phytoestrogens, oxalates, purines, histamine or food families. A new terms-and-associations base, with provenance and a confidence level per association, is this epic's first stub. The `nutrition` category of `patient_recommendations` carried this kind of directive as prose. The three fields replace it for new entries. This epic rests on D-27, D-30 and D-32. It supersedes the `nutrition` recommendation category as the home of food directives.

At launch the base holds CIQUAL only. Seven of the nine example consignes in the story (polyphénols, composés soufrés, phytoœstrogènes, I3C, oxalates, purines, fibres solubles) resolve « non reconnu » until Morgane's sources are loaded and validated through `knowledge-base-requests` (question 1 and question 5). A directive whose term carries a preparation note (the I3C example) passes the note to generation (`directive-application`). « Validé » has two meanings here. A term is validated in the base (`term-base`). A directive reaches recipes when the practitioner validates the protocol version (story 20, `directive-application`). The practitioner validates no single directive.

### Questions for Morgane

1. Who supplies the first associations for the terms CIQUAL does not cover (polyphénols, I3C, phytoœstrogènes, oxalates, purines, histamine, familles alimentaires)? Default: you name the sources, Jamie loads them as draft, you validate them in the admin.
2. « À limiter » applies « conformément au niveau de limitation défini ». The story names no levels. Which levels? Default: two, « réduire » and « rare ».
3. Do your existing « nutrition » recommendations move into the three fields, or stay as text under « Autres recommandations » (story 23, category 5)? Default: they stay as text. The three fields start empty.
4. Can a directive be saved as a reusable template, as the protocol templates are today? Default: no, per patient only in the MVP.
5. By when do you name and validate the sources for the compounds, so that your example consignes work on 1 December? Default: before phase 2 starts on 14 November.

Morgane answered on the call of 2026-10-23 (recorded by Jamie, 2026-11-01): 1. Yes: she names the sources, Jamie loads them as draft, she validates them in the admin. 5. Before 14 November.

### Questions for Jamie

1. Term matching: normalised exact match with a synonym table, or an embedding search? Default: normalised exact match and synonyms, no model.
2. Where does the directive editor live? Default: the console patient page, in the protocol section, beside the supplements.

## Build order

1. term-base — the validated terms and their food associations, seeded from CIQUAL, with provenance and confidence — depends-on: none
2. directive-fields — the three fields, the « ; » split, the directive rows with period or durable status, the favour-and-exclude block — depends-on: term-base
3. directive-resolution — official names, accepted corrections, unknown and uncertain flags, the « Demander l'ajout » hook — depends-on: directive-fields
4. directive-application — the validated directives as one read model for every generation and check — depends-on: directive-resolution

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                                                         | Stub                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | « Chaque élément séparé par “;” est traité comme une entrée distincte »                                                                                              | directive-fields                                                        |
| 2   | « Un élément reconnu s'affiche avec sa dénomination officielle ; une correction proposée doit être acceptée par le praticien »                                       | directive-resolution                                                    |
| 3   | « Un élément inconnu est signalé visiblement et n'est jamais considéré comme validé. Un bouton “Demander l'ajout” apparaît… »                                        | directive-resolution, knowledge-base-requests/request-record            |
| 4   | « Un terme dont l'association alimentaire est incertaine est signalé comme tel, jamais validé silencieusement »                                                      | directive-resolution                                                    |
| 5   | « Le praticien peut ajouter, modifier ou désactiver un élément à tout moment »                                                                                       | directive-fields                                                        |
| 6   | « “À favoriser” influe sur la priorité… ; “À limiter” sur leur quantité ou fréquence ; “Éviction totale” prime sur les deux autres »                                 | directive-application                                                   |
| 7   | « Un même élément présent à la fois dans “À favoriser” et dans “Éviction totale” : REMI bloque l'enregistrement »                                                    | directive-fields                                                        |
| 8   | « Une éviction totale ne peut pas être enregistrée sans période d'application ou statut d'exclusion médicale durable »                                               | directive-fields                                                        |
| 9   | « Les recommandations ne sont appliquées aux recettes et suggestions qu'après validation par le praticien »                                                          | directive-application                                                   |
| 10  | « Le praticien peut saisir indifféremment un aliment, un nutriment, un micronutriment, un composé bioactif ou une famille alimentaire dans chacun des trois champs » | directive-fields                                                        |
| 11  | « REMI relie la consigne aux sources alimentaires documentées, sans considérer comme équivalentes des traces et des concentrations significatives »                  | term-base                                                               |
| 12  | « REMI ne génère aucune association aliment–composé absente de sa base validée ; un élément incertain est signalé et peut faire l'objet d'une demande d'ajout »      | term-base, directive-resolution                                         |
| 13  | « Une éviction totale ne peut être présentée comme garantie lorsque les données… sont insuffisantes »                                                                | eviction-safety/compatibility-gate                                      |

## Out of scope

- The compatibility check itself (eviction-safety).
- The admin review of a requested term (knowledge-base-requests).
- Free text or dictation turned into rows by a model.
- A therapeutic effect attached to a compound. REMI recognises I3C and DIM as terms and attributes no effect.
