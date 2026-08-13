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

- [ ] Deployment protection verified ON for the admin project, in writing.
- [ ] Docs-site posture decided (D-1) and implemented — no crawlable-with-no-guidance middle state.
- [ ] `apps/docs` has either robots+noindex (private) or its confidential content removed (public).
- [ ] Findings F-30 and F-31 can be marked mitigated.

## Progress

**Steps 1–3 are answered; steps 4–5 need the owner.** Protection was verified from outside rather
than from the dashboard, and the answer is worse than the audit assumed.

Landed in code (the safe interim, chosen because it is correct under either branch of D-1 and
reverts to a one-file change if D-1 lands on "public"):

- `apps/docs/app/robots.ts` — `disallow: "/"`, modelled on `apps/admin/app/robots.ts`, no sitemap.
- `apps/docs/app/layout.tsx` — `robots: { index: false, follow: false }` in the root metadata.

`apps/docs` is therefore out of the crawlable-with-no-guidance middle state. That closes the
indexing half of F-31 and nothing else: **neither F-30 nor F-31 is mitigated**, because both hinge
on reachability, and reachability is a Vercel setting.

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

**`docs/VERCEL.md:105-106` is wrong on this point** and should be corrected: it says standard
protection "is enough" for REMI-001 and that the $150/month Advanced add-on is "not needed". Vercel
documents "Private Production Deployments" as an Advanced Deployment Protection feature, i.e. the
$150/month add-on on Pro — while also listing All Deployments as "available on Pro and Enterprise".
The two statements sit awkwardly together; the dashboard settles it, by either applying the setting
or showing an **Enable and Pay** prompt.

### Open — for the owner

- **Look at the dashboard and settle the cost question.** Vercel → the project whose root directory
  is `apps/admin` → **Settings → Deployment Protection** → set the scope to **All Deployments**;
  then the same for the `apps/docs` project. The projects are `remi-admin` and `remi-docs` on team
  `remi21`. Note whether it applies free or prompts to pay.
- **D-1 is unanswered, and the cost finding changes its shape.** If protecting production costs
  $150/month, that is a poor trade against the repo's stated budget rule for content that,
  per the audit, gains nothing from being deployed. The cheap and complete answer is
  **REMI-002 — take the confidential content out of the deployed apps** — which costs nothing,
  removes the exposure at its source rather than gating it, and leaves both sites publishable.
  Recommend deciding REMI-001 and REMI-002 together rather than in sequence.
- **Record the answers here and in the PR** — what was on or off, when it was checked, who decided
  D-1 — then the acceptance criteria above can be ticked and the ticket moved to `_done/`.

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
