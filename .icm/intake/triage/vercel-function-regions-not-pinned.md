# Stub: Every Vercel project runs its functions in the EU, as decided on 2026-08-06

- lane: chore
- found-by: the privacy-policy review of the Vercel API · 2026-10-23
- complexity: low
- priority: P0

## Problem

The decisions page (`apps/docs/app/technical/decisions/page.mdx`, 2026-08-06) says the function
regions of all six apps are pinned to the EU. The Vercel API returns no `serverlessFunctionRegion`
for `app`, `admin`, `marketing`, `documentation`, `support` or `demo`. No `vercel.json` sets
`regions`. The functions run in the default region, `iad1` (Washington D.C.). The database is in
Frankfurt. Patient data crosses the Atlantic on every request.

## Proposed change

Pin `fra1` for the six projects: a `regions` line in each app's `vercel.json`, or Settings →
Functions in each project.

## Acceptance criteria

- [ ] The Vercel API reads `fra1` as the function region of each of the six projects
- [ ] A production deployment's function logs name `fra1`
- [ ] The decisions page stays true without an edit
- [ ] The privacy policy can say the application runs in the European Union
