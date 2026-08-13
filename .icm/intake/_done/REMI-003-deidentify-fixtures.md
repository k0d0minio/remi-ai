# REMI-003 · De-identify fixtures: fictional practitioner, reserved email domains

|                |                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Status         | ready                                                                                           |
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

- [x] No real person's name appears anywhere in fixture data.
- [x] All fixture emails use reserved documentation domains.
- [x] A repo-wide search for the removed names returns zero hits in fixture data — see the note on
      the criterion's literal wording below.

## Progress — 2026-08-13 (PR #41, merged)

The real practitioner is fictional everywhere, and every fixture address is unroutable.

**The identity**, replaced across `apps/admin`, `apps/web` and `apps/demo`: Dr Georges Mouton →
**Dr Hélène Vasseur**; FunMedDev → **Cabinet Vasseur**; Brussels → **Waterloo**. The ids followed
it — `georges-mouton`, `app-georges-mouton`, `prac_mouton` and `frame_funmeddev` became
`helene-vasseur`, `app-helene-vasseur`, `prac_vasseur` and `frame_vasseur` — as did the three
"Referred by …" application sources and the demo's `practitionerName` / `clinicName` / `frameName`
constants, which every demo screen renders from.

**The addresses**: all eighteen moved onto domains RFC 2606 reserves — the fourteen admin practice
addresses from `.be` to `.example`, and the four web patient addresses from `example.be` to
`example.com`.

One deliberate departure from step 2's wording: `example.be` is a **registered** `.be` domain, not
a reserved one. RFC 2606 reserves `example.com` / `.net` / `.org` and the whole `.example` TLD, so
those are what the fixtures use. That meets the second criterion more strictly than the literal
suggestion would have.

**Two invented practices** were renamed off real organisations found during the step-3 sweep:
`Centre Nutrisens` → `Centre Delcourt` (a French medical-nutrition company) and
`Sint-Rafaël nutrition` → `Praktijk Peeters` (a UZ Leuven campus), both following through to their
support tickets and audit-log entries.

### On the third criterion's literal wording

"Zero hits repo-wide" cannot be met, and should not be. The name legitimately remains in two
places, neither of which is invented data:

- **`apps/marketing`** names Dr Georges Mouton and FunMedDev as a real partner in true, published
  copy — the content file's own comment records that the founders confirmed the partnership. F-33 is
  about _fabricated_ activity attributed to a real person; removing a real partner from real copy is
  the founders' decision, not this ticket's.
- **`.icm/docs/` and this ticket** name him because they are the record of the finding. Erasing that
  would destroy the audit trail.

`apps/admin/lib/questions.ts` also asks the founders what the FunMedDev partnership covers — a
business question about a real relationship, not fixture data.

### Noted, not changed

`apps/web/lib/content/fr.ts:37` uses `vous@exemple.com` as the French email placeholder, and
`exemple.com` is a registered domain. It is product copy rather than fixture data, so it sat outside
this ticket's scope; `vous@example.com` would be reserved.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/audit-report.md
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
