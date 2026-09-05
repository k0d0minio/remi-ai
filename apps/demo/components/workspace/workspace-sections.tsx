import type { ReactNode } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Button, CopyButton } from "@remi/ui";
import {
  Badge,
  Field,
  Input,
  Separator,
  Textarea,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type {
  PatientRecord,
  WorkspaceGoal,
  WorkspaceMeal,
  WorkspaceSectionId,
  WorkspaceSegment,
} from "@/lib/mock/types";
import { workspaceSections } from "@/lib/mock/workspace";
import {
  ArchivedFold,
  WorkspaceRows,
  WorkspaceSection,
} from "@/components/workspace/section-card";

export type RenderedSection = {
  id: WorkspaceSectionId;
  label: string;
  segment: WorkspaceSegment;
  /** Shown beside the section in the index — "how much is in there" (R10). */
  count: number | null;
  node: ReactNode;
};

const directionIcons = {
  up: TrendingUp,
  flat: Minus,
  down: TrendingDown,
} as const;

const directionTones = {
  up: "text-success-text",
  flat: "text-muted-foreground",
  down: "text-error-text",
} as const;

const GoalBlock = ({ goal }: { goal: WorkspaceGoal }) => (
  <div className="border-border flex flex-col gap-3 rounded-lg border p-3">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <Typography as="h3" size="sm" weight="medium" className="max-w-[70ch]">
        {goal.title}
      </Typography>
      {goal.reached ? (
        <Badge variant="success" tone="subtle" size="sm">
          atteint
        </Badge>
      ) : null}
    </div>
    <Typography size="sm" tone="muted" className="max-w-[70ch]">
      {goal.why}
    </Typography>
    <ol className="flex flex-col gap-2">
      {goal.checkIns.map((checkIn) => {
        const Icon = directionIcons[checkIn.direction];

        return (
          <li key={checkIn.on} className="flex items-start gap-2">
            <Icon
              aria-hidden="true"
              className={cn(
                "mt-0.5 size-4 shrink-0",
                directionTones[checkIn.direction],
              )}
            />
            <Typography size="xs" tone="muted" className="max-w-[70ch]">
              <span className="text-foreground font-medium">{checkIn.on}</span>{" "}
              — {checkIn.note}
            </Typography>
          </li>
        );
      })}
    </ol>
  </div>
);

const MealBlock = ({ meal }: { meal: WorkspaceMeal }) => (
  <li className="border-border flex flex-col gap-2 rounded-lg border p-3">
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <Typography as="h3" size="sm" weight="medium">
        {meal.slot}
      </Typography>
      <Typography as="span" size="xs" tone="muted">
        {meal.on}
      </Typography>
    </div>
    <Typography size="sm" tone="muted" className="max-w-[70ch]">
      {meal.text}
    </Typography>
    {meal.feedback ? (
      <Typography
        size="sm"
        className="border-primary max-w-[70ch] border-l-2 pl-3"
      >
        {meal.feedback}
      </Typography>
    ) : (
      <Badge variant="warning" tone="subtle" size="sm" className="w-fit">
        en attente de votre retour
      </Badge>
    )}
  </li>
);

/**
 * Every section of the patient page, rendered once, in the order the page
 * renders them. The three views are views over this list — the desktop two
 * columns, the medium anchor row and the phone segments all read it rather
 * than each holding their own copy of the page (decision #2).
 */
export const renderSections = (record: PatientRecord): RenderedSection[] => {
  const bodies: Record<
    WorkspaceSectionId,
    { count: number | null; node: ReactNode }
  > = {
    lien: {
      count: record.link.segments.length,
      node: (
        <WorkspaceSection
          id="lien"
          title="Lien patient"
          description="Leur vue du profil et des recommandations — pour la personne suivie, et pour les consultantes et consultants qui testent."
          badge={
            record.link.lastOpenedAt === null ? (
              <Badge variant="warning" tone="subtle" size="sm">
                jamais ouvert
              </Badge>
            ) : (
              <Badge variant="success" tone="subtle" size="sm">
                actif
              </Badge>
            )
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            <Typography
              as="span"
              size="sm"
              className="bg-muted rounded-md px-2 py-1 font-mono"
            >
              {record.link.url}
            </Typography>
            <CopyButton
              value={`https://${record.link.url}`}
              label="Copier le lien"
              copiedLabel="Copié"
            />
          </div>
          <Typography size="sm" tone="muted">
            Partagé le {record.link.sharedOn} · ouvert{" "}
            {record.link.lastOpenedAt ?? "jamais"}
          </Typography>
          <div className="flex flex-wrap gap-2">
            {record.link.segments.map((segment) => (
              <Badge key={segment} variant="info" tone="subtle" size="sm">
                {segment}
              </Badge>
            ))}
          </div>
        </WorkspaceSection>
      ),
    },

    resume: {
      count: null,
      node: (
        <WorkspaceSection
          id="resume"
          title="Résumé vivant"
          description="La synthèse de la personne — ce que vous relisez en premier. Une seule, révisée à chaque consultation."
          badge={
            record.summary ? (
              <Badge variant="neutral" tone="subtle" size="sm">
                {record.summary.revisionCount} révisions
              </Badge>
            ) : null
          }
        >
          {record.summary ? (
            <>
              <Typography size="sm" className="max-w-[70ch]">
                {record.summary.text}
              </Typography>
              <Typography size="xs" tone="muted">
                Révisé le {record.summary.revisedOn}
              </Typography>
            </>
          ) : (
            <Typography size="sm" tone="muted">
              Rien encore — le résumé s&apos;écrit après la première
              consultation.
            </Typography>
          )}
        </WorkspaceSection>
      ),
    },

    objectifs: {
      count: record.goals.length,
      node: (
        <WorkspaceSection
          id="objectifs"
          title="Objectifs et consigne"
          description="Deux ou trois priorités, dans votre ordre, avec leur évolution — et la consigne que vous vous donnez pour cet accompagnement."
        >
          {record.instruction ? (
            <div className="bg-primary-subtle flex flex-col gap-1 rounded-lg p-3">
              <Typography as="h3" size="xs" weight="medium" tone="muted">
                Consigne — posée le {record.instruction.setOn}
              </Typography>
              <Typography size="sm" className="max-w-[70ch]">
                {record.instruction.text}
              </Typography>
            </div>
          ) : null}

          {record.goals.length > 0 ? (
            <div className="flex flex-col gap-3">
              {record.goals.map((goal) => (
                <GoalBlock key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <Typography size="sm" tone="muted">
              Aucun objectif actif.
            </Typography>
          )}

          <ArchivedFold
            id="objectifs-archives"
            label="Objectifs retirés"
            count={record.archivedGoals.length}
          >
            <div className="flex flex-col gap-3">
              {record.archivedGoals.map((goal) => (
                <GoalBlock key={goal.id} goal={goal} />
              ))}
            </div>
          </ArchivedFold>

          <ArchivedFold
            id="consignes-archivees"
            label="Consignes précédentes"
            count={record.instruction?.superseded.length ?? 0}
          >
            <ul className="flex flex-col gap-2">
              {record.instruction?.superseded.map((previous) => (
                <li key={previous.id}>
                  <Typography size="sm" tone="muted" className="max-w-[70ch]">
                    <span className="text-foreground">{previous.setOn}</span> —{" "}
                    {previous.text}
                  </Typography>
                </li>
              ))}
            </ul>
          </ArchivedFold>
        </WorkspaceSection>
      ),
    },

    recommandations: {
      count: record.recommendations.reduce(
        (total, group) => total + group.rows.length,
        0,
      ),
      node: (
        <WorkspaceSection
          id="recommandations"
          title="Recommandations"
          description="Le protocole, encodé entrée par entrée — c'est ce que montre le lien patient."
        >
          {record.recommendations.length > 0 ? (
            record.recommendations.map((group) => (
              <div key={group.category} className="flex flex-col gap-2">
                <Typography as="h3" size="xs" weight="medium" tone="muted">
                  {group.category}
                </Typography>
                <WorkspaceRows
                  rows={group.rows}
                  empty="Rien dans cette catégorie."
                />
              </div>
            ))
          ) : (
            <Typography size="sm" tone="muted">
              Aucune recommandation encore encodée.
            </Typography>
          )}

          <ArchivedFold
            id="recommandations-archivees"
            label="Recommandations archivées"
            count={record.archivedRecommendations.length}
          >
            <WorkspaceRows
              rows={record.archivedRecommendations}
              empty="Rien d'archivé."
            />
          </ArchivedFold>

          <Separator />

          {/* Today this form is always open, because encoding a protocol is
                the most frequent act on the page. Whether it stays open on
                desktop or joins the other adds behind a trigger is one of the
                questions this prototype exists to ask — so it is shown as it is
                today, not quietly resolved. */}
          <div className="max-md:hidden">
            <form className="flex flex-col gap-3">
              <Typography as="h3" size="sm" weight="medium">
                Ajouter une recommandation
              </Typography>
              <div className="@2xl:grid-cols-2 grid gap-3">
                <Field id="rec-titre" label="Intitulé">
                  <Input id="rec-titre" placeholder="Ce qu'elle applique" />
                </Field>
                <Field id="rec-categorie" label="Catégorie">
                  <Input id="rec-categorie" placeholder="Alimentation" />
                </Field>
              </div>
              <Field id="rec-detail" label="Le pourquoi">
                <Textarea
                  id="rec-detail"
                  rows={2}
                  placeholder="Ce que la recommandation vise, dans vos mots"
                />
              </Field>
              <Button type="button" size="sm" className="w-fit">
                Ajouter
              </Button>
            </form>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full md:hidden"
          >
            Ajouter une recommandation
          </Button>
        </WorkspaceSection>
      ),
    },

    complements: {
      count: record.supplements.rows.length,
      node: (
        <WorkspaceSection
          id="complements"
          title="Protocole de compléments"
          description="Les compléments que vous prescrivez, avec dose, moment et raison."
        >
          <WorkspaceRows
            rows={record.supplements.rows}
            empty="Aucun complément prescrit."
          />
          <ArchivedFold
            id="complements-archives"
            label="Compléments arrêtés"
            count={record.supplements.archived.length}
          >
            <WorkspaceRows
              rows={record.supplements.archived}
              empty="Rien d'arrêté."
            />
          </ArchivedFold>
        </WorkspaceSection>
      ),
    },

    essentiels: {
      count: record.essentials.rows.length,
      node: (
        <WorkspaceSection
          id="essentiels"
          title="Essentiels placard / frigo"
          description="La courte liste d'aliments à avoir sous la main, avec le pourquoi de chacun — pour cette personne."
        >
          <WorkspaceRows
            rows={record.essentials.rows}
            dense
            empty="Aucun essentiel choisi."
          />
          <ArchivedFold
            id="essentiels-archives"
            label="Essentiels retirés"
            count={record.essentials.archived.length}
          >
            <WorkspaceRows
              rows={record.essentials.archived}
              dense
              empty="Rien de retiré."
            />
          </ArchivedFold>
        </WorkspaceSection>
      ),
    },

    recettes: {
      count: record.recipes.rows.length,
      node: (
        <WorkspaceSection
          id="recettes"
          title="Recettes"
          description="Les recettes que cette personne a en ce moment, avec le mot qui va avec chacune."
        >
          <WorkspaceRows
            rows={record.recipes.rows}
            dense
            empty="Aucune recette attribuée."
          />
          {/* Folded like the rest for now. Whether the recipe history should
                be open by default — it is "l'historique des adaptations, pas
                une corbeille" — is a question for the live review. */}
          <ArchivedFold
            id="recettes-precedentes"
            label="Recettes précédentes"
            count={record.recipes.archived.length}
          >
            <WorkspaceRows
              rows={record.recipes.archived}
              dense
              empty="Aucune recette retirée."
            />
          </ArchivedFold>
        </WorkspaceSection>
      ),
    },

    repas: {
      count: record.meals.entries.length,
      node: (
        <WorkspaceSection
          id="repas"
          title="Journal des repas"
          description="Ce que la personne a envoyé, transcrit ici, avec votre retour sous chaque repas."
          badge={
            record.meals.entries.some((meal) => meal.feedback === null) ? (
              <Badge variant="warning" tone="subtle" size="sm">
                {
                  record.meals.entries.filter((meal) => meal.feedback === null)
                    .length
                }{" "}
                en attente
              </Badge>
            ) : null
          }
        >
          {record.meals.entries.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {record.meals.entries.map((meal) => (
                <MealBlock key={meal.id} meal={meal} />
              ))}
            </ul>
          ) : (
            <Typography size="sm" tone="muted">
              Aucun repas transcrit.
            </Typography>
          )}
          <ArchivedFold
            id="repas-archives"
            label="Repas archivés"
            count={record.meals.archived.length}
          >
            <ul className="flex flex-col gap-2">
              {record.meals.archived.map((meal) => (
                <MealBlock key={meal.id} meal={meal} />
              ))}
            </ul>
          </ArchivedFold>
        </WorkspaceSection>
      ),
    },

    retenir: {
      count: record.learnings.rows.length,
      node: (
        <WorkspaceSection
          id="retenir"
          title="À retenir"
          description="Ce que les semaines vous apprennent sur cette personne : ce qui est noté sur un repas, et ce que vous observez en dehors."
        >
          <WorkspaceRows
            rows={record.learnings.rows}
            empty="Rien de noté pour l'instant."
          />
          <ArchivedFold
            id="retenir-archives"
            label="Observations closes"
            count={record.learnings.archived.length}
          >
            <WorkspaceRows
              rows={record.learnings.archived}
              empty="Rien de clos."
            />
          </ArchivedFold>
        </WorkspaceSection>
      ),
    },

    consultations: {
      count: record.consultations.length,
      node: (
        <WorkspaceSection
          id="consultations"
          title="Consultations"
          description="Vos notes de séance, de la plus récente à la plus ancienne. Elles ne s'affichent jamais sur le lien patient."
        >
          <WorkspaceRows
            rows={record.consultations}
            empty="Aucune consultation notée."
          />
        </WorkspaceSection>
      ),
    },

    anamnese: {
      count: record.anamnesis.filter((category) => category.entries.length > 0)
        .length,
      node: (
        <WorkspaceSection
          id="anamnese"
          title="Anamnèse"
          description="Le terrain, catégorie par catégorie. Ce que vous n'avez pas encore exploré reste visiblement vide."
        >
          <div className="@2xl:grid-cols-2 grid gap-3">
            {record.anamnesis.map((category) => (
              <div
                key={category.id}
                className="border-border flex flex-col gap-2 rounded-lg border p-3"
              >
                <Typography as="h3" size="sm" weight="medium">
                  {category.label}
                </Typography>
                {category.entries.length > 0 ? (
                  <dl className="flex flex-col gap-1.5">
                    {category.entries.map((entry) => (
                      <div key={entry.label} className="flex flex-col">
                        <Typography as="dt" size="xs" tone="muted">
                          {entry.label}
                        </Typography>
                        <Typography as="dd" size="sm">
                          {entry.value}
                        </Typography>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <Typography size="sm" tone="muted">
                    Pas encore exploré.
                  </Typography>
                )}
              </div>
            ))}
          </div>
        </WorkspaceSection>
      ),
    },

    profil: {
      count: record.profile.filter((field) => field.value !== null).length,
      node: (
        <WorkspaceSection
          id="profil"
          title="Profil"
          description="Le tableau de fond contre lequel les recommandations et les recettes sont personnalisées, et le consentement recueilli pour le tenir."
        >
          <dl className="@2xl:grid-cols-2 grid gap-3">
            {record.profile.map((field) => (
              <div key={field.label} className="flex flex-col">
                <Typography as="dt" size="xs" tone="muted">
                  {field.label}
                </Typography>
                <Typography as="dd" size="sm">
                  {field.value ?? "—"}
                </Typography>
              </div>
            ))}
          </dl>
          <Separator />
          <Typography size="sm" tone="muted" className="max-w-[70ch]">
            {record.consent}
          </Typography>
          <Button type="button" variant="outline" size="sm" className="w-fit">
            Modifier le profil
          </Button>
        </WorkspaceSection>
      ),
    },

    "zone-sensible": {
      count: null,
      node: (
        <WorkspaceSection
          id="zone-sensible"
          title="Zone sensible"
          description="La suppression retire le profil, ses recommandations, son protocole de compléments, ses essentiels, ses notes et son anamnèse. Rien n'est récupérable."
        >
          {/* Left as the last section, which is where it is today. Whether it
                belongs folded in the rail or in the "Ajouter" menu's overflow
                instead is a question for the live review, not for this code. */}
          <Button type="button" variant="outline" size="sm" className="w-fit">
            Supprimer ce dossier
          </Button>
        </WorkspaceSection>
      ),
    },
  };

  return workspaceSections.map((section) => ({
    id: section.id,
    label: section.label,
    segment: section.segment,
    count: bodies[section.id].count,
    node: bodies[section.id].node,
  }));
};
