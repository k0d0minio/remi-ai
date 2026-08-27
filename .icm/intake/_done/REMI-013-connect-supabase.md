# REMI-013 · Connect Supabase — database and authentication

> **Dropped** (Jamie, 2026-08-27): the database is **Neon**, not Supabase, and it is being
> connected in a separate session — so this ticket is superseded end to end, not just in its
> vendor name. Tickets that still say "depends on REMI-013" should be read as depending on the
> database being connected at all.
>
> **Not carried anywhere yet**, and worth re-cutting once Neon lands: the checked-in migrations,
> deleting the fixture fallbacks so a missing database fails loudly instead of serving invented
> content (audit F-08), the development session refusing to run in production (audit F-32), and
> the RLS-or-application-level authorisation question that v1's IDOR defects make load-bearing.
> None of that was Supabase-specific.

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| Status         | dropped                                                          |
| **Type**       | feature                                                          |
| **Priority**   | P0 — Phase B; every real feature is blocked behind it            |
| **Size**       | A week or more                                                   |
| **Depends on** | REMI-007 (decision recorded), REMI-014 (entities modelled first) |
| **Blocked by** | A Supabase account and project, in an EU region                  |
| **Sources**    | Status report Phase B bullet 1 · audit F-08 – F-11, F-32         |

## Problem statement

The repository has a database seam — an interface and a registration point — and no adapter behind
it. Worse than empty: every screen in the signed-in app reads built-in fixture data instead, so a
missing database does not fail loudly, it serves invented content silently (audit F-08). There is
no authentication at all; the sign-in form ignores its own fields and a role radio button is the
whole "login" (audit F-32).

This ticket lands the first real adapter and the first real session. It is the hinge of Phase B.

## Required steps

1. Write the Supabase adapter for the database seam in `packages/services/src/db/`, with the
   registration point actually wired (audit F-11 — there is currently nowhere an adapter would be
   registered).
2. Grow the seam interface where the first real screens need it (audit F-09), and make the
   access-control model expressible through it (audit F-10, F-14) rather than bolted beside it.
3. Migrations, checked into the repo and run by the factory — not applied by hand against a live
   project.
4. Authentication, phase-1 scope (patient-first, 2026-08-27): Morgane's operator/admin account
   and patient accounts. The practitioner tier and the invite/QR binding are the parked phase
   (REMI-027, in `_done/` as parked) — leave clean room for them in the model, build neither now.
   Phase-1 patients arrive through profiles Morgane creates and the shareable patient link
   (REMI-035).
5. Delete the fixture fallbacks as each screen gains a real query. A screen with no data must fail
   visibly, never silently render fiction.
6. Make the development session refuse to run in production (audit F-32) before any real record
   exists.
7. Three-list rule for every new variable: `.icm/docs/ENV.md`, the zod schema, `turbo.json`.

## Open questions — flag these on pickup

- **Supabase Auth, or something else?** Audit D-3 is open; Supabase Auth is the default answer to
  beat now that D-2 is closed. Magic links are the decided shape — confirm that still holds for
  patients; practitioner 2FA belongs to the parked phase.
- **How does a patient actually arrive, phase 1?** Morgane creates the profile and shares the
  patient link (REMI-035). The QR/invite mechanism and its edge cases (patients without a
  practitioner, practitioner departure) are parked with the practitioner phase.
- **RLS or application-level authorisation?** v1's IDOR-riddled model (any signed-in user could act
  on any patient) is the thing not to repeat. Decide the enforcement layer deliberately.
- **Which EU region, and is the free tier enough for the beta?** Raise with REMI-007's answers.

## Acceptance criteria

- [ ] A real Supabase adapter is registered and serving at least one real screen.
- [ ] No screen silently renders fixture data where real data is expected.
- [ ] Morgane's admin account and patient accounts exist; the model leaves clean room for the
      parked practitioner tier and invite/QR binding.
- [ ] The development session cannot run in production.
- [ ] Migrations are in the repo; no schema change was made by hand only.
- [ ] Every new variable is in all three lists; no secret committed.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then packages/services/AGENTS.md
for how seams and adapters work here, then .icm/docs/history/audit-report.md findings F-08 to F-11,
F-14 and F-32, then .icm/docs/history/v1-report.md section 8 (the defects not to repeat).

Task: land the Supabase adapter and real authentication.
1. Implement the adapter in packages/services/src/db/ and create the registration point the audit
   found missing. Grow the seam interface where the first real screens need it.
2. Add checked-in migrations. Never apply a schema change by hand against the live project only.
3. Wire authentication for Morgane's admin account and patient accounts (phase 1,
   patient-first). Leave room for the parked practitioner tier and invite/QR binding; build
   neither now.
4. Remove fixture fallbacks as screens gain real queries — a missing database must fail loudly.
5. Make the development session refuse to run in production.
6. Keep the three-list env rule. Never commit a key.
Read v1's authorization defects before designing access control: any signed-in user being able to
act on any patient is the specific mistake to avoid. Do not run build/lint/typecheck/format
locally. Push a branch, open a PR, git mv this ticket into .icm/intake/_done/, and state in the PR
body which of the open questions above you had to assume an answer to.
```
