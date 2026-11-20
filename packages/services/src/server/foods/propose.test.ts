import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ProviderReply,
  ProviderRequest,
  TextProvider,
} from "../../ai/index";
import type { FoodRecordProposalReply } from "../../ai/prompts/food-record";
import { FIRST_LOT_FOODS } from "./first-lot";
import { checkedFoodProposal } from "./propose";

/**
 * REMI's proposal with a fake provider and the in-memory client: no network,
 * no key. The registries of the seams are module state, thus each test loads
 * a fresh copy of the seams and of the services.
 *
 * The codes are foods of the committed CIQUAL subset.
 */
const RICE = "9100";
const EGG = "22010";

const operator = {
  id: "00000000-0000-4000-8000-0000000000aa",
  email: "morgane@example.test",
  name: "Morgane",
};

const reply = (
  overrides: Partial<FoodRecordProposalReply> = {},
): FoodRecordProposalReply => ({
  cookable: true,
  role: "protein",
  contains: ["eggs"],
  mayContain: [],
  densityGPerMl: null,
  units: [{ one: "œuf", many: "œufs", grams: 55 }],
  ...overrides,
});

const fakeProvider = (
  answer: FoodRecordProposalReply | string | Error,
  seen: ProviderRequest[] = [],
): TextProvider => ({
  name: "fake",
  generateText: async (request): Promise<ProviderReply> => {
    seen.push(request);
    if (answer instanceof Error) {
      throw answer;
    }
    return { text: typeof answer === "string" ? answer : JSON.stringify(answer) };
  },
});

