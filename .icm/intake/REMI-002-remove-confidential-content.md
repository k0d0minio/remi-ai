# REMI-002 · Remove confidential negotiation content from the admin app

|                |                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| **Type**       | chore                                                                                                     |
| **Priority**   | P0                                                                                                        |
| **Size**       | Hours                                                                                                     |
| **Depends on** | REMI-001 (verify protection first, so removal isn't racing exposure)                                      |
| **Blocked by** | Owner confirmation that the equity-offer page may leave the deployed app                                  |
| **Sources**    | audit F-30 ("decide whether a negotiation document belongs in a deployed app at all"), D-1 recommendation |

## Problem statement

The admin app contains, as page content: a document headed "Confidentiel" with the live equity
negotiation (`apps/admin/lib/offer.ts`), internal legal/strategy deliberations
(`apps/admin/lib/questions.ts`), and the unpublished signed pilot terms (in
`apps/admin/lib/fixtures.ts`). Even with deployment protection ON, a negotiation document gains
nothing from being a website: every person with admin access, every preview deployment, and the
git history carry it. The audit's recommendation is to take the equity-offer page out of the
deployed app regardless of D-1's outcome.

## Required steps

1. Inventory every page/route in `apps/admin` that renders content from `offer.ts`,
   `questions.ts`, or the pilot-terms fixture — and any nav links to them.
2. Confirm with the owner where this content should live instead (a private doc outside the repo
   is the audit's suggestion). Export the content for them before deleting — do not destroy the
   only copy.
3. Delete the offer page, its data file, and its navigation entries. Decide with the owner
   whether `questions.ts` (legal/strategy deliberations) and the pilot-terms fixture follow.
4. Note: git history still contains the content. Record that fact in the PR; history rewriting is
   a separate owner decision, out of scope here.

## Acceptance criteria

- [ ] Content handed to the owner in a private form before removal.
- [ ] The equity-offer page and its data no longer exist in any deployed app.
- [ ] No dangling imports, routes, or nav links remain.
- [ ] PR notes that git history retains the content, for the owner to decide on separately.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
finding F-30.

Task: remove the confidential equity-negotiation content from the deployed admin app.
1. Find every usage of apps/admin/lib/offer.ts and apps/admin/lib/questions.ts, plus the
   unpublished pilot-terms content inside apps/admin/lib/fixtures.ts (around lines 1033-1062),
   and the pages/nav entries that render them.
2. FIRST, write the current content of those files out to a single private handover document in
   your scratchpad and attach it to your final message for the owner — never delete the only copy.
3. Delete the equity-offer page, offer.ts, and their nav links. Leave questions.ts and the
   pilot-terms fixture in place but flag them in the PR as candidates for the same treatment,
   unless the session owner has already told you to remove them too.
4. Keep the admin app compiling: remove dangling imports and empty nav sections cleanly, matching
   the surrounding code style.
Do not run build/lint/typecheck locally (factory-owned); push a feature branch and open a PR that
lists exactly what was removed and notes that git history still contains the content.
```
