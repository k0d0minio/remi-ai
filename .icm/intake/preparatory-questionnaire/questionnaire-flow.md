# Stub: A patient fills the questionnaire in steps, it saves on every change, and the file becomes ready

- feature-slug: questionnaire-flow
- epic: preparatory-questionnaire
- story: 4
- sequence: 2 of 5
- depends-on: questionnaire-fields
- complexity: high
- priority: P0

## Problem

No questionnaire exists. The token link's « Mon profil » edits seven fields with a save
button. Story 4 needs sections, autosave, resume, mandatory marks and the status flip.

## Proposed change

Add `apps/web/app/[locale]/questionnaire/` behind the patient session. Sections: Profil,
Consultation, Alimentation, Santé, Génétique (gate only here, detail in `genotype-section`),
Question du praticien. Each change saves at once through a server action. Reopening lands on
the first incomplete section. Mandatory fields carry a mark and a list at the top. Taille and
poids accept plausible numbers only. Diet is a radio group. Motif and date de consultation are
asked. When every mandatory field, including the explicit allergy and intolerance answers, is
saved, the flow calls `setFileStatus(ready)`.

## Acceptance criteria

- [ ] Each field saves on change. There is no « Enregistrer » button
- [ ] Leaving and returning lands on the first incomplete section with every answer kept
- [ ] Sexe, taille, poids actuel, niveau d'activité and motif de consultation are marked mandatory. The top list names the missing ones
- [ ] Taille accepts 100 to 250 cm and poids 25 to 300 kg. Other values are refused with a message
- [ ] The four activity levels show their French description from the shared module
- [ ] Diet is a single-choice radio group with « Aucun régime particulier » selected by default and « Autre » opening a note
- [ ] The file becomes « Prêt pour consultation » when the last mandatory field is saved, and not before
- [ ] An empty field stays empty. No default value is written for an unanswered question
- [ ] Every saved answer is visible on the practitioner's file at once
- [ ] The flow works on a phone screen

## Out of scope

- The allergen lists' detail and the genotype lists (next stubs). The calculations' display.

## Notes

- D-30, D-31. cross-epic: `patient-list-and-status/file-status-enum`, `patient-file-creation/appointment-date` (the date column), `consent-and-data/genetic-consent-and-optional-data`.
- Médicaments and compléments stay free text, optional.
