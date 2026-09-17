# Build notes: link-writes

- commits: `feat: link-writes — the write path, attributed, ceilinged, audited`
- ci: see below (ci-status.sh after the last push)

## What changed

- `packages/services/src/db/services/patient-link-writes/` — **the trunk.**
  `writeThroughPatientLink()` is the one way anything writes through `/p/[token]`. Order is the
  design: length caps (pure, so an oversized body never reaches the database) → token resolved by
  the loader's own rule → rolling ceilings → ledger row → the caller's write → roster timestamp
  restored → audit → profile stamped. It takes the write as a callback and hands it the patient the
  token resolved, so no caller can name a patient id; that is what keeps the token the credential.
- `patient_link_writes` (new table) — the rate-limit ledger: a patient id and a time, nothing else.
  A ledger rather than a counter column because the windows are rolling, and a counter that resets
  on a boundary lets twice the ceiling through across it. Every accepted write prunes rows older
  than a day, so the table stays at roughly the day ceiling per patient and needs no cron.
- `audit_events.actor_kind` — `operator | patient`, recorded rather than inferred. A patient actor
  carries the pseudonym and no email; an empty email is also what a system write leaves, and
  "nobody" and "the patient" are not the same answer. `AuditActor` is now a union, so the console's
  single call site is unchanged.
- `written_by` on `patient_meal_entries` and `patient_goal_check_ins` — the two tables the console
  and the link both write. Defaults to `practitioner`, which is what every existing row is.
- `patient_profiles.link_last_wrote_at` — « ils ont répondu », distinct from « ils ont regardé ».
- `restorePatientLastEdited()` — see the first note under Release below.
- `apps/web/lib/patient-link/write.ts` — the app-side wrapper: registers the adapter, revalidates
  the token subtree. Not itself a `"use server"` module, deliberately — a callback cannot cross that
  boundary, so each feature's action file is the endpoint and this is what those endpoints call.
  Nothing calls it yet, which is the point of the stub.
- `apps/admin` — « dernière écriture » beside « dernière ouverture » on the patient page; the audit
  journal names a patient write as one instead of rendering the pseudonym like an operator's; the
  share-link footnote no longer says the link is read-only.
- `apps/web/lib/content/{fr,en}.ts` — the privacy card rewritten to what is now true.
- `.icm/docs/RETENTION.md`, `apps/docs/app/business/roles` — the same, in both registers.

## Acceptance criteria status

- [x] Valid token → row, audit with `patient` actor and the pseudonym, `link_last_wrote_at`
      stamped, `last_edited_at` untouched — proven end to end through the real `addMealEntry`.
- [x] Unknown, malformed or regenerated token → not-found, no row, no audit event, and the same
      refusal whether the token never existed or died a second ago.
- [x] 11th write in a rolling minute and 101st in a rolling day refused with `rate_limited`;
      counted from a table, so instances share one ceiling. The rolling half is proven too — the
      window opens again once the oldest writes age out.
- [x] Over 2000 (body) or 200 (short) → `invalid_input`, and the test asserts the write callback
      never ran.
- [x] No patient id, no cookie, no session: the request type has no id field, and the callback is
      handed the patient the token resolved.
- [x] `written_by` on both tables, `practitioner` for every pre-existing row, migration generated
      from `schema.ts` (`0013_gray_charles_xavier.sql`) and checked in — additive, defaults backfill.
- [x] Covered by `packages/services` tests against the in-memory client — 8 new, 209 green.
- [x] « dernière écriture » on the admin patient page, with its own empty state.
- [x] Privacy card in `fr` and `en`: what you write is kept, attributed and read by your
      practitioner; anyone holding the link can write as you.
- [x] `RETENTION.md` — the patient-written rows, the two new columns, the ledger, the cascade, and
      what the trail keeps after a deletion.
- [x] `business/roles` — what a patient can change, through which credential, with what ceiling.

## Notes for Release

- **One thing the spec did not foresee.** The console services bump `last_edited_at` on every write,
  correctly — encoding a protocol entry _is_ working on that patient. A patient's write reaching
  those same services would therefore reorder Morgane's roster, which is the opposite of what the
  owner chose when they asked for a separate `link_last_wrote_at`. Rather than leaving each of the
  five later stubs to remember to suppress it, the helper puts the timestamp back
  (`restorePatientLastEdited`). It compares before writing, so a write that never touched the column
  costs nothing. The honest limit: an operator edit landing inside the same few milliseconds would
  be put back a second early. With one practitioner and fifteen patients that is a stale sort order
  nobody sees; the alternative is a failure that would be noticed daily.
- **A deviation from the spec's prose, deliberate.** Proposed change said `shared/audit.ts` would
  gain "the patient-side action names this epic will use". It gains none. The existing vocabulary
  already covers every write this epic makes except recipe feedback, and adding three names for it
  now would mean three dead rows in each of two `Record<AuditActionName, …>` maps in the console
  plus a filter option matching nothing — `CONVENTIONS.md` § leanness. `recipe-feedback-and-favourites`
  adds its name with its writer. No acceptance criterion is affected.
- **Read the order of checks in `writeThroughPatientLink` adversarially** — it is the security
  surface of the only unauthenticated write path in the monorepo. In particular: the ledger row is
  written _before_ the caller's write, so a valid token cannot retry rejected payloads for free.
- The memory client and the Neon adapter differ on `findMany` ordering (the adapter sorts
  `createdAt` desc, the memory client returns insertion order). Nothing here depends on it — the
  count filters by age rather than position — but it is worth knowing when reading the tests.
- To smoke-test before ticking Ready to merge: open a patient in the console preview and check the
  share-link card reads « Rien n'a encore été écrit depuis le lien. »; open that patient's
  `/p/<token>` and confirm the privacy card's new wording in both `fr` and `en`; confirm the six
  segments still render and the link still 404s on a regenerated token. There is no patient-facing
  write to exercise — that is `patient-home-today` and `meal-entry`.
