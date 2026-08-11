# REMI-027 · Psychological scoring engine (Nutrition Mindset, 7 profiles)

|                |                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Type**       | feature (pure logic — the ideal first TDD target)                                                                     |
| **Priority**   | P1 — first port; needs nothing but the test harness                                                                   |
| **Size**       | Days                                                                                                                  |
| **Depends on** | REMI-008 (harness)                                                                                                    |
| **Blocked by** | — (REQ-27's provenance answer decides whether thresholds may ever be tuned; implement exactly as specified meanwhile) |
| **Sources**    | v1-report §6.1, §6.2, §9.1; info-gathering REQ-27                                                                     |

## Problem statement

The 20-question Nutrition Mindset questionnaire and the 7-profile psychological scoring
algorithm are part of the product's irreplaceable domain knowledge — fully preserved in
`.icm/docs/v1-report.md` §6.1–6.2 after the v1 code was deleted. Nothing in the monorepo implements
them. This is pure, fully-specified logic: the perfect first feature port and the first real TDD
exercise on the new harness.

## Required steps

1. Implement the questionnaire definition: 20 required Likert-1–5 items in 5 sections, with the
   asymmetric motivation split (autonomous = items 1&4, extrinsic = item 2, amotivation = item 3)
   — as data, in French and English, in the shared services layer (or a domain package per the
   porting map).
2. Implement scoring: seven dimensions, plain mean per dimension (1.0–5.0, 2 dp), levels
   low ≤ 2.4 / medium 2.5–3.4 / high ≥ 3.5.
3. Implement the ordered 7-profile cascade exactly as specified (rigid_motivated →
   emotional_reactive → practical_autonomous → non_ready_ambivalent → resilient_flexible →
   resilient_emotional (raw-score rule) → hybrid_motivated (raw-score rule)), plus the fallback
   cascade ending at resilient_flexible.
4. Carry the per-profile French coaching briefs as structured content — they are input to plan
   generation later (REMI-034); model them as data with an outcome-version field
   (v1's `computed_outcome_version` pattern) so the algorithm can evolve accountably.
5. TDD throughout: write the tests from the spec first; include boundary tests at every
   threshold (2.4/2.5, 3.4/3.5, the raw-score ≥4 rules) and a fixture set of response vectors
   per profile.

## Acceptance criteria

- [ ] Given the same responses, scores/levels/profile match v1's algorithm as specified in §6.2.
- [ ] Every profile is reachable by at least one test vector; fallback covered.
- [ ] Questionnaire content exists in FR and EN with parity.
- [ ] No UI in this ticket — engine + content only, exported from the services layer.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md, CONVENTIONS.md, packages/services/AGENTS.md, then
.icm/docs/v1-report.md §6.1 and §6.2 VERY carefully — they are the complete spec, reconstructed from
deleted code; there is no other source. Also read §9.1's porting-map row for this piece.

Task: implement the Nutrition Mindset questionnaire and 7-profile scoring engine as pure TypeScript
in the services layer, test-first.
1. Model the questionnaire (nutrition_mindset_v1): 20 Likert 1-5 items, 5 sections of 4
   (Motivation, Control/Rigidity, Food & Emotions, Resilience/Flexibility, Self-efficacy), with
   the motivation section scoring asymmetrically: autonomous = items 1 and 4, extrinsic = item 2,
   amotivation = item 3. Item text in French and English as content data (French source of truth
   per the v1 report; translate faithfully).
2. Scoring: 7 dimensions (autonomous, extrinsic, amotivation, rigidity, emotional, resilience,
   self_efficacy); score = mean of the dimension's items rounded to 2 decimals; levels: low <=2.4,
   medium 2.5-3.4, high >=3.5.
3. Profile: first match in the exact ordered cascade of §6.2 (7 rules — note rules 6 and 7 use
   RAW scores with >= thresholds, not levels), then the fallback cascade ending at
   resilient_flexible. Include each profile's key and French display name.
4. Attach the per-profile coaching briefs from §6.2's substance summary as structured data
   (portrait, mechanisms, success triggers, relapse risks, food strategies, coaching tactics) —
   these feed plan generation later. Version the whole outcome (outcome_version) so future tuning
   is traceable.
5. TDD: write failing tests from the spec first — threshold boundaries, one response vector per
   profile, ordering (a vector matching rules 1 and 5 must yield rule 1), fallback. Then implement.
Run tests only (factory owns build/lint/typecheck). Push a feature branch, open a PR. This repo
routes features through its pipeline — if the pipeline is active (see CLAUDE.md), enter via
/pipeline; otherwise a direct PR with the spec-mapping in its description.
```
