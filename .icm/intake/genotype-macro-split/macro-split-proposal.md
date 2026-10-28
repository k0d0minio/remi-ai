# Stub: The practitioner sees the proposed split, edits each value, and decides where the table requires it

- feature-slug: macro-split-proposal
- epic: genotype-macro-split
- story: 10
- sequence: 2 of 3
- depends-on: genotype-reference-table
- complexity: medium
- priority: P0

## Problem

A proposal the practitioner cannot see, edit or confirm is not usable. Story 10 asks for a
summary with « Modifier » on each value, three validation modes and the E2/E4 case.

## Proposed change

In the « Calculs » slot (`patient-file-view/calculations-summary-slot`) a row « Répartition des
macronutriments » shows five values: besoins énergétiques (kcal/j), protéines (g/j), glucides
(%), lipides (%), protéines (%), each with « Modifier ». The energy and protein values come from
`energy-needs` and `protein-needs` (Morgane's question 4). The orientation and the index show
beside them. The lookup detail opens on « Voir le détail » only. Mode `required`: the proposal
shows « À confirmer par le praticien » and « Confirmation par un médecin spécialisé en
nutrigénétique recommandée ». It applies nothing until the practitioner confirms. Mode
`practitioner`: a choice « Appliquer » / « Ne pas appliquer » the practitioner must make. Mode
`none`: the proposal is the working value. For E2/E4, glucides and lipides are empty fields the
practitioner fills. Protéines show 20 to 25 %. An absent combination shows DEFAULT with
« Combinaison absente de la table ». The practitioner's values go to the working copy of the
protocol (`protocol-versions/working-copy-and-validate`) and become validated at the protocol's
validation.

## Acceptance criteria

- [ ] The row shows the five values and « Modifier » on each. The lookup detail is hidden until « Voir le détail »
- [ ] A `required` row applies nothing until « Confirmer ». The nutrigenetics text is visible
- [ ] « Confirmer » records who confirmed and the date, as an audit event
- [ ] When the validated protein target in g/day disagrees with the protein percentage of the split, the row shows the conflict. REMI settles nothing alone
- [ ] A `practitioner` row applies nothing until « Appliquer » or « Ne pas appliquer » is chosen
- [ ] A `none` row is the working value at once
- [ ] E2/E4 shows empty glucides and lipides fields. The practitioner's values save. Protéines show 20 to 25 %
- [ ] An absent combination shows DEFAULT and « Combinaison absente de la table »
- [ ] Protéines show in g/day and in %. A change of one does not silently change the other
- [ ] Each value edit is stored in the working copy with who and when. Validation follows the protocol version
- [ ] The row shows « Estimation » until the protocol version is validated

## Out of scope

- The energy and protein calculations (`energy-needs`, `protein-needs`). Generation (stub 3).

## Notes

- D-30, D-32, D-35. Files: the patient file page in `apps/admin`, the calculations service.
- cross-epic: `patient-file-view/calculations-summary-slot`, `protocol-versions/working-copy-and-validate`, `energy-needs/calorie-target-validation`, `protein-needs/protein-target-validation`.
