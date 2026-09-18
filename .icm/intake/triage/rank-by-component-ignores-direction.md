# Stub: `rankFoodsByComponent` always ranks descending, while the component map says some go down

- lane: bug
- found-by: the `ciqual-import` Release code review, 2026-09-17 — latent, no caller yet
- priority: P2
- sources: `packages/services/src/db/services/foods/index.ts` § `rankFoodsByComponent` ·
  `packages/services/src/shared/nutrition.ts` § `NutrientDirection`

## Problem

`nutrientComponents` publicly carries a `direction` per component, and one of the twelve is
`reduce`: « sucres ». `rankFoodsByComponent` sorts descending, unconditionally, and `RankQuery` has
no field to say otherwise.

Nothing is broken today because nothing composes the two yet. The first caller that does — which is
`ai-assist/recipe-generation`, the reason this primitive exists — reads « réduire les sucres » from
a recommendation, resolves it to component 32000, ranks on it, and gets the sugariest foods in the
table back as a suggestion.

It was left rather than fixed inside the `ciqual-import` run because the right shape is a question
about the caller, not a missing line: whether ranking takes a direction, whether `reduce` means
"ascending" or "lowest above a floor" (a food with no sugar at all is not automatically the best
suggestion), and whether a recommendation to reduce something should rank at all rather than filter.
Guessing that here would have shipped an answer nobody asked for.

## Proposed change

Decide it with `recipe-generation`, then one of:

- `RankQuery` takes `direction`, defaulting to the component's own, and `reduce` sorts ascending; or
- `reduce` components are excluded from ranking and become an exclusion filter instead — arguably
  closer to what « réduire les sucres » means in a recipe.

Either way the default should come from `nutrientComponents` rather than the call site, so a caller
cannot silently disagree with the vocabulary.

## Acceptance criteria (rough)

- [ ] Ranking on a `reduce` component cannot return the richest foods in it
- [ ] The direction comes from the component vocabulary by default, not from each call site
- [ ] A test covers « réduire les sucres » end to end, from the phrasing to the ranked result

## Prompt

Run `/pipeline bug rank-by-component-ignores-direction` in the remi-ai repo. The lane pre-seeds from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change and nothing wider; a question left open above is raised, not answered in code.
