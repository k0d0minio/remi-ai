/**
 * The runner of the steps of `@remi/agent` — REM-188.
 *
 * `@remi/agent` has the pure half: it reads the order of a flow from the
 * numbers of the step folders (`flowOrder`), reads the contract of the step,
 * refuses an input that the contract does not name, and gives the two texts
 * of the call (`prepareCall`). This file has the other half: the call of the
 * AI seam.
 * It is here, and not in `@remi/agent`, because the seam and the settings are
 * in this package, and `@remi/agent` imports no package of the repo. The
 * dependency stays app → `@remi/services` → `@remi/agent`.
 *
 * The runner has no business rule. It adds no check on the reply, no retry
 * and no timeout, and it decides no next step. The service that calls gives
 * the steps to a run, and does its checks in code after each generation
 * (D-16).
 *
 * The seam validates the reply with the schema of the step and writes the log
 * line of the call, with the id of the step. The line has no prompt and no
 * reply. It stands for a row of `ai_generations` until that table exists.
 */

import { flowOrder, prepareCall, type Step } from "@remi/agent";

import { generateJson, type GenerationResult, type ModelRole } from "../../ai";
import { roleModel } from "../ai-models";

export type RunOptions = {
  /**
   * The model of the step's role, as the caller read it with `stepModel()`.
   * Unset: the seam uses the code default of the role.
   */
  model?: string;
};

/**
 * The model that an admin set in the console for the role of this step. One
 * read of the settings: the caller does it one time for a call, with its
 * other reads, and gives the value to `run`.
 */
export const stepModel = (step: { contract: { role: ModelRole } }) =>
  roleModel(step.contract.role);

/**
 * One run of a flow. `run` makes one model call for one step. The steps of a
 * run come in the order of their folders: `run` throws for a step of another
 * flow, for a step that the run already made, and for a step before one that
 * the run already made. A second attempt of a flow is a new run.
 *
 * `run` throws for a programmer's error only: the order, or an input that the
 * contract of the step does not name. A failed generation is a `Result`, as
 * for each call of the seam.
 */
export const startFlow = (flow: string) => {
  const order = flowOrder(flow);
  return {
    run: async <Inputs extends object, Output>(
      step: Step<Inputs, Output>,
      inputs: Inputs,
      options: RunOptions = {},
    ): Promise<GenerationResult<Output>> => {
      order.take(step.id);
      const call = prepareCall(step, inputs);
      return generateJson(call.prompt, step.schema, {
        role: call.role,
        ...(options.model === undefined ? {} : { model: options.model }),
        system: call.system,
        maxTokens: call.maxTokens,
        step: call.step,
      });
    },
  };
};
