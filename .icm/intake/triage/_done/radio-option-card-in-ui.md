# Stub: Lift the questionnaire's radio option card into packages/ui

- lane: chore
- found-by: preparatory-questionnaire/questionnaire-flow · 2026-11-03
- complexity: low
- priority: P2

## Problem

`ChoiceAnswer` (`apps/web/app/[locale]/questionnaire/_components/choice-answer.tsx`) renders a radio option as a card with a label and a description. The card renders from props, so `CONVENTIONS.md` puts it in `packages/ui`. The ticket kept it in the app because its scope excluded `packages/ui`.

## Proposed change

Add a `RadioCard` primitive to `packages/ui` and use it in `ChoiceAnswer`.

## Acceptance criteria

- [ ] `packages/ui` exports the radio card, and `ChoiceAnswer` uses it
- [ ] The questionnaire's radio groups look and behave as before
