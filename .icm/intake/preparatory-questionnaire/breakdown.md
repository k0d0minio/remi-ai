# Breakdown: preparatory-questionnaire — the patient fills the file before the consultation, and nothing is invented

- epic-slug: preparatory-questionnaire
- source: story 4 « Questionnaire préparatoire du patient », Morgane Paquet, 12 October 2026, https://drive.google.com/file/d/1ieLWd70_hoYoHqQlC6co3qTXyPhJ8Ewh/view
- story: 4

## What I understood

After sign-up the patient fills a questionnaire that saves on every change and resumes where
they left. Sections: identity (from sign-up), profile (sexe pour le calcul, taille, poids,
niveau d'activité on four NAP levels, poids souhaité), motif and date de consultation, diet as
radio buttons, allergies and intolerances as standard checkbox lists with four sub-lists and
« Tous », « Aucune connue » exclusive and distinct from empty, celiac disease in pathologies
with strict gluten exclusion, médicaments and compléments, the genotype gate (APOE, DIO2,
AMY1A, all three or DEFAULT 45/30/25, no partial calculation), and the practitioner's free
question. Mandatory: sexe, taille, poids, activité, motif, plus an explicit answer on
allergies and intolerances. When every mandatory field is filled the status becomes « Prêt
pour consultation ». On `main` the profile holds allergies and intolerances as free text and
has no activity level, no desired weight, no genotype, no pathologies. The patient edits a few
fields through « Mon profil » on the token link. This epic replaces that form. It rests on
D-26, D-30, D-31 and feeds the calculations (stories 7 to 9) and recipes (story 24).

### Questions for Morgane

1. Today's patients' free-text allergies and intolerances: do you redo them in the checkbox lists, or do they stay as « Autre » text until you correct them? Default: « Autre » text, you correct in the console.
2. Pathologies: a free-text field with a « Maladie cœliaque » checkbox, or a list? Default: free text plus the checkbox.
3. Who validates the A/H/M categories of DIO2 and AMY1A against the Fagron NutriGen report (the sample « NutriGen - Rapport Professional FR.pdf » of 24 September 2026), and by when? Default: you, before `genotype-macro-split` starts. Until then the genotype is stored and not used.
4. The practitioner's free question: one per practitioner, or several? Default: one.
5. « Date de consultation » here and « date de rendez-vous » on the file: the same date? Default: yes, one field.

### Questions for Jamie

1. Structured allergies and intolerances: rows in a `patient_allergens` table with the enum in code, or one JSONB column? Default: a table.
2. The three genotypes: three columns on `patient_profiles`? Default: yes.

## Build order

1. questionnaire-fields — the schema for every new field, migrated without loss — depends-on: none
2. questionnaire-flow — the patient's pages, autosave, resume, mandatory marks, plausibility, the status flip — depends-on: questionnaire-fields
3. allergy-intolerance-lists — the checkbox lists, the four sub-lists, « Tous », « Aucune connue », celiac — depends-on: questionnaire-flow
4. genotype-section — the gate, the three lists, DEFAULT, the reset — depends-on: questionnaire-flow
5. practitioner-free-question — one configurable question per practitioner — depends-on: questionnaire-flow

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                                                                                  | Stub                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | « Sexe, taille, poids actuel, niveau d'activité physique et motif de consultation sont obligatoires »                                                                                         | questionnaire-flow                                                                      |
| 2   | « Génotype, médicaments et compléments alimentaires sont facultatifs »                                                                                                                        | questionnaire-flow                                                                      |
| 3   | « Taille et poids n'acceptent que des valeurs numériques plausibles »                                                                                                                         | questionnaire-flow                                                                      |
| 4   | « Le patient peut quitter le questionnaire et le reprendre là où il s'est arrêté ; l'enregistrement est automatique »                                                                         | questionnaire-flow                                                                      |
| 5   | « Les champs non remplis restent vides : REMI n'invente aucune donnée »                                                                                                                       | rule: README (D-30), questionnaire-flow                                                 |
| 6   | « Les champs obligatoires sont clairement identifiés »                                                                                                                                        | questionnaire-flow                                                                      |
| 7   | « Les réponses sont visibles du praticien dès leur enregistrement »                                                                                                                           | questionnaire-flow (shown by patient-file-view)                                         |
| 8   | « Le statut du dossier passe à « Prêt pour consultation » dès que tous les champs obligatoires sont remplis »                                                                                 | questionnaire-flow (patient-list-and-status/file-status-enum)                           |
| 9   | « La question libre est configurable par praticien et apparaît dans le questionnaire de ses propres patients »                                                                                | practitioner-free-question                                                              |
| 10  | « Le patient peut modifier ses réponses »                                                                                                                                                     | questionnaire-flow                                                                      |
| 11  | « Le régime alimentaire peut être sélectionnés et modifiés par le patient »                                                                                                                   | questionnaire-flow                                                                      |
| 12  | « listes standardisées de cases à cocher … la saisie libre n'est disponible que via « Autre » »                                                                                               | allergy-intolerance-lists                                                               |
| 13  | « Les sous-listes de fruits à coque, poissons, crustacés et mollusques s'affichent automatiquement ; la sélection « Tous » est disponible »                                                   | allergy-intolerance-lists                                                               |
| 14  | « Les sous-catégories apparaissent uniquement lorsque la catégorie principale est cochée ; l'absence de précision entraîne l'exclusion de toute la catégorie »                                | allergy-intolerance-lists                                                               |
| 15  | « Le régime utilise des boutons radio »                                                                                                                                                       | questionnaire-flow                                                                      |
| 16  | « « Aucune allergie connue » et « Aucune intolérance connue » sont mutuellement exclusives … distinctes d'une absence de réponse »                                                            | allergy-intolerance-lists                                                               |
| 17  | « La question préalable sur les tests génétiques est facultative et les trois listes restent masquées tant que « Oui » n'est pas sélectionné »                                                | genotype-section                                                                        |
| 18  | « Chaque liste (APOE, DIO2, AMY1A) permet une seule sélection ; la personnalisation génétique exige trois résultats complets et une correspondance valide »                                   | genotype-section                                                                        |
| 19  | « Si la réponse est « Non / Je ne sais pas », si un résultat manque ou si aucune correspondance n'est valide, REMI conserve le profil DEFAULT (45 % glucides, 30 % lipides, 25 % protéines) » | genotype-section                                                                        |
| 20  | « Aucun calcul génétique partiel ; le patient peut terminer le questionnaire sans génotypes et les résultats non renseignés restent vides »                                                   | genotype-section                                                                        |
| 21  | « Les génotypes peuvent être modifiés et les propositions de macronutriments recalculées ; leur application reste soumise aux validations requises et à l'ajustement du praticien »           | genotype-section, genotype-macro-split/macro-split-proposal (story 10)                  |
| 22  | « Le patient doit répondre aux rubriques Allergies et Intolérances, y compris via « Aucune connue », avant le passage au statut « Prêt pour consultation » »                                  | allergy-intolerance-lists                                                               |
| 23  | « La sélection « Tous » bloque les sous-choix individuels ; la déclaration d'une allergie au blé est disponible séparément »                                                                  | allergy-intolerance-lists                                                               |
| 24  | « Le passage de « Oui » à « Non / Je ne sais pas » … réactive immédiatement DEFAULT et désactive l'usage des anciennes données »                                                              | genotype-section                                                                        |
| 25  | « La correspondance des catégories génétiques A/H/M avec les résultats des laboratoires doit être validée avant toute interprétation automatisée »                                            | not built: Morgane's validation (question 3). genotype-section stores, never interprets |

## Out of scope

- The calculations that read these fields (`bmi`, `protein-needs`, `energy-needs`).
- The genotype → macronutrient table and its use (`genotype-macro-split`, story 10, after Morgane's question 3).
- The consent texts (`consent-and-data`). This epic calls the genetic consent at the gate.
- The console's edit of the same fields (`patient-file-creation/practitioner-creates-file`, `patient-file-view/provenance-markers`).
