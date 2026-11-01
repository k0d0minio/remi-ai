# Stub: Move the client's addresses to remiai.be

- lane: chore
- found-by: Jamie's answers on the setup verification · 2026-11-01
- complexity: low
- priority: P2
- blocked: Jamie has no access to the registrar of remiai.be yet. Remove the line when the access exists.

## Problem

`remiai.be` is the address the client will use. Today the apps answer on `remi-ai.tech`:
`app.remi-ai.tech`, `admin.remi-ai.tech`, `uat-app.remi-ai.tech`, `uat-admin.remi-ai.tech`,
`remi-ai.tech` and `docs.remi-ai.tech`. `remiai.be` has its nameservers at GoDaddy with no
record for the apps: `app.remiai.be` is attached to the Vercel project `app` and answers
NXDOMAIN. `.icm/environments.md` names `https://app.remiai.be`, `https://uat-app.remiai.be` and
`https://uat-admin.remiai.be` as addresses that do not answer.

## Proposed change

Jamie does the act when the registrar access exists, then a chore run edits `.icm/environments.md`:

1. At the registrar of `remiai.be`: either point the nameservers at Vercel, or add one CNAME per
   address (`app`, `admin`, `uat-app`, `uat-admin`, `docs`, `www`) to `cname.vercel-dns.com`
   and the A record of the apex to Vercel's address.
2. In Vercel, team `remi21`: attach `app.remiai.be` (production) and `uat-app.remiai.be` (uat)
   to `app`; `admin.remiai.be` (production) and `uat-admin.remiai.be` (uat) to `admin`;
   `remiai.be` and `www.remiai.be` to `marketing`; `docs.remiai.be` to `documentation`. For
   each uat domain, add a Deployment Protection exception, as for `uat-admin.remi-ai.tech`.
3. In Vercel, set `APP_URL` and the `NEXT_PUBLIC_*` origin variables on production and uat to
   the new addresses, then redeploy (they are inlined at build).
4. In `.icm/environments.md`, write the `remiai.be` address in each Address cell, and keep the
   `remi-ai.tech` address beside it until it is removed from Vercel.
5. Update the auth trusted domains of Neon Auth on both Neon projects to the new addresses.

Overlap: `triage/neon-api-key-and-dead-domain.md` proposes to remove `app.remiai.be` from `app`
or add its records. This stub adds the records. Jamie prunes one of the two.

## Acceptance criteria

- [ ] Each `remiai.be` address in `.icm/environments.md` answers over TLS with the right app.
- [ ] `APP_URL` on production and uat of `app` and `admin` names the `remiai.be` address.
- [ ] `.icm/environments.md` names no address that does not answer.
