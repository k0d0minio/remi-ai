import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { z } from "zod";

import type { ProviderReply, ProviderRequest, TextProvider } from "./index";

/**
 * The seam with a fake provider: no network and no key. The registry is module
 * state, thus each test loads a fresh copy of the module.
 */
const loadSeam = async () => {
  vi.resetModules();
  return import("./index");
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

const meal = z.object({ title: z.string(), proteinGrams: z.number() });

const PROMPT = "PROMPT-SECRET patiente A, reflux";
const REPLY_BAD = '{"title":"REPLY-SECRET omelette","proteinGrams":"many"}';

let info: MockInstance;
let error: MockInstance;

beforeEach(() => {
  info = vi.spyOn(console, "info").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const lines = (spy: MockInstance) =>
  spy.mock.calls.map((call) => String(call[0]));

describe("generateJson", () => {
  it("returns the value when the reply satisfies the schema", async () => {
    const seam = await loadSeam();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(
      fakeProvider(
        {
          text: '{"title":"Omelette","proteinGrams":24}',
          inputTokens: 120,
          outputTokens: 18,
        },
        seen,
      ),
    );

    const result = await seam.generateJson(PROMPT, meal);

    expect(result).toEqual({
      ok: true,
      data: { title: "Omelette", proteinGrams: 24 },
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.model).toBe(seam.MODELS.fast);
    expect(seen[0]?.schema).toBe(meal);
    expect(seen[0]?.maxTokens).toBe(seam.DEFAULTS.maxTokens);
    expect("temperature" in (seen[0] ?? {})).toBe(false);

    expect(error).not.toHaveBeenCalled();
    const logged = lines(info);
    expect(logged).toHaveLength(1);
    expect(JSON.parse(logged[0] ?? "")).toMatchObject({
      event: "ai.generation",
      kind: "json",
      role: "fast",
      model: seam.MODELS.fast,
      provider: "fake",
      inputTokens: 120,
      outputTokens: 18,
      outcome: "ok",
    });
  });

  it("accepts a reply in a markdown code fence", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider(
      fakeProvider({
        text: '```json\n{"title":"Omelette","proteinGrams":24}\n```',
      }),
    );

    const result = await seam.generateJson(PROMPT, meal);

    expect(result.ok).toBe(true);
  });

  it("returns schema_fail, and logs it, when the reply does not satisfy the schema", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider(
      fakeProvider({ text: REPLY_BAD, inputTokens: 120, outputTokens: 18 }),
    );

    const result = await seam.generateJson(PROMPT, meal);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ ok: false, error: "schema_fail" });
    expect(JSON.stringify(result)).not.toContain("REPLY-SECRET");

    expect(info).not.toHaveBeenCalled();
    const logged = lines(error);
    expect(logged).toHaveLength(1);
    expect(JSON.parse(logged[0] ?? "")).toMatchObject({
      event: "ai.generation",
      kind: "json",
      outcome: "schema_fail",
      inputTokens: 120,
      outputTokens: 18,
    });
  });

  it("returns schema_fail when the reply is not JSON", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider(fakeProvider({ text: "Voici une omelette." }));

    const result = await seam.generateJson(PROMPT, meal);

    expect(result).toMatchObject({ ok: false, error: "schema_fail" });
  });

  it("returns refused when the provider says that the model refused", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider(fakeProvider({ text: "", refused: true }));

    const result = await seam.generateJson(PROMPT, meal);

    expect(result).toMatchObject({ ok: false, error: "refused" });
  });

  it("returns error when the provider throws", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider(
      fakeProvider(new Error(`upstream said: ${PROMPT}`)),
    );

    const result = await seam.generateJson(PROMPT, meal);

    expect(result).toMatchObject({ ok: false, error: "error" });
    expect(JSON.stringify(result)).not.toContain("PROMPT-SECRET");
    expect(JSON.parse(lines(error)[0] ?? "")).toMatchObject({
      outcome: "error",
      errorName: "Error",
    });
  });

  it("returns error when no provider is registered", async () => {
    const seam = await loadSeam();

    const result = await seam.generateJson(PROMPT, meal);

    expect(result).toMatchObject({ ok: false, error: "error" });
    expect(JSON.parse(lines(error)[0] ?? "")).toMatchObject({
      provider: null,
      outcome: "error",
    });
  });

  it("never writes the prompt or the reply in the log", async () => {
    const seam = await loadSeam();
    const replies: (ProviderReply | Error)[] = [
      { text: '{"title":"REPLY-SECRET","proteinGrams":1}' },
      { text: REPLY_BAD },
      new Error(`REPLY-SECRET ${PROMPT}`),
    ];
    for (const reply of replies) {
      seam.registerTextProvider(fakeProvider(reply));
      await seam.generateJson(PROMPT, meal, { system: "SYSTEM-SECRET" });
      await seam.generateText(PROMPT, { system: "SYSTEM-SECRET" });
    }

    const logged = [...lines(info), ...lines(error)];
    expect(logged).toHaveLength(6);
    for (const line of logged) {
      expect(line).not.toContain("SECRET");
      expect(line).not.toContain("reflux");
    }
  });
});

