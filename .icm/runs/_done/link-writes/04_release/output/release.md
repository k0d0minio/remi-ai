# Release: link-writes

- gate: Ready to merge ticked — merge authorised
- ci: GREEN, established by ci-status.sh on the head that was merged — the last push before the
  squash. PR #98's check runs are the record of it.
- pr: #98 · https://github.com/k0d0minio/remi-ai/pull/98 · merged: yes — 2026-09-17, squashed
- code-review: high (spec complexity: complex) — 6 findings; 5 fixed on the branch, 1 parked
- production-readiness: run — no env var added, no adapter added, migration additive and
  roll-back-safe; one cross-PR hazard found and parked (see below)
- security-review: run — 1 Medium (cross-patient targeting), fixed on the branch; everything else
  traced and ruled out
- parked: link-writes-regenerate-clears-write-timestamp.md · parallel-migrations-journal-ordering.md
- technical docs: no technical docs impact — no page under `apps/docs/app/technical/**` documents
  the patient link today, so nothing there was made stale by this change
- business docs: `business/roles` — what a patient can change, through which credential, with what
  ceiling, and that a link reaches its own record and no other
- release notes: both
- sent: no — `RESEND_API_KEY` and `SHIP_NOTE_RECIPIENTS` are both unset in this environment, so
  `send-ship-note.sh --send` cannot deliver. The note is written and ready at
  `04_release/output/ship-note.md`; whoever has those secrets can send it unchanged.
- closed out: RESULT: CLOSED — run archived to `.icm/runs/_done/link-writes/`; the `patient-loop`
  epic keeps its folder, 5 stubs still open

## Acceptance check (vs spec)

- [x] Valid token → row, `patient` audit actor with the pseudonym, `link_last_wrote_at` stamped,
      `last_edited_at` untouched — proven end to end through the real `addMealEntry`.
- [x] Unknown, malformed or regenerated token → not-found, no row, no audit event, and the same
      refusal whichever it was.
- [x] The ceilings hold, and now hold **under concurrency** — the original count-then-insert was a
      TOCTOU race against a driver with no interactive transaction; see below.
- [x] Over 2000 (body) or 200 (short) → `invalid_input`, and the write callback never runs.
- [x] No patient id, no cookie, no session; the callback is handed the patient the token resolved.
- [x] `written_by` on both tables, `practitioner` for every pre-existing row, migration generated
      from `schema.ts` and checked in — and, after review, actually reachable as `patient`.
- [x] Covered by `packages/services` tests against the in-memory client — 12 new, 212 green.
- [x] « dernière écriture » on the admin patient page, with its own empty state.
- [x] Privacy card in `fr` and `en`.
- [x] `RETENTION.md` — rows, columns, ledger, cascade, and what the trail keeps after a deletion.
- [x] `business/roles` — what a patient can change and through which credential.

## What the review passes changed

Five findings were fixed on this branch rather than parked, because all five were this run's own
code and three of them made the spec's own claims untrue:

1. **The rate limit was a TOCTOU race.** It counted, then inserted. The HTTP driver this package
   registers has no interactive transaction — `adapters/neon.ts` says so and its `transaction()` is
   a passthrough — so two requests carrying one token read the same pre-write count and both
   passed. The ceiling held only against a serial script, which is not the script that abuses a
   leaked link, and acceptance criterion 3 explicitly claims concurrent instances share one
   ceiling. Now the row goes in first and the count that follows includes it and every racing row.
   Serially exact; under a simultaneous burst it errs toward refusing, which is the safe direction.
   A rank-based variant was written and rejected: once two rows share an instant the tie-break
   decides, and any tie-break that is not insertion order lets the last write of a serial run slip
   through — it did, in the test.
2. **`written_by` could never hold `patient`.** No code path produced it, while `schema.ts`,
   `RETENTION.md` and `business/roles` all described the attribution as if it flowed. The two
   services now take it as a positional argument — not a field of the parsed input, so a form
   cannot claim it.
3. **A link could write into another patient's record.** The helper binds the patient to the token,
   but most writes here are keyed by a child row id, and `addGoalCheckIn` checks that the goal
   exists, never whose it is. Not reachable today — nothing calls the helper, which is the stub's
   whole shape — but five stubs are about to branch off this trunk, and a rule the trunk only
   documents is a rule each of them can forget once. The target is now a union: naming a row makes
   `ownerOf` mandatory, so the type enforces it. A row the token does not own is refused in the
   words of a token that never existed. `targetLabel` no longer falls back to the actor's pseudonym
   when a row was named — that default is what would have hidden a mistargeted write in the journal.
4. **The recorders could fail a saved write.** The audit call and the two stamps ran after the row
   was committed and nothing caught them, so a transient failure showed the patient an error for a
   meal that saved — and invited them to enter it twice.
5. **`text` was optional**, so the caps applied only to what a caller remembered to declare. It is
   required now; `{}` is a legitimate value, and "I forgot" no longer looks like "there is none".

## Production readiness

- **No environment variable added**, so the three-files-two-dashboards check is vacuous here:
  nothing to add to `env.ts`, `.icm/docs/ENV.md`, `turbo.json`, Vercel or Actions.
- **No adapter added.** The write path goes through the storage seam already registered lazily by
  `apps/web/lib/database.ts`; the Neon adapter derives its table map from `schema.ts`, so
  `patient_link_writes` is served the moment it is defined.
- **Migration `0013` is additive and roll-back-safe.** Three `ADD COLUMN` with backfilling defaults
  and one new table nothing older references — so redeploying the previous code against the
  migrated schema works. This repo has no `down` migrations at all, by convention; that is the
  convention this is measured against, not a gap introduced here.
- **One hazard found that is bigger than this PR**, parked as `parallel-migrations-journal-ordering`
  and worth the owner's attention before the next merge: five PRs were cut from the same `main`, at
  least two carry an `idx: 13` migration, and `migrate.mjs` documents that drizzle compares the
  journal's `when` against the newest applied `created_at` and never by hash — so whichever merges
  second with an older `when` is skipped silently, shipping code that queries columns that do not
  exist. This PR is safe to merge now (its `when` is later than everything on `main`); the others
  must be rebased and **regenerated**, never renumbered by hand.

## A note on the ship note's second link

It points at the changelog entry's **source** on `main`, not at the live page. The live origin
comes from `NEXT_PUBLIC_DOCS_URL`, which is set in Vercel; `shared/links.ts`'s fallback domain is
documented there as a placeholder that nothing in production should reach, and this session has no
Vercel read access to confirm the real one. A source link that works beats a guessed link that
404s. Swap it for the live URL when sending, if you know it.

## Context budget

Within the Inputs budget. The one deliberate overrun was reading the other open PRs' migration
journals through the GitHub API, to establish whether the ordering hazard above was a visible
conflict or a silent loss. It is worth the tokens: silent is the answer for whoever merges second.
