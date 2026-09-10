import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  MAX_ACTIVE_GOALS,
  countMealEntriesAwaitingFeedback,
  getPatient,
  getPatientInstruction,
  getPatientSummary,
  listArchivedMealEntries,
  listArchivedPantryEssentials,
  listArchivedPatientGoals,
  listArchivedPatientInstructions,
  listArchivedPatientObservations,
  listArchivedPatientRecipes,
  listArchivedPatientRecommendations,
  listGoalCheckIns,
  listMealEntries,
  listPantryEssentials,
  listPatientGoals,
  listPatientAnamnesis,
  listPatientLearnings,
  listPatientNotes,
  listPatientRecipes,
  listPatientRecommendations,
  listArchivedPatientSupplements,
  listPatientSupplements,
  listRecipes,
} from "@remi/services/server";
import { ageInYears, appHref } from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { AnamnesisBlock } from "@/components/patients/anamnesis-block";
import { AssignRecipeForm } from "@/components/patients/assign-recipe-form";
import { DeletePatient } from "@/components/patients/delete-patient";
import { GoalAddForm } from "@/components/patients/goal-add-form";
import { GoalList } from "@/components/patients/goal-list";
import { InstructionBlock } from "@/components/patients/instruction-block";
import {
  ArchivedObservations,
  LearningsList,
} from "@/components/patients/learnings-list";
import { MealAddForm } from "@/components/patients/meal-add-form";
import { MealJournal } from "@/components/patients/meal-journal";
import { NoteTimeline } from "@/components/patients/note-timeline";
import { ObservationAddForm } from "@/components/patients/observation-add-form";
import {
  PatientNavigation,
  type PatientSectionEntry,
} from "@/components/patients/patient-navigation";
import { PantryAddForm } from "@/components/patients/pantry-add-form";
import { PantryList } from "@/components/patients/pantry-list";
import { PatientForm } from "@/components/patients/patient-form";
import { PrepNote } from "@/components/patients/prep-note";
import { QuickActions } from "@/components/patients/quick-actions";
import { RecipeAssignments } from "@/components/patients/recipe-assignments";
import { RecommendationAddForm } from "@/components/patients/recommendation-add-form";
import { RecommendationGroups } from "@/components/patients/recommendation-groups";
import { ShareLinkCard } from "@/components/patients/share-link-card";
import { SummaryBlock } from "@/components/patients/summary-block";
import { SummaryHead } from "@/components/patients/summary-head";
import { SupplementAddForm } from "@/components/patients/supplement-add-form";
import { SupplementProtocol } from "@/components/patients/supplement-protocol";
import { WorkingGoals } from "@/components/patients/working-goals";
import { WorkingMeals } from "@/components/patients/working-meals";
import { WorkingRecommendations } from "@/components/patients/working-recommendations";
import {
  patientSegments,
  patientSexLabels,
  patientStatusIntents,
  patientStatusLabels,
  type PatientSegment,
} from "@/components/patients/vocabulary";
import { ensureDatabase } from "@/lib/database";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { id: string };

type PageProps = {
  params: Promise<Params>;
  searchParams: Promise<{ segment?: string | string[] }>;
};

const isPatientSegment = (value: string): value is PatientSegment =>
  (patientSegments as readonly string[]).includes(value);

/**
 * One patient, opening on a working view that answers the four consultation
 * questions at a glance — status, goals with their evolution, the consigne, the
 * summary head, recent meals, the main recommendations, the preparation note
 * for the next consultation, and quick actions. Every other section is behind
 * navigation: a section index on desktop, a segmented control on phone
 * (Suivi · Journal · Dossier · Profil), an anchor row in between. One DOM
 * order — the views are classes and segments over it, never a second tree.
 * Bodies of the secondary sections are untouched.
 */
