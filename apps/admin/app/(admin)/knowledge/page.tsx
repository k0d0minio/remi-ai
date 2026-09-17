import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import {
  listNutritionRuleTags,
  listNutritionRules,
  type NutritionRuleQuery,
} from "@remi/services/server";
import {
  nutritionRuleKinds,
  nutritionRuleStatuses,
  type NutritionRuleKind,
  type NutritionRuleShelf,
  type NutritionRuleStatus,
} from "@remi/services/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Typography,
} from "@remi/ui/server";
import { CorpusFilters } from "@/components/knowledge/corpus-filters";
import { RuleForm } from "@/components/knowledge/rule-form";
import { RuleRows } from "@/components/knowledge/rule-rows";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Connaissances",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const shelves: readonly NutritionRuleShelf[] = [
  "current",
  "superseded",
  "archived",
];

/**
 * A query string is user input, so each value is checked against the
 * vocabulary it belongs to rather than cast into it. An unknown `?kind=` is a
 * filter nobody set, not a crash.
 */
const oneOf = <T extends string>(
  value: string | undefined,
  vocabulary: readonly T[],
): T | undefined =>
  vocabulary.includes(value as T) ? (value as T) : undefined;

const emptyCopy = (shelf: NutritionRuleShelf, filtered: boolean) => {
  if (shelf === "superseded") {
    return "Aucune version remplacée pour l’instant — modifier une règle validée en créera une.";
  }
  if (shelf === "archived") {
    return "Rien d’archivé.";
  }
  return filtered
    ? "Essayez une autre étiquette, un autre type, ou videz la recherche."
    : "Écrivez votre première règle ci-dessous. Elle restera en brouillon jusqu’à ce que vous la validiez.";
};

/**
 * « Connaissances » — ce que REMI sait, par opposition à ce qu’une personne a
 * reçu.
 *
 * The corpus lives beside the recipe library for the same reason the library
 * lives beside Patients: it belongs to nobody in particular. What separates the
 * two screens is the status column — a recipe is written and handed out, a rule
 * is written and then *agreed to*, and only an agreed one is ever quoted.
 */
const Knowledge = async ({ searchParams }: { searchParams: SearchParams }) => {
  // The page's own graph, not the layout's — the two render in parallel.
  ensureDatabase();
  const params = await searchParams;
  const search = first(params.q) ?? "";
  const tag = first(params.tag) ?? "all";
  const kind = oneOf<NutritionRuleKind>(first(params.kind), nutritionRuleKinds);
  const status = oneOf<NutritionRuleStatus>(
    first(params.status),
    nutritionRuleStatuses,
  );
  const shelf = oneOf<NutritionRuleShelf>(first(params.shelf), shelves);

  const query: NutritionRuleQuery = {
    search,
    tag: tag === "all" ? undefined : tag,
    kind,
    status,
    shelf,
  };

  const [rules, tags] = await Promise.all([
    listNutritionRules(query),
    listNutritionRuleTags(),
  ]);
  const filtered =
    search !== "" ||
    tag !== "all" ||
    kind !== undefined ||
    status !== undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          Connaissances
        </Typography>
        <Typography size="sm" tone="muted">
          Votre nutrition, écrite une fois et retrouvée par étiquette. REMI ne
          cite que les règles validées — un brouillon n’arrive jamais dans une
          réponse.
        </Typography>
      </div>

      <CorpusFilters
        search={search}
        tag={tag}
        kind={kind ?? "all"}
        status={status ?? "all"}
        shelf={shelf ?? "current"}
        tags={tags}
      />

      {rules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={filtered ? "Aucune règle ne correspond" : "Rien encore"}
          body={emptyCopy(shelf ?? "current", filtered)}
        />
      ) : (
        <RuleRows rules={rules} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle règle</CardTitle>
          <CardDescription>
            Elle rejoint le corpus en brouillon. Rien n’est cité tant que vous
            ne l’avez pas validée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RuleForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Knowledge;
