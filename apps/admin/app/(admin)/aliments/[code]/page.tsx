import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NextLink from "next/link";
import {
  getCiqualImport,
  getFood,
  getFoodNutrients,
  type FoodNutrient,
} from "@remi/services/server";
import { formatNumber } from "@remi/services/shared";
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
import { ensureDatabase } from "@/lib/database";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = Promise<{ code: string }>;

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  ensureDatabase();
  const { code } = await params;
  const result = await getFood(code);
  return { title: result.ok ? result.data.nameFr : "Aliment" };
};

/**
 * How a value reads when it is not a plain measurement.
 *
 * CIQUAL's own notation is kept rather than translated into a number: `traces`
 * and `< 0,01` mean different things from `0`, and « - » means the constituent
 * was never determined for this food. Flattening them would let the page state
 * something the table does not.
 */
const readValue = (nutrient: FoodNutrient) => {
  if (nutrient.marker === "not_determined") {
    return "—";
  }
  if (nutrient.marker === "traces") {
    return "traces";
  }
  const value = formatNumber(nutrient.value ?? 0, "fr-FR");
  return nutrient.marker === "less_than" ? `< ${value}` : value;
};

const markerLabels: Record<FoodNutrient["marker"], string> = {
  exact: "",
  traces: "sous le seuil de quantification",
  less_than: "valeur maximale, non mesurée précisément",
  not_determined: "non déterminé",
};

const Aliment = async ({ params }: { params: Params }) => {
  ensureDatabase();
  const { code } = await params;

  const [result, imported] = await Promise.all([
    getFood(code),
    getCiqualImport(),
  ]);
  if (!result.ok) {
    notFound();
  }

  const food = result.data;
  const nutrients = await getFoodNutrients(food.code);
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
