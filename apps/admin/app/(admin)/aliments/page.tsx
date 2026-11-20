import type { Metadata } from "next";
import { Carrot } from "lucide-react";
import NextLink from "next/link";
import {
  getCiqualImport,
  listFoodGroups,
  listFoodRecords,
  listFoodRecordsToConfirm,
  searchFoods,
  type FoodRecord,
} from "@remi/services/server";
import { formatNumber } from "@remi/services/shared";
import { Badge, EmptyState, Typography } from "@remi/ui/server";
import { CiqualAttribution } from "@/components/foods/ciqual-attribution";
import { FirstLotButton } from "@/components/foods/first-lot-button";
import { FoodFilters } from "@/components/foods/food-filters";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Aliments",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

/** The first lot asks the model for about twenty foods in one action. */
export const maxDuration = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * The CIQUAL catalogue, and the food records over it (REM-189, REM-190).
 *
 * CIQUAL itself is read-only reference data. What a person does here is the
 * food record: mark a food « cuisinable », and confirm its allergens, its role
 * and its kitchen units on the page of the food. The queue « À confirmer »
 * lists what REMI proposed and no person confirmed yet. The actions are in
 * `lib/foods/actions.ts`, and the service writes the audit event of each one.
 */
type RecordBadgeProps = {
  record: Pick<FoodRecord, "status" | "cookable"> | undefined;
};

/** What the record of a food says, in one word. Nothing for a food with none. */
const FoodRecordBadge = ({ record }: RecordBadgeProps) => {
  if (!record) {
    return null;
  }
  if (record.status === "proposed") {
    return (
      <Badge variant="warning" tone="subtle" size="sm">
        à confirmer
      </Badge>
    );
  }
  return record.cookable ? (
    <Badge variant="success" tone="subtle" size="sm">
      cuisinable
    </Badge>
  ) : (
    <Badge variant="neutral" tone="subtle" size="sm">
      non cuisinable
    </Badge>
  );
};

const Aliments = async ({ searchParams }: { searchParams: SearchParams }) => {
  ensureDatabase();
  const params = await searchParams;
  const search = first(params.q) ?? "";
  const group = first(params.group) ?? "all";

  const [foods, groups, imported, records, toConfirm] = await Promise.all([
    searchFoods({
      query: search,
      group: group === "all" ? undefined : group,
    }),
    listFoodGroups(),
    getCiqualImport(),
    listFoodRecords(),
    listFoodRecordsToConfirm(),
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
            ? `${formatNumber(imported.foodCount)} aliments — ${imported.edition}, table de composition nutritionnelle de l'ANSES.`
            : "Aucun import pour le moment — la table est vide tant que le script d'import n'a pas tourné."}
        </Typography>
      </div>

      <section
        aria-labelledby="foods-to-confirm"
        className="bg-card flex flex-col gap-3 rounded-lg border p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Typography id="foods-to-confirm" as="h2" size="lg" weight="semibold">
            À confirmer
          </Typography>
          <Badge
            variant={toConfirm.length > 0 ? "warning" : "neutral"}
            tone="subtle"
            size="sm"
          >
            {toConfirm.length}
          </Badge>
        </div>
        <Typography size="sm" tone="muted">
          REMI propose la fiche d&apos;un aliment, une personne la confirme. Un
          aliment dont la fiche n&apos;est pas confirmée n&apos;entre dans
          aucune recette et n&apos;est jamais présenté comme sûr.
        </Typography>
        {toConfirm.length === 0 ? (
          <Typography size="sm" tone="muted">
            Aucune fiche en attente.
          </Typography>
        ) : (
          <ul className="flex flex-col gap-1">
            {toConfirm.map(({ food, recordProposed, unitsProposed }) => (
              <li key={food.code}>
                <NextLink
                  href={`/aliments/${food.code}`}
                  className="hover:bg-accent focus-visible:ring-ring flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-2 py-2 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
                >
                  <Typography as="span" size="sm" weight="medium">
                    {food.nameFr}
                  </Typography>
                  <span className="ml-auto flex flex-wrap items-center gap-2">
                    {recordProposed ? (
                      <Badge variant="warning" tone="subtle" size="sm">
                        fiche à confirmer
                      </Badge>
                    ) : null}
                    {unitsProposed ? (
                      <Badge variant="warning" tone="subtle" size="sm">
                        unités à confirmer
                      </Badge>
                    ) : null}
                  </span>
                </NextLink>
              </li>
            ))}
          </ul>
        )}
        <FirstLotButton />
      </section>

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
                className="hover:bg-accent focus-visible:ring-ring flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-2 py-2 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
              >
                <Typography as="span" size="sm" weight="medium">
                  {food.nameFr}
                </Typography>
                <span className="ml-auto flex items-center gap-2">
                  <FoodRecordBadge record={records.get(food.code)} />
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
