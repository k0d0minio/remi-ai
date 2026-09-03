import type { Metadata } from "next";
import { ChefHat } from "lucide-react";
import {
  listArchivedRecipes,
  listRecipeTags,
  listRecipes,
} from "@remi/services/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Typography,
} from "@remi/ui/server";
import { LibraryFilters } from "@/components/recipes/library-filters";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { RecipeRows } from "@/components/recipes/recipe-rows";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Recettes",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * The shared recipe library — one list, no patient in sight.
 *
 * That is the decision of record (#5) made visible: Morgane reuses the same
 * dish across her patients and personalises the giving, not the dish, so the
 * library lives beside Patients rather than inside one. Assigning happens on
 * the patient page; this is where the recipes themselves are written.
 */
const Recipes = async ({ searchParams }: { searchParams: SearchParams }) => {
  // The page's own graph, not the layout's — the two render in parallel.
  ensureDatabase();
  const params = await searchParams;
  const search = first(params.q) ?? "";
  const tag = first(params.tag) ?? "all";

  const [recipes, archived, tags] = await Promise.all([
    listRecipes({ search, tag: tag === "all" ? undefined : tag }),
    listArchivedRecipes(),
    listRecipeTags(),
  ]);
  const filtered = search !== "" || tag !== "all";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          Recettes
        </Typography>
        <Typography size="sm" tone="muted">
          La bibliothèque partagée : une recette s&apos;écrit ici une fois, et
          s&apos;attribue ensuite depuis la fiche de chaque personne.
        </Typography>
      </div>

      <LibraryFilters search={search} tag={tag} tags={tags} />

      {recipes.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title={filtered ? "Aucune recette ne correspond" : "Rien encore"}
          body={
            filtered
              ? "Essayez une autre étiquette, ou videz la recherche."
              : "Écrivez votre première recette ci-dessous — titre et texte libre, comme dans un message."
          }
        />
      ) : (
        <RecipeRows recipes={recipes} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle recette</CardTitle>
          <CardDescription>
            Elle rejoint la bibliothèque, sans être attribuée à personne.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeForm />
        </CardContent>
      </Card>

      {archived.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recettes archivées</CardTitle>
            <CardDescription>
              Sorties de la bibliothèque et du sélecteur. Les attributions déjà
              faites, elles, ne bougent pas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecipeRows recipes={archived} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default Recipes;
