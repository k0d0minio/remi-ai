# REMI-008 · Freeze the V2 scope to the braindump, and fix the docs that contradict it

|                |                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------ |
| Status         | ready                                                                                      |
| **Type**       | chore + decision-support                                                                   |
| **Priority**   | P0 — Phase A; the ~€10k budget is spent wrongly for as long as the old scope is documented |
| **Size**       | Half a day                                                                                 |
| **Depends on** | —                                                                                          |
| **Blocked by** | —                                                                                          |
| **Sources**    | Status report Phase A bullet 2 and Part two · `.icm/docs/braindump/roadmap/features.md`    |

## Problem statement

`apps/docs/app/business/**` is what the pipeline's knowledge map routes every stage to for product
direction — and it describes a different product. It carries a pilot with pricing and dates that
came from demo fixture data and never existed, and a feature set reconstructed from the deleted v1:
psychological scoring, genetics interpretation, weekly plan generation. None of those appear in the
braindump's V2.

Until the business pages agree with the braindump, every Scope run starts from the wrong premise.
The knowledge map now carries a banner saying `.icm/docs/` wins, but a banner is a workaround, not a
fix.

## Required steps

1. Write the frozen V2 scope down in one place — the braindump's own list, nothing added:
   - **Patient**: ultra-simple onboarding (the 7-day diary is killed), "Améliore mon assiette",
     the daily hub, "je mange autre chose", the smart supplement journal, micro-actions with
     their "why".
   - **Practitioner**: the dashboard, per-patient detail, remote recommendation adjustment, quick
     feedback, group messages.
   - **Technical centrepiece**: the recommendation parser.
2. Rewrite `apps/docs/app/business/initiatives/` against it. Remove the invented pilot pricing and
   dates entirely — do not soften them.
3. Reconcile `apps/docs/app/business/roles/` with the braindump's actual audiences: the
   practitioner is the customer and prescriber; the patient arrives through them and starts free.
4. Mark explicitly out of V2, so nobody re-adds them: the psychological questionnaire, the
   nutrigenomics engine (far-future "REMI Genetics" only), rigid weekly plan generation, and the
   7-day food diary.
5. Remove the banner from `pipeline/_shared/knowledge-map.md` once the pages no longer contradict
   the braindump.

## Open questions — flag these on pickup

- **Is the V2 launch date being re-dated?** The braindump says mid-2026; it is August and V2 is not
  launched. The report recommends acknowledging and re-dating it together. Do not invent a date.
- **Are the braindump's prices final?** €39/€79/€199 and ~€9.99 are described as _réflexions_. The
  business pages should not present a proposal as a decision.
- **Does the docs site stay public?** REMI-009 may retire it. Confirm before investing heavily in
  rewriting its pages.

## Acceptance criteria

- [ ] The V2 scope is written in one place, matching the braindump line for line.
- [ ] No page in `apps/docs` states a pilot price, a billing date, or a signed practitioner count.
- [ ] Out-of-scope features are named as out of scope, not silently dropped.
- [ ] The knowledge-map banner is removed only if the contradiction is genuinely gone.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/README.md, then
.icm/docs/braindump/roadmap/features.md, roadmap/court-term.md and roadmap/priorities.md in full.
Read Part two and Phase A of .icm/docs/remi-status-report.html.

Task: make apps/docs/app/business/** agree with the braindump.
1. Write the frozen V2 feature list — exactly the braindump's, nothing invented, nothing carried
   over from the deleted v1.
2. Rewrite business/initiatives and business/roles against it. Delete every pilot price, billing
   date and "signed practitioner" claim outright; they were demo fixture data.
3. Name the out-of-scope items explicitly: psychological questionnaire, nutrigenomics engine,
   rigid weekly plan generation, 7-day food diary.
4. If and only if the contradiction is gone, remove the superseding banner from
   pipeline/_shared/knowledge-map.md.
Keep EN/FR parity where the surface requires it — the compiler enforces it. Do not run
build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/ in the same PR, and put the three open questions above in the PR body for the
owner to answer. Do not decide them yourself.
```
