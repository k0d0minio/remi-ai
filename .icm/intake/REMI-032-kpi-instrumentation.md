# REMI-032 · Instrument the KPIs

|                |                                                                        |
| -------------- | ---------------------------------------------------------------------- |
| Status         | ready once Phase C produces usage                                      |
| **Type**       | feature                                                                |
| **Priority**   | P1 — Phase F; it must exist before the beta, not after                 |
| **Size**       | A week                                                                 |
| **Depends on** | REMI-021 (adherence), REMI-013                                         |
| **Blocked by** | —                                                                      |
| **Sources**    | Status report Phase F bullet 3 · `.icm/docs/braindump/business/kpi.md` |

## Problem statement

The braindump lists the indicators REMI steers by, and the first milestones to hit: 10–30 active
practitioners, 100–300 active users, €2,000–5,000 monthly recurring revenue, retention above 50% at
three months.

None of it is measured today. Instrumenting after the beta means the beta produces impressions
rather than evidence — and the whole point of the founding-practitioner phase is _validation
terrain_, which requires numbers.

## Required steps

1. Product metrics: daily and monthly actives, adherence rate, retention at J+7 / J+30 / J+90,
   meals or suggestions generated, AI usage frequency, patient churn.
2. Practitioner metrics: active practitioners, patients per practitioner, practitioner usage
   frequency, subscription renewal, satisfaction.
3. Wire them to real events from the patient loop and the practitioner dashboard — not to a
   separate analytics vocabulary that will drift from the product.
4. Somewhere to read them. A metric nobody looks at weekly is not instrumented, it is logged.
5. **No personal data in the analytics layer.** Aggregate and pseudonymise; this is health
   behaviour data.
6. Line them up against the braindump's first milestones so progress is legible without arithmetic.

## Open questions — flag these on pickup

- **What tool?** Vercel Analytics is already wired for traffic but will not carry product metrics.
  Anything added must satisfy the EU posture (REMI-015) — this is health behaviour data.
- **How is retention defined?** Returning at all, or completing a micro-action? The number differs
  enormously and the definition must be fixed before the beta, not chosen afterwards to suit the
  result.
- **Who reads the dashboard, and how often?** Metrics with no owner rot.
- **Do practitioners see their own numbers?** Potentially a feature in itself — and a reason for
  them to renew.

## Acceptance criteria

- [ ] Product and practitioner metrics are captured from real events in the product.
- [ ] Retention, adherence and activity have written definitions fixed before the beta starts.
- [ ] Somewhere exists to read them, with a named owner.
- [ ] No personal or health data sits in the analytics layer.
- [ ] The braindump's first milestones are visible as targets alongside the actuals.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
business/kpi.md in full, then Phase F of .icm/docs/remi-status-report.html.

Task: instrument the KPIs before the beta rather than after it.
1. Capture the product and practitioner metrics from the braindump's list, from real product
   events rather than a parallel analytics vocabulary.
2. Write down the definitions — especially retention and adherence — and fix them before the beta.
   Choosing a definition after seeing the data is how numbers stop meaning anything.
3. Build somewhere to read them and name who reads them weekly.
4. Keep personal and health data out of the analytics layer entirely; aggregate and pseudonymise.
5. Show the braindump's first milestones (10–30 practitioners, 100–300 users, EUR 2–5k MRR,
   >50% retention at 3 months) as targets next to the actuals.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and put the tool choice to the owner — it must satisfy the EU data posture.
```
