# REMI-025 · Billing for 1 September

|                |                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Type**       | decision-support, then (maybe) feature                                                                             |
| **Priority**   | P0 decision, P2 integration — the signed pilot terms start billing 1 September 2026                                |
| **Size**       | Decision: owner. Manual process: hours. Integration: weeks                                                         |
| **Depends on** | — (the decision); a payment integration would depend on REMI-022/023                                               |
| **Blocked by** | Owner decision D-4; REQ-19 (existing invoice tooling), REQ-20 (the executed pilot terms — which figure is binding) |
| **Sources**    | audit F-07, D-4; info-gathering REQ-19, REQ-20, REQ-32                                                             |

## Problem statement

The signed pilot terms say billing (€24.50/practitioner/month) starts 1 September 2026, and
payments are the least-started connection in the product: no vendor, no code, no seam, no
reserved variable. This is the only connection with a contractual date attached. The audit's
recommendation: **manual invoicing for the fifteen pilot practitioners** (hours of admin per
month, zero code), deciding the payment provider only when self-serve signup is scoped. Either
way it must be a decision, not a September discovery. Note: the audit also found the public
pricing and the signed pilot pricing contradict each other (REQ-32) — resolve which number is
real before invoicing anyone.

## Required steps

1. Put D-4 to the owner with the two options costed (provider integration vs. manual invoicing);
   get the binding price confirmed from the executed pilot terms (REQ-20/REQ-32).
2. If manual (recommended): document the process (who invoices, from what tool, VAT handling at
   21%, the practitioner list source) in a short runbook; optionally add a minimal
   invoice-tracking view to the admin console against REMI-021's entities.
3. If provider: scope it as a proper pipeline feature — vendor choice (Stripe the obvious
   candidate), a payments seam consistent with the architecture, EU/VAT handling, and DPA
   (feeds REMI-026).
4. Either way: reserve the decision in the decisions page so the docs stay honest.

## Acceptance criteria

- [ ] D-4 is decided and recorded before 1 September.
- [ ] One binding price exists, confirmed against the executed terms.
- [ ] The chosen mechanism can actually produce a compliant invoice on 1 September (process
      documented or integration shipped).

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
finding F-07 and decision D-4, and docs/info-gathering.md REQ-19, REQ-20, REQ-32.

Task: prepare the billing decision and implement its cheap half.
1. Write a one-page decision brief for the owner comparing: (a) manual invoicing for ~15 pilot
   practitioners (steps, monthly effort, VAT 21%, what tool if REQ-19 surfaced one) and
   (b) a payment provider integration (realistic scope: vendor, seam, EU VAT, DPA, weeks of
   work). Recommend (a) for the pilot per the audit, and name the date the provider decision
   must be revisited (self-serve signup scoping). Flag that the binding per-practitioner price
   must be read from the executed pilot terms, not from repo fixtures, and that public vs pilot
   pricing currently contradict (REQ-32).
2. Add the brief where owner decisions live (docs/ or the docs app's decisions page, following
   the repo's routing conventions) and link it from the decisions index.
3. If the owner has already answered D-4 as "manual": write the invoicing runbook
   (docs/BILLING.md): source of the practitioner list, invoice fields (SRL details from
   docs/v1-report.md §7), VAT, schedule, who sends, where copies are kept.
4. Do not build any payment integration in this ticket; if D-4 lands on a provider, that is a
   pipeline feature to scope separately.
Push a feature branch and open a PR. Anything financial is decision-support only — mark figures
as needing the accountant's confirmation rather than inventing them.
```
