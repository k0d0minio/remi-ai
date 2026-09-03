import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { countRecipeAssignments, getRecipe } from "@remi/services/server";
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

export const metadata: Metadata = {
  title: "Recette",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { id: string };

/**
 * One recipe, and the number of people currently holding it.
 *
 * That count is the honest part of a shared library: an edit here reaches every
 * one of them. Whether Morgane wants a « dupliquer en variante » escape hatch
 * instead is hers to answer, so this run states the consequence rather than
 * guessing at a mechanism she has not asked for.
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
  const holders = await countRecipeAssignments(recipe.id);
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
