# Stub: Make the marketing canonical address the address that answers

- lane: bug
- found-by: the UAT audit · 2026-11-12
- complexity: low
- priority: P2

## Problem

On production, `https://www.remiai.be/fr` has `<link rel="canonical" href="https://remiai.be/fr">`.
`https://remiai.be/fr` answers `308` to `https://www.remiai.be/fr`. `robots.txt` names
`https://remiai.be/sitemap.xml`. A canonical that redirects weakens the canonical signal. The
origin comes from `NEXT_PUBLIC_MARKETING_URL` on the production target of the Vercel project
`marketing` (`appOrigin("marketing")` in `packages/services/src/shared/links.ts`). The redirect is a
domain setting of the same project. No code changes.

## Proposed change

Jamie chooses one primary address, then makes the two settings agree:

1. Keep `www.remiai.be` primary: set `NEXT_PUBLIC_MARKETING_URL` to `https://www.remiai.be` on production. Redeploy.
2. Make `remiai.be` primary: in Vercel `marketing` › Settings › Domains, redirect `www.remiai.be` to `remiai.be`.

Then update `.icm/environments.md` and `.icm/docs/ENV.md` to the chosen address.

## Acceptance criteria

- [ ] The production canonical URL answers `200` with no redirect.
- [ ] The production `robots.txt` sitemap URL answers `200` with no redirect.
- [ ] `.icm/environments.md` names the chosen address.
