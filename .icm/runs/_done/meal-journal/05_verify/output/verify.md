# Verify: meal-journal

- production-readiness: run — storage touched (two new tables + migration 0007). No
  new env vars, no new service adapter. One standing gap recorded below.
- code-review: high (spec complexity `complex`) — 4 findings; 2 fixed on branch,
  2 accepted with reasons below.
- security-review: run — no HIGH or MEDIUM findings. One design note recorded.
- automated tests: 22 unit tests on the two services against the in-memory
  client, run locally and green. No end-to-end suite exists yet, so the DoD
  smoke below carries the rest.

## Production readiness

- **Migration `down`: absent, and that is the estate's standing position, not
  this PR's omission.** None of the eight checked-in migrations has a `down` —
  `drizzle-kit generate` does not produce one. Migration 0007 is additive
  (`CREATE TABLE` ×2 plus two foreign keys), so a rollback is two `DROP TABLE`
  statements against tables nothing else references. **This is a gap in the
  estate's migration practice and is worth a chore of its own**; it is not a
  reason to hold this PR, which is strictly less risky than the seven before it.
- Env vars: none added — confirmed against the branch diff (`env.ts`,
  `turbo.json` and `.icm/docs/ENV.md` are all untouched).
- Adapters: none added. Both services reach storage through the existing seam.

## Security review

Method: analysed directly rather than fanned out to sub-tasks, at the owner's
explicit request for speed (2026-09-03). Recorded so the shortcut is visible
rather than implied.

- Authorisation: all nine new server actions call `requireOperator()` as their
  first statement — verified mechanically across the file, not from memory.
- Injection: no raw SQL anywhere; every write goes through the seam's
  parameterised Drizzle collection. No `dangerouslySetInnerHTML`, `eval` or
  dynamic execution in the diff.
- Input handling: zod schemas with length caps on every service entry point.
  `updateMealEntry` spreads only schema-constrained keys, so `patientId`,
  `archivedAt` and `feedbackWrittenAt` cannot be set from a form.
- Patient surface: nothing new reaches `/p/[token]` — no file under `apps/web`
  is in the diff.
- **Design note, not a finding:** `audit()` stores a 60-character slice of the
  meal description as the event's target label, so health-adjacent text lands in
  `audit_events`. That follows the estate's existing pattern (`pantry.added`
  stores the item, `recommendation.added` the title) and stays inside the
  operator-only boundary — but a meal description is more sensitive than a
  pantry item, so it deserves a deliberate decision rather than inheritance.

## DoD smoke (on the preview — each line says who verified it)

**A caveat that shapes this whole section.** `packages/services/scripts/migrate.mjs`
refuses to migrate from a non-production Vercel deploy — the guard added after
the 2026-09-02 incident. So the admin preview points at a database with neither
new table, and the journal cannot be exercised there. The build notes said the
preview would create both tables; that was wrong and is corrected here.

- [x] Code path traced in the diff for every acceptance criterion (agent)
- [x] All five preview deployments build and are Ready; `Format, lint, typecheck`
      green on the build head (agent)
- [x] `/p/[token]` unchanged — no `apps/web` file in the diff (agent)
- [x] Every mutation behind `requireOperator()` (agent, mechanically verified)
- [x] The feature works (**operator**, reported 2026-09-03: "it is working").
      Recorded as the owner's global confirmation, **not** a line-by-line
      demonstration of each criterion on the preview — the migrate guard above
      means the preview could not have carried one.
- [x] The 375px criterion — covered by the operator's confirmation above, on the
      same terms.
- [ ] auth: not separately exercised — this PR adds no auth surface and changes
      no session path.
- [x] payments: not touched.
- [x] email/notifications: none expected — this run sends nothing.

## Findings & cleanup

- **Archiving an observation was a one-way door** — `ObservationItem` renders a
  « Réactiver » control, but `LearningsList` only ever received _active_
  observations, so an archived one vanished with no way back and the
  `observation.restored` audit action was unreachable. Archive that cannot be
  undone is a disguised delete. **Fixed on branch:** the « À retenir » card now
  renders an archived section, mirroring the archived-meals card.
- **Two forms shared one error slot** in `meal-entry-item.tsx`, so a feedback
  validation error rendered inside the transcription form. **Fixed on branch:**
  one error slot per form.
- **Four independent reads of `patient_meal_entries` per page render** —
  `listMealEntries`, `listArchivedMealEntries`,
  `countMealEntriesAwaitingFeedback` and `listPatientLearnings` (which calls
  `listMealEntries` again), each up to 500 rows over the Neon HTTP driver.
  **Accepted for now:** they run in the page's existing `Promise.all`, the
  cohort is 10–15 patients, and collapsing them means a combined read that
  changes the service's shape. Worth doing when the page is next touched.
- **The 500-row cap is applied before the archived/active split**, so past
  roughly six months of daily logging the oldest archived meals would drop out
  of « Repas archivés » and the awaiting-feedback count would under-report.
  **Accepted:** months of runway on a beta cohort, and the honest fix is
  pagination rather than a bigger number. Flagged here so it is a known horizon
  rather than a surprise.

Context budget: within the Inputs table.
