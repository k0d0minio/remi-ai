import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import NextLink from "next/link";
import {
  confirmedKitchenUnits,
  gateTags,
  getCiqualImport,
  getFood,
  getFoodNutrients,
  getFoodRecord,
  type FoodNutrient,
  type FoodRecord,
} from "@remi/services/server";
import { formatDateTime, kitchenQuantityText } from "@remi/services/shared";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@remi/ui/server";
import { CiqualAttribution } from "@/components/foods/ciqual-attribution";
import {
  FoodRecordCard,
  type FoodRecordView,
} from "@/components/foods/food-record-card";
import {
  FoodUnitsCard,
  type FoodUnitsView,
} from "@/components/foods/food-units-card";
import { tagGroups } from "@/components/foods/vocabulary";
import { ensureDatabase } from "@/lib/database";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = Promise<{ code: string }>;

/**
 * One read per request, not two.
 *
 * `generateMetadata` and the page both need the food, and Next calls them
 * separately; `cache()` is what makes the second call the same call. It dedupes
 * per request only, so this is request memoisation, not a cache with a lifetime
 * anyone has to reason about.
 */
const foodByCode = cache(async (code: string) => {
  ensureDatabase();
  return getFood(code);
});

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  const { code } = await params;
  const result = await foodByCode(code);
  return { title: result.ok ? result.data.nameFr : "Aliment" };
};

/**
 * How a value reads.
 *
 * The publisher's own string, verbatim — already French, already at the
 * precision ANSES measured to. Reformatting the parsed float instead looks
 * tidier and is wrong: `Intl` defaults to three fraction digits, which renders
 * DHA at 0,00012 g as « 0 ». Forty-seven values in the committed subset alone
 * round to nothing that way, and one of them is a component the recommendation
 * map ranks on — the page would state « contains none » where the table says
 * otherwise, which is the exact failure this function exists to prevent.
 *
 * `traces`, `< 0,01` and « - » already carry their meaning in that string;
 * only the dash is swapped for a typographic one.
 */
const readValue = (nutrient: FoodNutrient) => {
  if (nutrient.marker === "not_determined") {
    return "—";
  }
  return nutrient.rawValue;
};

const markerLabels: Record<FoodNutrient["marker"], string> = {
  exact: "",
  traces: "sous le seuil de quantification",
  less_than: "valeur maximale, non mesurée précisément",
  not_determined: "non déterminé",
};

const decimal = (value: number) => String(value).replace(".", ",");

/** « Morgane, le 20/11/2026 14:02 ». The account can be gone: the fact stays. */
const confirmedLine = (name: string, at: Date | null) =>
  at === null
    ? null
    : `${name || "un compte supprimé"}, le ${formatDateTime(at)}`;

const recordView = (record: FoodRecord | null): FoodRecordView | null =>
  record === null
    ? null
    : {
        status: record.status,
        proposedByRemi: record.source === "remi",
        cookable: record.cookable,
        role: record.role,
        containsTags: record.containsTags,
        mayContainTags: record.mayContainTags,
        confirmedLine: confirmedLine(record.confirmedByName, record.confirmedAt),
        lexiconId: record.lexiconId,
      };

/** The weights that the example line of the units shows. */
const EXAMPLE_GRAMS = [5, 15, 50, 100, 250];

const unitsView = (record: FoodRecord | null): FoodUnitsView => {
  const confirmed = confirmedKitchenUnits(record);
  return {
    status: record?.unitsStatus ?? null,
    density:
      record === null || record.densityGPerMl === null
        ? ""
        : decimal(record.densityGPerMl),
    units: (record?.units ?? []).map((unit) => ({
      one: unit.one,
      many: unit.many,
      grams: decimal(unit.grams),
    })),
    confirmedLine: record
      ? confirmedLine(record.unitsConfirmedByName, record.unitsConfirmedAt)
      : null,
    // Only a weight that the confirmed units write in another way than grams.
    examples: confirmed
      ? EXAMPLE_GRAMS.flatMap((grams) => {
          const text = kitchenQuantityText(grams, confirmed);
          return text === null || text === kitchenQuantityText(grams, null)
            ? []
            : [`${grams} g → ${text}`];
        })
      : [],
  };
};

const Aliment = async ({ params }: { params: Params }) => {
  ensureDatabase();
  const { code } = await params;

  const [result, imported] = await Promise.all([
    foodByCode(code),
    getCiqualImport(),
  ]);
  if (!result.ok) {
    notFound();
  }

  const food = result.data;
  const [nutrients, record] = await Promise.all([
    getFoodNutrients(food.code),
    getFoodRecord(food.code),
  ]);
  const determined = nutrients.filter(
    (nutrient) => nutrient.marker !== "not_determined",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography size="xs" tone="muted">
          <NextLink href="/aliments" className="underline">
            Aliments
          </NextLink>
        </Typography>
        <Typography as="h1" size="2xl" weight="semibold">
          {food.nameFr}
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" tone="subtle" size="sm">
            {food.code}
          </Badge>
          <Typography as="span" size="sm" tone="muted">
            {food.groupNameFr}
            {food.subGroupNameFr ? ` · ${food.subGroupNameFr}` : ""}
          </Typography>
        </div>
        <Typography size="sm" tone="muted">
          {determined.length} constituants renseignés sur {nutrients.length}.
        </Typography>
      </div>

      {/* A saved record changes the key: each form then shows the stored values. */}
      <FoodRecordCard
        key={`record:${record?.updatedAt.getTime() ?? "none"}`}
        code={food.code}
        record={recordView(record)}
        groups={tagGroups(gateTags())}
      />
      <FoodUnitsCard
        key={`units:${record?.updatedAt.getTime() ?? "none"}`}
        code={food.code}
        hasRecord={record !== null}
        view={unitsView(record)}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Constituant</TableHead>
            <TableHead>Pour 100 g</TableHead>
            <TableHead>Unité</TableHead>
            <TableHead>Confiance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nutrients.map((nutrient) => (
            <TableRow key={nutrient.componentCode}>
              <TableCell>{nutrient.componentNameFr}</TableCell>
              <TableCell
                className="tabular-nums"
                title={markerLabels[nutrient.marker] || undefined}
              >
                {readValue(nutrient)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {nutrient.unit}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {nutrient.confidence || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CiqualAttribution edition={imported?.edition} />
    </div>
  );
};

export default Aliment;
