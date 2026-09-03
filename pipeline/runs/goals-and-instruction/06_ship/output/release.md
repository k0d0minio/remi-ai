# Ship: goals-and-instruction

- pr: [#73](https://github.com/k0d0minio/remi-ai/pull/73) · merged: yes — squash-merged
  3 September 2026, on the ticked **Ready to merge** box and five green check runs
- CI: green on `8ec570c` — Format/lint/typecheck, Pipeline gates, Project run labels,
  Spec structure, Vercel Preview Comments. Nothing failed at any point in Ship
- technical docs: no technical docs impact — `technical/packages` routes to
  `packages/services/AGENTS.md` rather than enumerating services, `technical/architecture`
  carries no table list, and `technical/applications` describes the admin boundary, not
  the patient page's cards. Nothing on those pages became untrue
- business docs: no business docs impact — `business/scope` names the frozen V2 feature
  list and `business/roles` the three roles; neither describes what a patient's record
  holds. The operator-facing change is announced in the changelog instead
- release notes: both — changelog entry `2026-09-03-goals-and-instruction` (registered in
  `changelog/_meta.ts` and the index page) and `ship-note.md`
- sent: none — `RESEND_API_KEY` and `SHIP_NOTE_RECIPIENTS` are absent from this
  environment, so the send would have failed rather than delivered. The note is written
  and its links are live; one command sends it from a shell that has the config:
  `pipeline/scripts/send-ship-note.sh goals-and-instruction --send`

Two notes on the record, so the next run does not re-derive them:

- **The changelog's "live" link is its source on `main`.** The docs site has no publicly
  reachable origin today: its Vercel production URL sits behind Vercel SSO, and the
  `remi-docs.jamienisbet.com` fallback in `links.ts` is the placeholder nobody owns (it
  404s). A link a recipient cannot open is worse than a link to the file itself
- **Four DoD lines are still the operator's.** `verify.md` records them unticked: the
  admin preview is behind Vercel SSO, so no agent can reach a signed-in surface to
  demonstrate the card rendering or the write paths through it. The data layer beneath
  every one of them is covered by service tests

## Acceptance check (vs spec)

- [x] `patient_goals` table — `patient_id` (cascade), `title`, `baseline`, `position`,
      `archived_at`, timestamps — in a generated migration that applies over existing rows —
      `0008_colossal_ozymandias.sql`, read in Verify; purely additive
- [x] `patient_goal_check_ins` — `goal_id` (cascade), `checked_on` as a calendar date,
      `direction`, `measure`, `note` — same migration; patient delete cascades through both
- [x] `patient_instructions` — `patient_id` (cascade), `body`, `archived_at` — same migration
- [x] `goalDirections` is a `const` tuple in `shared/patient.ts`, re-exported through
      `@remi/services/shared`; the French wording lives only in the admin's `vocabulary.ts`
- [x] `patient-goals` service behind the seam: active in position order, archived
      newest-archive-first, add / update / reorder / archive / restore / delete, each write
      calling `touchPatient` — service tests
- [x] The fourth active goal fails `conflict` with no row written, and so does a restore into
      a full list; archiving frees the slot immediately — service tests
- [x] Check-ins list newest first; an entry with no direction, no measure and no note is
      `invalid_input`, and so is an unknown direction key — service tests
- [x] `patient-instructions` returns the one active row or `null`, lists the superseded ones
      newest first, and archives before inserting on replace — service tests
- [x] An empty or whitespace-only body archives the current instruction and inserts nothing,
      leaving the trail intact — service tests
- [x] One card between "Lien patient" and "Recommandations" holding active goals in order
      with baseline, latest check-in and trail, the instruction beneath, archived goals and
      superseded instructions in subdued sections — code verified; **rendering is one of the
      four operator-owned DoD lines**
- [x] Each write goes through a server action and re-renders without touching a sibling
      goal's row; the add form is absent while three are active — per-goal isolation is a
      service test, the gate derives from `MAX_ACTIVE_GOALS`
- [x] Every goal, check-in and instruction write records an audit event, with each new action
      name in `auditActions` and a French label in the audit vocabulary
- [x] The profile's `objective` column, its content, its form field and its position are
      unchanged — untouched by the diff
- [x] New service tests round-trip through the in-memory client: the cap, the restore refusal,
      per-goal isolation, trail order, the empty check-in refusal, replace-and-archive,
      clearing, and cascade on patient delete
- [x] `/p/[token]` renders as before; the five new read functions have no caller outside the
      `(admin)` group — grep across the repo, confirmed independently by the security pass