const PatientDetail = async ({ params, searchParams }: PageProps) => {
  // The page's own graph, not the layout's — the two render in parallel.
  ensureDatabase();
  const { id } = await params;
  const segmentParam = (await searchParams).segment;
  const segmentValue = Array.isArray(segmentParam)
    ? segmentParam[0]
    : segmentParam;
  const initialSegment: PatientSegment =
    segmentValue && isPatientSegment(segmentValue) ? segmentValue : "suivi";
  const result = await getPatient(id);
  if (!result.ok) {
    notFound();
  }
  const patient = result.data;

  const [
    recommendations,
    archived,
    supplements,
    archivedSupplements,
    essentials,
    archivedEssentials,
    assignedRecipes,
    pastRecipes,
    library,
    mealEntries,
    archivedMealEntries,
    awaitingFeedback,
    learnings,
    archivedObservations,
    notes,
    anamnesis,
    goals,
    archivedGoals,
    instruction,
    supersededInstructions,
    summary,
  ] = await Promise.all([
    listPatientRecommendations(patient.id),
    listArchivedPatientRecommendations(patient.id),
    listPatientSupplements(patient.id),
    listArchivedPatientSupplements(patient.id),
    listPantryEssentials(patient.id),
    listArchivedPantryEssentials(patient.id),
    listPatientRecipes(patient.id),
    listArchivedPatientRecipes(patient.id),
    // The picker offers the active library only — an archived recipe is out of
    // circulation, which is exactly what archiving it meant.
    listRecipes(),
    listMealEntries(patient.id),
    listArchivedMealEntries(patient.id),
    countMealEntriesAwaitingFeedback(patient.id),
    listPatientLearnings(patient.id),
    listArchivedPatientObservations(patient.id),
    listPatientNotes(patient.id),
    listPatientAnamnesis(patient.id),
    listPatientGoals(patient.id),
    listArchivedPatientGoals(patient.id),
    getPatientInstruction(patient.id),
    listArchivedPatientInstructions(patient.id),
    getPatientSummary(patient.id),
  ]);

  // One trail per goal, active and archived alike: two or three goals plus
  // what has been set down is a handful of reads, and they run together.
  const trails = await Promise.all(
    [...goals, ...archivedGoals].map(async (goal) => ({
      id: goal.id,
      entries: await listGoalCheckIns(goal.id),
    })),
  );
  const checkIns = Object.fromEntries(
    trails.map((trail) => [trail.id, trail.entries]),
  );
  const shareUrl = appHref("web", `/p/${patient.shareToken}`, patient.locale);
  const age = ageInYears(patient.birthDate);

  // The default consultation date, resolved server-side: a date input seeded
  // from the browser's clock disagrees with the server the moment someone is
  // working across midnight or from another timezone.
  const today = new Date().toISOString().slice(0, 10);

  // The section registry — the one list the desktop index, the phone segments
  // and the medium anchor row all read. Every rendered section, in DOM order.
  const sections: PatientSectionEntry[] = [
    { id: "working-view", label: "Vue de travail", segment: "suivi" },
    { id: "patient-link", label: "Lien patient", segment: "dossier" },
    { id: "summary", label: "Résumé vivant", segment: "suivi" },
    {
      id: "objectifs",
      label: "Objectifs et consigne",
      segment: "suivi",
      count: goals.length,
    },
    {
      id: "recommendations",
      label: "Recommandations",
      segment: "suivi",
      count: recommendations.length,
    },
    ...(archived.length > 0
      ? [
          {
            id: "archived-recommendations",
            label: "Recommandations archivées",
            segment: "suivi" as const,
            count: archived.length,
          },
        ]
      : []),
    {
      id: "supplements",
      label: "Protocole de compléments",
      segment: "suivi",
      count: supplements.length,
    },
    {
      id: "pantry",
      label: "Essentiels placard / frigo",
      segment: "suivi",
      count: essentials.length,
    },
    ...(archivedEssentials.length > 0
      ? [
          {
            id: "archived-pantry",
            label: "Essentiels archivés",
            segment: "suivi" as const,
            count: archivedEssentials.length,
          },
        ]
      : []),
    {
      id: "recipes",
      label: "Recettes",
      segment: "dossier",
      count: assignedRecipes.length,
    },
    ...(pastRecipes.length > 0
      ? [
          {
            id: "past-recipes",
            label: "Recettes précédentes",
            segment: "dossier" as const,
            count: pastRecipes.length,
          },
        ]
      : []),
    {
      id: "meals",
      label: "Journal des repas",
      segment: "journal",
      count: mealEntries.length,
    },
    ...(archivedMealEntries.length > 0
      ? [
          {
            id: "archived-meals",
            label: "Repas archivés",
            segment: "journal" as const,
            count: archivedMealEntries.length,
          },
        ]
      : []),
    {
      id: "retain",
      label: "À retenir",
      segment: "journal",
      count: learnings.length,
    },
    {
      id: "consultations",
      label: "Consultations",
      segment: "dossier",
      count: notes.length,
    },
    {
      id: "anamnesis",
      label: "Anamnèse",
      segment: "dossier",
      count: anamnesis.length,
    },
    { id: "profile", label: "Profil", segment: "profil" },
    { id: "danger-zone", label: "Zone sensible", segment: "profil" },
  ];

  return (
    <div
      id="patient-page"
      data-segment={initialSegment}
      className="patient-page mx-auto flex w-full max-w-2xl flex-col gap-6 scroll-smooth lg:max-w-[58rem] lg:flex-row lg:items-start lg:gap-8"
    >
      <Suspense fallback={null}>
        <PatientNavigation sections={sections} />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col gap-6 lg:order-1">
        {/* Status banner — above every section, stays put on desktop. */}
        <div className="bg-background flex flex-col gap-2 lg:sticky lg:top-14 lg:z-20">
          <NextLink
            href="/patients"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Patients
          </NextLink>
          <div className="flex flex-wrap items-center gap-3">
            <Typography as="h1" size="2xl" weight="semibold">
              {patient.pseudonym}
            </Typography>
            <Badge
              variant={patientStatusIntents[patient.status]}
              tone="subtle"
              size="sm"
            >
              {patientStatusLabels[patient.status]}
            </Badge>
          </div>
          <Typography size="sm" tone="muted">
            {[
              patient.fullName,
              age !== null ? `${age} ans` : null,
              patient.sex !== "unspecified"
                ? patientSexLabels[patient.sex]
                : null,
              patient.heightCm ? `${patient.heightCm} cm` : null,
              patient.weightKg ? `${patient.weightKg} kg` : null,
            ]
              .filter((part) => part !== null && part !== "")
              .join(" · ") || "Profil à compléter"}
          </Typography>
        </div>

        {/* The anchor row — medium only; the rail takes over from lg, the
            segmented control below md. */}
        <nav
          aria-label="Sections de la page"
          className="flex gap-2 overflow-x-auto pb-1 md:flex lg:hidden"
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="border-border text-muted-foreground hover:bg-accent hover:text-foreground shrink-0 rounded-full border px-3 py-1 text-sm transition-colors"
            >
              {section.label}
            </a>
          ))}
        </nav>

        {/* The working view — the landing state. */}
        <section
          id="working-view"
          data-segment="suivi"
          aria-label="Vue de travail"
          className="flex scroll-mt-32 flex-col gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Objectifs</CardTitle>
              <CardDescription>
                Ce que vous suivez en ce moment — la dernière mesure
                d&apos;abord, puis la direction. Les objectifs archivés sont
                masqués ici.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <WorkingGoals goals={goals} checkIns={checkIns} />

              {goals.length < MAX_ACTIVE_GOALS ? (
                <GoalAddForm patientId={patient.id} />
              ) : (
                <Typography size="sm" tone="muted">
                  {`${MAX_ACTIVE_GOALS} objectifs actifs — archivez-en un pour en ajouter un autre.`}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consigne</CardTitle>
              <CardDescription>
                La consigne que vous vous donnez pour cet accompagnement. Les
                consignes précédentes sont masquées ici.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstructionBlock
                patientId={patient.id}
                pseudonym={patient.pseudonym}
                instruction={instruction}
                superseded={[]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
              <CardDescription>
                Le début de la synthèse — la révision complète est la section
                Résumé vivant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SummaryHead summary={summary} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Derniers repas</CardTitle>
              <CardDescription>
                Ce qui est arrivé depuis la dernière fois — le journal complet
                est une des sections Journal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkingMeals
                entries={mealEntries}
                awaitingFeedback={awaitingFeedback}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
              <CardDescription>
                La première de chaque catégorie — le protocole complet est la
                section Recommandations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkingRecommendations recommendations={recommendations} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>À préparer pour la prochaine consultation</CardTitle>
              <CardDescription>
                Ce que vous voulez avoir en tête quand vous la revoyez, écrit et
                revu entre deux consultations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrepNote
                patientId={patient.id}
                pseudonym={patient.pseudonym}
                value={patient.nextConsultationPrep}
              />
            </CardContent>
          </Card>

          <QuickActions />
        </section>

        {/* Secondary sections — each registered once above, body untouched. */}
        <section
          id="patient-link"
          data-segment="dossier"
          className="scroll-mt-32"
        >
          <Card>
            <CardHeader>
              <CardTitle>Lien patient</CardTitle>
              <CardDescription>
                Leur vue du profil et des recommandations — pour la personne
                suivie, et pour les consultantes et consultants qui testent
                l&apos;interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShareLinkCard
                patientId={patient.id}
                url={shareUrl}
                email={patient.email}
                lastOpenedAt={patient.linkLastOpenedAt}
              />
            </CardContent>
          </Card>
        </section>

        <section id="summary" data-segment="suivi" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Résumé vivant</CardTitle>
              <CardDescription>
                La synthèse de la personne — ce que vous relisez en premier. Une
                seule, révisée à chaque consultation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SummaryBlock
                patientId={patient.id}
                pseudonym={patient.pseudonym}
                summary={summary}
              />
            </CardContent>
          </Card>
        </section>

        <section id="objectifs" data-segment="suivi" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Objectifs et consigne</CardTitle>
              <CardDescription>
                Deux ou trois priorités, dans votre ordre, avec leur évolution —
                et la consigne que vous vous donnez pour cet accompagnement.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {goals.length === 0 ? (
                <Typography size="sm" tone="muted">
                  Aucun objectif pour le moment.
                </Typography>
              ) : (
                <GoalList
                  goals={goals}
                  checkIns={checkIns}
                  ranked
                  today={today}
                />
              )}

              {goals.length < MAX_ACTIVE_GOALS ? (
                <GoalAddForm patientId={patient.id} />
              ) : (
                <Typography size="sm" tone="muted">
                  {`${MAX_ACTIVE_GOALS} objectifs actifs — archivez-en un pour en ajouter un autre.`}
                </Typography>
              )}

              {archivedGoals.length > 0 ? (
                <div className="border-border flex flex-col gap-3 border-t pt-6">
                  <Typography as="h3" size="sm" weight="medium" tone="muted">
                    Objectifs archivés
                  </Typography>
                  <GoalList
                    goals={archivedGoals}
                    checkIns={checkIns}
                    ranked={false}
                    today={today}
                  />
                </div>
              ) : null}

              <div className="border-border flex flex-col gap-3 border-t pt-6">
                <InstructionBlock
                  patientId={patient.id}
                  pseudonym={patient.pseudonym}
                  instruction={instruction}
                  superseded={supersededInstructions}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section
          id="recommendations"
          data-segment="suivi"
          className="scroll-mt-32"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
              <CardDescription>
                Le protocole, encodé entrée par entrée — c&apos;est ce que
                montre le lien patient.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {recommendations.length === 0 ? (
                <Typography size="sm" tone="muted">
                  Rien d&apos;encodé pour le moment.
                </Typography>
              ) : (
                <RecommendationGroups recommendations={recommendations} />
              )}

              <RecommendationAddForm patientId={patient.id} />
            </CardContent>
          </Card>
        </section>

        {archived.length > 0 ? (
          <section
            id="archived-recommendations"
            data-segment="suivi"
            className="scroll-mt-32"
          >
            <Card>
              <CardHeader>
                <CardTitle>Recommandations archivées</CardTitle>
                <CardDescription>
                  Ce qui a été suivi puis arrêté. Invisible sur le lien patient,
                  gardé pour la suite du dossier.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecommendationGroups recommendations={archived} />
              </CardContent>
            </Card>
          </section>
        ) : null}

        <section id="supplements" data-segment="suivi" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Protocole de compléments</CardTitle>
              <CardDescription>
                Les compléments que vous prescrivez, avec dose, moment et
                raison. Ceux que la personne prend déjà d&apos;elle-même se
                notent dans le profil.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {supplements.length === 0 ? (
                <Typography size="sm" tone="muted">
                  Aucun complément prescrit pour le moment.
                </Typography>
              ) : (
                <SupplementProtocol supplements={supplements} />
              )}

              <SupplementAddForm patientId={patient.id} />

              {archivedSupplements.length > 0 ? (
                <details className="border-border flex flex-col gap-3 border-t pt-6">
                  <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
                    {`Compléments arrêtés (${archivedSupplements.length})`}
                  </summary>
                  <div className="pt-3">
                    <SupplementProtocol supplements={archivedSupplements} />
                  </div>
                </details>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section id="pantry" data-segment="suivi" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Essentiels placard / frigo</CardTitle>
              <CardDescription>
                La courte liste d&apos;aliments à avoir sous la main, avec le
                pourquoi de chacun — pour cette personne.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {essentials.length === 0 ? (
                <Typography size="sm" tone="muted">
                  Aucun essentiel pour le moment.
                </Typography>
              ) : (
                <PantryList essentials={essentials} />
              )}

              <PantryAddForm patientId={patient.id} />
            </CardContent>
          </Card>
        </section>

        {archivedEssentials.length > 0 ? (
          <section
            id="archived-pantry"
            data-segment="suivi"
            className="scroll-mt-32"
          >
            <Card>
              <CardHeader>
                <CardTitle>Essentiels archivés</CardTitle>
                <CardDescription>
                  Ce qui est sorti de la liste lors d&apos;une mise à jour.
                  Gardé pour la suite du dossier.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PantryList essentials={archivedEssentials} />
              </CardContent>
            </Card>
          </section>
        ) : null}

        <section id="recipes" data-segment="dossier" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Recettes</CardTitle>
              <CardDescription>
                Les recettes que cette personne a en ce moment, avec le mot qui
                va avec chacune. Elles s&apos;écrivent une fois dans « Recettes
                » et s&apos;attribuent ici.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {assignedRecipes.length === 0 ? (
                <Typography size="sm" tone="muted">
                  Aucune recette attribuée pour le moment.
                </Typography>
              ) : (
                <RecipeAssignments entries={assignedRecipes} />
              )}

              <AssignRecipeForm
                patientId={patient.id}
                recipes={library}
                today={today}
              />
            </CardContent>
          </Card>
        </section>

        {pastRecipes.length > 0 ? (
          <section
            id="past-recipes"
            data-segment="dossier"
            className="scroll-mt-32"
          >
            <Card>
              <CardHeader>
                <CardTitle>Recettes précédentes</CardTitle>
                <CardDescription>
                  Ce qui est sorti du lot au fil des semaines, avec sa date.
                  C&apos;est l&apos;historique des adaptations, pas une
                  corbeille.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecipeAssignments entries={pastRecipes} />
              </CardContent>
            </Card>
          </section>
        ) : null}

        <section id="meals" data-segment="journal" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Journal des repas</CardTitle>
              <CardDescription>
                Ce que la personne a envoyé, transcrit ici, avec votre retour
                sous chaque repas. Texte seulement pour l&apos;instant — les
                photos restent sur WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {awaitingFeedback > 0 ? (
                <Typography size="sm" tone="muted">
                  {awaitingFeedback === 1
                    ? "1 repas attend un retour."
                    : `${awaitingFeedback} repas attendent un retour.`}
                </Typography>
              ) : null}

              {mealEntries.length === 0 ? (
                <Typography size="sm" tone="muted">
                  Aucun repas noté pour le moment.
                </Typography>
              ) : (
                <MealJournal entries={mealEntries} />
              )}

              <MealAddForm patientId={patient.id} today={today} />
            </CardContent>
          </Card>
        </section>

        {archivedMealEntries.length > 0 ? (
          <section
            id="archived-meals"
            data-segment="journal"
            className="scroll-mt-32"
          >
            <Card>
              <CardHeader>
                <CardTitle>Repas archivés</CardTitle>
                <CardDescription>
                  Sortis du journal, gardés pour la suite du dossier.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MealJournal entries={archivedMealEntries} />
              </CardContent>
            </Card>
          </section>
        ) : null}

        <section id="retain" data-segment="journal" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>À retenir</CardTitle>
              <CardDescription>
                Ce que les semaines vous apprennent sur cette personne : ce qui
                est noté sur un repas, et ce que vous observez en dehors.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {learnings.length === 0 ? (
                <Typography size="sm" tone="muted">
                  Rien à retenir pour le moment.
                </Typography>
              ) : (
                <LearningsList learnings={learnings} />
              )}

              <ObservationAddForm patientId={patient.id} today={today} />

              {archivedObservations.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <Typography size="sm" tone="muted">
                    Observations archivées
                  </Typography>
                  <ArchivedObservations observations={archivedObservations} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section
          id="consultations"
          data-segment="dossier"
          className="scroll-mt-32"
        >
          <Card>
            <CardHeader>
              <CardTitle>Consultations</CardTitle>
              <CardDescription>
                Vos notes de séance, de la plus récente à la plus ancienne.
                Elles ne s&apos;affichent jamais sur le lien patient.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NoteTimeline
                patientId={patient.id}
                notes={notes}
                today={today}
              />
            </CardContent>
          </Card>
        </section>

        <section id="anamnesis" data-segment="dossier" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Anamnèse</CardTitle>
              <CardDescription>
                Le terrain, catégorie par catégorie. Ce que vous n&apos;avez pas
                encore exploré reste visiblement vide. Ne s&apos;affiche jamais
                sur le lien patient.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnamnesisBlock patientId={patient.id} entries={anamnesis} />
            </CardContent>
          </Card>
        </section>

        <section id="profile" data-segment="profil" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Le tableau de fond contre lequel les recommandations et les
                recettes sont personnalisées, et le consentement recueilli pour
                le tenir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientForm patient={patient} />
            </CardContent>
          </Card>
        </section>

        <section
          id="danger-zone"
          data-segment="profil"
          className="scroll-mt-32"
        >
          <Card variant="error">
            <CardHeader>
              <CardTitle>Zone sensible</CardTitle>
              <CardDescription>
                La suppression retire le profil, ses recommandations, son
                protocole de compléments, ses essentiels, ses notes, son
                anamnèse, ses objectifs et leurs points d&apos;étape, ses
                consignes, ses recettes attribuées, son journal des repas, ses
                observations et le lien patient — définitivement. Les recettes
                elles-mêmes restent dans la bibliothèque.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeletePatient
                patientId={patient.id}
                pseudonym={patient.pseudonym}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PatientDetail;
