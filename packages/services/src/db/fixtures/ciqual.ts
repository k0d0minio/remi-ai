import { readFileSync } from "node:fs";
import type { DatabaseClient } from "../client";
import type {
  CiqualImport,
  ConfidenceCode,
  Food,
  FoodNutrient,
  NutrientMarker,
} from "../models/food";

/**
 * Loading the committed CIQUAL subset into a database client.
 *
 * The subset is real ANSES data — `pnpm ciqual:fixture` derives it from the
 * full export and nothing about it is hand-written, which is the point: a
 * fixture somebody typed agrees with whatever the code does, and that is the
 * one thing a fixture must never do. See `LICENCE.md` beside it.
 *
 * Read with `readFileSync` rather than a JSON import so TypeScript never has
 * to infer a literal type for eight thousand nutrient values.
 */

/** `[value, marker, confidence, rawValue]` — see `scripts/ciqual-fixture.mjs`. */
type PackedNutrient = [number | null, string, string, string];

type FixtureFood = {
  code: string;
  nameFr: string;
  nameEn: string;
  searchName: string;
  groupCode: string;
  groupNameFr: string;
  subGroupCode: string;
  subGroupNameFr: string;
  nutrients: Record<string, PackedNutrient>;
};

type Fixture = {
  edition: string;
  source: {
    publisher: string;
    doi: string;
    licence: string;
    checksums: readonly string[];
  };
  components: readonly { code: string; nameFr: string; unit: string }[];
  foods: readonly FixtureFood[];
};

export const ciqualFixture: Fixture = JSON.parse(
  readFileSync(new URL("./ciqual-subset.json", import.meta.url), "utf8"),
) as Fixture;

/**
 * Inserts the subset through the seam, exactly as the import script's upserts
 * leave it — same tables, same column meanings — so a service tested here is
 * tested against the shape production holds.
 */
export const loadCiqualFixture = async (client: DatabaseClient) => {
  const foods = client.collection<Food>("foods");
  const nutrients = client.collection<FoodNutrient>("food_nutrients");
  const imports = client.collection<CiqualImport>("ciqual_imports");

  const components = new Map(
    ciqualFixture.components.map((component) => [component.code, component]),
  );

  let nutrientCount = 0;

  for (const food of ciqualFixture.foods) {
    await foods.insert({
      code: food.code,
      nameFr: food.nameFr,
      nameEn: food.nameEn,
      searchName: food.searchName,
      groupCode: food.groupCode,
      groupNameFr: food.groupNameFr,
      subGroupCode: food.subGroupCode,
      subGroupNameFr: food.subGroupNameFr,
    });

    for (const [componentCode, packed] of Object.entries(food.nutrients)) {
      const component = components.get(componentCode);
      await nutrients.insert({
        foodCode: food.code,
        componentCode,
        componentNameFr: component?.nameFr ?? "",
        unit: component?.unit ?? "",
        value: packed[0],
        marker: packed[1] as NutrientMarker,
        rawValue: packed[3],
        confidence: packed[2] as ConfidenceCode | "",
      });
      nutrientCount += 1;
    }
  }

  await imports.insert({
    edition: ciqualFixture.edition,
    foodCount: ciqualFixture.foods.length,
    nutrientCount,
    sourceChecksums: ciqualFixture.source.checksums.join("\n"),
  });

  return { foodCount: ciqualFixture.foods.length, nutrientCount };
};
