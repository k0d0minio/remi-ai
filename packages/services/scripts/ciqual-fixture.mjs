#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { parseCiqualExport } from "../dist/db/index.js";
import { nutrientComponents } from "../dist/shared/index.js";
import { readCiqualSource } from "./ciqual-source.mjs";

/**
 * Derives the committed test fixture from a full CIQUAL export.
 *
 *   pnpm ciqual:fixture <dir>
 *
 * The full export is 75 MB and is not in this repository, but the service
 * tests still have to run against real data — a fixture someone typed would
 * agree with whatever the code does, which is the one thing a fixture must not
 * do. So this writes a deterministic subset of the real table: every CIQUAL
 * group is represented, and within a group the foods chosen are the ones with
 * the most of the mapped components actually measured, so a ranking test has
 * something to rank.
 *
 * Deterministic means re-running it on the same export rewrites the same
 * bytes. Nothing about the output is hand-edited; to change it, change the
 * rule here and re-run.
 */

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: {
      type: "string",
      default: "src/db/fixtures/ciqual-subset.json",
    },
    edition: { type: "string", default: "Ciqual 2025" },
    "per-group": { type: "string", default: "10" },
  },
});

const dir = positionals[0];
if (!dir) {
  console.error("usage: pnpm ciqual:fixture <dir> [--per-group 10]");
  process.exit(1);
}

const perGroup = Number.parseInt(values["per-group"], 10);

const { source, checksums } = await readCiqualSource(dir);
const { components, foods, nutrients } = parseCiqualExport(source);

const mapped = new Set(
  nutrientComponents.flatMap((component) => component.codes),
);

/** Every food's rows, so the subset can carry a whole column per food. */
const byFood = new Map();
for (const nutrient of nutrients) {
  const rows = byFood.get(nutrient.foodCode);
  if (rows) {
    rows.push(nutrient);
  } else {
    byFood.set(nutrient.foodCode, [nutrient]);
  }
}

/** How many of the twelve mapped components this food actually has a number for. */
const informativeness = (code) =>
  (byFood.get(code) ?? []).filter(
    (nutrient) => mapped.has(nutrient.componentCode) && nutrient.marker === "exact",
  ).length;

const groups = new Map();
for (const food of foods) {
  const bucket = groups.get(food.groupCode);
  if (bucket) {
    bucket.push(food);
  } else {
    groups.set(food.groupCode, [food]);
  }
}

const chosen = [...groups.keys()]
  .sort()
  .flatMap((groupCode) =>
    [...groups.get(groupCode)]
      .sort(
        (a, b) =>
          informativeness(b.code) - informativeness(a.code) ||
          a.code.localeCompare(b.code),
      )
      .slice(0, perGroup),
  );

/**
 * The nutrient rows are stored as `[value, marker, confidence, rawValue]`
 * keyed by component code rather than as objects: the subset is 110 foods by
 * 74 components, and the field names would be four fifths of the file. The
 * test helper expands them back into rows.
 */
const fixture = {
  edition: values.edition,
  source: {
    publisher: "ANSES — unité Observatoire des Aliments",
    doi: "10.57745/RDMHWY",
    licence: "Licence Ouverte 2.0 (Etalab)",
    checksums,
  },
  components: components
    .filter((component) =>
      chosen.some((food) =>
        (byFood.get(food.code) ?? []).some(
          (nutrient) => nutrient.componentCode === component.code,
        ),
      ),
    )
    .map((component) => ({
      code: component.code,
      nameFr: component.label,
      unit: component.unit,
    })),
  foods: chosen.map((food) => ({
    code: food.code,
    nameFr: food.nameFr,
    nameEn: food.nameEn,
    searchName: food.searchName,
    groupCode: food.groupCode,
    groupNameFr: food.groupNameFr,
    subGroupCode: food.subGroupCode,
    subGroupNameFr: food.subGroupNameFr,
    nutrients: Object.fromEntries(
      (byFood.get(food.code) ?? [])
        .slice()
        .sort((a, b) => a.componentCode.localeCompare(b.componentCode))
        .map((nutrient) => [
          nutrient.componentCode,
          [
            nutrient.value,
            nutrient.marker,
            nutrient.confidence,
            nutrient.rawValue,
          ],
        ]),
    ),
  })),
};

await writeFile(values.out, `${JSON.stringify(fixture, null, 0)}\n`, "utf8");

console.log(
  `[ciqual] ${fixture.foods.length} aliments across ${groups.size} groups → ${values.out}`,
);