describe("generateText", () => {
  it("returns the text, with the role and the options of the caller", async () => {
    const seam = await loadSeam();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(fakeProvider({ text: "Bonjour" }, seen));

    const result = await seam.generateText(PROMPT, {
      role: "balanced",
      system: "Tu es Remi.",
      maxTokens: 200,
      temperature: 0.2,
    });

    expect(result).toEqual({ ok: true, data: "Bonjour" });
    expect(seen[0]).toEqual({
      prompt: PROMPT,
      model: seam.MODELS.balanced,
      system: "Tu es Remi.",
      maxTokens: 200,
      temperature: 0.2,
    });
  });

  it("returns error for a reply with no text, never an empty answer", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider(fakeProvider({ text: "  " }));

    const result = await seam.generateText(PROMPT);

    expect(result).toMatchObject({ ok: false, error: "error" });
  });
});

describe("the model of a call", () => {
  it("uses the model that the caller resolved, and logs that model", async () => {
    const seam = await loadSeam();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(
      fakeProvider({ text: '{"title":"Omelette","proteinGrams":24}' }, seen),
    );

    await seam.generateJson(PROMPT, meal, {
      role: "fast",
      model: "acme/small",
    });

    expect(seen[0]?.model).toBe("acme/small");
    expect(JSON.parse(lines(info)[0] ?? "")).toMatchObject({
      role: "fast",
      model: "acme/small",
      outcome: "ok",
    });
  });

  it("logs the model that ran when the call fails", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider(fakeProvider(new Error("network")));

    await seam.generateText(PROMPT, { role: "deep", model: "acme/large" });

    expect(JSON.parse(lines(error)[0] ?? "")).toMatchObject({
      role: "deep",
      model: "acme/large",
      outcome: "error",
    });
  });

  it("uses the code default of the role for an empty model", async () => {
    const seam = await loadSeam();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(fakeProvider({ text: "Bonjour." }, seen));

    await seam.generateText(PROMPT, { role: "balanced", model: "  " });

    expect(seen[0]?.model).toBe(seam.MODELS.balanced);
  });
});

describe("a refusal that the adapter names", () => {
  it.each(["no_access", "unknown_model"] as const)(
    "returns %s, and logs it with no message",
    async (reason) => {
      const seam = await loadSeam();
      seam.registerTextProvider(
        fakeProvider(new seam.ProviderCallError(reason)),
      );

      const result = await seam.generateJson(PROMPT, meal, {
        model: "acme/small",
      });

      expect(result).toMatchObject({ ok: false, error: reason });
      expect(JSON.parse(lines(error)[0] ?? "")).toMatchObject({
        model: "acme/small",
        outcome: reason,
        errorName: "ProviderCallError",
      });
    },
  );
});

