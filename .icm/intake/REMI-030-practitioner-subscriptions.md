# REMI-030 · Practitioner subscriptions — first revenue

|                |                                                                     |
| -------------- | --------------------------------------------------------------------- |
| Status         | blocked — pricing not confirmed, no payment provider chosen         |
| **Type**       | feature                                                             |
| **Priority**   | P1 — Phase F; no contractual date exists, despite what older documents claimed |
| **Size**       | Weeks                                                               |
| **Depends on** | REMI-013, REMI-023                                                  |
| **Blocked by** | A pricing decision and a payment provider                           |
| **Sources**    | Status report Phase F bullet 1 · `.icm/docs/braindump/business/pricing.md` |

## Problem statement

REMI has no revenue and no payment vendor — no code, no seam, not even a reserved variable name.
The braindump proposes practitioner tiers at **Starter €39 / Growth €79 / Clinic €199** per month,
with a patient premium around **€9.99** later, and it labels these *réflexions*, not decisions.

Worth stating plainly, because older documents in this repository said otherwise: **there is no
billing deadline.** The "signed pilot at €24.50/month from 1 September" was demo fixture data. This
ticket exists to start revenue, not to meet a date.

## Required steps

1. Confirm the pricing with the owner before building anything against it.
2. Choose a payment provider, weighed against the EU/sovereignty posture (REMI-015) and Belgian
   VAT handling.
3. Build subscription management behind a seam, as with every other vendor here: subscribe,
   upgrade, downgrade, cancel, fail-to-pay.
4. Tie the tiers to something real — patient count, feature access, or both. A tier that changes
   nothing is not a tier.
5. Invoicing that satisfies Belgian requirements, including VAT.
6. Three-list rule for every new variable; never commit a key.

## Open questions — flag these on pickup

- **Are the prices final?** They are explicitly reflections in the braindump. Nothing should be
  built against them until the owner confirms.
- **What distinguishes the tiers?** Patient count is the obvious axis, but the braindump does not
  say. It is a pricing decision with product consequences.
- **Which payment provider?** Nothing chosen. Stripe is the obvious default; Mollie is more common
  in the Benelux; the sovereignty argument may favour an EU option.
- **Is there a trial or a founding-practitioner rate?** The beta practitioners are being asked for
  fortnightly feedback; charging them full price from day one may not be the intent.
- **Who handles VAT and invoicing compliance?** Accountant territory, not the agent's.

## Acceptance criteria

- [ ] Pricing is confirmed by the owner before implementation, not assumed from the braindump.
- [ ] A practitioner can subscribe, change tier and cancel.
- [ ] Failed payments are handled deliberately, with a defined grace period.
- [ ] Invoices meet Belgian requirements including VAT.
- [ ] The provider sits behind a seam; no vendor call leaks into application code.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then packages/services/AGENTS.md
for the seam pattern, then .icm/docs/braindump/business/pricing.md and business/model-economic.md.

Task: build practitioner subscriptions.
1. Get the pricing confirmed by the owner first — the braindump calls the figures reflections, and
   there is no billing deadline of any kind. Do not build against unconfirmed numbers.
2. Choose a payment provider with the owner, weighing the EU posture and Belgian VAT.
3. Implement subscription management behind a seam: subscribe, upgrade, downgrade, cancel, and
   failed payment with a defined grace period.
4. Make the tiers mean something concrete.
5. Belgian-compliant invoicing including VAT. Flag that this needs the accountant's sign-off.
6. Three-list env rule; never commit a key.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and put the tier-differentiation and founding-practitioner-rate questions to
the owner.
```
