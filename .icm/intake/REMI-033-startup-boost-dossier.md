# REMI-033 · Write the Startup Boost dossier

|                |                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| Status         | ready — **it is GO** (Jamie, 27 Aug): the two gating facts are verified and the criteria are naturally met |
| **Type**       | decision-support (writing, not engineering)                                                                |
| **Priority**   | P0 — the call closes **15 September**, 19 days out                                                         |
| **Size**       | Owner + accountant time; the technical annexes are mine                                                    |
| **Depends on** | — (REMI-010 resolved as go, 27 Aug)                                                                        |
| **Blocked by** | The accountant's financial projections                                                                     |
| **Sources**    | Status report Q1, Q2 and "How Startup Boost fits this plan"                                                |

## Problem statement

REMI-010 resolved as go (27 Aug): the dossier has to be written inside a tight window, and it runs in
**parallel** with Phases A and B — it is writing and financial-projection work, not engineering.
The report has already prepared the argument: five arguments in the order to make them, the honest
scoring of the five criteria, and the two hard questions a jury will ask, with answers.

The one discipline that matters more than any other: REMI has no paying customers, no signed pilot
and no revenue. Inventing more than the real story — field-tested MVP with clinic patients,
validated practitioner interest, a planned founding-practitioner beta, incubator support — would be
discovered and would be fatal.

## Required steps

1. Lead on the two strong criteria: sector-specific solution with tangible operational value, and
   strong scalability through a replicable practitioner-led model.
2. Present the proprietary core — the recommendation parser and the behavioural micro-action engine
   — honestly, as **technology in development**, never as shipped.
3. Frame sovereignty as a design commitment backed by concrete choices (EU hosting, EU processing
   agreements), not as an achievement. Building REMI-015 and REMI-029 makes the claim progressively
   more defensible.
4. Skip the cybersecurity criterion entirely. Applying under a criterion that cannot be defended
   costs credibility on the ones that can.
5. Financial projections come from the accountant. Leave a blank rather than inventing a number.
6. Prepare the technical annexes and the answers to the two hard questions the report anticipates.

## Open questions — flag these on pickup

- **Everything in REMI-010** — the seat and the incorporation date gate this entirely.
- **Who writes the financial plan, and by when?** The pitch deck requires projections and the
  window is short.
- **Is there an existing deck or a previous application?** Contradicting something already submitted
  is an avoidable own goal.
- **What can the incubator contribute?** The report notes an incubator is already accompanying the
  project; that is an asset worth naming and possibly a source of help with the dossier.
- **Team and advisors** — juries weigh the team, and clinical credibility is the hardest part of
  REMI for a competitor to copy.

## Acceptance criteria

- [ ] The dossier leads on the two strong criteria and does not claim the cybersecurity one.
- [ ] The proprietary technology is described as in development, accurately.
- [ ] Sovereignty is framed as a commitment with named concrete choices behind it.
- [ ] No claim of paying customers, signed pilots or revenue appears anywhere.
- [ ] Financial projections carry the accountant's sign-off, or are visibly blank pending it.

## Agent prompt

```text
Work in the remi-ai monorepo. Read Q1 and Q2 of .icm/docs/remi-status-report.html in full — the
argument is already prepared there — plus .icm/docs/correspondence/01-startup-boost.md and the
braindump's vision-strategy/ and business/ folders.

Task: write the Startup Boost dossier — REMI-010 resolved as go on 27 Aug.
1. Lead on market need with operational value, and on scalability through the practitioner-led
   model. Both are strong and both are evidenced by Morgane's own field work.
2. Present the recommendation parser and the behavioural engine as proprietary technology IN
   DEVELOPMENT. Never as shipped.
3. Frame sovereignty as a commitment backed by concrete choices, not an achievement.
4. Do not apply under the cybersecurity criterion.
5. Prepare the technical annexes and the answers to the two hard questions the report anticipates.
ABSOLUTE RULE: no paying customers, no signed pilot, no revenue. The honest story is a field-tested
MVP with clinic patients, validated practitioner interest, a planned ~15-practitioner beta, and
incubator support. Never write more than that. Leave financial figures blank for the accountant
rather than estimating them.
Push a branch, open a PR with the draft, and git mv this ticket into .icm/intake/_done/ once the
dossier is submitted or the application is abandoned.
```
