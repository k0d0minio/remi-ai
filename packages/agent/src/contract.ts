/**
 * The contract of a step: the `CONTEXT.md` of its folder, read as data.
 *
 * Pure: no I/O and no clock. The text comes in as a string (the build inlines
 * the file). A contract that misses a part is a programmer's error, thus this
 * file throws. `tree.test.ts` reads each contract of the tree, so a bad
 * contract is a red test before it is a failed call.
 *
 * The parts that code reads:
 * - `## Inputs`: one bullet for each input, `- \`name\`: …`. A call can give
 *   these inputs and no other.
 * - `## Output`: one bullet for each field of the reply, `- \`field\`: …`.
 * - `## Model`: the role in backticks, and the maximum of output tokens in
 *   backticks.
 * - `## Rules`: text for the person who reads the contract. Code checks only
 *   that it is there.
 */

export const modelRoles = ["fast", "balanced", "deep"] as const;

/** The same three roles as the AI seam of `@remi/services`. */
export type ModelRole = (typeof modelRoles)[number];

export type Contract = {
  inputs: readonly string[];
  output: readonly string[];
  role: ModelRole;
  maxTokens: number;
};

/**
 * Input names that a contract can never have: a prompt is pseudonymous
 * (`REMI.md`, fixed rule 3). Compared with no case and no separator.
 */
const IDENTIFYING_INPUTS: ReadonlySet<string> = new Set([
  "name",
  "firstname",
  "lastname",
  "fullname",
  "email",
  "emailaddress",
  "phone",
  "address",
  "birthdate",
  "dateofbirth",
  "patientid",
  "userid",
  "accountid",
]);

const plain = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");

/** The lines of each `## ` section, with the heading in lower case as the key. */
const sectionsOf = (text: string) => {
  const sections = new Map<string, string[]>();
  let lines: string[] | null = null;
  for (const line of text.split("\n")) {
    const heading = /^##\s+(.+?)\s*$/.exec(line)?.[1];
    if (heading !== undefined) {
      lines = [];
      sections.set(heading.toLowerCase(), lines);
    } else if (lines !== null) {
      lines.push(line);
    }
  }
  return sections;
};

/** The names of the bullets `- \`name\`` of a section. */
const namesIn = (lines: readonly string[]) =>
  lines.flatMap((line) => {
    const name = /^- `([^`]+)`/.exec(line)?.[1];
    return name === undefined ? [] : [name];
  });

/** `step` is the id of the step. Each error message starts with it. */
export const parseContract = (text: string, step: string): Contract => {
  const sections = sectionsOf(text);
  const fail = (problem: string): never => {
    throw new Error(`${step}: the contract ${problem}`);
  };

  const inputs = namesIn(sections.get("inputs") ?? []);
  if (inputs.length === 0) {
    fail("names no input (section Inputs)");
  }
  const identifying = inputs.filter((name) =>
    IDENTIFYING_INPUTS.has(plain(name)),
  );
  if (identifying.length > 0) {
    fail(
      `names an input that identifies a person (${identifying.join(", ")}). A prompt is pseudonymous`,
    );
  }

  const output = namesIn(sections.get("output") ?? []);
  if (output.length === 0) {
    fail("names no output shape (section Output)");
  }

  const model = (sections.get("model") ?? []).join("\n");
  const role = modelRoles.find((candidate) =>
    model.includes(`\`${candidate}\``),
  );
  if (role === undefined) {
    return fail("names no model role (section Model)");
  }
  const maxTokens = Number(/`(\d+)`/.exec(model)?.[1] ?? "0");
  if (maxTokens <= 0) {
    fail("names no maximum of output tokens (section Model)");
  }

  const rules = (sections.get("rules") ?? []).filter(
    (line) => line.trim() !== "",
  );
  if (rules.length === 0) {
    fail("has no rule (section Rules)");
  }

  return { inputs, output, role, maxTokens };
};
