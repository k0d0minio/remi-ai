# Stub: promote.sh names a cancelled deployment as what production serves

- lane: chore
- found-by: the setup verification of 2026-10-31 · 2026-10-31
- complexity: low
- priority: P1

## Problem

`vercel_production_current` in `.icm/scripts/lib/vercel.sh` reads `.targets.production.id` of
the project. Vercel sets that field to the newest production deployment, even one the Ignored
Build Step cancelled. On 2026-10-31 `promote.sh status` printed « app: production serves
dpl_EhZbGvxhDeRJUpkkmKtisHaCSG8d » (CANCELED). The domain `app.remi-ai.tech` served
`dpl_DvrrNaz5dwurmY94wgwKo9QwQhzU` (READY, PROMOTED, 2026-09-25). `promote.yml` uses the same
read to decide that a project is current, so a promotion may skip a project or wait on the
wrong id.

## Proposed change

The blueprint owns `.icm/scripts/lib/vercel.sh`, so the change goes there, then `copier
update` here. Read what the production domain serves: `GET /v4/aliases/<production domain>`
gives `deploymentId`, or take the newest production deployment whose `readySubstate` is
`promoted`.

## Acceptance criteria

- [ ] `promote.sh status` prints the deployment id that the production domain serves.
- [ ] `promote.yml` compares the promoted id, not `.targets.production.id`.
