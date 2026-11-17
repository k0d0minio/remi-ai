# Stub: Set the origin variables of each Vercel project to the remiai.be addresses

- lane: chore
- found-by: triage/remiai-be-addresses · 2026-11-17
- complexity: low
- priority: P1

## Problem

`APP_URL` and the four `NEXT_PUBLIC_*_URL` variables decide each cross-app link, canonical URL,
invitation and share link (`packages/services/src/shared/links.ts`). The production and uat
targets of the Vercel projects can still hold a `remi-ai.tech` address, which is discontinued
(D-37). The build inlines the `NEXT_PUBLIC_*` values. Not read on 2026-11-17: the session had no
access to the Vercel team.

## Proposed change

Jamie sets the variables on production and uat of `app`, `admin` and `marketing`, and on
production of `documentation`, to the addresses of `.icm/environments.md`. Then redeploy each
target.

## Acceptance criteria

- [ ] No variable of a Vercel project holds a `remi-ai.tech` address
- [ ] On uat, a link from `app` to `admin` goes to `https://uat-admin.remiai.be`
- [ ] On production, an operator invitation names `https://admin.remiai.be`
