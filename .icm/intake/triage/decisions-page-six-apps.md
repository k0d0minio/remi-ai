# Stub: The decisions page counts the applications that exist

- lane: tweak
- found-by: triage/vercel-function-regions-not-pinned · 2026-11-12
- complexity: low
- priority: P2

## Problem

`apps/docs/app/technical/decisions/page.mdx`, § Plateforme — 2026-08-06, says the function
regions are pinned to the EU "pour les six applications". The repo has four applications:
`web`, `admin`, `marketing` and `docs`.

## Proposed change

Replace "les six applications" with "les quatre applications", or with "chaque application".

## Acceptance criteria

- [ ] The decisions page names a count of applications that matches `apps/`
