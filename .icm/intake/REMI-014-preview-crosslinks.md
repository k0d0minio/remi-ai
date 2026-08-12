# REMI-014 · Stop preview deployments cross-linking to production

|                |                                                                       |
| -------------- | --------------------------------------------------------------------- |
| Status         | ready                                                                 |
| **Type**       | config + chore                                                        |
| **Priority**   | P1 — every design review currently carries a trapdoor into production |
| **Size**       | Hours                                                                 |
| **Depends on** | —                                                                     |
| **Blocked by** | Vercel access (REQ-01) for the config half                            |
| **Sources**    | audit F-38                                                            |

## Problem statement

Any non-development build answers cross-app links with **production** origins unless each of six
`NEXT_PUBLIC_*_URL` overrides is set (`packages/services/src/shared/links.ts`). So a preview
build of the marketing site links its header and footer to production web/support/docs — and the
pipeline's whole review model is stakeholders clicking through preview URLs. A reviewer silently
walks onto production mid-review.

## Required steps

1. Preferred: teach `links.ts` to detect preview context (Vercel exposes `VERCEL_ENV` and the
   deployment URL) and answer with the preview's own origin for the current app, while making
   cross-app links on previews explicit and non-surprising (banner, or honest absolute links —
   decide and document).
2. And/or: set the six `NEXT_PUBLIC_*_URL` overrides in each Vercel project's preview scope,
   fed from Vercel's deployment-URL variable. Config outside the repo — document exactly what
   was set where.
3. Whichever route: keep the single-domain-catalogue design intact; `links.ts` stays the one
   file that knows origins.
4. Add tests for the new resolution logic (harness exists after REMI-008).

## Acceptance criteria

- [ ] On a preview deployment, same-app links stay on the preview origin.
- [ ] Cross-app links on previews are either correct per-environment or visibly marked — never a
      silent walk onto production.
- [ ] Behaviour covered by tests; any new env variable follows the three-list rule.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/audit-report.md
finding F-38, then packages/services/src/shared/links.ts end to end (it is the single origin
catalogue — keep it that way).

Task: make preview deployments self-contained.
1. Extend links.ts to detect preview context via VERCEL_ENV (route the read through the services
   env module and the three-list rule: zod schema + docs/ENV.md + turbo.json). On previews,
   resolve the current app's own origin from the deployment URL rather than production.
2. For cross-app links on previews, prefer resolving each app's preview alias if the six
   NEXT_PUBLIC_*_URL overrides are set, falling back to production ONLY with an explicit signal —
   never silently. Document the fallback in the file's header comment.
3. Add Vitest tests covering development / preview / production resolution for same-app and
   cross-app links.
4. In the PR, list the exact Vercel preview-scope variables the owner should set per project to
   complete the cross-app case, if you cannot set them yourself via available Vercel tooling.
Do not run build/lint/typecheck locally (factory-owned; tests are allowed if the harness permits).
Push a feature branch and open a PR.
```
