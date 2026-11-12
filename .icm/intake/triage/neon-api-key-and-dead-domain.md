# Stub: Remove the dead app.remiai.be domain

- lane: chore
- found-by: the setup verification of 2026-10-31 · 2026-10-31
- complexity: low
- priority: P2

## Problem

The domain `app.remiai.be`
is attached to the Vercel project `app` for production, and `remiai.be` has its nameservers at
GoDaddy with no record for it: NXDOMAIN, and Vercel marks it misconfigured. `.icm/environments.md`
lists it as a production address.

## Proposed change

Jamie decides, no file changes but `.icm/environments.md`: either remove `app.remiai.be` from `app` →
Settings → Domains or add its records at GoDaddy. Then correct the Address column of the app
Production row.

## Acceptance criteria

- [ ] `app.remiai.be` either answers over TLS or is attached to no Vercel project.
- [ ] The app Production row of `.icm/environments.md` names only addresses that answer.

## Notes

- The secret `NEON_API_KEY` stays: `neon-preview-cleanup.yml` reads it since `triage/neon-preview-branches-not-deleted` (2026-11-12).
