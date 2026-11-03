# Stub: feat: morgane-transmission — landing page, brand, leads and French docs

- lane: tweak
- found-by: Morgane's transmission bundle of 2 November 2026, handed over by Jamie · 2026-11-03
- complexity: high
- priority: P0

## Problem

Morgane delivered a bundle on 2 November 2026: a landing page she built in React and Vite, her
reviewed copy, the logo and the visuals, and five strategic documents. The public site in
`apps/marketing` still shows the earlier copy. The design tokens in `packages/ui` do not match
the logo. The docs site in `apps/docs` is in English and does not hold her documents. No table
holds a waiting-list lead.

## Proposed change

Port her landing page into `apps/marketing` with her copy, in French only. Retune the brand
tokens to the logo palette and keep the logo as the brand mark. Store a lead in Neon, show it
in the admin console, and notify morgane@remiai.be. Put her documents on the docs site and
set the whole docs site in French.

## Acceptance criteria

- [ ] The marketing site shows Morgane's single page in French with her copy, her offers and her prices.
- [ ] The three forms (patient pilot, information request, practitioner pilot) store a lead in Neon and send an email to morgane@remiai.be.
- [ ] The admin console lists the leads under « Liste d'attente ».
- [ ] The four legal pages are reachable from the footer.
- [ ] The brand tokens and the marketing header use the logo and its palette.
- [ ] The docs site is in French and holds her business model, milestones, OKR, product roadmap, genotype knowledge base and landing brief.
- [ ] The repository no longer holds `morgane-input/`.
