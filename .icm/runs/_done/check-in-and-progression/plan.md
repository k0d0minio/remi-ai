# Plan: check-in-and-progression

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Schema and migration** — `packages/services/src/db/schema.ts` (`patient_goal_check_ins`: nullable
   `score` integer with a 0–5 check, nullable `seen_at` timestamptz), one new migration under
   `packages/services/src/db/migrations/` + its journal entry (database-migration skill: nullable adds
   only, reversible) — done when: the migration applies on a fresh branch database and existing rows
   read back unchanged.
2. **Services** — `packages/services/src/db` (goal check-in services) + `src/shared` (types, a `scoreRange`
   constant beside `goalDirections`): a patient weekly check-in write (per rated goal: score, note,
   direction vs that goal's previous *patient* score, `written_by: patient`, `checked_on` today; refuses
   an empty submission; writes nothing when a patient check-in exists inside the 7-day window — checked
   in the same transaction), a read of the last patient check-in date, a per-goal score series (last 12),
   the closed-challenges list, a last-7-days meal count, a count of unseen patient *worse* rows, and a
   mark-seen (idempotent) — done when: each is exported from `@remi/services/server` and the services
   package builds.
3. **Link: the home card** — `apps/web/lib/patient-link/{load,actions,write}.ts`,
   `apps/web/components/patient-link/` (a weekly check-in card: goals in her order, six buttons each,
   optional word; the answered line otherwise), `apps/web/app/[locale]/p/[token]/page.tsx`,
   `apps/web/lib/content/{fr,en,types}.ts` — done when: the card shows/hides by the 7-day rule, a submit
   writes through the link-writes path (rate limit + audit), and a second submit is a no-op.
4. **Link: « Ma progression »** — `segments.ts` (+ `progression`), `visibleSegments` (active goal or closed
   challenge), `apps/web/app/[locale]/p/[token]/progression/page.tsx`, a strip component (design-system
   primitives, no chart library), content in both locales — done when: the segment renders the strips,
   the consigne, the 7-day meal count and past challenges with outcomes, and hides when empty.
5. **Console** — `apps/admin/components/patients/goal-trail.tsx` (score « 3/5 », « écrit par la
   patiente », « Vu » on unseen worse rows), the at-a-glance goals slot in
   `apps/admin/app/(admin)/patients/[id]/page.tsx` (the same strip — reuse the link's strip only if it
   can live in `@remi/ui`; otherwise a console twin, never an app→app import), the awaiting line worded
   like the meals' (`working-meals.tsx` pattern), a mark-seen action in `apps/admin/lib/patients/actions.ts`
   — done when: a patient worse row counts, « Vu » clears it, practitioner rows never count, and her
   consultation form is untouched.
6. **Prove it** — push, flip ready, `ci-status.sh` GREEN on the full tier with the web and admin previews
   — done when: GREEN, and every acceptance criterion is ticked against the preview.

## Risks

- **The 7-day window and "today"** — the link's notion of today must be the same one `checked_on` uses
  (a calendar date, no timezone drift); signal: the card reappears or vanishes a day early around midnight.
- **Double submit** — two tabs racing past the window check would write two weeks' rows; the check and
  the insert share one transaction. Signal: two patient rows on the same goal and day.
- **Direction baseline** — "previous score" is the goal's previous *patient* row with a score, not
  Morgane's latest check-in (which has none); signal: a first-ever score shown as worse.
- **Schema contention** — `patient-documents-and-links` and `general-feedback` also touch `schema.ts`
  and the migrations journal; if either is open when Build runs, rebase the journal entry, never renumber
  a merged one.
