# Stub: The patient accepts or declines, and may ask once for another suggestion

- feature-slug: suggestion-feedback
- epic: meal-improvement
- story: 28
- sequence: 3 of 3
- depends-on: meal-suggestion
- complexity: low
- priority: P0

## Problem

A suggestion the patient will not follow is useless. Morgane wants one retry and no more.

## Proposed change

Under each suggestion, two buttons: « Ça me convient » and « Pas pour moi ». The response is stored on the `meal_suggestions` row. After « Pas pour moi » on attempt 1, a button « Une autre suggestion » runs attempt 2 with the first improvement passed as excluded, for the same meal and protocol. After attempt 2 the button is not shown. After two refusals the screen shows « Merci pour ton retour. Bon appétit. ». No history screen is built.

## Acceptance criteria

- [ ] Both buttons appear under every suggestion.
- [ ] A response is stored once per attempt and cannot be changed after.
- [ ] After « Pas pour moi » on the first attempt, one second attempt is offered and returns a different improvement for the same meal and the same validated protocol version.
- [ ] No third attempt is possible for the same meal.
- [ ] The response is used for the interaction only. No screen lists past choices.

## Out of scope

- A free-text comment. Behavioural tracking. A console view.

## Notes

Story 30 rules out points, badges and periodic feedback questionnaires. These two buttons are the only feedback in the patient space. Files: the result view, `server/meals/respond.ts`.
