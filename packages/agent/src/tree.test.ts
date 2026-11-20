import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseContract } from "./contract";
import * as agent from "./index";

/**
 * The folder tree is the orchestration, thus this test reads the folders. It
 * fails when a step has no contract, when a contract names no output shape,
 * when a folder is not in the barrel, or when the order of a flow has a gap.
 * `step.test.ts` has the third rule of REM-188: a call with an input that its
 * contract does not name is refused. `flow.test.ts` has the order of a run.
 */

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FLOWS = join(ROOT, "flows");
const STEP_FILES = ["CONTEXT.md", "prompt.md", "step.ts", "step.test.ts"];

const folders = (path: string) =>
  readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const flows = folders(FLOWS).map((flow) => ({
  flow,
  steps: folders(join(FLOWS, flow)),
}));

const stepIds = flows.flatMap(({ flow, steps }) =>
  steps.map((step) => `${flow}/${step}`),
);

type AnyStep = {
  id: string;
  contract: ReturnType<typeof parseContract>;
  schema: unknown;
};

const isStep = (value: unknown): value is AnyStep =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  "contract" in value &&
  "render" in value;

const exported = (Object.values(agent) as unknown[]).filter(isStep);

describe("the folder tree", () => {
  it("has a step", () => {
    expect(stepIds.length).toBeGreaterThan(0);
  });

  it.each(flows)(
    "the flow $flow numbers its steps 01, 02, 03 with no gap",
    ({ steps }) => {
      expect(steps.length).toBeGreaterThan(0);
      steps.forEach((step, index) => {
        expect(step).toMatch(/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/);
        expect(Number(step.slice(0, 2))).toBe(index + 1);
      });
    },
  );

  it.each(stepIds)("the step %s has its files", (id) => {
    for (const file of STEP_FILES) {
      expect(existsSync(join(FLOWS, id, file)), `${id}/${file}`).toBe(true);
    }
  });

  it.each(stepIds)("the contract of %s has each part", (id) => {
    const text = readFileSync(join(FLOWS, id, "CONTEXT.md"), "utf8");

    expect(() => parseContract(text, id)).not.toThrow();
  });

  it("has one line in the barrel for each step folder, and no other", () => {
    expect(exported.map((step) => step.id).sort()).toEqual(stepIds);
  });

  it("names each flow in the routes of REMI.md", () => {
    const identity = readFileSync(join(ROOT, "REMI.md"), "utf8");

    for (const { flow } of flows) {
      expect(identity, flow).toContain(`\`flows/${flow}/\``);
    }
  });
});

describe.each(exported)("the step $id", (step) => {
  it("is built from the contract of its folder", () => {
    const text = readFileSync(join(FLOWS, step.id, "CONTEXT.md"), "utf8");

    expect(step.contract).toEqual(parseContract(text, step.id));
  });

  it("names each field of its schema in the section Output, and no other", () => {
    expect(step.schema).toBeInstanceOf(z.ZodObject);
    const shape = (step.schema as z.ZodObject).shape;

    expect([...step.contract.output].sort()).toEqual(Object.keys(shape).sort());
  });

  // Section 9 of the recipe plan (Jamie, 2026-11-20): `fast` in the test period.
  it("uses the role fast", () => {
    expect(step.contract.role).toBe("fast");
  });
});