describe("listProviderModels", () => {
  const catalogue = [
    {
      id: "acme/small",
      name: "Acme Small",
      type: "language",
      tags: ["structured-output"],
      noTraining: "all",
      zdr: "none",
    },
  ];

  it("gives the catalogue of the provider", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider({
      ...fakeProvider({ text: "" }),
      listModels: async () => catalogue,
    });

    expect(await seam.listProviderModels()).toEqual(catalogue);
  });

  it("gives null with no provider, and with a provider that has no list", async () => {
    const seam = await loadSeam();
    expect(await seam.listProviderModels()).toBeNull();

    seam.registerTextProvider(fakeProvider({ text: "" }));
    expect(await seam.listProviderModels()).toBeNull();
  });

  it("gives null when the list cannot be read, and logs the error name only", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider({
      ...fakeProvider({ text: "" }),
      listModels: async () => {
        throw new TypeError("fetch failed: SECRET-DETAIL");
      },
    });

    expect(await seam.listProviderModels()).toBeNull();
    const logged = lines(error);
    expect(logged).toHaveLength(1);
    expect(JSON.parse(logged[0] ?? "")).toMatchObject({
      event: "ai.catalogue",
      outcome: "error",
      errorName: "TypeError",
    });
    expect(logged[0]).not.toContain("SECRET-DETAIL");
  });
});

describe("the model roles", () => {
  it("are AI Gateway ids of the form creator/model", async () => {
    const seam = await loadSeam();

    for (const id of Object.values(seam.MODELS)) {
      expect(id).toMatch(/^[a-z0-9-]+\/[a-z0-9.-]+$/);
    }
    expect(seam.resolveModel()).toBe(seam.MODELS.fast);
  });
});

describe("registration without the key", () => {
  it("gives no adapter, and the seam stays unregistered", async () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    const seam = await loadSeam();

    expect(seam.gatewayTextProviderFromEnv()).toBeNull();
    expect(seam.isTextProviderRegistered()).toBe(false);
    expect(() => seam.getTextProvider()).toThrow(/no AI provider registered/);
    expect(await seam.generateText(PROMPT)).toMatchObject({
      ok: false,
      error: "error",
    });
  });

  it("gives the adapter when the key is set", async () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "test-key-not-real");
    const seam = await loadSeam();

    const adapter = seam.gatewayTextProviderFromEnv();

    expect(adapter?.name).toBe("vercel-ai-gateway");
    expect(seam.isTextProviderRegistered()).toBe(false);
  });
});

describe("the step name in the log line (REM-188)", () => {
  it("writes the step of the call, and does not send it to the provider", async () => {
    const seam = await loadSeam();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(
      fakeProvider({ text: '{"title":"Omelette","proteinGrams":24}' }, seen),
    );

    await seam.generateJson(PROMPT, meal, { step: "meal/01-suggest" });

    expect(JSON.parse(lines(info)[0] ?? "")).toMatchObject({
      event: "ai.generation",
      step: "meal/01-suggest",
      outcome: "ok",
    });
    expect("step" in (seen[0] ?? {})).toBe(false);
  });

  it("writes the step of a failed call too", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider(fakeProvider(new Error("network")));

    await seam.generateJson(PROMPT, meal, { step: "meal/01-suggest" });

    expect(JSON.parse(lines(error)[0] ?? "")).toMatchObject({
      step: "meal/01-suggest",
      outcome: "error",
    });
  });

  it("has no step field for a call that no step made", async () => {
    const seam = await loadSeam();
    seam.registerTextProvider(
      fakeProvider({ text: '{"title":"Omelette","proteinGrams":24}' }),
    );

    await seam.generateJson(PROMPT, meal);

    expect("step" in JSON.parse(lines(info)[0] ?? "{}")).toBe(false);
  });
});
