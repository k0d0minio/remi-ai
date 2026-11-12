# Stub: The journal names no actor on a patient's consultation date

- lane: bug
- found-by: the UAT audit, uat-admin.remiai.be/audit · 2026-11-12
- complexity: low
- priority: P1

## Problem

A patient fills the questionnaire from their link. The journal shows two events.
« statut du dossier changé » shows « Patient F3GK — depuis son lien ». « date de consultation
changée » (∅ → 2026-11-20) shows « compte supprimé ». Morgane reads this as a deleted account.

The questionnaire service records the date event with the audit actor that the caller passes
(`packages/services/src/db/services/patient-questionnaire/index.ts`). A caller that passes none
gives a row with the `operator` kind and no name and no email. The journal renders such a row as
« compte supprimé » (`apps/admin/app/(admin)/audit/page.tsx`).

The same screen prints the status event detail in raw English: « to_complete → ready: every
mandatory field is filled ». The console renders in French (`apps/admin/AGENTS.md` § Language).

## Proposed change

The service records a patient's own save in the patient's name when the caller passes no audit
actor. The journal renders a row with no actor id as « auteur non enregistré », not as
« compte supprimé ». The journal renders the status detail with the French file-status labels.

## Acceptance criteria

- [ ] A patient's save of the consultation date writes `patient.consultation_date_changed` with the `patient` actor kind, the patient's id and pseudonym, also when the caller passes no audit actor.
- [ ] A service test proves it.
- [ ] A journal row with no actor id, no name and no email reads « auteur non enregistré ».
- [ ] « statut du dossier changé » reads « Dossier à compléter → Prêt pour consultation : tous les champs obligatoires sont remplis ».
- [ ] No journal row in the database changes.
