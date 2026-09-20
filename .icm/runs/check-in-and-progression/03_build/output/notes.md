# Build notes: check-in-and-progression

- commits: schema + migration · services + tests · patient link · console surfaces
- ci: (settled below — see the Release note)

## What changed

- `packages/services/src/db/schema.ts` + migration `0020_smooth_war_machine.sql`: the new
  `patient_recommendation_check_ins` table and an additive `acknowledged_at` on
  `patient_goal_check_ins`. Generated with `pnpm db:generate` after merging `main`, per
  CONVENTIONS' "regenerate, never renumber".
- `shared/patient.ts`: `checkInCategories` (the closed set of askable categories),
  `orderCheckInRotation` and `awaitsCheckInOn`. The *rule* lives here rather than in the app
  because it is a product decision both surfaces read, the same reasoning as
  `firstRecommendationPerCategory` beside it — and because `packages/services` is the only
  workspace with a test runner, so it is also the only place the criteria can be asserted.
- `db/services/patient-recommendation-check-ins/`: the new entity's reads, its one write, its
  owner lookup for the link's write guard, and `acknowledge…`.
- `db/services/patient-check-ins/`: the cross-entity reads — both trails for one patient, and
  the awaiting-attention count. The row CRUD stays with each entity.
- `patient-goals`: `patientGoalOwner` (the link's ownership guard) and `acknowledgeGoalCheckIn`.
- `packages/ui/src/server/check-in-strip.tsx`: `CheckInStrip`, consumed by both apps in this PR.
  No chart library: eight weeks of one-tap answers is a handful of marks, and « mieux » has no
  magnitude to plot.
- `apps/web`: the prompt island on the home, the rotation assembly, the `logCheckInAction`
  endpoint through the existing patient-link write path, the `/p/[token]/progression` segment and
  its view, and both dictionaries.
- `apps/admin`: the same strip in the patient page's goals slot with « Vu » on an unacknowledged
  patient « moins bien », the per-patient count, and the roll-up card on Accueil.

## Two judgement calls worth a reviewer's eye

- **Where the question's wording lives.** The spec says to keep the per-category verb map in
  `shared/patient.ts`. What went there is the closed *set* (`checkInCategories`), which both apps
  read; the wording went into each app's own locale files, because `apps/web` ships fr **and** en
  and French strings in `shared/` would have no English counterpart. That follows the split
  `goalDirections` already keeps with the console's `vocabulary.ts`. The spec's intent — one copy
  of the vocabulary, no second opinion — is met; the literal file placement is not.
- **`CheckInStrip` takes `directionLabels` as a prop.** The ui package may not import from
  services, and the direction keys are English because they are what the database stores. Passing
  the labels in is what keeps a francophone patient from hearing "worse" read aloud.

## Acceptance criteria status

- [x] One question, three faces, an optional word, once a calendar day — `awaitsCheckInOn` is
      computed at render from the loaded dates; answering hides it until tomorrow.
- [x] Subject drawn from active goals plus the first active recommendation of `habit`, `activity`
      and `monitoring`, least-recently-answered first; `nutrition` and `supplement` never asked.
- [x] « Passer » advances the rotation, writes nothing, does not hide the prompt. Client state
      only — a persisted skip would be a row recording a non-answer.
- [x] A goal answer writes `patient_goal_check_ins` (`written_by: "patient"`, today, direction,
      note); a recommendation answer writes the new table.
- [x] Both go through `writeThroughPatientLink` with an `ownerOf`, so they are rate-limited,
      attributed and audited exactly as a meal entry is. New audit action:
      `recommendation.checked_in`.
- [x] `/p/[token]/progression` exists, is navigation-gated on having something to show, and
      renders the eight-week strip, the patient-facing consigne and the week's meals. No chart
      library added.
- [x] The console's goals slot renders the same strip, both authors on one timeline, the
      patient's own answers marked with a ring.
- [x] A patient `worse` raises a per-patient count and lists them on Accueil until « Vu » stamps
      `acknowledged_at`; acknowledging is idempotent.
- [x] Nothing schedules, polls or sends.
- [x] One migration, additive; existing rows unaffected.

## Notes for Release

- « Recettes essayées cette semaine » is **out of scope by the operator's decision at Define**:
  nothing records that a recipe was tried until `patient-loop/recipe-feedback-and-favourites`
  ships. The spec names it under Out of scope. The progression view ships without it.
- `.icm/runs/patient-home-today/` is still sitting in `runs/` although its PR (#106) merged —
  that release skipped `close-out.sh`. Not this run's to fix and not touched here; flagged to the
  operator, who has not yet said whether to cut it as a triage stub.
