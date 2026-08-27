# REMI-038 · Patient subscriptions — Stripe Billing from the open day

|                |                                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status         | ready once the patient loop is live (REMI-018/019/020)                                                                                                                           |
| **Type**       | feature                                                                                                                                                                          |
| **Priority**   | P1 — commercialisation starts 19 Dec with the patient version, and this is its revenue path                                                                                      |
| **Size**       | A week                                                                                                                                                                           |
| **Depends on** | REMI-013 (auth + persistence), REMI-018 (the onboarding it gates behind)                                                                                                         |
| **Blocked by** | The patient price (owner + Morgane), and whose Stripe account this is                                                                                                            |
| **Sources**    | Direction of record (19 Dec commercialisation) · `.icm/docs/braindump/business/kpi.md` (MRR-shaped milestones) · 2026-08-27 estate ticket audit (gap: no patient-revenue ticket) |

## Problem statement

The direction of record starts commercialising the **patient version** at the
19 Dec open day — and no ticket covers patient-side revenue: REMI-030
(practitioner subscriptions) was the only payment ticket and is parked with its
phase. There is no payment seam, no Stripe dependency, and no reserved variable
anywhere in the repo.

Decided 2026-08-28 (Jamie): **recurring subscription via Stripe Billing** for
patients joining from the open day onward. **Morgane's terrain cohort stays
comped** — their feedback is the payment, and the validation phase stays clean of
paywalls.

## Required steps

1. A payment seam in `packages/services` in the house style — interface +
   registration point, Stripe adapter behind it, the same shape as the db/email/AI
   seams — so the vendor stays one adapter.
2. Stripe Billing: patient subscription checkout, the customer portal
   (cancel / update card), and signature-verified webhooks driving the
   subscription state the app reads. Never trust client-side state for access.
3. Comp mechanism for the terrain cohort: a flag Morgane sets in the admin that
   grants full access with **no Stripe object at all** — not a 100% coupon.
4. Access model: what a lapsed or never-subscribed patient still sees. Their own
   data stays readable and exportable regardless (REMI-015 doctrine); what gates
   is the open question below.
5. Patients are EU consumers (Belgium first): VAT-inclusive pricing via Stripe
   Tax; invoices/receipts from Stripe.
6. Three-list rule for every new variable; test keys only until the open day.

## Open questions — flag these on pickup

- **The price, and whether there is a trial.** Owner + Morgane decide; the
  braindump's MRR milestones frame the ambition but name no patient price. Build
  against a placeholder product until this is answered.
- **Whose Stripe account?** Morgane's business or a REMI entity — it determines
  whose name is on the invoices and where the money lands. Owner decision before
  the adapter touches a live account.
- **What exactly gates?** The recommendation loop presumably; whether the daily
  hub's basics stay free is a product decision with retention weight.
- **The comped cohort's future.** Comped indefinitely until the owner says
  otherwise — confirm at pickup that this still holds.

## Acceptance criteria

- [ ] A new patient can subscribe in test mode, and subscription state is read
      from webhook-driven data, never the client.
- [ ] Morgane can comp an account from the admin; comped accounts never touch
      Stripe.
- [ ] Cancel/lapse degrades access per the decided gating; the patient's own data
      remains readable and exportable regardless.
- [ ] VAT-inclusive pricing via Stripe Tax; receipts arrive from Stripe.
- [ ] No secret committed; every new variable in all three lists.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then
.icm/intake/REMI-038-patient-subscriptions-stripe.md in full, then
packages/services/AGENTS.md for how seams and adapters work here.

Task: patient-side subscriptions with Stripe Billing.
1. Build a payment seam (interface + registration point) in packages/services and
   the Stripe adapter behind it — swapping vendor must stay one adapter.
2. Wire subscription checkout, the customer portal, and signature-verified
   webhooks; the app reads webhook-driven subscription state only.
3. Add the admin comp flag for Morgane's terrain cohort — full access, no Stripe
   object.
4. Respect the access model in the ticket: a patient's own data is always
   readable and exportable, subscribed or not.
5. Test keys only. The price is an open question — build against a placeholder
   product, and put the price/trial and account-ownership questions to the owner
   in the PR body.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, and
git mv this ticket into .icm/intake/_done/ when the work merges.
```
