import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import type { Step } from "@remi/agent";
import { z } from "zod";

import type {
  ProviderReply,
  ProviderRequest,
  TextProvider,
} from "../../ai/index";

/**
 * The runner with a fake provider and a step that is not in the tree: no
 * network, no key and no database. The registry of the seam is module state,
 * thus each test loads a fresh copy of the seam and of the runner.
 */
const load = async () => {
  vi.resetModules();
  const seam = await import("../../ai/index");
  const { startFlow } = await import("./runner");
  return { seam, startFlow };
};

const fakeProvider = (
  reply: ProviderReply | Error,
  seen: ProviderRequest[] = [],
): TextProvider => ({
  name: "fake",
  generateText: async (request) => {
    seen.push(request);
    if (reply instanceof Error) {
      throw reply;
    }
    return reply;
  },
});

type Inputs = { food: string };

const step: Step<Inputs, { title: string }> = {
  id: "test/01-title",
  contract: {
    inputs: ["food"],
    output: ["title"],
    role: "fast",
    maxTokens: 256,
  },
  system: "Tu écris un titre.",
  schema: z.object({ title: z.string() }),
  render: (inputs) => `Aliment : ${inputs.food}`,
};

let info: MockInstance;
let error: MockInstance;

beforeEach(() => {
  info = vi.spyOn(console, "info").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const logged = (spy: MockInstance) =>
  spy.mock.calls.map((call) => JSON.parse(String(call[0])) as object);

describe("startFlow", () => {
  it("calls the seam with the texts, the role and the maximum of the step", async () => {
    const { seam, startFlow } = await load();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(
      fakeProvider({ text: '{"title":"Poêlée de courgettes"}' }, seen),
    );

    const result = await startFlow("test").run(step, { food: "courgette" });

    expect(result).toEqual({
      ok: true,
      data: { title: "Poêlée de courgettes" },
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({
      prompt: "Aliment : courgette",
      system: "Tu es REMI. Tu écris un titre.",
      model: seam.MODELS.fast,
      maxTokens: 256,
    });
    expect(seen[0]?.schema).toBe(step.schema);
  });

  it("writes the id of the step in the log line of the call", async () => {
    const { seam, startFlow } = await load();
    seam.registerTextProvider(fakeProvider({ text: '{"title":"Poêlée"}' }));

    await startFlow("test").run(step, { food: "courgette" });

    expect(logged(info)).toEqual([
      expect.objectContaining({
        event: "ai.generation",
        step: "test/01-title",
        role: "fast",
        outcome: "ok",
      }),
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  it("runs the model that the caller read from the settings", async () => {
    const { seam, startFlow } = await load();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(
      fakeProvider({ text: '{"title":"Poêlée"}' }, seen),
    );

    await startFlow("test").run(step, { food: "courgette" }, { model: "acme/small" });

    expect(seen[0]?.model).toBe("acme/small");
  });

  it("returns schema_fail when the reply does not have the shape of the step", async () => {
    const { seam, startFlow } = await load();
    seam.registerTextProvider(fakeProvider({ text: '{"titre":"Poêlée"}' }));

    const result = await startFlow("test").run(step, { food: "courgette" });

    expect(result).toMatchObject({ ok: false, error: "schema_fail" });
    expect(logged(error)).toEqual([
      expect.objectContaining({ step: "test/01-title", outcome: "schema_fail" }),
    ]);
  });

  it("refuses an input that the contract does not name, before any call", async () => {
    const { seam, startFlow } = await load();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(
      fakeProvider({ text: '{"title":"Poêlée"}' }, seen),
    );
    // A wider object than the type: the check is at run time too.
    const inputs = { food: "courgette", patientName: "A" } as Inputs;

    await expect(startFlow("test").run(step, inputs)).rejects.toThrow(
      "the contract does not name the input patientName",
    );
    expect(seen).toHaveLength(0);
    expect(info).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("runs the steps of a flow in the order of the folders", async () => {
    const { seam, startFlow } = await load();
    seam.registerTextProvider(fakeProvider({ text: '{"title":"Poêlée"}' }));
    const second = { ...step, id: "test/02-subtitle" };
    const flow = startFlow("test");

    await flow.run(step, { food: "courgette" });
    await flow.run(second, { food: "courgette" });

    expect(logged(info)).toEqual([
      expect.objectContaining({ step: "test/01-title" }),
      expect.objectContaining({ step: "test/02-subtitle" }),
    ]);
  });

  it("refuses a step out of the order of the folders, before any call", async () => {
    const { seam, startFlow } = await load();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(
      fakeProvider({ text: '{"title":"Poêlée"}' }, seen),
    );
    const second = { ...step, id: "test/02-subtitle" };
    const flow = startFlow("test");
    await flow.run(second, { food: "courgette" });

    await expect(flow.run(step, { food: "courgette" })).rejects.toThrow(
      "already at step 2",
    );
    await expect(flow.run(second, { food: "courgette" })).rejects.toThrow(
      "already at step 2",
    );
    expect(seen).toHaveLength(1);
  });

  it("refuses a step of another flow", async () => {
    const { seam, startFlow } = await load();
    seam.registerTextProvider(fakeProvider({ text: '{"title":"Poêlée"}' }));

    await expect(
      startFlow("meal").run(step, { food: "courgette" }),
    ).rejects.toThrow("this step is not in the flow meal");
    expect(info).not.toHaveBeenCalled();
  });
});
