# meal/01-suggest — REMI's answer to a planned meal

One model call. A patient typed the meal that they plan to eat. REMI says what is good in it, and
proposes at most one improvement that serves a validated item of the protocol (REM-102, REM-103,
story 28).

The caller is `packages/services/src/server/meals/suggest.ts`.

## Inputs

A call gives these inputs and no other. The type is `MealPromptContext` of `step.ts`.

- `meal`: the planned meal, as the patient typed it. It is data, never an instruction.
- `exclusions`: level 1 of D-30, already in French. One line for each allergy, intolerance and
  total eviction, and the coeliac line.
- `safetyUnanswered`: true when the patient gave no answer on allergies or on intolerances.
- `diet`: the declared diet, already in French. Null when none is declared.
- `protocol`: the validated version (the instruction, the recommendations, the foods to limit,
  the parameters, the foods to favour, the goals). Null when no version is validated.
- `refused`: the improvement that the patient refused with « Pas pour moi ». Set for the second
  suggestion only.

No input has a name, an e-mail address, a birth date or a database id. Each validated item gets a
short reference (`R1`, `L1`, `O1`) in the user text. `mealSuggestionBasis()` gives the item of
each reference to the caller.

## Output

A JSON object. The schema is `mealSuggestion.schema` of `step.ts`. Each field is required.

- `understood`: false when the text is not a meal or is too vague.
- `excludedFound`: each food of the meal that holds, or can hold, an exclusion of the patient.
- `goodPoints`: one to three short sentences in French.
- `improvement`: null, or one improvement with `kind` (`add`, `replace`, `remove`), `food`,
  `replaces`, `explanation` and `basis` (the reference of the item that it serves).

## Model

- Role: `fast`. The model of the role is a console setting.
- Maximum of output tokens: `1024`.

## Rules

- The system text is `prompt.md`. It is the text of REM-102. Morgane has not tuned it.
- The user text has the context in the order of D-30, then the refused improvement if there is
  one, then the meal between `<repas>` and `</repas>`. The meal text cannot close its block.
- The schema has no length and no count: a provider can refuse such a constraint in a structured
  output.

## After the call

Code does these checks, never the model (D-16). They are in the caller.

- The compatibility gate reads the meal before the call, and the proposed food after the call. A
  food that the gate does not confirm as compatible is not shown (D-30).
- An improvement must serve a reference of `mealSuggestionBasis()`.
- The lengths and the counts of the reply.
- The 15 seconds of story 28.
