import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  MODELS,
  ProviderCallError,
  registerTextProvider,
  type CatalogueModel,
  type ProviderReply,
  type ProviderRequest,
  type TextProvider,
} from "../../ai";
import { registerDatabase } from "../../db/client";
import { systemActor } from "../../db/services/access";
import { getAppSetting } from "../../db/services/app-settings";
import { listAuditEvents } from "../../db/services/audit";
import { createMemoryDatabase } from "../../db/test-helpers";
import {
  aiModelSettingKey,
  listCatalogueModels,
  listRoleModels,
  resetRoleModel,
  roleModel,
  setRoleModel,
  testRoleModel,
  type AiModelsOperator,
} from "./index";

const admin: AiModelsOperator = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "jamie@example.com",
  name: "Jamie",
  role: "admin",
};

const practitioner: AiModelsOperator = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "morgane@example.com",
  name: "Morgane",
  role: "practitioner",
};

const entry = (
  id: string,
  patch: Partial<CatalogueModel> = {},
): CatalogueModel => ({
  id,
  name: id,
  type: "language",
  tags: ["structured-output"],
  noTraining: "all",
  zdr: "none",
  ...patch,
});

const CATALOGUE = [
  entry("acme/small"),
  entry("acme/large", { zdr: "all" }),
  entry("acme/plain", { tags: ["tool-use"] }),
  entry("acme/trains", { noTraining: "some" }),
  entry("acme/silent", { noTraining: null }),
];

type Fake = {
  catalogue?: CatalogueModel[] | Error;
  reply?: ProviderReply | Error;
  seen?: ProviderRequest[];
};

const provider = ({ catalogue, reply, seen = [] }: Fake): TextProvider => ({
  name: "fake",
  generateText: async (request) => {
    seen.push(request);
    if (!reply || reply instanceof Error) {
      throw reply ?? new Error("no reply");
    }
    return reply;
  },
  ...(catalogue === undefined
    ? {}
    : {
        listModels: async () => {
          if (catalogue instanceof Error) {
            throw catalogue;
          }
          return catalogue;
        },
      }),
});

const events = async (action: "ai_model.set" | "ai_model.reset") =>
  listAuditEvents(systemActor, { action, limit: 500 });

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

beforeEach(async () => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  registerTextProvider(provider({ catalogue: CATALOGUE }));
  for (const role of ["fast", "balanced", "deep"] as const) {
    await resetRoleModel(admin, role);
  }
});

describe("the model of a role, with no setting", () => {
  it("is the code default", async () => {
    expect(await roleModel("fast")).toBe(MODELS.fast);
    const listed = await listRoleModels(admin);
    expect(listed).toMatchObject({
      ok: true,
      data: [
        { role: "fast", model: MODELS.fast, source: "default", setAt: null },
        { role: "balanced", model: MODELS.balanced, source: "default" },
        { role: "deep", model: MODELS.deep, source: "default" },
      ],
    });
  });
});

describe("setRoleModel", () => {
  it("sets the model, with who set it and when", async () => {
    const result = await setRoleModel(admin, "fast", "  acme/small ");

    expect(result).toMatchObject({
      ok: true,
      data: {
        role: "fast",
        model: "acme/small",
        defaultModel: MODELS.fast,
        source: "setting",
        setByName: "Jamie",
      },
    });
    expect(result.ok && result.data.setAt).toBeInstanceOf(Date);
    expect(await roleModel("fast")).toBe("acme/small");
    expect(await roleModel("deep")).toBe(MODELS.deep);
  });

  it("writes an audit event with the model before and after", async () => {
    const before = (await events("ai_model.set")).length;

    await setRoleModel(admin, "balanced", "acme/small");
    await setRoleModel(admin, "balanced", "acme/large");

    const written = await events("ai_model.set");
    expect(written).toHaveLength(before + 2);
    const details = written
      .filter((event) => event.targetId === "ai.model.balanced")
      .map((event) => JSON.parse(event.detail) as unknown);
    expect(details).toContainEqual({
      role: "balanced",
      from: MODELS.balanced,
      to: "acme/small",
    });
    expect(details).toContainEqual({
      role: "balanced",
      from: "acme/small",
      to: "acme/large",
    });
    expect(written[0]).toMatchObject({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "setting",
      targetLabel: "balanced",
    });
  });

  it("refuses an id that the gateway does not list", async () => {
    expect(await setRoleModel(admin, "fast", "acme/unknown")).toMatchObject({
      ok: false,
      error: "invalid_input",
      message: "the gateway does not list this model",
    });
    expect(await roleModel("fast")).toBe(MODELS.fast);
  });

  it("refuses a model with no structured output", async () => {
    expect(await setRoleModel(admin, "fast", "acme/plain")).toMatchObject({
      ok: false,
      message: "this model has no structured output",
    });
  });

  it.each(["acme/trains", "acme/silent"])(
    "refuses %s: its providers may train on the data",
    async (id) => {
      const before = (await events("ai_model.set")).length;

      expect(await setRoleModel(admin, "fast", id)).toMatchObject({
        ok: false,
        message: "the providers of this model may train on the data",
      });
      expect(await getAppSetting(aiModelSettingKey("fast"))).toBeNull();
      expect(await events("ai_model.set")).toHaveLength(before);
    },
  );

  it.each([
    ["the gateway cannot be reached", { catalogue: new Error("down") }],
    ["the provider has no list", {}],
  ])("refuses a save when %s", async (_name, fake) => {
    registerTextProvider(provider(fake));

    expect(await setRoleModel(admin, "fast", "acme/small")).toMatchObject({
      ok: false,
      error: "upstream_failed",
      message: "the model list is not available",
    });
    expect(await roleModel("fast")).toBe(MODELS.fast);
  });

  it("refuses an empty id and an unknown role", async () => {
    expect(await setRoleModel(admin, "fast", "   ")).toMatchObject({
      ok: false,
      message: "a model id is required",
    });
    expect(await setRoleModel(admin, "cheap", "acme/small")).toMatchObject({
      ok: false,
      message: "this AI role does not exist",
    });
  });
});

