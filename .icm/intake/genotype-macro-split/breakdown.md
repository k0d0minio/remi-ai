# Breakdown: genotype-macro-split — the daily macronutrient split, from the genotype or by default, under the practitioner's hand

- epic-slug: genotype-macro-split
- story: 10
- source: story 10 « Répartition des macronutriments selon le génotype », Morgane Paquet, 23 October 2026, https://drive.google.com/file/d/1gs7fTU8mTl5G0_Am5_n-dr1fMdDFVOv8/view (Drive `remi-ai/` root, filed after the first cut), with « Recommandations alimentaires.docx » (24 October 2026, the procedure with the complete 28-row table and the definition of « Validation médicale »), « Genotyp Last version .xlsx » (24 October 2026) and « Résumé du Livre du Docteur Mouton.docx » (24 October 2026) as reference

## What I understood

REMI proposes the daily split of carbohydrates, fats and proteins that recipe generation
follows. Without a genotype the split is « Méditerranéen équilibré »: 45 % glucides, 30 %
lipides, 25 % protéines. With the three genotypes (APOE, DIO2, AMY1A) REMI finds the row of the
story's reference table and proposes its three ranges with the food orientation. The column
« Validation médicale » decides how the proposal applies. « Oui »: the practitioner must confirm
it, and REMI recalls that a nutrigenetics doctor's confirmation is recommended for extreme
profiles. « Selon praticien »: the practitioner decides explicitly. « Non »: the proposal applies
directly. E2/E4 (« Inclassable ») proposes no carbohydrates and no fats. The practitioner types
them. Proteins stay 20 to 25 %. A combination absent from the table gets DEFAULT and a flag.
The practitioner sees a summary (besoins énergétiques, protéines g/j, glucides %, lipides %,
protéines %) with « Modifier » on each value. The calculation detail stays hidden by default.
The proportions hold over the day, never per dish. The values are stored with the food
recommendation and validated at the protocol's final validation (story 20). Only validated
values reach generation.

On `main` nothing stores a genotype or a split. `preparatory-questionnaire/genotype-section`
stores the three genotypes and exposes `macroProfile()`, which returns DEFAULT until Morgane
validates the laboratory mapping (story 4, question 3). This epic owns the reference table that
function reads, the proposal in the « Calculs » slot (`patient-file-view/calculations-summary-slot`),
and the read in generation (`recipe-space/weekly-plan-generation`). Story 4's rule stands: no
partial genetic calculation. The Mouton summary explains the biology. The table is the whole
rule. This epic rests on D-30, D-32 and D-35.

The procedure of 24 October adds four rules the story of 23 October does not carry. The table
has 28 genotype rows: it adds E2/E3 · H · M and E3/E4 · A · M, the two rows the book omits and
the summary resolves by analogy. The proportions are landmarks and need not total 100 %. REMI
normalises nothing. « Oui » means a risk profile: REMI shows the proposal and requires the
practitioner's confirmation, recorded with its date, before it applies. The genotype comes from
the patient, or later from the laboratory's API, outside the MVP. The summary adds one more: when
the validated protein target in g/day and the protein percentage of the split disagree, REMI
shows the conflict to the practitioner and settles nothing alone.

### Questions for Morgane

1. The story's table of 23 October has 26 genotype rows. The procedure « Recommandations alimentaires.docx » of 24 October has 28: it adds E2/E3 · H · M (as H/H) and E3/E4 · A · M (as A/H). Is the 24 October table the reference? Default: yes, 28 rows. The spreadsheet's index ranges are informative.
2. « Profils extrêmes » for the nutrigenetics reminder: which rows? Default: every row with « Validation médicale = Oui ».
3. Story 4's question 3 (the A/H/M mapping against the laboratories' reports) still stands. Until you validate it, does REMI apply the table? Default: no. The table is loaded and tested. The lookup returns DEFAULT until you confirm the mapping.
4. The summary shows « Besoins énergétiques 1 850 kcal/j » and « Protéines 90 g/j » beside the three percentages. Are those the validated targets of stories 8 and 9, or the estimates? Default: the validated targets when they exist, else the estimates labelled « Estimation ».
5. The Mouton summary uses LCT/MCM6 for lactose vigilance (its CAS D). Story 4 collects APOE, DIO2 and AMY1A only. Collect LCT/MCM6 in the MVP? Default: no. Lactose stays an allergy, an intolerance or an eviction the practitioner writes.

