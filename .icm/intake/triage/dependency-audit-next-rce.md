# Stub: Bump Next.js past the unauthenticated RCE, and clear the other high advisories

- lane: chore
- found-by: challenges · security-check.sh --branch · 2026-09-23
- complexity: medium
- priority: P0

## Problem

`pnpm audit --audit-level=high` on `main` reports 20 high/critical advisories. Two are
**critical — Next.js unauthenticated remote code execution** (`next` >=16.0.0 <16.3.3, patched in
16.3.3), on the path `apps__admin>next`; the other apps pin the same `next` through the catalog.
The rest are high: `sharp` <0.35.0 (via next), `postcss` <=8.5.17 (via next, and admin's own),
`nanoid` <3.3.18, `js-yaml` <4.3.1 (via eslint), `@xmldom/xmldom` <=0.9.11 (via nextra →
better-react-mathjax, docs only). No run introduced them; the `challenges` branch touched no
manifest or lockfile, so it parked this rather than bumping inside a feature PR.

## Proposed change

Bump `next` to >=16.3.3 in the pnpm `catalog:` (every app), regenerate the lockfile with pnpm,
then re-run `pnpm audit --audit-level=high` and bump or override what remains (`sharp`,
`postcss`, `nanoid`, `js-yaml`, `@xmldom/xmldom`). Done when `security-check.sh --all --audit`
reports no high/critical advisory and every product-app preview builds.