describe("resetRoleModel", () => {
  it("removes the setting: the code default applies again", async () => {
    await setRoleModel(admin, "fast", "acme/small");
    const before = (await events("ai_model.reset")).length;

    expect(await resetRoleModel(admin, "fast")).toMatchObject({
      ok: true,
      data: { model: MODELS.fast, source: "default", setByName: null },
    });
    expect(await roleModel("fast")).toBe(MODELS.fast);

    const written = await events("ai_model.reset");
    expect(written).toHaveLength(before + 1);
    // Two events can share a millisecond: do not read the order.
    expect(
      written.map((event) => JSON.parse(event.detail) as unknown),
    ).toContainEqual({ role: "fast", from: "acme/small", to: MODELS.fast });
  });

  it("writes no event when the role had no setting", async () => {
    const before = (await events("ai_model.reset")).length;

    expect((await resetRoleModel(admin, "deep")).ok).toBe(true);

    expect(await events("ai_model.reset")).toHaveLength(before);
  });

  it("works when the gateway cannot be reached", async () => {
    await setRoleModel(admin, "fast", "acme/small");
    registerTextProvider(provider({ catalogue: new Error("down") }));

    expect((await resetRoleModel(admin, "fast")).ok).toBe(true);
    expect(await roleModel("fast")).toBe(MODELS.fast);
  });
});

describe("a practitioner", () => {
  it("reads nothing and changes nothing", async () => {
    await setRoleModel(admin, "fast", "acme/small");
    const refusal = { ok: false, error: "not_permitted" };

    expect(await listRoleModels(practitioner)).toMatchObject(refusal);
    expect(await listCatalogueModels(practitioner)).toMatchObject(refusal);
    expect(
      await setRoleModel(practitioner, "fast", "acme/large"),
    ).toMatchObject(refusal);
    expect(await resetRoleModel(practitioner, "fast")).toMatchObject(refusal);
    expect(
      await testRoleModel(practitioner, "fast", "acme/small"),
    ).toMatchObject(refusal);

    expect(await roleModel("fast")).toBe("acme/small");
  });
});

describe("listCatalogueModels", () => {
  it("gives the catalogue, or null when it is not available", async () => {
    expect(await listCatalogueModels(admin)).toEqual({
      ok: true,
      data: CATALOGUE,
    });

    registerTextProvider(provider({ catalogue: new Error("down") }));
    expect(await listCatalogueModels(admin)).toEqual({ ok: true, data: null });
    // The current values still read.
    expect((await listRoleModels(admin)).ok).toBe(true);
  });
});

describe("testRoleModel", () => {
  it("makes one call to the model that the admin typed, with no patient data", async () => {
    const seen: ProviderRequest[] = [];
    registerTextProvider(provider({ reply: { text: '{"ok":true}' }, seen }));

    expect(await testRoleModel(admin, "deep", " acme/large ")).toEqual({
      ok: true,
      data: "ok",
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.model).toBe("acme/large");
    expect(seen[0]?.schema).toBeDefined();
    expect(seen[0]?.system).toBeUndefined();
  });

  it("changes no setting and writes no audit event", async () => {
    registerTextProvider(provider({ reply: { text: '{"ok":true}' } }));
    const before = (await events("ai_model.set")).length;

    await testRoleModel(admin, "fast", "acme/large");

    expect(await roleModel("fast")).toBe(MODELS.fast);
    expect(await events("ai_model.set")).toHaveLength(before);
  });

  it.each([
    ["no_access", new ProviderCallError("no_access")],
    ["unknown_model", new ProviderCallError("unknown_model")],
    ["error", new Error("network")],
    ["schema_fail", { text: "Bonjour." }],
    ["refused", { text: "", refused: true }],
  ] as const)("reports %s as the outcome", async (outcome, reply) => {
    registerTextProvider(provider({ reply }));

    expect(await testRoleModel(admin, "fast", "acme/small")).toEqual({
      ok: true,
      data: outcome,
    });
  });
});
