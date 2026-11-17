# Stub: Neon Auth trusts only the remiai.be addresses

- lane: chore
- found-by: triage/remiai-be-addresses · 2026-11-17
- complexity: low
- priority: P1

## Problem

The Neon API on 2026-11-17: Neon Auth of the Neon project `remi-ai` (production) trusts four
origins: `https://admin.remi-ai.tech`, `https://app.remi-ai.tech`, `https://app.remiai.be` and
`https://admin.remiai.be`. The two `remi-ai.tech` origins are discontinued (D-37). The trusted
origins of the Neon project `uat-remi-ai` were not read.

## Proposed change

Remove the two `remi-ai.tech` origins from `remi-ai`. Read the origins of `uat-remi-ai`: they
must be `https://uat-app.remiai.be` and `https://uat-admin.remiai.be`.

## Acceptance criteria

- [ ] Neon Auth of `remi-ai` trusts only `https://app.remiai.be` and `https://admin.remiai.be`
- [ ] Neon Auth of `uat-remi-ai` trusts only the two uat addresses of `.icm/environments.md`
- [ ] A sign-in on `https://uat-app.remiai.be` and on `https://uat-admin.remiai.be` works
