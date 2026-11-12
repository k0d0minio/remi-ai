# Stub: Stop search engines from indexing the marketing site outside production

- lane: bug
- found-by: the UAT audit · 2026-11-12
- complexity: low
- priority: P1

## Problem

`https://uat.remiai.be/robots.txt` serves `User-Agent: *` and `Allow: /`. The pages have no `robots`
meta tag, and the canonical link points at `https://uat.remiai.be/fr`. Search engines can index
the UAT site as a copy of production. Preview deployments do the same. `app` and `admin` are
already `noindex`. The cause is in `apps/marketing/app/robots.ts` and
`apps/marketing/app/[locale]/layout.tsx`: they do not check the Vercel environment.

## Proposed change

Let only the production deployment of `marketing` be indexed. Every other deployment serves
`Disallow: /` and a `noindex` meta tag.

## Acceptance criteria

- [ ] `https://uat.remiai.be/robots.txt` serves `Disallow: /` and no sitemap line.
- [ ] `https://uat.remiai.be/fr` has `<meta name="robots" content="noindex, nofollow">`.
- [ ] The preview deployment of this pull request serves the same two results.
- [ ] Production `robots.txt` and the production pages do not change.
