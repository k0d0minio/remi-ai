import { describe, expect, it } from "vitest";
import {
  PROTOCOL_SNAPSHOT_SCHEMA_VERSION,
  type ProtocolSnapshot,
} from "./protocol-snapshot";
import { validatedRecommendationsView } from "./validated-recommendations";

const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const empty: ProtocolSnapshot = {
  schemaVersion: PROTOCOL_SNAPSHOT_SCHEMA_VERSION,
  recommendations: [],
  goals: [],
  supplements: [],
  instruction: null,
  calculations: [],
  foodDirectives: [],
};

const directive = (
  n: number,
  kind: ProtocolSnapshot["foodDirectives"][number]["kind"],
  term: string,
  rest: Partial<ProtocolSnapshot["foodDirectives"][number]> = {},
): ProtocolSnapshot["foodDirectives"][number] => ({
  id: id(n),
  kind,
  term,
  limitLevel: null,
  startsOn: null,
  endsOn: null,
  durable: false,
  position: n,
  ...rest,
});

const TODAY = "2026-11-20";
const validatedAt = new Date("2026-11-18T10:00:00.000Z");

const viewOf = (snapshot: ProtocolSnapshot, today = TODAY) =>
  validatedRecommendationsView({ validatedAt, snapshot }, today);

describe("validatedRecommendationsView", () => {
  it("is empty for a snapshot with no recommendation", () => {
    const view = viewOf(empty);
    expect(view.isEmpty).toBe(true);
    expect(view.lifestyle).toEqual([]);
  });

  it("is empty when the snapshot holds only content that the page does not show", () => {
    const view = viewOf({
      ...empty,
      instruction: {
        id: id(1),
        body: "Priorité énergie",
        patientBody: "Bravo",
      },
      calculations: [
        {
          kind: "protein",
          value: 60,
          parameters: {},
          validatedAt: "2026-11-18T09:00:00.000Z",
        },
      ],
    });
    expect(view.isEmpty).toBe(true);
  });

  it("gives the day of the validation at the practice", () => {
    // 23:30 UTC is the next day in Brussels.
    const view = validatedRecommendationsView(
      { validatedAt: new Date("2026-11-18T23:30:00.000Z"), snapshot: empty },
      TODAY,
    );
    expect(view.updatedOn).toBe("2026-11-19");
  });

  it("keeps the supplements as written, in the practitioner's order", () => {
    const view = viewOf({
      ...empty,
      supplements: [
        {
          id: id(2),
          name: "Vitamine D",
          dose: "",
          timing: "",
          reason: "",
          position: 1,
        },
        {
          id: id(1),
          name: "Magnésium",
          dose: "300 mg",
          timing: "le soir",
          reason: "Sommeil",
          position: 0,
        },
      ],
    });
    expect(view.supplements).toEqual([
      {
        id: id(1),
        name: "Magnésium",
        dose: "300 mg",
        timing: "le soir",
        reason: "Sommeil",
      },
      { id: id(2), name: "Vitamine D", dose: "", timing: "", reason: "" },
    ]);
    expect(view.isEmpty).toBe(false);
  });

  it("puts each recommendation in its category", () => {
    const rec = (
      n: number,
      category: ProtocolSnapshot["recommendations"][number]["category"],
      title: string,
    ) => ({ id: id(n), category, title, detail: "", position: n });
    const view = viewOf({
      ...empty,
      recommendations: [
        rec(1, "nutrition", "Légumes à chaque repas"),
        rec(2, "habit", "Coucher avant 23 h"),
        rec(3, "supplement", "Prendre avec un repas"),
        rec(4, "monitoring", "Noter le sommeil"),
        rec(5, "habit", "Respiration le matin"),
      ],
    });
    expect(view.foodAdvice.map((row) => row.title)).toEqual([
      "Légumes à chaque repas",
    ]);
    expect(view.supplementAdvice.map((row) => row.title)).toEqual([
      "Prendre avec un repas",
    ]);
    // No `activity` item: the sub-category is not in the view.
    expect(view.lifestyle).toEqual([
      {
        category: "eating_behaviour",
        items: [
          { id: id(2), title: "Coucher avant 23 h", detail: "" },
          { id: id(5), title: "Respiration le matin", detail: "" },
        ],
      },
      {
        category: "monitoring",
        items: [{ id: id(4), title: "Noter le sommeil", detail: "" }],
      },
    ]);
  });

  it("puts the lifestyle advice in the six categories, in Morgane's order", () => {
    const rec = (
      n: number,
      category: ProtocolSnapshot["recommendations"][number]["category"],
      title: string,
      position: number,
    ) => ({ id: id(n), category, title, detail: "", position });
    const view = viewOf({
      ...empty,
      recommendations: [
        rec(1, "sleep", "Coucher avant 23 h", 0),
        rec(2, "physical_activity", "Marcher 30 minutes", 1),
        // An old `activity` row is read in « Activité physique ».
        rec(3, "activity", "Prendre l'escalier", 0),
        rec(4, "habit", "Poser les couverts", 0),
        rec(5, "lifestyle_other", "Lumière du jour le matin", 0),
      ],
    });
    expect(
      view.lifestyle.map((group) => [
        group.category,
        group.items.map((item) => item.title),
      ]),
    ).toEqual([
      ["physical_activity", ["Prendre l'escalier", "Marcher 30 minutes"]],
      ["sleep", ["Coucher avant 23 h"]],
      ["eating_behaviour", ["Poser les couverts"]],
      ["lifestyle_other", ["Lumière du jour le matin"]],
    ]);
    expect(view.foodAdvice).toEqual([]);
    expect(view.isEmpty).toBe(false);
  });

  it("splits the food directives into the three lists", () => {
    const view = viewOf({
      ...empty,
      foodDirectives: [
        directive(1, "favour", "Légumes verts"),
        directive(2, "limit", "Café", { limitLevel: "reduce" }),
        directive(3, "limit", "Sucre"),
        directive(4, "exclude", "Gluten", { durable: true }),
      ],
    });
    expect(view.favour).toEqual([{ id: id(1), term: "Légumes verts" }]);
    expect(view.limit).toEqual([
      { id: id(2), term: "Café", limitLevel: "reduce" },
      { id: id(3), term: "Sucre", limitLevel: null },
    ]);
    expect(view.evictions).toEqual([
      { id: id(4), term: "Gluten", startsOn: null, endsOn: null },
    ]);
  });

  it("hides an eviction whose period has ended, and only that one", () => {
    const view = viewOf({
      ...empty,
      foodDirectives: [
        directive(1, "exclude", "Lait", { endsOn: "2026-11-19" }),
        directive(2, "exclude", "Œufs", { endsOn: "2026-11-20" }),
        directive(3, "exclude", "Soja", { endsOn: "2026-12-31" }),
        directive(4, "exclude", "Arachide", { durable: true }),
      ],
    });
    expect(view.evictions.map((row) => row.term)).toEqual([
      "Œufs",
      "Soja",
      "Arachide",
    ]);
    expect(view.evictions[1]?.endsOn).toBe("2026-12-31");
  });

  it("is empty when the only content is an ended eviction", () => {
    const view = viewOf({
      ...empty,
      foodDirectives: [
        directive(1, "exclude", "Lait", { endsOn: "2026-11-01" }),
      ],
    });
    expect(view.isEmpty).toBe(true);
  });

  it("gives the start date only for an eviction that has not started", () => {
    const view = viewOf({
      ...empty,
      foodDirectives: [
        directive(1, "exclude", "Lait", {
          startsOn: "2026-11-01",
          endsOn: "2026-12-31",
        }),
        directive(2, "exclude", "Blé", {
          startsOn: "2026-12-01",
          endsOn: "2026-12-31",
        }),
      ],
    });
    expect(view.evictions).toEqual([
      { id: id(1), term: "Lait", startsOn: null, endsOn: "2026-12-31" },
      { id: id(2), term: "Blé", startsOn: "2026-12-01", endsOn: "2026-12-31" },
    ]);
  });

  it("gives the goals in the practitioner's order, with the title only", () => {
    const view = viewOf({
      ...empty,
      goals: [
        { id: id(2), title: "Sommeil", baseline: "4/10", position: 1 },
        { id: id(1), title: "Énergie", baseline: "3/10", position: 0 },
      ],
    });
    expect(view.goals).toEqual([
      { id: id(1), title: "Énergie" },
      { id: id(2), title: "Sommeil" },
    ]);
  });
});
