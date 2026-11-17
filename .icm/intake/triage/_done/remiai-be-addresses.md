# Stub: Record remiai.be as the only domain, and the uat environment of marketing

- lane: chore
- found-by: the remiai.be domain setup · 2026-11-03
- complexity: low
- priority: P1

## Problem

Jamie retires `remi-ai.tech` (2026-11-03). `remiai.be` is the only domain. The repo still names
the old addresses:

- `.icm/environments.md` names `remi-ai.tech` addresses, and `uat-*.remiai.be` rows that did not exist.
- `.icm/docs/ENV.md` names the `remi-ai.tech` uat addresses and `EMAIL_FROM` on `mail.jamienisbet.com`.
- `packages/services/src/shared/links.ts` keeps the placeholder root domain `jamienisbet.com`.
- D-36 says that `marketing` has no uat. `marketing` now has the custom environment `uat` at `https://uat.remiai.be`.

## Proposed change

Update the files to the addresses below. Record the marketing uat as a decision that amends D-36.
Close `triage/neon-api-key-and-dead-domain` for its domain half.

| Project         | Production                | uat                           |
| --------------- | ------------------------- | ----------------------------- |
| `marketing`     | `https://remiai.be`       | `https://uat.remiai.be`       |
| `app`           | `https://app.remiai.be`   | `https://uat-app.remiai.be`   |
| `admin`         | `https://admin.remiai.be` | `https://uat-admin.remiai.be` |
| `documentation` | `https://docs.remiai.be`  | none                          |

## Acceptance criteria

- [ ] `.icm/environments.md` names only `remiai.be` addresses, and has a marketing uat row.
- [ ] `.icm/docs/ENV.md` names the `remiai.be` uat addresses.
- [ ] `links.ts` uses `remiai.be` as its root domain.
- [ ] `.icm/intake/README.md` records the marketing uat and how marketing production moves.
- [ ] No file names `remi-ai.tech`, except in history.

## Notes

Carried from `triage/_done/move-addresses-to-remiai-be.md` (dropped 2026-11-12). These steps are not in the criteria above. Do them in this run, or park each one as its own stub:

1. Set `APP_URL` and the `NEXT_PUBLIC_*` origin variables on production and uat of `app` and `admin` to the `remiai.be` addresses. Then redeploy, because the build inlines them.
2. Set the Neon Auth trusted domains of both Neon projects to the `remiai.be` addresses.
3. Verify `remiai.be` in Resend. Then set `EMAIL_FROM` to `REMI <no-reply@remiai.be>` on every target of `admin`.
