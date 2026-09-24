# Build notes: general-feedback

- commits: 70139a5 schema + migration (regenerated as `0022` in the merge)  · 96ed8fd service + tests · d306325 link · 5a75e53 console + RETENTION
- ci: GREEN (draft tier) on c559969 — Format, lint, typecheck incl. 455 tests (14 new); full gate GREEN on e8ed21f with no preview (every head since the code landed was `.icm`-only against its parent, so `turbo-ignore --fallback=HEAD^1` skipped all six projects); re-settled after merging #123

## What changed

- `packages/services/src/db/schema.ts`, `migrations/0022_patient_messages.sql`: the one-thread table — `author` (`patient` | `practitioner`), `body`, `sent_at`, `read_at` (patient rows only), `operator_id` (`set null`), cascade on the patient, an index on `patient_id`.
- `packages/services/src/db/services/patient-messages/`: `sendPatientMessage`, `replyToPatient` (marks every unread patient message sent up to the reply read, in one transaction — D-32), `markPatientMessageRead` (idempotent; refuses her own replies), `listPatientMessages` (newest first, each reply with its operator's name), `countUnreadPatientMessages`, `listUnreadMessageCounts` (paged, for the roster). Tests written from the criteria.
- `packages/services/src/shared/audit.ts` + `apps/admin/components/audit/vocabulary.ts`: `message.sent` (patient), `message.replied`, `message.marked_read`.
- `apps/web`: the `messages` segment — always visible like Repas; `/p/[token]/messages` (composer, then thread); the home's `MessageCard` beside the meal invitation (D-31); `MessageComposer` renders her § 6 prompt once for both placements (D-30) with « Dernier message envoyé le … »; `sendMessageAction` goes through `writePatientLink` (token-only, ceilings, audit as the patient); fr/en copy.
- `apps/admin`: `MessageThread` (reply box, then the thread with « non lu » and « Marquer comme lu »), the Messages section in the Journal segment, a Messages card in the working view, the roster badge; `messagesAwaitingLabel` in `vocabulary.ts` is the one wording of the count.
- `.icm/docs/RETENTION.md`: `patient_messages` in the table, the attribution paragraph and the deletion list.

## Acceptance criteria status

- [x] `/p/[token]/messages` in the nav for every patient — `visibleSegments` pushes `messages` unconditionally; the page 404s through `loadPatientLink` like every segment.
- [x] Segment: her § 6 prompt verbatim (fr), box, send, thread newest first with dates.
- [x] Home card with the same prompt, box, send and « Voir vos messages ».
- [x] Sent through the link-writes path: `writePatientLink` → ceilings, token resolution, audit with the `patient` actor; stored with `author: patient` (the table's attribution column is `author`, per the spec's Proposed change, rather than a `written_by` column).
- [x] Empty / >2000 refused in the patient's language (`messages.errors.invalid_input`), nothing stored — service tests.
- [x] « Dernier message envoyé le <date> » on both placements once one exists; absent before.
- [x] Console thread newest first, « non lu » marks, « N message(s) attend(ent) une réponse ».
- [x] Reply stored with `practitioner` + operator id, audited, shown on the link under the operator's name.
- [x] Reply clears every earlier unread message; « Marquer comme lu » clears one and is audited; reading clears nothing — service tests.
- [x] Roster badge with the count; the working view (at-a-glance) shows the same count.
- [x] Cascade on the patient; RETENTION lists `patient_messages`.
- [x] No scheduler, cron, email or push.

## Notes for Release

- The Neon adapter's `transaction()` is a passthrough (`patient-link-writes` says so), so reply + mark-read is sequential rather than atomic in production; a failure between them leaves messages unread, never read without a reply. Same standing as `challenges`' close-and-create.
- The security gate blocked one commit on a test fixture literal (`error.log`); the literal was removed before anything was pushed.
- `main` was merged in before the flip (fef3101): `patient-documents-and-links` (#122) landed `0021_patient_documents` first, as D-33 expected. This branch's migration was deleted and regenerated on the merged tree as `0022_patient_messages` (CONVENTIONS → regenerate, never renumber); `check-migration-order` → safe. The other conflicts were both-sides additions (exports, audit actions, the link's segments and loader, the console's registry and sections, RETENTION) — kept both.
- `security-check.sh --branch` was BLOCKED on dependency-audit only (`main`'s 20 advisories) until `next-rce-dep-bump` (#123) merged; `main` merged in again, the branch gate with the audit → OK, `pnpm audit`: no high/critical.
- The admin preview build runs `db:migrate` against the shared Neon database and the preview guard is not in force there (`_shared/project-rules.md` → Deploy; `triage/previews-migrate-the-shared-database.md`), so the ready-phase admin preview may create `patient_messages` in the live database before the merge. The migration only adds a table, as `challenges`' did; forward-only, no rollback script (`migrations.reversible: false`).
