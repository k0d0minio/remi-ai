# Release: secondary-sections

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on `fde7827` before the base merge; re-established on the head this stage pushed
- pr: [#100](https://github.com/k0d0minio/remi-ai/pull/100) · merged: yes — 2026-09-18
- code-review: medium (spec `complexity: standard`) — 5 findings; 3 fixed on the branch, 2 parked
- production-readiness: not required — the diff adds no storage, auth, payments or environment
  variable. Seven files under `apps/admin` plus two docs pages and a changelog entry; no migration,
  no service function, no `process.env` read, so `ENV.md`, `env.ts` and `turbo.json` are untouched.
- security-review: run — no HIGH or MEDIUM findings. `ProfileSummary` renders patient PII, but the
  same fields already crossed to the same client boundary through `PatientForm` on the same
  operator-only page; no route, guard, action or policy is modified, and `/p/[token]` is untouched.
- parked: `profile-form-close-discards-edits.md` · `label-map-lookups-assume-valid-enums.md`
- technical docs: `apps/docs/app/technical/applications` — § The operator's patient page now
  describes the secondary sections instead of claiming their bodies are unchanged
- business docs: `apps/docs/app/business/roles` — the Operator bullet says what is behind the
  navigation
- release notes: both
- sent: see below
- closed out: RESULT: CLOSED — run archived. The `practitioner-workflow` epic stays open:
  `reuse-and-duplicate` is still to spin out, and it waits on `bulk-entry` and `recipe-in-place`,
  both of which landed on `main` overnight — so it is unblocked and is the epic's next stub.

## The base merge

`main` moved by six runs between Build and Release, and `bulk-entry` overlapped: it wraps the
recommendations, supplements and essentials sections in whole-section editors. The two compose
rather than collide — the editor keeps the active list and the add form, this run's archived fold
sits after it, outside what a batch save writes. `recipe-in-place` made `today` required on
`RecipeAssignments`; the « Recettes précédentes » fold carries it. Resolved by merging `main` into
the branch, never by rebasing it.

## Findings fixed on the branch

- **Consent date formatted client-side.** `formatDate` on a `YYYY-MM-DD` string parses as UTC
  midnight and renders in the reader's timezone, so the badge could name the wrong day and
  disagree with the server on hydration. Both dates the summary shows are now formatted on the
  server and passed as strings — the guard `lastEditedAt` already had, extended to consent.
- **« Compléter » lost the tap.** It opens the editor further up the list than the button pressed;
  with no focus move that reads as the button vanishing, which on a phone is the whole interaction.
  The textarea now takes focus.
- **A lost sentence about the patient link.** The archived recommendations sat under a card saying
  « c'est ce que montre le lien patient ». The deleted card's « Invisible sur le lien patient » is
  restored inside the fold, where the rows it describes now live.

## Findings parked

- `profile-form-close-discards-edits` — « Fermer » unmounts an uncontrolled `PatientForm`. Real,
  but the fix needs the form to expose whether it is dirty, and this run was scoped not to touch
  it. The stub carries the cheaper alternatives and the question that decides between them.
- `label-map-lookups-assume-valid-enums` — indexing `vocabulary.ts` maps assumes the row is
  in-union. Not introduced here: the roster, the banner and both recommendation forms have done it
  since they were written. One fix across all consumers, not a patch in this component.

## Acceptance check (vs spec)

- [x] Anamnesis lists filled categories first, then « Compléter » buttons, above a count of twelve
- [x] « Compléter » / « Modifier » opens the editor in place, one at a time; a saved category
      re-renders among the filled ones
- [x] The profile shows a read summary before any click, with « Modifié le … »
- [x] « Modifier » swaps in the existing `PatientForm` with every field it has; « Fermer » returns
- [x] A profile with neither consent half reads « Pas encore enregistré », as `RETENTION.md`
      § Consent describes — that page needed no edit
- [x] Archived recommendations, essentials, previous recipes and archived meals are closed folds
      with counts at the end of their active section; the four standalone sections are gone
- [x] Archived supplements, observations and goals use the same fold
- [x] The delete flow is a closed fold at the end of the profile; no red card, no `danger-zone`
- [x] Thirteen registry entries, no conditional — the same list for every patient
- [x] No migration, schema, service, `apps/web` or `/p/[token]` change
- [x] `apps/admin/AGENTS.md` § Interface rewritten
- [x] `apps/docs` `technical/applications` and `business/roles` updated — this stage, this PR
