# Release: at-a-glance-page

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on e9dd360 (ci-status.sh, after the last push)
- pr: #93 https://github.com/k0d0minio/remi-ai/pull/93 · merged: no (this is the live record at close-out; the step-13 report carries the post-merge SHA)
- code-review: high (complex) — manual fresh-eyes pass over the new-diff files (navigation island, prep-note, page composition, service/action pair, barrel exports, migration). Findings: two minor UX edges in `prep-note.tsx` (post-save stale-prop flicker; blur/click double-submit race) — parked, not merge-stopping. Wiring, segment mapping, counts and guards verified clean.
- production-readiness: run — storage touched. Migration 0012 is additive (one nullable `text` column), applied successfully to the live DB from the admin preview build; no `down` exists in any migration repo-wide (up-only drizzle convention, 0000–0012). No env var is new in this diff (three files + two dashboards untouched); the `ALLOW_NON_PRODUCTION_MIGRATIONS` Vercel preview-only variable was added at the owner's request during Build's preview fix and was already in `.icm/docs/ENV.md`. Storage adapter registration unchanged; `db:migrate`'s table-presence check passed.
- security-review: run — pass. The diff adds one free-text PII column plus one server action. Guard asserted twice: `requireOperator()` in the action, and the write goes through `@remi/services/server` (zod `text` = trim, max 10000) with an idempotent read-before-write and an audit entry (`next_consultation_prep.updated`) only on a real change. The patient link (`/p/[token]`, `apps/web`) is untouched and never renders the column. No auth, payments or route policy changes.
- parked: `at-a-glance-prep-note-polish` (.icm/intake/triage/) — the two non-blocking UX findings above
- technical docs: `apps/docs/app/technical/applications/page.mdx` — new § The operator's patient page
- business docs: `apps/docs/app/business/roles/page.mdx` — Operator "What they can see" now names the working view and the navigation
- release notes: both
- sent: ship note — to send after merge (step 12)
- closed out: RESULT: CLOSED — run archived (step 9); epic `practitioner-workflow` keeps 5 stubs, not finished by this run

## Acceptance check (vs spec)

- [x] The patient page opens on a working view that lands on status, active goals (most recent measure first, then the direction), the active instruction, the summary head (expandable inline), the last meals with the awaiting-feedback count, the first recommendation of each category, the new "à préparer pour la prochaine consultation" note, and four quick actions — built in `page.tsx` + `working-*` components, per Build notes.
- [x] Every secondary section sits behind navigation and its body is untouched — the 17 cards are wrapped as sections, not rewritten; confirmed in `page.tsx` and by `apps/admin/AGENTS.md` § Interface rewrite.
- [x] `next_consultation_prep` nullable text column + the one-field `setPatientNextConsultationPrep` service action (read-modify, `""`→null), migration `0012`, `PatientProfile` model field, unit tests — per Build notes.
- [x] One DOM order, three views — `page.tsx` renders sections once; `patients.css` media queries + the `data-segment` attribute drive show/hide; the desktop rail and phone segments are two views over the same order.
- [x] At most five segments (four used): Suivi · Journal · Dossier · Profil; the active segment lives in the URL (`?segment=`) so a link lands on it and back-navigation restores it.
- [x] Desktop section index is sticky, marks the current section via scroll-spy, and clicking scrolls.
- [x] Stale goals card description ("Rien de tout cela ne s'affiche sur le lien patient") removed; the secondary card description now ends at "…pour cet accompagnement."
- [x] `apps/admin/AGENTS.md` § Interface rewritten to the spec's text — lib/AGENTS.md on `main` will show it once merged.
- [x] Docs updated in this PR (Release's step): `technical/applications` + `business/roles`, above.

## Notes for the owner

- The `ALLOW_NON_PRODUCTION_MIGRATIONS` topic is documented at `.icm/docs/ENV.md:105-114`; the preview-only variable in Vercel can be removed once a future PR stops needing unmerged-column previews, or left as the standing preview-migration policy.
- Build's segment mapping (owner-confirmed) omitted the "Résumé vivant" card — assigned to Suivi as the natural home; see `03_build/output/notes.md`.
- Prep-note polish parked at `.icm/intake/triage/at-a-glance-prep-note-polish.md`.