const load = async () => {
  vi.resetModules();
  const seam = await import("../../ai/index");
  const { registerDatabase } = await import("../../db/client");
  const { createMemoryDatabase } = await import("../../db/test-helpers");
  const { loadCiqualFixture } = await import("../../db/fixtures/ciqual");
  const records = await import("../../db/services/food-records");
  const service = await import("./propose");
  const client = createMemoryDatabase();
  registerDatabase(client);
  await loadCiqualFixture(client);
  return { seam, records, service };
};

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("proposeFoodRecord", () => {
  it("asks the model of the role fast and stores the reply as proposed", async () => {
    const { seam, records, service } = await load();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(fakeProvider(reply(), seen));

    const result = await service.proposeFoodRecord(operator, EGG);

    expect(result).toMatchObject({
      ok: true,
      data: {
        foodCode: EGG,
        status: "proposed",
        source: "remi",
        proposedModel: seam.MODELS.fast,
        cookable: true,
        role: "protein",
        containsTags: ["eggs"],
        confirmedAt: null,
        units: [{ one: "œuf", many: "œufs", grams: 55 }],
        unitsStatus: "proposed",
      },
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.model).toBe(seam.MODELS.fast);
    expect(seen[0]?.system).toContain("jamais une décision de sécurité");
    expect(seen[0]?.prompt).toContain("Nom : Oeuf dur");
    expect(seen[0]?.prompt).toContain("gluten:wheat");
    // A proposal is not a food that a generation can use.
    expect(await records.listConfirmedCookableFoods()).toEqual([]);
    expect(
      (await records.listFoodRecordsToConfirm()).map((line) => line.food.code),
    ).toEqual([EGG]);
  });

  it("adds the tags of the lexicon row that names the food", async () => {
    const { seam, service } = await load();
    seam.registerTextProvider(
      fakeProvider(reply({ role: "starch", contains: [], units: [] })),
    );
    const result = await service.proposeFoodRecord(operator, RICE);
    expect(result).toMatchObject({
      ok: true,
      data: {
        lexiconId: "riz",
        containsTags: ["carb"],
        unitsStatus: null,
      },
    });
  });

  it.each([
    ["the provider fails", new Error("boom")],
    ["the reply is not the JSON asked for", "pas du JSON"],
  ])("stores nothing when %s", async (_label, answer) => {
    const { seam, records, service } = await load();
    seam.registerTextProvider(fakeProvider(answer));
    expect(await service.proposeFoodRecord(operator, EGG)).toEqual({
      ok: false,
      error: "upstream_failed",
      message: "the food proposal is not available",
    });
    expect(await records.getFoodRecord(EGG)).toBeNull();
  });

  it("stores nothing with no provider", async () => {
    const { records, service } = await load();
    expect(await service.proposeFoodRecord(operator, EGG)).toMatchObject({
      ok: false,
      error: "upstream_failed",
    });
    expect(await records.getFoodRecord(EGG)).toBeNull();
  });

  it("never replaces a record: the model is not called", async () => {
    const { seam, records, service } = await load();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(fakeProvider(reply({ contains: [] }), seen));
    await records.confirmFoodRecord(operator, EGG, {
      cookable: true,
      containsTags: ["eggs"],
      mayContainTags: [],
      role: "protein",
    });
    expect(await service.proposeFoodRecord(operator, EGG)).toEqual({
      ok: false,
      error: "conflict",
      message: "this food already has a record",
    });
    expect(seen).toEqual([]);
    expect((await records.getFoodRecord(EGG))?.status).toBe("confirmed");
  });

  it("refuses a code that CIQUAL does not have", async () => {
    const { seam, service } = await load();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(fakeProvider(reply(), seen));
    expect(
      await service.proposeFoodRecord(operator, "no-such-code"),
    ).toMatchObject({ ok: false, error: "not_found" });
    expect(seen).toEqual([]);
  });
});

describe("proposeFirstLot", () => {
  const lot = [
    { code: RICE, name: "riz blanc" },
    // A wrong code: the name finds the food, and rice gets no second record.
    { code: RICE, name: "oeuf dur" },
    { code: "1", name: "zzzz" },
  ];

  it("proposes each food of the lot that has no record", async () => {
    const { seam, records, service } = await load();
    const seen: ProviderRequest[] = [];
    seam.registerTextProvider(fakeProvider(reply(), seen));
    await records.confirmFoodRecord(operator, RICE, {
      cookable: true,
      containsTags: ["carb"],
      mayContainTags: [],
      role: "starch",
    });

    expect(await service.proposeFirstLot(operator, lot)).toEqual({
      proposed: 1,
      alreadyRecorded: 1,
      failed: 0,
      notFound: ["zzzz"],
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.prompt).toContain("Nom : Oeuf dur");
    expect((await records.getFoodRecord(EGG))?.status).toBe("proposed");
    expect((await records.getFoodRecord(RICE))?.status).toBe("confirmed");

    // A second run has nothing left to propose.
    expect(await service.proposeFirstLot(operator, lot)).toEqual({
      proposed: 0,
      alreadyRecorded: 2,
      failed: 0,
      notFound: ["zzzz"],
    });
    expect(seen).toHaveLength(1);
  });

  it("counts a failed proposal and stores nothing for it", async () => {
    const { seam, records, service } = await load();
    seam.registerTextProvider(fakeProvider(new Error("boom")));
    expect(await service.proposeFirstLot(operator, lot)).toEqual({
      proposed: 0,
      alreadyRecorded: 0,
      failed: 2,
      notFound: ["zzzz"],
    });
    expect((await records.listFoodRecords()).size).toBe(0);
  });
});

describe("checkedFoodProposal", () => {
  const egg = { nameFr: "Oeuf dur" };

  it("drops a tag that the gate does not know", () => {
    const proposal = checkedFoodProposal(
      egg,
      reply({ contains: ["eggs", "dairy"], mayContain: ["eggs", "milk", "x"] }),
      "test/model",
    );
    expect(proposal.containsTags).toEqual(["eggs"]);
    expect(proposal.mayContainTags).toEqual(["milk"]);
    expect(proposal.model).toBe("test/model");
  });

  it("drops a unit or a density that is out of range, and corrects none", () => {
    const proposal = checkedFoodProposal(
      egg,
      reply({
        densityGPerMl: 99,
        units: [
          { one: " œuf ", many: "", grams: 55 },
          { one: "Œuf", many: "œufs", grams: 60 },
          { one: "", many: "x", grams: 10 },
          { one: "boîte", many: "boîtes", grams: 99999 },
          { one: "blanc", many: "blancs", grams: -3 },
        ],
      }),
      "test/model",
    );
    expect(proposal.kitchenUnits).toEqual({
      densityGPerMl: null,
      units: [{ one: "œuf", many: "œuf", grams: 55 }],
    });
  });

  it("keeps three units at most", () => {
    const units = ["a", "b", "c", "d"].map((one) => ({
      one,
      many: `${one}s`,
      grams: 10,
    }));
    expect(
      checkedFoodProposal(egg, reply({ units }), "m").kitchenUnits?.units,
    ).toHaveLength(3);
  });

  it("gives no kitchen units when the reply has none", () => {
    expect(
      checkedFoodProposal(egg, reply({ units: [] }), "m").kitchenUnits,
    ).toBeNull();
    expect(
      checkedFoodProposal(egg, reply({ units: [], densityGPerMl: 0.92 }), "m")
        .kitchenUnits,
    ).toEqual({ densityGPerMl: 0.92, units: [] });
  });

  it("adds the tags of the lexicon row and never says less", () => {
    const proposal = checkedFoodProposal(
      { nameFr: "Riz blanc, cru" },
      reply({ contains: [], mayContain: ["carb", "gluten"] }),
      "m",
    );
    expect(proposal.containsTags).toEqual(["carb"]);
    expect(proposal.mayContainTags).toEqual(["gluten"]);
  });
});

describe("the first lot", () => {
  it("is a short list with one line for each code and each name", () => {
    expect(FIRST_LOT_FOODS.length).toBeGreaterThan(0);
    expect(FIRST_LOT_FOODS.length).toBeLessThanOrEqual(30);
    expect(new Set(FIRST_LOT_FOODS.map((food) => food.code)).size).toBe(
      FIRST_LOT_FOODS.length,
    );
    expect(new Set(FIRST_LOT_FOODS.map((food) => food.name)).size).toBe(
      FIRST_LOT_FOODS.length,
    );
    for (const food of FIRST_LOT_FOODS) {
      expect(food.code).toMatch(/^\d+$/);
      expect(food.name.trim()).not.toBe("");
      expect(food.name).toBe(food.name.toLowerCase());
    }
  });
});
