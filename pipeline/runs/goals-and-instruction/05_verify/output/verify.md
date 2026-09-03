# Verify: goals-and-instruction

- production-readiness: run — the diff touches storage. One finding, recorded below
  (no `down` migration; the estate has none and drizzle-kit generates forward-only).
  No new env var and no new adapter, so those two limbs are not applicable.
- code-review: high (the spec's `complexity: complex`) — five findings, four confirmed
  and one latent; all five fixed on this branch.
- security-review: run — the diff carries patient health data and nine new operator
  server actions. No finding survived filtering.
- automated tests: 155 green in `@remi/services` (20 new). No end-to-end suite exists
  yet, so the signed-in half of the DoD smoke is the operator's, below.

## DoD smoke (on the preview — each line says who verified it)

The admin preview sits behind Vercel SSO, so **the agent cannot reach any signed-in
surface**. What the agent verified is the code path and the data layer; every line
that needs the console open is the operator's and is **not yet demonstrated**.

- [x] The migration is additive — three `CREATE TABLE`s plus their FKs, no `ALTER` of
      an existing table, so it applies over existing rows untouched (agent: read
      `0007_yielding_banshee.sql`)
- [x] The cap refuses a fourth active goal and a restore into a full list, with
      `conflict` and no row written (agent: service tests)
- [x] A check-in carrying no direction, no measure and no note is refused; an unknown
      direction is refused (agent: service tests)
- [x] Replace archives before inserting; a patient never holds two active consignes;
      an empty body clears and keeps the trail; re-saving identical words is a no-op
      (agent: service tests)
- [x] Deleting a goal takes its check-ins with it (agent: service test). The
      patient-level cascade is the FK in the migration — the in-memory client has no
      foreign keys, so it is read, not executed
- [x] Nothing reaches `/p/[token]`: the only callers of the five new read functions
      are the `(admin)`-guarded patient page (agent: grep across the repo, confirmed
      independently by the security pass)
- [ ] **The card renders** between "Lien patient" and "Recommandations", with goals
      numbered, baseline, latest check-in and the trail — **operator**
- [ ] **Add / edit / reorder / archive / restore / delete a goal** from the console —
      **operator**
- [ ] **Add, correct and delete a check-in**; the panel closes on save and a second
      click does not duplicate the row — **operator**
- [ ] **Write, replace and clear the consigne**; the superseded list grows — **operator**
- [ ] auth: Morgane signs in and reaches the patient page — **operator** (unchanged by
      this diff; no auth code touched)
- [x] payments: not touched (agent)
- [x] email/notifications: none expected — this diff sends nothing (agent)

## Findings & cleanup

- **Check-in panel never closed on success** — an uncontrolled form left open one click
  from writing the same dated row twice. Fixed: the form now calls `onDone()` on a
  successful save, the shape `PantryItem` already uses (`goal-check-in-form.tsx`).
- **Re-saving an unchanged consigne archived and reinserted it** — a no-op became
  history and reset "en vigueur depuis" to today. Fixed with an equality guard in
  `setPatientInstruction`, plus a test.
- **`instruction.cleared` was audited for a non-event** — an empty body on a patient who
  never had a consigne. Fixed: the action reads the current row first and audits only a
  change that happened.
- **The cap copy hardcoded "Trois"** while the gate used `MAX_ACTIVE_GOALS`. Fixed: the
  sentence derives from the constant.
- **`updatePatientGoal` lacked the `supplied()` guard** its own file added for check-ins
  — latent, no caller passes an explicit `undefined` today. Fixed for symmetry.
- **No `down` migration** — accepted, and it is not this run's to change: drizzle-kit
  generates forward-only migrations and no migration in this repo has ever carried a
  down. Reversing `0007` by hand is three `DROP TABLE`s. Making downs a convention is a
  chore of its own.
- **The direction select uses a `none` sentinel** because Radix refuses `""` as an item
  value. Anything outside `goalDirections` narrows to null in the action, so it needs no
  special case — but it is the one place the UI token and the stored vocabulary differ.
