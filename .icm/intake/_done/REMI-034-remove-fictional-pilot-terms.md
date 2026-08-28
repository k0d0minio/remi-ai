# REMI-034 · Remove the fictional pilot terms from the admin console

|                |                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Status         | **done** — the pilot page and its fixtures were deleted with the admin-console narrowing                                        |
| **Type**       | fix — confidentiality / truthfulness                                                                                            |
| **Priority**   | P0 — publicly visible fabricated contract terms                                                                                 |
| **Size**       | An hour                                                                                                                         |
| **Depends on** | —                                                                                                                               |
| **Blocked by** | —                                                                                                                               |
| **Sources**    | REMI-002 step 3 (deliberately deferred) · REMI-001 (deployment protection measured OFF in production) · history/audit-report.md |

## Problem statement

`apps/admin/lib/fixtures.ts` (the `pilotTerms` object, around line 1036) still declares
**"€24.50 / month"**, a **"1 September 2026"** billing start and a 15-seat cap, rendered by
`apps/admin/components/pilot/pilot-terms.tsx` on `apps/admin/app/(admin)/pilot/page.tsx`
under wording that presents every line as **fixed by a signed agreement. No such agreement
exists** — the direction report established this figure was fixture data an earlier audit
mistook for a contract. Under the new direction (patient-first, commercialisation from the
19 Dec open day) it is doubly wrong: there is no pilot of this shape at all.

REMI-001 measured the admin app's deployment protection as **OFF in production**, so this
fabricated "signed" document is publicly reachable. REMI-002 removed the equity offer and
consciously deferred this artefact; no other open ticket covers it.

## Required steps

1. Delete the `pilotTerms` fixture from `apps/admin/lib/fixtures.ts` and the
   `PilotTerms` rendering from the pilot page (`apps/admin/app/(admin)/pilot/page.tsx`,
   `apps/admin/components/pilot/pilot-terms.tsx`) — or replace the section with an honest
   empty state ("No pilot terms agreed yet") if the page layout needs a block there.
2. Sweep `apps/admin` for any other copy asserting signed pilot terms, the €24.50 figure,
   or the 1 September date, and remove it.
3. Note the removal in the PR description as the completion of REMI-002's deferred step 3.

## Open questions — flag these on pickup

- **Empty state or full removal?** If the pilot page becomes trivially empty, removing the
  route from the nav may be cleaner — flag rather than decide.

## Prompt

Read `.icm/intake/REMI-034-remove-fictional-pilot-terms.md` at the repo root for full
context. The admin console still renders fabricated "signed" pilot terms (€24.50/month,
1 September 2026) from `apps/admin/lib/fixtures.ts`; no such agreement exists. Remove the
fixture and its rendering per the required steps, flag the open question in the PR, and
open a PR on a `claude/` branch. Do not run local checks — CI is the source of truth.
