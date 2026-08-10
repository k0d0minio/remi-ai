# REMI-013 · Public-surface polish: social image and robots files

| | |
| --- | --- |
| **Type** | chore |
| **Priority** | P2 — becomes P1 the moment the pilot marketing push starts |
| **Size** | Hours |
| **Depends on** | — |
| **Blocked by** | Brand assets would help (REQ-29) but a typographic placeholder is acceptable |
| **Sources** | audit F-41; info-gathering REQ-29 |

## Problem statement

The support site's metadata promises a large social-card image that does not exist, so links
shared to social media render blank — exactly the kind of thing that matters when the pilot
marketing push starts. And web and demo carry noindex metadata but no `robots.ts` file — the
weaker form; admin's two-line file is the model.

## Required steps

1. Add an `opengraph-image.tsx` to `apps/support`, modelled on marketing's existing one, so the
   declared social card actually renders. Use brand assets if available (REQ-29); otherwise a
   clean typographic card from the design tokens.
2. Add admin-style `robots.ts` files to `apps/web` and `apps/demo`.
3. Check marketing's own OG image still renders after any shared-code touch.

## Acceptance criteria

- [ ] A support-site link pasted into a social/chat preview shows a card image.
- [ ] Web and demo serve explicit robots responses matching their noindex intent.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
finding F-41.

Task: finish the public-surface metadata.
1. apps/support declares a large social-card image in lib/metadata.ts that doesn't exist. Add an
   opengraph-image.tsx modelled on apps/marketing's implementation, using @remi/ui tokens for a
   clean typographic card (product name + one-line descriptor in the site's language). Make the
   declared metadata and the generated image agree on dimensions and URL.
2. Copy the two-line robots.ts pattern from apps/admin/app/robots.ts into apps/web/app/ and
   apps/demo/app/ so their noindex intent has the strong form.
Do not run build/lint/typecheck locally (factory-owned). Push a feature branch and open a PR.
```
