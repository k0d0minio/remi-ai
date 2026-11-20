/**
 * @remi/agent — REMI's prompts, as a folder tree (REM-188).
 *
 * `REMI.md` is the identity. Each folder of `flows/<flow>/` is one step: its
 * contract (`CONTEXT.md`), its prompt (`prompt.md`) and its shape (`step.ts`).
 * A new step is one new folder and one line below. `tree.test.ts` fails when
 * a folder has no line here, or a line has no folder.
 *
 * Isomorphic and pure: no I/O, no clock, no import of another package of the
 * repo. The call of the model is in `@remi/services`.
 */

export { flowOrder } from "./flow";
export { prepareCall } from "./step";
export type { Step } from "./step";

export {
  mealSuggestion,
  mealSuggestionBasis,
} from "../flows/meal/01-suggest/step";
export type {
  MealPromptContext,
  MealPromptItem,
  MealPromptProtocol,
  MealSuggestionReply,
} from "../flows/meal/01-suggest/step";
