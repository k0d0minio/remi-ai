import { describe, expect, it } from "vitest";
import { z } from "zod";

import { IDENTITY_VOICE } from "./identity";
import { defineStep, prepareCall } from "./step";

const CONTRACT = [
  "## Inputs",
  "",
  "- `food`: one food.",
  "- `season`: the season. Optional.",
  "",
  "## Output",
  "",
  "- `title`: the title.",
  "",
  "## Model",
  "",
  "- Role: `fast`.",
  "- Maximum of output tokens: `256`.",
  "",
  "## Rules",
  "",
  "- One rule.",
].join("\n");

type Inputs = { food: string; season?: string };

const source = {
  id: "test/01-title",
  contract: CONTRACT,
  prompt: "Tu écris un titre.\n",
  schema: z.object({ title: z.string() }),
  render: (inputs: Inputs) => `Aliment : ${inputs.food}`,
};

describe("defineStep", () => {
  it("reads the contract and trims the prompt", () => {
    const step = defineStep(source);

    expect(step.id).toBe("test/01-title");
    expect(step.system).toBe("Tu écris un titre.");
    expect(step.contract).toEqual({
      inputs: ["food", "season"],
      output: ["title"],
      role: "fast",
      maxTokens: 256,
    });
  });

  it("refuses a step whose contract names no output shape", () => {
    const contract = CONTRACT.replace("- `title`: the title.", "");

    expect(() => defineStep({ ...source, contract })).toThrow(
      "test/01-title: the contract names no output shape",
    );
  });

  it("refuses an id that is not the path of a step folder", () => {
    expect(() => defineStep({ ...source, id: "title" })).toThrow(
      "<flow>/NN-<step>",
    );
  });

  it("refuses an empty prompt", () => {
    expect(() => defineStep({ ...source, prompt: " \n" })).toThrow(
      "the prompt is empty",
    );
  });
});

describe("prepareCall", () => {
  it("gives the call of the step: the Voice, the prompt, then the user text", () => {
    expect(prepareCall(defineStep(source), { food: "courgette" })).toEqual({
      step: "test/01-title",
      role: "fast",
      maxTokens: 256,
      system: `${IDENTITY_VOICE} Tu écris un titre.`,
      prompt: "Aliment : courgette",
    });
  });

  it("accepts each input that the contract names", () => {
    const inputs: Inputs = { food: "courgette", season: "été" };

    expect(() => prepareCall(defineStep(source), inputs)).not.toThrow();
  });

  it("refuses an input that the contract does not name", () => {
    // A wider object than the type: the check is at run time too.
    const inputs = { food: "courgette", patientName: "A" } as Inputs;

    expect(() => prepareCall(defineStep(source), inputs)).toThrow(
      "test/01-title: the contract does not name the input patientName",
    );
  });

  it("never writes the value of a refused input in the message", () => {
    const inputs = { food: "courgette", note: "VALUE-SECRET" } as Inputs;

    let message = "";
    try {
      prepareCall(defineStep(source), inputs);
    } catch (error) {
      message = error instanceof Error ? error.message : "";
    }

    expect(message).toContain("the input note");
    expect(message).not.toContain("VALUE-SECRET");
  });
});
