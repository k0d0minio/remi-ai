# Stub: A practitioner creates and completes a patient's whole file from the console, without an invitation

- feature-slug: practitioner-creates-file
- epic: patient-file-creation
- story: 1
- sequence: 3 of 5
- depends-on: care-relationship
- complexity: medium
- priority: P0

## Problem

A patient who did not follow the link arrives at the consultation without a file. Story 1:
the practitioner « doit pouvoir créer et compléter intégralement le profil d'un patient depuis
son espace praticien, exactement comme si le patient s'était inscrit lui-même ».

## Proposed change

Rework `(admin)/patients/new` and the file's edit mode to use the same questionnaire fields
as the patient (`preparatory-questionnaire/questionnaire-fields`). The practitioner saves at
any point. Missing fields are listed. No e-mail goes out. Entering an e-mail that already
belongs to one of their patients opens that file instead of creating a second one. The new
file's status is « Dossier à compléter » until every mandatory field is filled.

## Acceptance criteria

- [ ] « Nouveau patient » offers every questionnaire field, in the questionnaire's order
- [ ] The file saves with missing fields. The missing ones are listed on the file
- [ ] No invitation or activation e-mail is sent on creation
- [ ] An e-mail already on one of this practitioner's files opens that file with « Ce dossier existe déjà »
- [ ] The file is created with `practitioner_id` set to the creator
- [ ] The status is « Dossier à compléter » until the mandatory fields are filled, then « Prêt pour consultation »
- [ ] The practitioner opens any file of theirs and edits any questionnaire field at any time, a missing one included
- [ ] The three genotype fields stay locked in the console until the patient's genetic consent is `given` (Morgane's question 5)
- [ ] Creation and each save write an audit event

## Out of scope

- The field definitions and their validation rules (`preparatory-questionnaire`).
- The patient's later takeover (next stubs).

## Notes

- cross-epic: `preparatory-questionnaire/questionnaire-fields` (the schema), `patient-list-and-status/file-status-enum` (the status).
- Reuses the console's existing bulk-entry form components where they fit.
- Jamie accepted the defaults of the pull request's questions on 2026-11-03:
  1. `file-status-enum` shipped first (k0d0minio/remi-ai#170). This build calls `markReadyWhenComplete`, which calls `setFileStatus(ready)`.
  2. Mandatory: sexe pour le calcul, taille, poids, activité, motif, and an explicit answer on allergies and on intolerances.
  3. The free-text objectif, régime, allergies and intolérances leave the form. The form shows them read-only when set.
  4. One « Enregistrer » button, no save per change.
  5. The same e-mail on another practitioner's file creates a new file.
  6. The audit event of a save names the changed fields and holds no value.
