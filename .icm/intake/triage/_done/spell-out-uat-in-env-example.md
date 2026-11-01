# Stub: Spell out each variable's value per target in .env.example, and close the setup acts

- lane: chore
- found-by: Jamie's answers on the setup verification · 2026-11-01
- complexity: low
- priority: P0

## Problem

Jamie fills the `uat` environment of `app` and `admin` from `.env.example`. The notes name a
target but not the value each target takes: `APP_URL` on `uat` is the UAT address,
`AUTH_SECRET` on `uat` is its own value, `BLOB_READ_WRITE_TOKEN` on `uat` is the token of the
`uat-document-storage` store, `RESEND_API_KEY` on `uat` is a test key. The eight setup stubs
are done on Jamie's word of 2026-11-01, and the `remiai.be` addresses wait for access to the
registrar. The three questions for Jamie in `patient-signup-account/breakdown.md` are answered.

## Proposed change

Write the value per target in each note of both `.env.example` files, and the same in
`.icm/docs/ENV.md`. Move the eight setup stubs into `setup/_done/` with `> Done: Jamie,
2026-11-01`. Write the triage stub `move-addresses-to-remiai-be`. Record Jamie's three answers
in the breakdown.

## Acceptance criteria

- [ ] Each note in `apps/web/.env.example` and `apps/admin/.env.example` says what value `uat` takes, or that the Neon or Blob integration sets it.
- [ ] `.icm/intake/setup/` holds no open stub. Each stub in `setup/_done/` starts with `> Done: Jamie, 2026-11-01`.
- [ ] `.icm/intake/triage/move-addresses-to-remiai-be.md` exists and names the DNS, Vercel and `.icm/environments.md` steps.
- [ ] `patient-signup-account/breakdown.md` records the three answers under Questions for Jamie.
