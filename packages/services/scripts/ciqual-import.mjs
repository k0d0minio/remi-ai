#!/usr/bin/env node
import { neon } from "@neondatabase/serverless";
import { parseArgs } from "node:util";
import {
  checkComponents,
  parseCiqualExport,
} from "../dist/db/index.js";
import { nutrientComponents } from "../dist/shared/index.js";
import { readCiqualSource } from "./ciqual-source.mjs";

/**
 * Imports an ANSES CIQUAL export into `foods`, `food_nutrients` and
 * `ciqual_imports`.
 *
 *   pnpm ciqual:import <dir> [--edition "Ciqual 2025"] [--dry-run]
 *
 * Idempotent by construction: both tables carry a natural key from CIQUAL
 * itself — `foods.code` and `(food_code, component_code)` — and every write is
 * an upsert on it. Running this twice over the same export changes no row
 * count and no value, which is the property that makes re-importing after a
 * partial failure safe rather than frightening.
 *
 * Like `migrate.mjs`, this is a maintenance script rather than a service, and
 * it is the one place in this package that reaches the driver directly. The
 * reason is arithmetic: the 2025 edition is 257 816 composition rows, and
 * `Collection.insert` over Neon's HTTP driver is one request per row. The
 * services under `src/db/services/` still speak only to the seam — that is
 * what the in-memory tests prove — and nothing here is reachable from an app.
 *
 * The literal `process.env` read is the same carve-out as `drizzle.config.ts`
 * and `migrate.mjs`: this runs outside the app process, where `env()` and its
 * zod schema do not exist.
 */

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    edition: { type: "string", default: "Ciqual 2025" },
    "dry-run": { type: "boolean", default: false },
    batch: { type: "string", default: "1000" },
  },
});

const dir = positionals[0];
if (!dir) {
  console.error(
    'usage: pnpm ciqual:import <dir> [--edition "Ciqual 2025"] [--dry-run]',
  );
  process.exit(1);
}

const batchSize = Number.parseInt(values.batch, 10);

console.log(`[ciqual] reading ${dir}`);
const { source, checksums } = await readCiqualSource(dir);
const { components, foods, nutrients } = parseCiqualExport(source);

/**
 * Refuse an export whose component vocabulary is not the one the
 * recommendation map was written against.
 *
 * A later edition may renumber or retire a component. Importing it anyway
 * would leave `rankFoodsByComponent` reading a column that no longer means
 * what `shared/nutrition.ts` says it does — a ranking that is confidently
 * wrong, which is worse than one that refuses to run.
 */
const expected = nutrientComponents.flatMap((component) => component.codes);
const missing = checkComponents(components, expected);
if (missing.length > 0) {
  console.error(
    `[ciqual] this export is missing ${missing.length} component code(s) the recommendation map needs: ${missing.join(", ")}`,
  );
  console.error(
    "[ciqual] it is a different edition from the one packages/services/src/shared/nutrition.ts was written against.",
  );
  console.error(
    "[ciqual] reconcile the codes there first, then re-run — do not import past this.",
  );
  process.exit(1);
}

const markers = nutrients.reduce((counts, nutrient) => {
  counts[nutrient.marker] = (counts[nutrient.marker] ?? 0) + 1;
  return counts;
}, {});

console.log(`[ciqual] edition        ${values.edition}`);
console.log(`[ciqual] components     ${components.length}`);
console.log(`[ciqual] foods          ${foods.length}`);
console.log(`[ciqual] nutrient rows  ${nutrients.length}`);
for (const [marker, count] of Object.entries(markers).sort()) {
  console.log(`[ciqual]   ${marker.padEnd(15)} ${count}`);
}
for (const checksum of checksums) {
  console.log(`[ciqual] ${checksum}`);
}

if (values["dry-run"]) {
  console.log("[ciqual] --dry-run — parsed only, nothing written.");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error(
    "[ciqual] DATABASE_URL is not set. See .icm/docs/ENV.md, or re-run with --dry-run to parse only.",
  );
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

/**
 * One multi-row `INSERT … ON CONFLICT DO UPDATE` per batch.
 *
 * Postgres caps a statement at 65 535 bound parameters, so the batch size is
 * bounded by columns × rows; 1 000 rows of nine columns leaves ample room.
 */
const upsert = async ({ label, table, columns, conflict, rows, toValues }) => {
  const assignments = columns
    .filter((column) => !conflict.includes(column))
    .map((column) => `"${column}" = excluded."${column}"`)
    .concat(`"updated_at" = now()`)
    .join(", ");
  const columnList = columns.map((column) => `"${column}"`).join(", ");
  const conflictList = conflict.map((column) => `"${column}"`).join(", ");

  let done = 0;
  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const params = [];
    const tuples = batch.map((row) => {
      // `cells`, not `values` — the outer `values` is parseArgs' result.
      const cells = toValues(row);
      const placeholders = cells.map(
        (_, index) => `$${params.length + index + 1}`,
      );
      params.push(...cells);
      return `(${placeholders.join(", ")})`;
    });

    await sql.query(
      `insert into "${table}" (${columnList}) values ${tuples.join(", ")} on conflict (${conflictList}) do update set ${assignments}`,
      params,
    );

    done += batch.length;
    process.stdout.write(`\r[ciqual] ${label} ${done}/${rows.length}`);
  }
  process.stdout.write("\n");
};

await upsert({
  label: "foods         ",
  table: "foods",
  columns: [
    "code",
    "name_fr",
    "name_en",
    "search_name",
    "group_code",
    "group_name_fr",
    "sub_group_code",
    "sub_group_name_fr",
  ],
  conflict: ["code"],
  rows: foods,
  toValues: (food) => [
    food.code,
    food.nameFr,
    food.nameEn,
    food.searchName,
    food.groupCode,
    food.groupNameFr,
    food.subGroupCode,
    food.subGroupNameFr,
  ],
});

await upsert({
  label: "nutrient rows ",
  table: "food_nutrients",
  columns: [
    "food_code",
    "component_code",
    "component_name_fr",
    "unit",
    "value",
    "marker",
    "raw_value",
    "confidence",
  ],
  conflict: ["food_code", "component_code"],
  rows: nutrients,
  toValues: (nutrient) => [
    nutrient.foodCode,
    nutrient.componentCode,
    nutrient.componentNameFr,
    nutrient.unit,
    nutrient.value,
    nutrient.marker,
    nutrient.rawValue,
    nutrient.confidence,
  ],
});

await sql.query(
  `insert into "ciqual_imports" ("edition", "food_count", "nutrient_count", "source_checksums") values ($1, $2, $3, $4)`,
  [values.edition, foods.length, nutrients.length, checksums.join("\n")],
);

console.log(
  `[ciqual] done — ${foods.length} aliments, ${nutrients.length} valeurs, édition ${values.edition}.`,
);
