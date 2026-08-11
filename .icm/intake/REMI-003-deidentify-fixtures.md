# REMI-003 · De-identify fixtures: fictional practitioner, reserved email domains

|                |                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------- |
| **Type**       | chore                                                                                           |
| **Priority**   | P0 (compounds with F-30 while exposure is unverified)                                           |
| **Size**       | An hour                                                                                         |
| **Depends on** | —                                                                                               |
| **Blocked by** | — (REQ-28 asks whether a real Dr Mouton relationship exists, but the rename is safe either way) |
| **Sources**    | audit F-33; info-gathering REQ-28                                                               |

## Problem statement

A real, named, identifiable practitioner ("Dr Georges Mouton", FunMedDev, Brussels) appears in
`apps/admin/lib/fixtures.ts` with entirely invented professional activity: fabricated patient
rosters, sign-in history, and client counts. Fabricated activity attributed to a real person is
personal data under GDPR and a reputational risk if the console leaks. Fourteen other fixture
practitioners use plausible real `.be` email domains that could belong to actual practices.

## Required steps

1. Rename the real practitioner record to a clearly fictional person; remove the real clinic
   name and any other identifying details.
2. Switch every fixture email address to a reserved domain (`example.com` / `example.be`-style
   RFC 2606 domains).
3. Sweep all fixture files in all apps (not just admin) for other real names, real clinics, or
   plausibly-real contact details.
4. If fixture data is generated or referenced elsewhere (tests, demo app), keep it consistent.

## Acceptance criteria

- [ ] No real person's name appears anywhere in fixture data.
- [ ] All fixture emails use reserved documentation domains.
- [ ] A repo-wide search for the removed names returns zero hits outside git history.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
finding F-33.

Task: de-identify all fixture data.
1. In apps/admin/lib/fixtures.ts, find the record for the real practitioner (around lines
   203-215, "Dr Georges Mouton" / "FunMedDev") and replace name, clinic, and location with a
   clearly fictional equivalent, keeping the data shape identical.
2. Replace every fixture email across the repo that uses a plausible real domain (especially .be
   practice domains) with reserved domains like practice-name@example.be or @example.com.
3. Grep the whole repo (all apps and packages, fixtures, demo app, seeds) for any other real
   person/clinic names or contact details in invented data and fix them the same way.
4. Preserve referential consistency: if other fixtures reference the renamed practitioner by id
   or name, update them.
Do not run build/lint/typecheck locally (factory-owned). Push a feature branch and open a PR
listing every identity changed.
```
