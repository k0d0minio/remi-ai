# REMI-018 · Ultra-simple patient onboarding — a first micro-action immediately

|                |                                                                     |
| -------------- | --------------------------------------------------------------------- |
| Status         | ready once Phase B lands                                            |
| **Type**       | feature                                                             |
| **Priority**   | P0 — Phase C; it is the first thing every patient meets             |
| **Size**       | A week                                                              |
| **Depends on** | REMI-013, REMI-014                                                  |
| **Blocked by** | An AI provider, for the first micro-action                          |
| **Sources**    | Status report Phase C bullet 1 · `.icm/docs/braindump/roadmap/features.md`, `roadmap/court-term.md` |

## Problem statement

V1 asked users to fill a **7-day food diary before getting anything back**. People quit. The
braindump kills that feature explicitly and replaces it with a rule: **deliver value in under 60
seconds**.

The new onboarding is built on the user's most frequent foods — not an exhaustive intake — and ends
with a first micro-action generated immediately. The FunMedDev tests are unambiguous about why:
users who wait days for value abandon, and the problem is behavioural (adherence, decision fatigue,
mental load), not informational.

## Required steps

1. Design the shortest onboarding that can produce a useful first micro-action: the patient's most
   frequent foods, their practitioner's recommendations (arriving via the invite/QR binding), and
   the minimum context — tastes, budget, time available, family situation.
2. Generate and show a first micro-action at the end of it, with its *why*. Not a summary, not a
   plan: one concrete thing to do.
3. Enforce the 60-second rule as a real constraint on the design, and instrument it so the claim
   can be checked against actual sessions.
4. Handle the patient who arrives with **no** practitioner recommendations yet — a QR scan can
   precede the consultation.
5. French first; the braindump's product language is French, and EN/FR parity is compiler-enforced
   on this surface.

## Open questions — flag these on pickup

- **What is the minimum viable input set?** The braindump says "most frequent foods" but not how
  many, or whether allergies and intolerances are captured here or later. Allergies are a safety
  matter — getting this wrong is not a UX problem.
- **Is the first micro-action AI-generated or rule-based?** Under the 60-second rule and the cost
  discipline (REMI-022), a deterministic first action may be better than an AI call.
- **What does onboarding look like without a practitioner?** Free patients may arrive on their own.
  Whether that is even supported at launch is a product decision.
- **Consent placement.** Health-data consent (REMI-015) has to be captured before any health input.
  Where it sits in a 60-second flow needs deciding, not improvising.

## Acceptance criteria

- [ ] A new patient reaches a first, concrete micro-action with its *why* in under 60 seconds.
- [ ] No 7-day diary, and no multi-day wait, exists anywhere in the flow.
- [ ] Health-data consent is captured before any health information is collected.
- [ ] Allergies and intolerances are handled safely, wherever they are captured.
- [ ] The flow works for a patient whose practitioner has not yet sent recommendations.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
roadmap/features.md ("Côté Patient" → "Onboarding ultra simplifié"), roadmap/court-term.md, and
developpement-produit/tests.md — the last of these says exactly why v1's onboarding failed.

Task: build the V2 patient onboarding.
1. The shortest flow that can produce a genuinely useful first micro-action: most frequent foods,
   the practitioner's recommendations if present, and minimum context (tastes, budget, time,
   family). Nothing else.
2. End on one concrete micro-action with its "why" — not a summary or a plan.
3. Treat 60 seconds as a hard design constraint and instrument it so the claim is checkable.
4. Support the patient who has no practitioner recommendations yet.
5. French first, with EN/FR parity — the compiler enforces it.
Use @remi/ui primitives only; do not add a component library. Do not run build/lint/typecheck/
format locally. Push a branch, open a PR, git mv this ticket into .icm/intake/_done/, and put the
open questions above in the PR body — particularly where allergies are captured, which is a safety
question, not a preference.
```
