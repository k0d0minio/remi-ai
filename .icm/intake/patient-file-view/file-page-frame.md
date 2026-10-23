# Stub: A practitioner opens any of their files, complete or not, and sees every answer or « Non renseigné »

- feature-slug: file-page-frame
- epic: patient-file-view
- story: 6
- sequence: 1 of 5
- depends-on: none
- complexity: high
- priority: P0

## Problem

Story 6: the practitioner must « préparer la consultation en un coup d'œil » and « savoir
précisément ce qui manque ». The current page is built around September's loop, not the
questionnaire, and fills nothing in the questionnaire's shape.

## Proposed change

Rebuild `(admin)/patients/[id]/page.tsx` (Jamie's question 1). Header: nom, prénom, the
status label, the appointment date. Top block: « Informations manquantes » in two lists,
obligatoires and facultatives, each item linking to its field. Then the questionnaire's
sections in its order, each field showing its value or « Non renseigné ». Then the sections
other epics add. The page opens for any file of this practitioner, from sign-up on.

## Acceptance criteria

- [ ] A file at « Dossier à compléter » or an incomplete self-registration opens without error
- [ ] Every empty field shows « Non renseigné ». No field shows a computed or default value
- [ ] The missing list separates mandatory from optional and links each item to its field
- [ ] The status label and the appointment date are in the header
- [ ] A URL to another practitioner's file returns not found
- [ ] Every saved answer of the questionnaire is on the page, in the questionnaire's order
- [ ] The page renders on a tablet width without horizontal scroll

## Out of scope

- Editing (next stubs). The protocol sections of other epics.

## Notes

- D-30, D-31. cross-epic: `preparatory-questionnaire/questionnaire-fields` (the fields), `patient-file-creation/care-relationship` (the scope), `patient-list-and-status/file-status-enum` (the label).
- The anamnesis and the living summary move below the questionnaire as collapsed sections, per Morgane's question 1.
