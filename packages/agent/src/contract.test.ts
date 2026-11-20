import { describe, expect, it } from "vitest";

import { parseContract } from "./contract";

const CONTRACT = [
  "# flow/01-step",
  "",
  "## Inputs",
  "",
  "- `meal`: the meal.",
  "- `diet`: the diet,",
  "  on two lines with `a word in backticks`.",
  "",
  "## Output",
  "",
  "- `title`: the title.",
  "- `steps`: the steps.",
  "",
  "## Model",
  "",
  "- Role: `balanced`.",
  "- Maximum of output tokens: `2048`.",
  "",
  "## Rules",
  "",
  "- One rule.",
  "",
  "### A sub-section is not a section",
  "",
  "- `notAnInput`: this bullet is in Rules.",
].join("\n");

/** The contract with the lines of one section removed, heading included. */
const without = (heading: string) => {
  const lines = CONTRACT.split("\n");
  const start = lines.indexOf(`## ${heading}`);
  const next = lines.findIndex(
    (line, index) => index > start && line.startsWith("## "),
  );
  return [
    ...lines.slice(0, start),
    ...(next === -1 ? [] : lines.slice(next)),
  ].join("\n");
};

describe("parseContract", () => {
  it("reads the inputs, the output, the role and the token maximum", () => {
    expect(parseContract(CONTRACT, "flow/01-step")).toEqual({
      inputs: ["meal", "diet"],
      output: ["title", "steps"],
      role: "balanced",
      maxTokens: 2048,
    });
  });

  it("refuses a contract that names no input", () => {
    expect(() => parseContract(without("Inputs"), "flow/01-step")).toThrow(
      "flow/01-step: the contract names no input",
    );
  });

  it("refuses a contract that names no output shape", () => {
    expect(() => parseContract(without("Output"), "flow/01-step")).toThrow(
      "names no output shape",
    );
  });

  it("refuses an output section with text and no field", () => {
    const text = CONTRACT.replace(
      "- `title`: the title.\n- `steps`: the steps.",
      "A JSON object.",
    );

    expect(() => parseContract(text, "flow/01-step")).toThrow(
      "names no output shape",
    );
  });

  it("refuses a contract with no model role", () => {
    expect(() => parseContract(without("Model"), "flow/01-step")).toThrow(
      "names no model role",
    );
  });

  it("refuses a role that is not one of the three", () => {
    const text = CONTRACT.replace("`balanced`", "`cheap`");

    expect(() => parseContract(text, "flow/01-step")).toThrow(
      "names no model role",
    );
  });

  it("refuses a contract with no token maximum", () => {
    const text = CONTRACT.replace("- Maximum of output tokens: `2048`.", "");

    expect(() => parseContract(text, "flow/01-step")).toThrow(
      "names no maximum of output tokens",
    );
  });

  it("refuses a contract with no rule", () => {
    expect(() => parseContract(without("Rules"), "flow/01-step")).toThrow(
      "has no rule",
    );
  });

  it.each(["name", "firstName", "e-mail", "email", "birth_date", "patientId"])(
    "refuses the input %s: a prompt is pseudonymous",
    (input) => {
      const text = CONTRACT.replace("- `diet`: the diet,", `- \`${input}\`: x,`);

      expect(() => parseContract(text, "flow/01-step")).toThrow(
        "identifies a person",
      );
    },
  );
});
