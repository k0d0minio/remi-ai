# REMI-019 · "Améliore mon assiette" — the central V2 feature

|                |                                                                     |
| -------------- | --------------------------------------------------------------------- |
| Status         | ready once Phase B lands                                            |
| **Type**       | feature                                                             |
| **Priority**   | P0 — Phase C; this is the product                                   |
| **Size**       | A week or more                                                      |
| **Depends on** | REMI-013, REMI-014, REMI-018                                        |
| **Blocked by** | An AI provider (REMI-012)                                           |
| **Sources**    | Status report Phase C bullet 2 · `.icm/docs/braindump/developpement-produit/fonctionnalites.md` |

## Problem statement

This is the feature REMI is for. The user says what they are about to eat; REMI analyses it against
their practitioner's recommendations, proposes **one** concrete improvement, and explains the *why*.
Not a plan, not a score, not a list of everything wrong with the meal — one realistic change,
adapted to their tastes, budget, time and family life, with the reasoning attached.

It is also the whole product thesis in one screen: the last kilometre between what a practitioner
recommended and what someone actually eats tonight.

## Required steps

1. Meal input that is faster to use than not to use. If describing the meal takes longer than
   eating it, the feature has failed.
2. Analysis against the patient's active rules — the structured form of their practitioner's
   recommendations (REMI-014, later fed automatically by REMI-029).
3. **One** improvement, concrete and immediately actionable. Resist returning a list.
4. The *why*, always, in plain language. The braindump treats the explanation as load-bearing:
   it is what builds understanding, adherence and autonomy.
5. Respect the constraints that make a suggestion realistic: tastes, budget, time available, family
   context — and, non-negotiably, allergies and intolerances.
6. Record the interaction so it feeds the practitioner's adherence view (REMI-024).
7. Targeted AI calls with cost tracking from the first line, per REMI-022.

## Open questions — flag these on pickup

- **How does the user describe the meal?** Free text, photo, a picker, or a hybrid. This is the
  single biggest UX decision in the product and the braindump does not settle it.
- **What happens with no practitioner recommendations?** General nutritional advice, or a prompt to
  connect a practitioner? The answer defines the free tier's value.
- **How is a suggestion's quality judged?** "One concrete improvement" is easy to state and hard to
  verify. Some form of review or guardrail is needed before real patients see output — v1 had a
  "Guardian Agent" for exactly this reason.
- **What are the safety limits?** REMI is not a medical device and must not read as one. Where the
  boundary sits — and what the model is forbidden to say — needs writing down before launch, not
  after.

## Acceptance criteria

- [ ] A patient can describe a meal and get one concrete improvement with its *why*.
- [ ] The suggestion respects the practitioner's rules and the patient's allergies without exception.
- [ ] The interaction is recorded and visible to the practitioner.
- [ ] Every AI call is cost-tracked and error-handled.
- [ ] Nothing in the output reads as medical advice or diagnosis.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
developpement-produit/fonctionnalites.md and roadmap/features.md for "Améliore mon assiette", and
developpement-produit/ai.md for the AI architecture and cost discipline.

Task: build the central V2 feature.
1. Meal input that is faster to use than to skip.
2. Analyse against the patient's active rules; return exactly ONE concrete improvement, never a
   list.
3. Always attach the "why", in plain language.
4. Honour tastes, budget, time and family context — and allergies and intolerances absolutely.
5. Record the interaction so the practitioner's adherence view can read it.
6. Targeted AI calls, cost tracked per generation, with real error handling and retries.
Before writing prompts, read .icm/docs/history/v1-report.md section 5.2 for how v1 structured its
generation and validation contract — the shape is instructive even though the product changed.
Do not run build/lint/typecheck/format locally. Push a branch, open a PR, git mv this ticket into
.icm/intake/_done/, and raise the four open questions above explicitly — the meal-input question
and the safety boundary in particular should not be settled silently by an implementation choice.
```
