# Stub: Delete the unread NEON_API_KEY secret, and the dead app.remiai.be domain

- lane: chore
- found-by: the setup verification of 2026-10-31 · 2026-10-31
- complexity: low
- priority: P2

## Problem

The repository secret `NEON_API_KEY` (set 2026-10-29) has no reader: `.icm/docs/ENV.md` named
`preview-db.yml` and `neon-cleanup.yml`, and neither workflow exists. The domain `app.remiai.be`
is attached to the Vercel project `app` for production, and `remiai.be` has its nameservers at
GoDaddy with no record for it: NXDOMAIN, and Vercel marks it misconfigured. `.icm/environments.md`
lists it as a production address.

## Proposed change

Jamie decides, no file changes but `.icm/environments.md`: delete the secret under GitHub →
Settings → Secrets and variables → Actions, and either remove `app.remiai.be` from `app` →
Settings → Domains or add its records at GoDaddy. Then correct the Address column of the app
Production row.

## Acceptance criteria

- [ ] `gh secret list -R k0d0minio/remi-ai` lists no `NEON_API_KEY`.
- [ ] `app.remiai.be` either answers over TLS or is attached to no Vercel project.
- [ ] The app Production row of `.icm/environments.md` names only addresses that answer.
