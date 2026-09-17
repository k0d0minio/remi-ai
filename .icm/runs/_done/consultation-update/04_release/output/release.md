# Release: consultation-update

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on `07ced9e` — the last code-bearing push, all six previews built — and re-established
  by `ci-status.sh` on the close-out head immediately before the merge
- pr: [#99](https://github.com/k0d0minio/remi-ai/pull/99) · merged: yes — squash `b16f080`, 2026-09-17
- code-review: high (spec complexity: complex) — 5 findings, all introduced by this diff, all fixed
  on the branch; see below
- production-readiness: run (the diff changes the storage adapter) — no new environment variable,
  no schema change and no migration, so `ENV.md` / `env.ts` / `turbo.json` / Vercel / Actions are
  untouched and there is no `down` to test. Registration is unchanged: `ensureDatabase()` per app,
  lazily at first use, guarded by `isDatabaseRegistered()`, loud when `DATABASE_URL` is unset. The
  two pool findings below are this pass's real output.
- security-review: run (the diff adds an operator route handling patient PII) — one MEDIUM finding,
  fixed in part on the branch and parked in part. No authorization, injection or seam-escape
  finding: the new route sits inside the `(admin)` group and the action re-asserts
  `requireOperator()`; every query goes through the Drizzle builder with literal filter keys;
  `describeConsultation` emits field names and counts, never clinical text.
- parked: `check-in-goal-not-scoped-to-patient.md` · `consultation-draft-clear-on-sign-out.md`
- base merge: `copy-context` (#96) and `link-writes` (#98) merged to `main` during this run and the
  PR went un-mergeable. `main` was merged in — never rebased, the branch is shared — and four
  conflicts resolved by hand: the changelog index (all three entries, newest first), the quick
  actions' docblock (five actions now, one of which leaves the page), the patient page's working
  view (both the copy-context card and the quick actions), and `addGoalCheckIn`, which gained
  `writtenBy` from #98 and the transaction's client from this run — it now takes both, and the
  composed write passes `"practitioner"` explicitly. 232 service tests pass on the merged tree.
- technical docs: `technical/decisions` (a new "Storage driver — 2026-09-17" block) ·
  `technical/applications` (the consultation screen under the operator's patient page)
- business docs: no business docs impact — the change is a practitioner workflow already described
  by `business/roles`, and it alters no documented user-facing behaviour outside the console
- release notes: both
- sent: **not sent** — this session's environment carries no mail configuration (`RESEND_API_KEY`,
  `SHIP_NOTE_RECIPIENTS` and `EMAIL_FROM` / `SHIP_NOTE_FROM` are all unset), so
  `send-ship-note.sh` refuses before it composes anything. The note is written and its links are
  filled; sending it is one command in an environment that has the three variables:
  `.icm/scripts/send-ship-note.sh consultation-update --send`
- closed out: RESULT: CLOSED — run archived to `.icm/runs/_done/consultation-update/`; the
  `practitioner-workflow` epic keeps five stubs, so no epic was finished by this run

## Findings and what was done with each

Five from the code review, one from the security pass. Every one of them was introduced by this
diff, and none is a style note — so all six were fixed on the branch rather than parked, except the
two halves noted below.

1. **The pool had no `error` listener** (`packages/services/src/db/adapters/neon.ts`). Neon drops
   idle connections; node-postgres emits `'error'` on the pool for that, and an unhandled `'error'`
   event ends the Node process. The HTTP driver this replaced held no sockets and could not do it —
   the defect arrived with the driver move. **Fixed:** a listener that logs.
2. **The pool was unbounded and "once per process" was wrong.** Next.js gives every route bundle
   its own module graph, so `registerDatabase()` runs once per graph and each builds its own pool —
   default `max: 10`, no idle timeout, never closed. **Fixed:** `max: 5`, a 30-second idle timeout,
   and a comment that says what actually happens.
3. **A queued autosave could outlive the save it followed**
   (`apps/admin/components/patients/consultation-form.tsx`). Typing while the save was in flight
   left a write pending; it landed after `clearDraft()` and restored the just-saved consultation as
   a fresh draft, one click from being saved twice. **Fixed:** the timer is cleared before the
   store is.
4. **A check-in could land on another patient's goal.** `addGoalCheckIn` resolves a goal by id
   alone, and the goal ids come from the form. **Fixed in the composed write:** every submitted
   goal id is checked against `listPatientGoals(patientId)` before anything is written, with a test.
   The identical pre-existing shape in `addCheckInAction` / `updateCheckInAction` is **parked** —
   fixing it is not this run's, and it is record integrity rather than a trust boundary, since both
   operator roles already manage every patient.
5. **`from=consultation` was dropped on the first segment change**, by the URL rewrites in
   `patient-navigation.tsx` and `quick-actions.tsx`, which rebuilt the query string as `?segment=`
   alone. That ended the round trip the "Agir" links exist for. **Fixed:** both rewrite from the
   params in hand.
6. **Consultation notes sat in `localStorage` indefinitely** — the most sensitive free text in the
   product, outliving the session that wrote it, readable from devtools by whoever opens that
   browser profile next. **Fixed in part:** a draft is stamped and dropped on read after twelve
   hours, which bounds the window. Clearing on sign-out closes it and is **parked**, because it
   means a hook on a sign-out path this PR does not otherwise touch.
   `sessionStorage` was considered and rejected: it does not survive a closed tab, which is the
   failure the draft exists to prevent.

## Acceptance check (vs spec)

- [x] The screen renders in the four steps with everything prefilled.
- [x] The quick action navigates to it.
- [x] One save writes the note, the qualifying check-ins, and the three fields only when changed.
- [x] One transaction; a failure part-way leaves the database as it was — asserted by a test that
      writes the note, fails the next check-in, and finds the note gone.
- [x] Exactly one `consultation.recorded` audit event, detail naming what changed.
- [x] A successful save returns to `/patients/[id]`.
- [x] A note with neither title nor body is refused and nothing is written.
- [x] Whole-form autosave, restored with a notice and a discard, cleared after a successful save —
      and now also after twelve hours.
- [x] The three protocol links reach their sections and return, the `from` param surviving a
      segment change (finding 5).
- [x] The adapter uses the WebSocket driver and rolls back for real.
- [x] `consultation.recorded` is in the vocabulary and the journal filters on it.
- [x] Nothing on `/p/[token]` changes; no model is called — confirmed by the security pass.
- [x] The `apps/docs` pages for `technical/applications` and `technical/decisions` — done here.
