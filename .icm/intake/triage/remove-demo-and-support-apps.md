# Stub: Remove the demo and support apps

- lane: chore
- found-by: Jamie's answer on `triage/set-up-uat-environment` (#148) · 2026-10-28
- complexity: medium
- priority: P2

## Problem

Jamie decided on 2026-10-28 to keep four apps: `admin`, `app`, `marketing` and `documentation`.
`apps/demo/` and `apps/support/` remain in the repo and deploy as the Vercel projects `demo` and
`support`. Other files name them: `CLAUDE.md`, `package.json`, `turbo.json`, `eslint.config.ts`,
`packages/services/src/shared/links.ts`, `.icm/docs/ENV.md`, the `.env.example` files of `web`,
`marketing` and `docs`, and `apps/docs/app/technical/applications/page.mdx`.

## Proposed change

Delete `apps/demo/` and `apps/support/`. Remove every reference to them, and every link to
the support site. Jamie deletes the two Vercel projects.

## Acceptance criteria

- [ ] `apps/demo/` and `apps/support/` do not exist.
- [ ] No file outside `.icm/docs/history/` and `_done/` names `@remi/demo`, `@remi/support`, `NEXT_PUBLIC_DEMO_URL` or `NEXT_PUBLIC_SUPPORT_URL`.
- [ ] `CLAUDE.md` lists four apps. Its rule "`apps/demo` is mock data only" is gone.
- [ ] `pnpm-lock.yaml` has no importer for the two apps.
- [ ] No page of `app`, `marketing` or `documentation` links to the support site.
- [ ] The Vercel projects `demo` and `support` are deleted (Jamie).
