# REMI-013 · Connect Supabase — database and authentication

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| Status         | ready once REMI-007 and REMI-014 land                            |
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
4. Authentication: practitioner accounts and patient accounts, plus the **invite / QR link** that
   binds a patient to the practitioner who brought them. That link is the acquisition mechanism,
   not a detail.
5. Delete the fixture fallbacks as each screen gains a real query. A screen with no data must fail
   visibly, never silently render fiction.
6. Make the development session refuse to run in production (audit F-32) before any real record
   exists.
7. Three-list rule for every new variable: `.icm/docs/ENV.md`, the zod schema, `turbo.json`.

## Open questions — flag these on pickup

- **Supabase Auth, or something else?** Audit D-3 is open; Supabase Auth is the default answer to
  beat now that D-2 is closed. Magic links are the decided shape — confirm that still holds for
  practitioners, who may need 2FA.
- **How does a patient actually arrive?** QR code, invite link, or both; whether they can exist
  without a practitioner; what happens when a practitioner leaves. The braindump names the
  mechanism but not its edge cases.
- **RLS or application-level authorisation?** v1's IDOR-riddled model (any signed-in user could act
  on any patient) is the thing not to repeat. Decide the enforcement layer deliberately.
- **Which EU region, and is the free tier enough for the beta?** Raise with REMI-007's answers.

## Acceptance criteria

- [ ] A real Supabase adapter is registered and serving at least one real screen.
- [ ] No screen silently renders fixture data where real data is expected.
- [ ] Practitioner and patient accounts exist, with the invite/QR binding between them.
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
3. Wire authentication for practitioner and patient accounts, plus the invite/QR link that binds a
   patient to their practitioner.
4. Remove fixture fallbacks as screens gain real queries — a missing database must fail loudly.
5. Make the development session refuse to run in production.
6. Keep the three-list env rule. Never commit a key.
Read v1's authorization defects before designing access control: any signed-in user being able to
act on any patient is the specific mistake to avoid. Do not run build/lint/typecheck/format
locally. Push a branch, open a PR, git mv this ticket into .icm/intake/_done/, and state in the PR
body which of the open questions above you had to assume an answer to.
```
