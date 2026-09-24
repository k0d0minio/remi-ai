# Plan: general-feedback

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Schema and migration** — `packages/services/src/db/schema.ts` (`patient_messages`: patient
   id with cascade on patient delete, `author` `patient | practitioner`, `body`, `sent_at`,
   `read_at` nullable, `operator_id` nullable → operators, an index on `(patient_id, sent_at)`) and
   a generated migration under `packages/services/src/db/migrations/` (load the
   `database-migration` skill; the journal is shared with `patient-documents-and-links`, which may
   merge first — D-33) — done when: the migration is generated from `schema.ts`, checked in, and
   `Migration order` is green.
2. **Service** — `packages/services/src/db/services/patient-messages/` + `db/models/patient-message.ts`,
   exported from the server entrypoint: `sendPatientMessage` (patient, 1–2000 trimmed), `replyToPatient`
   (operator id; marks every earlier unread patient message read in the same transaction),
   `markPatientMessageRead`, `listPatientMessages` newest first, `countUnreadPatientMessages`, a
   per-patient unread map for the list — modelled on `meal-entries` (`countMealEntriesAwaitingFeedback`)
   — done when: in-memory tests cover the length rule, reply-clears-earlier, mark-read, and ordering.
3. **Link** — `apps/web/lib/patient-link/{segments,load,actions,write}.ts` (the `messages` segment,
   always visible like `repas`; load the thread + last-sent date + replying operators' names; one
   server action through the link-writes path, rate-limited, `written_by: patient`, audited),
   `apps/web/app/[locale]/p/[token]/messages/page.tsx`, `apps/web/components/patient-link/`
   (a message form + thread list; a home card on `page.tsx` beside the existing sections),
   `apps/web/lib/content/{fr,en,types}.ts` (her § 6 prompt verbatim in `fr` — D-30 — the last-sent
   line, errors) — done when: a message sent on the preview shows in the thread and on the home card's
   last-sent line; an empty or 2001-character body is refused.
4. **Console** — `apps/admin/components/patients/` (a messages card: thread, unread marks,
   « Marquer comme lu », reply form; a `working-messages` count beside `working-meals`), wired into
   `apps/admin/app/(admin)/patients/[id]/page.tsx` (section + working view), the badge on
   `apps/admin/app/(admin)/patients/page.tsx` beside the challenge badge, and the reply / mark-read
   wording in `apps/admin/components/audit/vocabulary.ts` — done when: every console criterion is
   observable on the admin preview and the reply shows on the link under the operator's name.
5. **Retention** — `.icm/docs/RETENTION.md` — done when: `patient_messages`, its patient-written
   rows, the cascade and the audit residue are described.

## Risks

- Reply and mark-read not atomic: a reply stored while earlier messages stay unread (or the
  reverse). Signal: the service test for reply-clears-earlier passes without a transaction.
- The segment hidden when empty (`visibleSegments` filters by data): the first message cannot be
  written. Signal: `/p/<token>/messages` 404s for a patient with no messages.
- Migration journal collision with `patient-documents-and-links`. Signal: `Migration order` red after
  merging `main`; renumber per the `database-migration` skill, never hand-edit `idx`.
- The prompt paraphrased in `fr`. Signal: the string differs from D-30 by a character.
