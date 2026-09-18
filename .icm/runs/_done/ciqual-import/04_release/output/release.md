# Release: ciqual-import

- gate: Ready to merge ticked — merge authorised
- ci: GREEN — `ci-status.sh` on the close-out head, established after the last push and re-read
  immediately before the squash-merge. Every blocking check plus all six Vercel deploys, admin
  included; `Vercel – demo` skipped by `turbo-ignore` on the final docs-only diff, which
  `ci-status.sh` reports as skipped rather than counting as a pass.
- pr: #102 — https://github.com/k0d0minio/remi-ai/pull/102 · merged: yes — 2026-09-17
- code-review: high (spec complexity: complex) — 5 findings. Four were in this run's own code and
  are fixed on the branch: (1) `/aliments/[code]` formatted the parsed float through `Intl`, whose
  three-fraction-digit default rendered every measured value under 0,0005 as « 0 » — eight in the
  committed subset alone, including the EPA and DHA codes the recommendation map ranks on, so the
  page said « contains none » where the table says otherwise; it now prints the publisher's own
  string. (2) The import script hashed the BOM-stripped text, so a recorded checksum never matched
  `sha256sum`, defeating the only reason to store it; it now hashes the bytes as shipped and the
  two agree. (3) `allFoods()` memoised an empty catalogue, so the first request on a fresh
  deployment — which is every deployment until the import runs — would have served « nothing » for
  the life of the instance, past the import. (4) `pnpm ciqual:import ./dir` from the repo root
  resolved the relative path under `packages/services`; it now resolves against `INIT_CWD`, and
  both invocations are verified against the real export. The fifth is latent with no caller and is
  parked. None was stop-class.
- production-readiness: run (the diff adds a migration and touches `db/`). **No new environment
  variable**, so `.icm/docs/ENV.md`, `env.ts`, `turbo.json` and both dashboards are untouched by
  design — the only `process.env` reads added are in the maintenance scripts, the documented
  carve-out `migrate.mjs` and `drizzle.config.ts` already use. No new service adapter; the storage
  seam is unchanged and the Neon adapter derives its collections from the schema, with
  `neon.test.ts` pinning the three new table names. `ensureDatabase()` is called in both new
  routes. The migration adds three tables and touches no existing one, so old code ignores them
  and the admin build's `db:migrate` can run ahead of the deploy. **No `down` migration**: this
  repo has none for any of its fifteen, so that is the standing convention rather than a
  regression here. The migration is written `IF NOT EXISTS` — see the run notes for why that is
  load-bearing rather than defensive.
- security-review: run (the diff adds two console routes, so route policy is in scope). No
  findings. Both routes live inside the `(admin)` group, whose layout calls `requireOperator()`;
  neither writes, so there is no server action to guard twice and no audit entry owed. The one
  user-supplied value that reaches storage is the `[code]` path segment, which goes through the
  seam's exact-match filter and is parameterised by Drizzle. Search filters in memory over an
  already-fetched page rather than building a query. No PII, no payments, no `app/api/` route, no
  new auth surface. The only regex built from data is over this repo's own phrase list, escaped.
- parked: `rank-by-component-ignores-direction.md`, `preview-deploys-migrate-production.md`,
  `changelog-index-missing-entries.md`
- technical docs: `technical/decisions` (the edition, the DOI, the Etalab terms and the marker
  decision), `technical/applications` (the food table in the console). `apps/admin/AGENTS.md`
  corrected — « nothing else lives here » had stopped being true.
- business docs: no business docs impact. `business/scope` does not name the nutrition-knowledge
  layer because decision #7 post-dates it; `.icm/docs/` outranks the page, so this is recorded as
  drift on the spec's open questions rather than silently rewritten here.
- release notes: both
- sent: **not sent.** `send-ship-note.sh --send` refused: none of `RESEND_API_KEY`,
  `SHIP_NOTE_RECIPIENTS`, `SHIP_NOTE_FROM` or `EMAIL_FROM` is set in the session Release ran in, so
  even the dry run cannot render a sender. The note is written and its links are filled — it is
  ready to send from anywhere those variables exist. Recorded rather than quietly dropped, and
  raised as `.icm/intake/triage/ship-note-unsendable-from-remote-sessions.md`.
- closed out: RESULT: CLOSED — run archived. The `nutrition-knowledge` epic is not finished by this
  run; `nutrition-rules` is still open in it.

## Acceptance check (vs spec)

- [x] Tables behind the seam with generated migrations — `pnpm db:generate` reports no drift, and
      the migration applied for real on the admin preview.
- [x] `pnpm ciqual:import <dir>` — parse verified against the genuine Ciqual 2025 export: 74
      components, 3 484 foods, 257 816 rows, marker histogram matching the source counted
      independently. The write half is the owner's, per the Ready-to-merge tick.
- [x] Idempotent — natural keys plus `on conflict do update`; proven by construction and by the
      owner's own run.
- [x] Refuses a mismatched component vocabulary — `checkComponents`, unit-tested.
- [x] Markers survive: `traces`, `< x`, `-`, decimal commas — unit-tested on strings copied from
      the real export, and the dry-run histogram matches it exactly.
- [x] Confidence codes A–D on every row.
- [x] Fixture committed, spans all 11 named groups, regenerable, `LICENCE.md` present.
- [x] Accent- and case-insensitive search, proven through the in-memory client.
- [x] `getFoodNutrients` returns names, units, markers and confidence.
- [x] `rankFoodsByComponent` honours group and both exclusions, and never ranks an unmeasured
      value.
- [x] Services tested against `createMemoryDatabase()` — 300 tests pass, 48 new. No coverage gate
      exists in CI yet, so the floor is argued from the tests rather than measured.
- [x] `shared/nutrition.ts` maps the twelve phrasings to their codes with no model call.
- [x] The console home line, and `/aliments` operator-only with attribution — attested by the
      Ready-to-merge tick.
- [x] `technical/decisions` records the edition, the DOI and the licence.
