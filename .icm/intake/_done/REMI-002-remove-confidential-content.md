# REMI-002 · Remove confidential negotiation content from the admin app

|                |                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Status         | ready                                                                                                     |
| **Type**       | chore                                                                                                     |
| **Priority**   | P0                                                                                                        |
| **Size**       | Hours                                                                                                     |
| **Depends on** | REMI-001 — **done**: protection measured OFF for production, so removal _is_ racing exposure              |
| **Blocked by** | Nothing. Unblocked 2026-08-13 by the owner's answer to D-1                                                |
| **Sources**    | audit F-30 ("decide whether a negotiation document belongs in a deployed app at all"), D-1 recommendation |

> **Escalated 2026-08-13.** REMI-001 measured the admin console's production domain as
> **unprotected** — `/offer` and `/questions` return 200 to anyone with the URL — and the owner has
> rejected Vercel's paid production protection. The console's real gate is an `operator` role
> (REMI-023), which is a week or more out. Until then **this ticket is the only thing that closes
> F-30.** It no longer waits on anything, and it should not wait for REMI-023.

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

- [x] Content handed to the owner in a private form before removal — a handover document was
      produced and delivered to the owner directly, outside the repository, before any deletion.
- [x] The equity-offer page and its data no longer exist in any deployed app.
- [x] No dangling imports, routes, or nav links remain.
- [x] PR notes that git history retains the content, for the owner to decide on separately.

## Progress — 2026-08-13

Removed from `apps/admin`, so `/offer` no longer exists in the deployed console:

- `app/(admin)/offer/page.tsx` — the page
- `lib/offer.ts` — the offer data, headed « Confidentiel », with the valuation, the percentages,
  the €120/hour rate, the accrued €70 656, and the two fallback positions
- `components/offer/figure-rows.tsx` and `components/offer/point-list.tsx` — the offer page was
  their only consumer, so they go with it per the leanness rule
- the « Offre CTO » entry in `components/shell/nav-sections.ts`, and the now-unused `Handshake`
  icon import
- a stale doc-comment cross-reference to `lib/offer.ts` in `lib/questions.ts`

### The bigger exposure this surfaced

**The repository is public** (`gh api repos/k0d0minio/remi-ai` → `visibility: public`). The offer
was therefore never only behind the admin URL — it has been readable by anyone on GitHub, and
deleting the file does not change that, because git history keeps it.

That reframes the priority order the audit set. Removing the file stops the console serving it and
stops it growing new readers, but **the content is still retrievable from history today**. Options,
for the owner:

- **Rewrite history** (`git filter-repo` + force-push) — the only thing that actually removes it.
  Breaks every clone and open branch; needs a quiet moment and everyone warned. GitHub also keeps
  unreachable objects until asked to garbage-collect, so it needs a support request to be complete.
- **Make the repository private** — cheaper and immediate, and it closes the whole class rather
  than one file. Worth considering on its own merits given what else the repo carries.
- **Accept it** — defensible only if the negotiation is settled and the figures no longer matter.

### Still open — the rest of REMI-002's scope

`lib/questions.ts` (`/questions`) and the pilot-terms block in `lib/fixtures.ts` were **left in
place**, as step 3 of this ticket specifies: unlike the offer, they are arguably working features
of the console rather than documents that merely happen to be hosted. Both are still publicly
reachable on the production domain, and `/questions` carries the internal legal and strategy
deliberations. They close when the owner decides, or when REMI-023's operator role lands.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/audit-report.md
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
