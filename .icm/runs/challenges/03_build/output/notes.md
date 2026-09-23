# Build notes: challenges

- commits: 5d69654 schema + migration · f41b351 service + tests · d28543c link card + taps + consigne · 3f2f6a2 console section + roster badge · (this commit) retention + run pack
- ci: GREEN — cheap tier on 332c152 (admin + app previews built); full gate on 21dd702 after the flip, `pnpm test` 412/412 incl. 16 `patient-challenges`

## What changed

- `packages/services/src/db/schema.ts` + `migrations/0020_patient_challenges.sql`: the
  `patient_challenges` table, cascade on patient delete, partial unique index
  `patient_challenges_one_open` on `patient_id where closed_on is null` (D-25 held by the database).
- `packages/services/src/db/services/patient-challenges/`: start (close-and-create in one
  transaction when `closeCurrentWith` is given, `conflict` otherwise), edit and close (open rows
  only), the two taps as set/clear with the sequential rule and the clear cascade, reads (current,
  past newest-closed first), `listChallengeSignals()` for the roster in one paged pass,
  `challengeOwner()` for the link's ownership check. Start date ≤ `todayAtPractice()`.
- `packages/services/src/shared/{patient,audit}.ts`: `challengeOutcomes`; seven `challenge.*` audit
  actions (three hers, four the patient's set/clear).
- `apps/web`: `ChallengeCard` (server) + `ChallengeTaps` (client island, `aria-pressed`, posts the
  target state), `tapChallengeAction` through `writePatientLink` with `ownerOf: challengeOwner`;
  the home's « Aujourd'hui » always renders, challenge first, then goals, then the consigne under
  its new title; fr/en copy.
- `apps/admin`: `ChallengeSection` (new / edit / close, one mode at a time; the outcome picker
  pre-selected from the patient's tap), `ChallengeHistory` in a closed fold at the section's foot,
  `WorkingChallenge` in the working view with the « prêt(e) pour le prochain » line, the roster
  badge, three audited actions, outcome vocabulary; the instruction's patient-facing field
  relabelled (D-29).
- `.icm/docs/RETENTION.md`: the table, its patient-written columns, the cascade, what the trail keeps.

## Acceptance criteria status

- [x] Table, one-open rule in the database, cascade, generated migration — schema + `0020`.
- [x] Create / edit / close with the three outcomes, future date refused, pre-selection — service + `ChallengeSection`.
- [x] Close-and-create atomic — service transaction; test forces the insert to fail and checks the close rolled back.
- [x] Current + past lists, at-a-glance current and state — `ChallengeSection`, `ChallengeHistory`, `WorkingChallenge`.
- [x] Link card first, « Prêt(e) » only after « acquis », fr + en — `ChallengeCard` / `ChallengeTaps`.
- [x] Taps through link-writes: patient actor, `link_last_wrote_at`, ceiling, not-found for a foreign or closed challenge — `tapChallengeAction` + service; the foreign-token case is tested.
- [x] Toggle, clear cascade — service + tests.
- [x] Awaiting line + roster badge while ready; cleared by close/create; subtle « acquis » badge — `WorkingChallenge`, roster, `listChallengeSignals` test.
- [x] Empty slot copy; closed challenge keeps outcome and tap dates — `ChallengeCard`, `ChallengeHistory`.
- [x] Consigne relabel on the link, `patientBody` only — home page + content.
- [x] Service rules covered by in-memory tests — `patient-challenges/index.test.ts` (green is CI's to say).
- [x] RETENTION.md — updated.

## Notes for Release

- `apps/docs/app/business/roles` describes the link's home (« Aujourd'hui ») and what a patient can
  change: it now gains the challenge and its two taps — Release's docs pass.
- D-29 is a Build decision (see `decisions.md`): the console's instruction field is relabelled too.
- The at-a-glance "awaiting count" is a single line per patient (one challenge at a time), not a
  number; the roster badge carries the cross-patient view.
- The partial unique index is the only DB-level rule here; the in-memory tests cannot exercise it —
  the preview database applies the migration at the admin build.
- `security-check.sh challenges --branch` → `BLOCKED 1` on **dependency-audit only** (secrets
  passed): 20 high/critical advisories already on `main`, two of them **critical — Next.js
  unauthenticated RCE (next <16.3.3)**. Not this branch's (no manifest or lockfile touched); parked
  as `.icm/intake/triage/dependency-audit-next-rce.md` (chore, P0) per the security-audit skill.
  The same gate will say `BLOCKED` at Release step 4 until that chore merges — it is not a finding
  this diff introduced. `gitleaks` is not installed in this session: the secrets pass ran the
  built-in patterns only.
