import type { Metadata } from "next";
import { Carrot } from "lucide-react";
import NextLink from "next/link";
import {
  getCiqualImport,
  listFoodGroups,
  searchFoods,
} from "@remi/services/server";
import { formatNumber } from "@remi/services/shared";
import { Badge, EmptyState, Typography } from "@remi/ui/server";
import { CiqualAttribution } from "@/components/foods/ciqual-attribution";
import { FoodFilters } from "@/components/foods/food-filters";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Aliments",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * The CIQUAL catalogue, read-only.
 *
 * It is reference data, not a patient record: nothing here writes, so there is
 * no action to guard twice and no audit entry to make. What it is for is
 * checking by hand what the recipe step will later do by query — « qu'est-ce
 * qu'il y a vraiment dans cette sardine » — which is the only way to trust an
 * answer nobody can see being computed.
 */
const Aliments = async ({ searchParams }: { searchParams: SearchParams }) => {
  ensureDatabase();
  const params = await searchParams;
  const search = first(params.q) ?? "";
  const group = first(params.group) ?? "all";

  const [foods, groups, imported] = await Promise.all([
    searchFoods({
      query: search,
      group: group === "all" ? undefined : group,
    }),
    listFoodGroups(),
    getCiqualImport(),
  ]);
  const filtered = search !== "" || group !== "all";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          Aliments
        </Typography>
        <Typography size="sm" tone="muted">
          {imported
            ? `${formatNumber(imported.foodCount, "fr-FR")} aliments — ${imported.edition}, table de composition nutritionnelle de l'ANSES.`
            : "Aucun import pour le moment — la table est vide tant que le script d'import n'a pas tourné."}
        </Typography>
      </div>

      <FoodFilters search={search} group={group} groups={groups} />

      {foods.length === 0 ? (
        <EmptyState
          icon={Carrot}
          title={
            imported
              ? filtered
                ? "Aucun aliment ne correspond"
                : "Rien à afficher"
              : "La table n'est pas encore importée"
          }
          body={
            imported
              ? "Essayez un autre groupe, ou une partie du nom seulement."
              : "Lancez « pnpm ciqual:import » sur l'export CIQUAL téléchargé chez l'ANSES."
          }
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {foods.map((food) => (
            <li key={food.code}>
              <NextLink
                href={`/aliments/${food.code}`}
                className="hover:bg-accent focus-visible:ring-ring/40 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-2 py-2 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
              >
                <Typography as="span" size="sm" weight="medium">
                  {food.nameFr}
                </Typography>
                <span className="ml-auto flex items-center gap-2">
                  <Typography as="span" size="xs" tone="muted">
                    {food.subGroupNameFr || food.groupNameFr}
                  </Typography>
                  <Badge variant="neutral" tone="subtle" size="sm">
                    {food.code}
                  </Badge>
                </span>
              </NextLink>
            </li>
          ))}
        </ul>
      )}

      <CiqualAttribution edition={imported?.edition} />
    </div>
  );
};

export default Aliments;
