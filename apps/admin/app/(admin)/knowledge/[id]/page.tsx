import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  getNutritionRule,
  getNutritionRuleLineage,
  getOperator,
} from "@remi/services/server";
import { formatDateTime } from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Markdown,
  Typography,
} from "@remi/ui/server";
import { RuleActions } from "@/components/knowledge/rule-actions";
import { RuleForm } from "@/components/knowledge/rule-form";
import {
  kindLabels,
  statusIntents,
  statusLabels,
} from "@/lib/knowledge/vocabulary";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Règle",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { id: string };

/**
 * One rule, its wording rendered as she wrote it, and the chain it sits in.
 *
 * The « validée par » line and the links to the versions either side are the
 * point of the page: a rule REMI quotes has a person's name against it and a
 * date, and what it replaced is one click away rather than lost.
 */
const RuleDetail = async ({ params }: { params: Promise<Params> }) => {
  // The page's own graph, not the layout's — the two render in parallel.
  ensureDatabase();
  const { id } = await params;
  const result = await getNutritionRule(id);
  if (!result.ok) {
    notFound();
  }
  const rule = result.data;
  const [lineage, validator] = await Promise.all([
    getNutritionRuleLineage(rule.id),
    rule.validatedBy ? getOperator(rule.validatedBy) : Promise.resolve(null),
  ]);
  const archived = rule.archivedAt !== null;
  const superseded = rule.supersededBy !== null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <NextLink
          href="/knowledge"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Connaissances
        </NextLink>

        <div className="flex flex-wrap items-center gap-3">
          <Typography as="h1" size="2xl" weight="semibold">
            {rule.title}
          </Typography>
          <Badge variant={statusIntents[rule.status]} tone="subtle" size="sm">
            {statusLabels[rule.status]}
          </Badge>
          {superseded ? (
            <Badge variant="info" tone="subtle" size="sm">
              remplacée
            </Badge>
          ) : null}
          {archived ? (
            <Badge variant="warning" tone="subtle" size="sm">
              archivée
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" size="sm">
            {kindLabels[rule.kind]}
          </Badge>
          {rule.tags.map((tag) => (
            <Badge key={tag} variant="neutral" tone="subtle" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <Typography size="sm" tone="muted">
          Version {rule.version}
          {rule.validatedAt
            ? ` · validée le ${formatDateTime(rule.validatedAt)}${
                validator ? ` par ${validator.name}` : ""
              }`
            : " · pas encore validée — REMI ne la cite pas"}
        </Typography>

        {lineage.previous || lineage.next ? (
          <div className="flex flex-wrap items-center gap-4">
            {lineage.previous ? (
              <NextLink
                href={`/knowledge/${lineage.previous.id}`}
                className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-2"
              >
                ← version {lineage.previous.version}
              </NextLink>
            ) : null}
            {lineage.next ? (
              <NextLink
                href={`/knowledge/${lineage.next.id}`}
                className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-2"
              >
                version {lineage.next.version} →
              </NextLink>
            ) : null}
          </div>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>La règle</CardTitle>
          <CardDescription>
            Telle que REMI la citera, mot pour mot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Markdown>{rule.body}</Markdown>
        </CardContent>
      </Card>

      {superseded ? (
        <Typography size="sm" tone="muted">
          Cette version a été remplacée : elle se lit, elle ne se modifie plus.
          Ouvrez la version suivante pour changer le texte.
        </Typography>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Modifier</CardTitle>
              <CardDescription>
                {rule.status === "validated"
                  ? "Enregistrer crée une nouvelle version en brouillon et garde celle-ci telle qu’elle a été validée."
                  : "Ce brouillon se modifie sur place — personne ne s’y est encore fié."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RuleForm rule={rule} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {rule.status === "draft" && !archived ? "Valider" : "Archiver"}
              </CardTitle>
              <CardDescription>
                {rule.status === "draft" && !archived
                  ? "Valider, c’est autoriser REMI à citer ce texte. Votre nom et la date restent attachés à la version."
                  : archived
                    ? "Elle réapparaîtra dans le corpus, et redeviendra citable si elle est validée."
                    : "Elle sort du corpus et REMI cesse de la citer. Rien n’est supprimé — la version reste lisible."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RuleActions rule={rule} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RuleDetail;
