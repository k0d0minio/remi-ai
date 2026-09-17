import type { Metadata } from "next";
import { ArrowLeft, Copy } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { countRecipeAssignments, getRecipe } from "@remi/services/server";
import { Button } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { ArchiveRecipe } from "@/components/recipes/archive-recipe";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { ensureDatabase } from "@/lib/database";
import { duplicateRecipeAction } from "@/lib/recipes/actions";

export const metadata: Metadata = {
  title: "Recette",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { id: string };

/**
 * One recipe, its provenance, and the number of people currently holding it.
 *
 * That count is the honest part of a shared library: an edit here reaches every
 * one of them. « Dupliquer en variante » is the way out of it — a copy is a new
 * library row, so adapting a recipe for one person leaves every other holder
 * with what they were given. The count is per row, which is why a variant never
 * adds to its origin's.
 */
const RecipeDetail = async ({ params }: { params: Promise<Params> }) => {
  // The page's own graph, not the layout's — the two render in parallel.
  ensureDatabase();
  const { id } = await params;
  const result = await getRecipe(id);
  if (!result.ok) {
    notFound();
  }
  const recipe = result.data;
  const [holders, origin] = await Promise.all([
    countRecipeAssignments(recipe.id),
    // A variant whose origin has gone renders as an ordinary recipe rather
    // than as a broken link — the same tolerance the patient card applies.
    recipe.variantOfId ? getRecipe(recipe.variantOfId) : null,
  ]);
  const archived = recipe.archivedAt !== null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <NextLink
          href="/recipes"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Recettes
        </NextLink>
        <div className="flex flex-wrap items-center gap-3">
          <Typography as="h1" size="2xl" weight="semibold">
            {recipe.title}
          </Typography>
          {archived ? (
            <Badge variant="neutral" tone="subtle" size="sm">
              archivée
            </Badge>
          ) : null}
        </div>
        {origin?.ok ? (
          <Typography size="sm" tone="muted">
            variante de{" "}
            <NextLink
              href={`/recipes/${origin.data.id}`}
              className="hover:text-foreground underline underline-offset-2"
            >
              {origin.data.title}
            </NextLink>
          </Typography>
        ) : null}
        <Typography size="sm" tone="muted">
          {holders === 0
            ? "Personne ne l'a pour l'instant."
            : holders === 1
              ? "Une personne l'a en ce moment — la modifier change ce qu'elle voit."
              : `${holders} personnes l'ont en ce moment — la modifier change ce qu'elles voient.`}
        </Typography>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>La recette</CardTitle>
          <CardDescription>
            Une seule version, partagée. Le mot personnel pour chaque personne
            se met sur son attribution, depuis sa fiche.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeForm recipe={recipe} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dupliquer en variante</CardTitle>
          <CardDescription>
            Une copie, à adapter librement — l&apos;original ne bouge pas et les
            personnes qui l&apos;ont gardent ce qu&apos;elles ont reçu. Rien
            n&apos;est attribué ici : la copie s&apos;ouvre pour édition, et
            l&apos;attribution se fait depuis la fiche d&apos;une personne.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={duplicateRecipeAction}>
            <input type="hidden" name="id" value={recipe.id} />
            <input type="hidden" name="title" value={recipe.title} />
            <Button type="submit" size="sm" variant="secondary">
              <Copy aria-hidden="true" />
              Dupliquer en variante
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{archived ? "Réactiver" : "Archiver"}</CardTitle>
          <CardDescription>
            {archived
              ? "Elle réapparaîtra dans la bibliothèque et dans le sélecteur."
              : "Elle sort de la bibliothèque et du sélecteur. Les attributions déjà faites restent intactes — une recette qu'une personne a reçue ne se supprime pas."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArchiveRecipe recipe={recipe} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeDetail;
