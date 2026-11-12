# Stub: A preview's cross-app links point at production

- lane: bug
- found-by: Jamie, the admin preview of PR 200 · 2026-11-12
- complexity: medium
- priority: P1

## Problem

On the admin preview of a branch, « Mon lien d'inscription » reads
`https://app.remiai.be/fr/inscription/<token>`. That is the production `app`. A patient who signs
up from a preview link lands in production, so nobody can test a patient flow on a preview.

`appOrigin` in `packages/services/src/shared/links.ts` answers `NEXT_PUBLIC_APP_URL` first. The
value is inlined at build time. The Vercel project `admin` sets `NEXT_PUBLIC_APP_URL` and
`NEXT_PUBLIC_ADMIN_URL` for the `uat` environment only (`vercel env ls --project admin`). A
preview build gets the production origin from another source (a team variable, or a value that
the CLI list does not show). The same rule builds the share link (`/p/<token>`), the operator
invitation (`/invitation/<token>`) and the links of `marketing`.

The `app` preview of the same branch has its own database: the Neon branch `preview/<branch>` in
`uat-remi-ai`, the same branch as the `admin` preview. So a link to the branch's own `app`
preview reaches the same data.

## Proposed change

On a Vercel preview, build each cross-app origin from the branch alias of the target project:
`https://<project>-git-<branch>-remi21.vercel.app`. Read the branch alias from
`NEXT_PUBLIC_VERCEL_BRANCH_URL` and replace this project's name with the target's (`app`,
`admin`, `marketing`, `documentation`). Keep `NEXT_PUBLIC_*_URL` for `uat` and Production. When a
preview cannot build the alias, fall back to the UAT origin, never to production. Update
`.icm/docs/ENV.md`. Check that Neon Auth accepts a sign-up from a `*.vercel.app` preview host. If
it does not, record the act that only Jamie can do (the trusted domain in the Neon console).

## Acceptance criteria

- [ ] On the admin preview of a branch, « Mon lien d'inscription » starts with `https://app-git-<branch>-remi21.vercel.app/fr/inscription/`.
- [ ] The patient share link and the operator invitation link on a preview use the preview origins of their apps.
- [ ] A preview never builds a link to a production origin.
- [ ] `uat` and Production links do not change.
- [ ] A test patient can sign up on the `app` preview from the admin preview's link, and the journal on the admin preview shows the patient's events.
- [ ] A unit test covers the origin of each app on a preview, on `uat` and in production.
