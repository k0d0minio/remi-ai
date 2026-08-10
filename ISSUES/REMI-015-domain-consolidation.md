# REMI-015 · Consolidate on the real domain

| | |
| --- | --- |
| **Type** | config + chore |
| **Priority** | P1 — every week of delay adds wrongly-indexed URLs |
| **Size** | Minutes of code; DNS/Vercel work around it |
| **Depends on** | — |
| **Blocked by** | Owner decision D-6 (which domain), registrar/DNS access (REQ-05), Vercel access (REQ-01) |
| **Sources** | audit F-39, F-03, D-6; info-gathering REQ-33, REQ-05, REQ-06 |

## Problem statement

Every canonical URL, hreflang alternate, and sitemap entry on the public sites currently tells
search engines that Remi AI's home is `jamienisbet.com` — a placeholder personal domain — while
the brand domain (`remiai.be`) appears only in hardcoded contact-email strings in marketing
content. SEO equity is accruing to the wrong place. The single-domain-catalogue design makes the
code fix one line; DNS, Vercel domains, and redirects are the real work.

## Required steps

1. Get the D-6 decision confirmed (presumably `remiai.be`).
2. Change `rootDomain` in `packages/services/src/shared/links.ts` — the one line.
3. Centralise the contact addresses (`morgane@`, `arnaud@`) so F-03's four hardcoded content
   lines can't drift at the next move; confirm the addresses are live and monitored (REQ-06).
4. Configure the domains in Vercel per app (subdomain scheme per `links.ts`), DNS records at the
   registrar, and 301 redirects from any previously-indexed `jamienisbet.com` URLs.
5. Re-verify sitemaps, canonicals, and hreflang render the new domain.

## Acceptance criteria

- [ ] All canonical URLs, sitemaps, and hreflang alternates advertise the brand domain.
- [ ] Old-domain URLs 301 to their new equivalents.
- [ ] Contact addresses have one home in code and are confirmed monitored.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
findings F-39 and F-03 and decision D-6. Do not start unless the owner has confirmed the target
domain; if unconfirmed, stop and ask.

Task: move the product onto its real domain.
1. Change rootDomain in packages/services/src/shared/links.ts to the confirmed domain. Check the
   file's derived origins still match the intended subdomain scheme for all six apps.
2. Centralise the contact email addresses: they are hardcoded in
   apps/marketing/lib/content/en.ts and fr.ts (~lines 679-689). Move them to the links/contact
   catalogue in packages/services/src/shared/ and reference them from content, so the next domain
   change is one edit.
3. Update any tests covering links.ts for the new domain.
4. If you have Vercel/DNS tooling: add the custom domains to each Vercel project and write out
   the DNS records needed; configure 301 redirects from the old domain. If not, produce the exact
   per-project domain + DNS + redirect checklist in the PR for the owner.
Do not run build/lint/typecheck locally (factory-owned). Push a feature branch and open a PR.
```
