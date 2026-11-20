/**
 * A step, and the model call that the runner makes from it.
 *
 * This file is the pure half of the runner: no I/O, no clock, no business
 * rule. It reads the contract, refuses an input that the contract does not
 * name, and gives the two texts of the call. The other half calls the AI seam
 * and is in `@remi/services` (`src/server/agent/runner.ts`), because this
 * package imports no other package of the repo.
 */

import type { ZodType } from "zod";

import { parseContract, type Contract, type ModelRole } from "./contract";
import { stepPlace } from "./flow";
import { IDENTITY_VOICE } from "./identity";

export type Step<Inputs extends object, Output> = {
  /** The path of the folder below `flows/`: `meal/01-suggest`. */
  id: string;
  contract: Contract;
  /** The text of `prompt.md`. */
  system: string;
  /** The shape of the reply. The seam validates the reply with it. */
  schema: ZodType<Output>;
  /** The user text of the call, from the named inputs. Pure. */
  render: (inputs: Inputs) => string;
};

type StepSource<Inputs extends object, Output> = {
  id: string;
  /** The text of the folder's `CONTEXT.md`. */
  contract: string;
  /** The text of the folder's `prompt.md`. */
  prompt: string;
  schema: ZodType<Output>;
  render: (inputs: Inputs) => string;
};

/**
 * The one way to make a step. It throws when the id is not the path of a step
 * folder, or when the contract misses a part.
 */
export const defineStep = <Inputs extends object, Output>(
  source: StepSource<Inputs, Output>,
): Step<Inputs, Output> => {
  stepPlace(source.id);
  const system = source.prompt.trim();
  if (system === "") {
    throw new Error(`${source.id}: the prompt is empty (prompt.md)`);
  }
  return {
    id: source.id,
    contract: parseContract(source.contract, source.id),
    system,
    schema: source.schema,
    render: source.render,
  };
};

/** What the seam needs for one call, with no value of its own. */
export type StepCall = {
  /** The id of the step, for the log line of the call. */
  step: string;
  role: ModelRole;
  maxTokens: number;
  system: string;
  prompt: string;
};

/**
 * The call of a step for these inputs. An input that the contract does not
 * name is a programmer's error: the call is refused, and the message has the
 * name of the input only, never its value.
 */
export const prepareCall = <Inputs extends object, Output>(
  step: Step<Inputs, Output>,
  inputs: Inputs,
): StepCall => {
  const unnamed = Object.keys(inputs).filter(
    (name) => !step.contract.inputs.includes(name),
  );
  if (unnamed.length > 0) {
    throw new Error(
      `${step.id}: the contract does not name the input ${unnamed.join(", ")}`,
    );
  }
  return {
    step: step.id,
    role: step.contract.role,
    maxTokens: step.contract.maxTokens,
    system: `${IDENTITY_VOICE} ${step.system}`,
    prompt: step.render(inputs),
  };
};
