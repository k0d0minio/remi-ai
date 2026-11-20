/**
 * The order of a flow. The id of a step is the path of its folder,
 * `<flow>/NN-<step>`, and NN is its place in the flow. Thus the order is read
 * from the folders, and no list of steps is written in code.
 *
 * Pure: no I/O and no clock.
 */

const STEP_ID =
  /^([a-z0-9]+(?:-[a-z0-9]+)*)\/(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `meal/01-suggest` is the step 1 of the flow `meal`. It throws on another form. */
export const stepPlace = (id: string) => {
  const match = STEP_ID.exec(id);
  if (!match) {
    throw new Error(
      `${id}: the id of a step is the path of its folder, <flow>/NN-<step>`,
    );
  }
  return { flow: match[1] ?? "", position: Number(match[2]) };
};

export type FlowOrder = {
  /** Call it before each step of the run. It throws when the order is broken. */
  take: (stepId: string) => void;
};

/**
 * The order of one run of a flow. A run takes the steps of its flow in rising
 * order of their numbers: not a step of another flow, not a step two times,
 * and not a step before one that the run already took. A second attempt is a
 * new run.
 */
export const flowOrder = (flow: string): FlowOrder => {
  let last = 0;
  return {
    take: (stepId) => {
      const place = stepPlace(stepId);
      if (place.flow !== flow) {
        throw new Error(`${stepId}: this step is not in the flow ${flow}`);
      }
      if (place.position <= last) {
        throw new Error(
          `${stepId}: this run of the flow ${flow} is already at step ${last}. A run takes the steps in the order of the folders`,
        );
      }
      last = place.position;
    },
  };
};
