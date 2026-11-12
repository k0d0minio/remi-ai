# Stub: Replace turbo-ignore with Vercel's project skipping

- lane: tweak
- found-by: triage/morgane-transmission · 2026-11-03
- complexity: low
- priority: P1

## Problem

Each app's `vercel.json` sets `ignoreCommand` to `npx turbo-ignore <app> --fallback=HEAD^1`.
On 2026-11-03 a push of four commits to `triage/morgane-transmission` changed admin, web,
marketing and docs, but the last commit touched only docs. turbo-ignore judged admin, web and
marketing « not affected » and Vercel cancelled their previews. The branch previews kept the
old code, the preview database never received migration 0032, and the GitHub status of each
cancelled build still read « success ». Vercel's build log says turbo-ignore is deprecated and
points to the built-in project skipping.

## Proposed change

Remove `ignoreCommand` from the four `vercel.json` files. Turn on « Skip deployments when
there are no changes to the root directory or its dependencies » in each Vercel project. Make
sure the preview and the migration run on every push that changes an app or a package it
depends on.

## Acceptance criteria

- [ ] A push of several commits, where only the last one touches one app, builds every app the
      push changed.
- [ ] A push that changes no file an app depends on skips that app.
- [ ] No `vercel.json` names turbo-ignore.
