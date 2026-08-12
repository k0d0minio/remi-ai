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
