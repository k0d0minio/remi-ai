# REMI-001 · Verify deployment protection on admin; settle docs-site visibility

|                |                                                                |
| -------------- | -------------------------------------------------------------- |
| Status         | ready                                                          |
| **Type**       | config + decision-support                                      |
| **Priority**   | P0 — live exposure, close today                                |
| **Size**       | Hours                                                          |
| **Depends on** | —                                                              |
| **Blocked by** | Vercel access (REQ-01); owner decision D-1                     |
| **Sources**    | audit F-30, F-31, checklist item 1, D-1; info-gathering REQ-08 |

## Problem statement

The admin console renders genuinely confidential business content (a live equity negotiation,
internal legal/strategy deliberations, unpublished pilot terms) statically to anyone with the
URL. The only in-repo protections (`robots.ts`, noindex) stop search engines, not people. The
decision log says Vercel deployment protection is the interim answer — but whether it is actually
ON cannot be seen from the repo, and that single fact decides whether this is a live exposure.
Separately, the docs site has **no** robots rules, no noindex, and publishes the pilot's exact
pricing plus a sentence describing the admin console's missing access gate — the worst middle
state: crawlable with no guidance.

## Required steps

1. In Vercel, for the **admin** project: Settings → Deployment Protection. Confirm it is ON for
   all environments (production included). If OFF, switch it on immediately.
2. In Vercel, for the **docs** project: check reachability and protection status.
3. Put the D-1 decision to the owner: (a) protect both, business content stays; or (b) protect
   admin, docs goes public with business/decision pages moved out. The audit recommends (a) today,
   then (b) at leisure.
4. Implement the chosen docs posture in code: if private, add noindex metadata and a `robots.ts`
   like admin's (`apps/admin/app/robots.ts`); if public, move `apps/docs/app/business/**` and the
   sensitive parts of `app/technical/decisions/` out of the deployed site first.
5. Record the outcome (what was on/off, when, who decided) in the PR description.

## Acceptance criteria

- [x] Deployment protection state established for the admin project, in writing — **measured OFF for
      production**, see below.
- [x] Docs-site posture decided (D-1) and implemented — no crawlable-with-no-guidance middle state.
- [x] `apps/docs` has robots+noindex **and** its confidential content removed — the owner's answer to
      D-1 took both halves, not one.
- [ ] Finding F-31 mitigated — the docs half is done; closing it needs the owner to confirm nothing
      confidential remains.
- [ ] Finding F-30 mitigated — **not this ticket any more**: it now runs through REMI-002 (remove the
      content) and REMI-023 (the operator role).

## Decision — D-1, answered 2026-08-13

**The docs site stays uncrawlable but publicly viewable, with the confidential content removed.**
Vercel deployment protection is rejected: covering a production domain costs $150/month, which is
not a trade worth making at this stage. The admin console will instead be protected by a real
**`operator`/admin role in the database and backend**, which is REMI-023's existing scope — not by a
platform wall.

Two consequences follow, and both are now on the critical path rather than "at leisure":

- **REMI-002 becomes the mitigation for F-30, not a tidy-up.** With no protection being bought and
  the role a week or more away, taking the confidential content out of the deployed app is the only
  thing that actually closes the exposure. It should not wait for REMI-023.
- **Nothing may rely on deployment protection as an interim** anywhere in the backlog or the docs.

## Progress

Landed in code:

- `apps/docs/app/robots.ts` — `disallow: "/"`, modelled on `apps/admin/app/robots.ts`, no sitemap.
- `apps/docs/app/layout.tsx` — `robots: { index: false, follow: false }` in the root metadata.
- `apps/docs/app/business/initiatives/page.mdx` — the pilot-terms table (cohort ceiling, enrolment
  window, **price**, billing date, commitment) and the named partner clinic are gone, replaced by a
  note that the terms live in the operator console. The quarter's objectives no longer restate the
  cohort size or the window dates.
- `apps/docs/app/technical/decisions/page.mdx` — the entry describing the console's absent access
  gate is gone; a new **Access control — 2026-08-13** section records the decision above without
  publishing a signpost to anything.

`apps/docs` is therefore out of the crawlable-with-no-guidance middle state **and** no longer carries
the confidential figures. F-30 is untouched by this work.

### Verified — deployment protection is NOT covering production

The dashboard could not be reached from an agent session (no Vercel MCP server, no `vercel` CLI, no
`VERCEL_*` token, no linked project; and `vercel.json` has no field for this — it lives only in the
dashboard and the REST API). But the question is answerable from outside, by asking the
deployments themselves. Measured 2026-08-13, unauthenticated:

- `remi-admin.jamienisbet.com/` → **200**, and it is the real console (title "Overview · REMI admin")
- `remi-admin.jamienisbet.com/offer` → **200** — the equity negotiation
- `remi-admin.jamienisbet.com/questions` → **200** — the internal legal/strategy deliberations
- `remi-docs.jamienisbet.com/` → **200**
- `remi-docs.jamienisbet.com/business/initiatives` → **200** — the pilot pricing
- `remi-docs.jamienisbet.com/robots.txt` → **404**, confirming F-31 in production
- the docs **preview** deployment → **302 to `vercel.com/sso-api`** — protected

So protection is **on for previews and off for production**. **F-30 and F-31 are live exposures,
confirmed, not theoretical ones.** The equity-offer page and the internal questions page are
readable by anyone with the URL, right now.

That pattern is not a mistake anyone made — it is Vercel's default. **Standard Protection protects
every deployment _except_ production domains**, by design
([Vercel docs](https://vercel.com/docs/deployment-protection)). Protecting production needs the
**All Deployments** scope.

`docs/VERCEL.md` used to claim the opposite — that standard protection "is enough" for REMI-001 and
the $150/month Advanced add-on is "not needed". That claim was the belief this ticket disproved, and
the file has since been **deleted** (commit `2d4398c`), taking the wrong claim with it and removing
the hosting playbook's routing entry from `CLAUDE.md`. Nothing in the repo now recommends the paid
route. If the playbook is ever wanted back, the free-tier facts in it are still good — only the
deployment-protection section was wrong — and it is recoverable from git history.

The cost is what settled D-1: the owner rejected the add-on rather than pay it. See the decision
section above.

### Still open

- **The admin console remains readable by anyone with the URL.** Nothing in this ticket changed
  that, and nothing will until REMI-002 lands. It is the last piece of F-30 and it is now unblocked
  — D-1's answer is the owner confirmation REMI-002 was waiting on.
- Then F-31 can be ticked and this ticket moved to `_done/`.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md first, then read
.icm/docs/audit-report.md findings F-30 and F-31 and decision D-1 in full.

Context: the admin app (apps/admin) statically renders confidential content and relies on Vercel
deployment protection, which cannot be verified from the repo. The docs app (apps/docs) has no
robots rules or noindex at all while publishing confidential pilot pricing.

Your task, in order:
1. If you have Vercel access (MCP tools or dashboard), check Deployment Protection for the admin
   and docs projects and report the exact state. If you cannot check, say so explicitly and list
   the exact steps the owner must take (project → Settings → Deployment Protection).
2. Ask the owner (or record as an open question) decision D-1: protect docs, or make it public
   with confidential content moved out.
3. Implement the safe interim in code regardless: give apps/docs the same noindex posture admin
   has — a robots.ts modelled on apps/admin/app/robots.ts and noindex robots metadata in
   apps/docs/app/layout.tsx. This is reversible if D-1 later lands on "public".
4. Do not run build/lint/typecheck locally — the repo's factory owns checks; push and read CI.
Commit on a feature branch, push, open a PR describing what was verified vs. what remains for
the owner.
```
