# Stub: The console no longer shows the September challenges

- lane: tweak
- found-by: the UAT audit of uat-admin.remiai.be · 2026-11-12
- complexity: medium
- priority: P2

## Problem

D-19 puts challenges outside the stories. The console still shows them:

- `apps/admin/app/(admin)/patients/page.tsx:64` gives the patient list the status label « Challenge acquis ».
- `apps/admin/components/patients/challenge-section.tsx`, `challenge-status.tsx` and `challenge-history.tsx` render on the patient page.
- The challenge actions are in `apps/admin/lib/patients/actions.ts`.

Two dropped stubs found faults in this section: `challenge-start-closes-unseen-challenge` and `challenge-writes-double-submit`.

## Proposed change

Remove the challenge section, its status label and its actions from the console. Keep the `patient_challenges` table, as D-19 says.

## Acceptance criteria

- [ ] The patient list shows no « Challenge acquis » label.
- [ ] The patient page shows no challenge section.
- [ ] No console action writes to `patient_challenges`.
- [ ] The `patient_challenges` table and its rows stay.

## Notes

D-19 names `apps/web` only. The removal from the console is an inference from « None is in the stories ». Jamie confirms it before the build: this is why `complexity` is `medium`.
