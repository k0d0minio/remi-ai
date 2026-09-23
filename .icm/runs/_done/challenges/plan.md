# Plan: challenges

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Schema and migration** — `packages/services/src/db/schema.ts` (`patient_challenges`, the
   partial unique index on the patient where `closed_on` is null, cascade on patient delete) and a
   generated migration under `packages/services/src/db/migrations/` (load the `database-migration`
   skill; the journal is shared with `patient-documents-and-links` and `general-feedback`, which
   are sequenced after this run) — done when: the migration is generated from `schema.ts`, checked
   in, and `Migration order` is green.
2. **Service** — `packages/services/src/db/services/patient-challenges/` + model: create (refuses a
   future `started_on`), edit current, close with outcome, close-and-create in one transaction,
   patient taps (`acquired`, `ready_for_next`) as toggles with the sequential rule and the clear
   cascade, refusal on a closed challenge, reads (current, past newest first, per-patient state for
   the list); `listPatients` gains the challenge signal — done when: the in-memory tests cover every
   rule in the spec's service criterion.
3. **Link** — `apps/web/lib/patient-link/{load,actions,write}.ts` (load the current challenge; two
   server actions through `writeThroughPatientLink`), `apps/web/components/patient-link/` (the
   challenge card with its two sequential taps and the empty state), the home page order
   (challenge → goals → consigne; the section always renders), `apps/web/lib/content/{fr,en,types}.ts`
   (the new copy and the consigne relabel) — done when: a tap on the preview persists, toggles, and
   a closed or foreign challenge is refused as not-found.
4. **Console** — `apps/admin/components/patients/` (a challenges section: current with state, edit,
   close with the pre-selected outcome picker, create-with-close form, past list) wired into
   `apps/admin/app/(admin)/patients/[id]/page.tsx` beside « Objectifs », the `working-view`
   current challenge + awaiting item, and the badge on `apps/admin/app/(admin)/patients/page.tsx` —
   done when: every console criterion is observable on the admin preview.
5. **Retention** — `.icm/docs/RETENTION.md` — done when: the table, its patient-written columns,
   the cascade and the audit residue are described.

## Risks

- The one-open-challenge rule held only in code: two concurrent creates both succeed. Signal: no
  partial unique index in the migration. The database must enforce it.
- Close-and-create not atomic: a failed create leaves the patient with no challenge and a closed
  one. Signal: the service test for a failing second half passes without a transaction.
- The consigne relabel missed in `en` or in `types.ts`, or `body` leaking as a fallback. Signal: the
  instruction card still reads « challenge ».
- Migration journal collision with a later run in the same epic. Signal: `Migration order` red after
  merging `main`; renumber per the `database-migration` skill, never hand-edit `idx`.
