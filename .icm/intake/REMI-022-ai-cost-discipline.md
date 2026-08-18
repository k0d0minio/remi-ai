# REMI-022 · AI cost discipline from day one

|                |                                                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| Status         | ready once an AI provider is chosen                                                |
| **Type**       | feature (infrastructure)                                                           |
| **Priority**   | P0 — Phase C; retrofitting cost control after launch is how budgets die            |
| **Size**       | A few days                                                                         |
| **Depends on** | REMI-014 (the AI-generation record)                                                |
| **Blocked by** | The AI provider choice (REMI-012)                                                  |
| **Sources**    | Status report Phase C bullet 5 · `.icm/docs/braindump/developpement-produit/ai.md` |

## Problem statement

The braindump states the AI priorities directly: *stabilité des workflows, cohérence des résultats,
gestion des erreurs, suivi des coûts par génération, qualité des recommandations* — and an
architecture of "appels IA ciblés" with "limitation des coûts de génération". This is not a
performance nicety. V2 is self-funded and capped around €10k, and the two most-used features in the
product ("Améliore mon assiette", the daily hub) are both AI calls on the critical path.

The audit also found the AI seam too thin for the product's own safety rules (F-12). Cost control
and safety belong in the same layer, because both are properties of every call.

## Required steps

1. Build cost tracking into the AI seam itself, not into each caller: model, tokens, cost and
   outcome recorded per generation against REMI-014's AI-generation record.
2. Make the calls targeted. Send the minimum context that produces a good answer; do not ship the
   patient's whole history into every prompt.
3. Real error handling and retries with sensible limits — a failed generation must degrade
   visibly, never silently return something wrong.
4. Add a per-patient and global spend view so the number is knowable before the invoice arrives.
5. Cache and reuse where the answer genuinely does not change.
6. Grow the seam to carry the safety constraints the product needs (audit F-12), so no caller can
   bypass them.

## Open questions — flag these on pickup

- **Which provider, and at what price?** Unchosen. An EU provider (Mistral was named in Morgane's
  email) strengthens the sovereignty argument; cost and quality still have to be weighed.
- **What is the acceptable cost per patient per month?** Without a target figure "cost discipline"
  has nothing to measure against. The owner has the budget context.
- **Is patient data pseudonymised before the call?** Audit D-5, open, and it constrains both the
  prompt design and the record kept here.
- **What is the fallback when generation fails or costs too much?** A degraded deterministic
  suggestion, or an honest error? The patient-facing consequence differs a lot.

## Acceptance criteria

- [ ] Every AI call is recorded with model, tokens, cost and outcome — no caller can skip it.
- [ ] A spend figure exists per patient and overall, readable without a provider login.
- [ ] Failures are handled explicitly and never silently produce a wrong answer.
- [ ] The seam carries the product's safety constraints; no caller can bypass them.
- [ ] No unbounded retry loop can run up a bill.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then packages/services/AGENTS.md,
then .icm/docs/braindump/developpement-produit/ai.md, then .icm/docs/history/audit-report.md
finding F-12.

Task: put cost discipline and safety into the AI seam itself.
1. Record model, tokens, cost and outcome for every generation, in the seam — not in the callers,
   so nothing can skip it. Write against the AI-generation record from REMI-014.
2. Keep calls targeted: minimum sufficient context, never the patient's whole history.
3. Real error handling with bounded retries. A failure must be visible, never a silently wrong
   answer.
4. Expose spend per patient and overall.
5. Grow the seam so the product's safety constraints apply to every call and cannot be bypassed.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and ask the owner in the PR body for a target cost per patient per month — the
discipline has nothing to measure against without one.
```