### Questions for Jamie

1. Where does the split live? Default: a `macro` kind in `patient_calculations` (`bmi/calculations-table`), the ranges and the orientation in `estimate_parameters`, the practitioner's values in `validated_value` and `validation_parameters`.
2. Validation: through the protocol version (story 20) or its own « Valider »? Default: the protocol version. « Modifier » edits the working copy of `protocol-versions/working-copy-and-validate`.
3. Where in the order? Default: after `energy-needs`, as the fourth calculation.

## Build order

1. genotype-reference-table — the table as data with a test per row, the lookup behind `macroProfile()`, DEFAULT and the flag for an absent combination — depends-on: none
2. macro-split-proposal — the summary in the « Calculs » slot, « Modifier » per value, the three validation modes, E2/E4 — depends-on: genotype-reference-table
3. macro-split-in-generation — generation reads the validated split only, over the day, proteins in g/day and in % — depends-on: macro-split-proposal

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                              | Stub                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | « Un patient sans génotype reçoit la répartition par défaut 45 / 30 / 25 »                                                                | genotype-reference-table                                         |
| 2   | « Un patient avec génotype reçoit des valeurs comprises dans les fourchettes de sa ligne de référence »                                   | genotype-reference-table, macro-split-proposal                   |
| 3   | « combinaison absente de la table … répartition par défaut et le signale au praticien : aucune déduction n'est inventée »                 | genotype-reference-table, macro-split-proposal                   |
| 4   | « Validation médicale = Oui » … « pas appliquée tant que le praticien n'a pas confirmé » … rappel « médecin spécialisé en nutrigénétique » | macro-split-proposal                                             |
| 5   | « profil E2/E4 (« Inclassable ») … ni glucides ni lipides ; le praticien les saisit ; protéines 20–25 % »                                 | macro-split-proposal                                             |
| 6   | « Selon praticien » : « le praticien décide explicitement d'appliquer ou non »                                                            | macro-split-proposal                                             |
| 7   | « Chaque valeur du résumé … est modifiable par le praticien »                                                                             | macro-split-proposal                                             |
| 8   | « Les protéines sont présentées distinctement en g/jour et en pourcentage »                                                               | macro-split-proposal                                             |
| 9   | « Les proportions sont évaluées à l'échelle de la journée et ne sont pas imposées à chaque plat »                                         | macro-split-in-generation                                        |
| 10  | « Le praticien garde la décision finale ; le détail du calcul n'est pas affiché par défaut »                                              | macro-split-proposal                                             |
| 11  | « Un profil génotypique non reconnu ne donne lieu à aucune déduction inventée »                                                           | genotype-reference-table, rule: README (D-30)                    |
| 12  | « Les profils exigeant une validation médicale sont signalés comme tels »                                                                 | macro-split-proposal                                             |
| 13  | « Les valeurs modifiées sont prises en compte lors de la validation finale de la recommandation alimentaire »                             | macro-split-proposal, protocol-versions/working-copy-and-validate |
| 14  | « REMI utilise uniquement les valeurs validées pour générer les recettes personnalisées »                                                 | macro-split-in-generation                                        |

## Out of scope

- The genotype inputs and the gate (`preparatory-questionnaire/genotype-section`).
- The genetic consent (`consent-and-data/genetic-consent-and-optional-data`).
- The energy and protein values themselves (`energy-needs`, `protein-needs`). This epic shows them in the same summary.
- The LCT/MCM6 profile (question 5) and any orientation the Mouton summary describes beyond the table.
- The laboratory API that would fetch the genotype. The procedure of 24 October puts it outside the MVP.
