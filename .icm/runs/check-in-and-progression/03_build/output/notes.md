# Build notes: check-in-and-progression

- commits: 4e726b2 schema + migration · 923135d services + tests · 1a1750e patient link · fb2cdcb console · fbf3cba types · e984d6c + 7da1fdb CI fixes · 44e55be main merged
- ci: GREEN on 44e55be (cheap tier); full tier on the post-flip head — see status.md

## What changed

- `packages/services/src/db/schema.ts` + `migrations/0022_goal_check_in_scores.sql`: nullable
  `score` (integer, check 0–5) and `seen_at` (timestamptz) on `patient_goal_check_ins`. Additive,
  forward-only; existing rows read `null` for both.
- `packages/services/src/shared/{format,patient}.ts`: `addDays`; `goalScores`,
  `WEEKLY_CHECK_IN_DAYS`, `weeklyCheckInState()` (the 7-day window computed from one date — D-9)
  and `scoreDirection()` (D-31). `shared/audit.ts`: `goal.check_in_seen`.
- `packages/services/src/db/services/patient-goals/`: `getWeeklyCheckIn`, `recordWeeklyCheckIn`
  (every goal checked against the token's patient, range, at-least-one, window — all before the
  first insert; inserts in one transaction), `listGoalScoreStrips` (last 12, oldest first),
  `countGoalCheckInsAwaitingAttention`, `markGoalCheckInSeen` (idempotent, keeps the first time).
  `addGoalCheckIn` writes `score: null, seenAt: null`.
- `packages/ui/src/server/score-strip.tsx`: `ScoreStrip` — a domain-free row of 0…max marks with a
  label under each; consumed by both apps (no chart library).
- `apps/web`: `WeeklyCheckInCard` (server) + `WeeklyCheckInForm` (client island) in « Aujourd'hui »
  after the goals; `weeklyCheckInAction` through `writePatientLink` (audit `goal.checked_in`,
  patient actor); `progression` segment + page; loader reads the window, strips and past
  challenges; fr/en copy.
- `apps/admin`: `WorkingGoals` shows each goal's strip and the « N objectif(s) en baisse » line;
  the same line heads the goals section; `GoalTrail` shows `n/5`, the link mark and « Vu » on an
  unseen patient *worse* row; `markCheckInSeenAction` (audited).
- `.icm/docs/RETENTION.md`: the two new columns.

## Acceptance criteria status

- [x] Weekly card when due — `WeeklyCheckInCard`, window from `weeklyCheckInState`; both locales.
- [x] One row per rated goal, patient attribution, direction vs previous patient score, empty
  refused — `recordWeeklyCheckIn`; asserted in `patient-goals/index.test.ts`.
- [x] Link-writes path, second submission inside the window writes nothing — `writePatientLink`;
  the service refuses with `conflict`, the card says « déjà répondu, rechargez ».
- [x] Answered state and no card without goals — `WeeklyCheckInCard`.
- [x] `/p/<token>/progression`, visible with an active goal or a closed challenge; strips, consigne,
  7-day meal count, past challenges with outcome.
- [x] Console strip + trail score and mark — see Notes for Release on the mark's wording.
- [x] Awaiting line, « Vu » clears it, practitioner rows never count — asserted in the service tests.
- [x] One migration, additive; her consultation form untouched.
- [x] No scheduler / cron / email / push / model.

## Notes for Release

- **The trail mark reads « écrit depuis le lien », not « écrit par la patiente ».** The spec quoted
  the older wording; `apps/admin/AGENTS.md` names marks by the act, not the person, and the meal
  journal already uses « écrit depuis le lien ». Reused rather than adding a gendered second mark.
- **"Meals logged" counts `eaten` entries only** — a « je vais manger » that never became « j'ai
  mangé » is not a logged meal.
- **Double submit across two tabs at the same instant** is guarded by the in-transaction window
  check, not by a unique index; a true simultaneous race could still write both. The spec's
  migration carries only the two columns, so no index was added.
- The console strip's wrapper and the link's wrapper are thin per-app shells over `ScoreStrip`
  (dates and wording differ); the primitive is shared.
- **Ready to merge was ticked before the ready flip**, so before any post-flip preview existed. The
  tick attests the operator's own smoke of the preview; Release should confirm it was given after
  the previews below, not on the draft.
