import { describe, expect, it } from "vitest";

import { flowOrder, stepPlace } from "./flow";

describe("stepPlace", () => {
  it("reads the flow and the number from the path of the folder", () => {
    expect(stepPlace("meal/01-suggest")).toEqual({ flow: "meal", position: 1 });
    expect(stepPlace("food-record/12-propose-tags")).toEqual({
      flow: "food-record",
      position: 12,
    });
  });

  it.each([
    "meal",
    "meal/suggest",
    "meal/1-suggest",
    "meal/01_suggest",
    "Meal/01-suggest",
    "meal/01-suggest/extra",
    "",
  ])("refuses the id %j", (id) => {
    expect(() => stepPlace(id)).toThrow("<flow>/NN-<step>");
  });
});

describe("flowOrder", () => {
  it("takes the steps of the flow in the order of the folders", () => {
    const order = flowOrder("recipe");

    expect(() => {
      order.take("recipe/01-choose");
      order.take("recipe/02-write");
      order.take("recipe/03-score");
    }).not.toThrow();
  });

  it("refuses a step before one that the run already took", () => {
    const order = flowOrder("recipe");
    order.take("recipe/02-write");

    expect(() => order.take("recipe/01-choose")).toThrow(
      "already at step 2",
    );
  });

  it("refuses a step two times in one run", () => {
    const order = flowOrder("recipe");
    order.take("recipe/01-choose");

    expect(() => order.take("recipe/01-choose")).toThrow("already at step 1");
  });

  it("refuses a step of another flow", () => {
    expect(() => flowOrder("recipe").take("meal/01-suggest")).toThrow(
      "meal/01-suggest: this step is not in the flow recipe",
    );
  });

  it("starts each run at the first step", () => {
    flowOrder("recipe").take("recipe/03-score");

    expect(() => flowOrder("recipe").take("recipe/01-choose")).not.toThrow();
  });
});
