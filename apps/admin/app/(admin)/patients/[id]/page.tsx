import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  MAX_ACTIVE_GOALS,
  countMealEntriesAwaitingFeedback,
  getCurrentChallenge,
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
  listPastChallenges,
  listPatientGoals,
  listPatientAnamnesis,
  listPatientDocuments,
  listPatientLearnings,
  listPatientMessages,
  listPatientNotes,
  listPatientRecipes,
  listPatientRecommendations,
  listArchivedPatientSupplements,
  listPatientSupplements,
  listRecipes,
} from "@remi/services/server";
import {
  ageInYears,
  appHref,
  formatDate,
  patientLinkPreviewParam,
  todayAtPractice,
} from "@remi/services/shared";
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
import { ChallengeHistory } from "@/components/patients/challenge-history";
import { ChallengeSection } from "@/components/patients/challenge-section";
import { CopyContextCard } from "@/components/patients/copy-context-card";
import { DeletePatient } from "@/components/patients/delete-patient";
import {
  DocumentSection,
  type AttachmentOption,
} from "@/components/patients/document-section";
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
import { PantrySection } from "@/components/patients/pantry-section";
import { ProfileSummary } from "@/components/patients/profile-summary";
import { PrepNote } from "@/components/patients/prep-note";
import { QuickActions } from "@/components/patients/quick-actions";
import { RecipeAssignments } from "@/components/patients/recipe-assignments";
import { RecommendationAddForm } from "@/components/patients/recommendation-add-form";
import { RecommendationGroups } from "@/components/patients/recommendation-groups";
import { RecommendationSection } from "@/components/patients/recommendation-section";
import { SectionFold } from "@/components/patients/section-fold";
import { ShareLinkCard } from "@/components/patients/share-link-card";
import { SummaryBlock } from "@/components/patients/summary-block";
import { SummaryHead } from "@/components/patients/summary-head";
import { SupplementAddForm } from "@/components/patients/supplement-add-form";
import { SupplementProtocol } from "@/components/patients/supplement-protocol";
import { SupplementSection } from "@/components/patients/supplement-section";
import { WorkingGoals } from "@/components/patients/working-goals";
import { WorkingChallenge } from "@/components/patients/working-challenge";
import { MessageThread } from "@/components/patients/message-thread";
import { WorkingMeals } from "@/components/patients/working-meals";
import { WorkingMessages } from "@/components/patients/working-messages";
import { WorkingRecommendations } from "@/components/patients/working-recommendations";
import {
  consentChannelLabels,
  messagesAwaitingLabel,
  patientSegments,
  patientSexLabels,
  patientStatusIntents,
  patientStatusLabels,
  type PatientSegment,
} from "@/components/patients/vocabulary";
import { patientContextInput } from "@/lib/patients/context";
import { ensureDatabase } from "@/lib/database";
import { fileStoreReady } from "@/lib/files";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { id: string };

type PageProps = {
  params: Promise<Params>;
  searchParams: Promise<{ segment?: string | string[]; from?: string }>;
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
  const query = await searchParams;
  const segmentParam = query.segment;
  // Set by the consultation screen's protocol links: leaving the write-up to
  // add a recommendation is a round trip, so the way back is on the page she
  // lands on rather than in her browser history.
  const fromConsultation = query.from === "consultation";
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
    currentChallenge,
    pastChallenges,
    documents,
    messages,
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
    getCurrentChallenge(patient.id),
    listPastChallenges(patient.id),
    listPatientDocuments(patient.id),
    listPatientMessages(patient.id),
  ]);
  // Derived from the thread already in hand rather than a second read.
  const unreadMessages = messages.filter(
    (message) => message.author === "patient" && message.readAt === null,
  ).length;

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
  // Both halves or neither: a date with no channel says nothing about what the
  // patient actually agreed through, so it still reads as not recorded.
  const consent =
    patient.consentDate && patient.consentChannel
      ? `Recueilli le ${formatDate(patient.consentDate)} · ${consentChannelLabels[patient.consentChannel]}`
      : null;
  const shareUrl = appHref("web", `/p/${patient.shareToken}`, patient.locale);
  // « Voir comme la patiente » — the same link, marked so her look is not
  // recorded as the patient opening it.
  const previewUrl = `${shareUrl}?${patientLinkPreviewParam}=1`;
  // What a document can hang from: this patient's goals and recipes, archived
  // ones included so an edit never silently drops an existing attachment.
  const attachments: AttachmentOption[] = [
    ...goals.map((goal) => ({
      value: `goal:${goal.id}`,
      label: `Objectif · ${goal.title}`,
    })),
    ...archivedGoals.map((goal) => ({
      value: `goal:${goal.id}`,
      label: `Objectif · ${goal.title} (archivé)`,
    })),
    ...assignedRecipes.map(({ assignment, recipe }) => ({
      value: `recipe:${assignment.id}`,
      label: `Recette · ${recipe.title}`,
    })),
    ...pastRecipes.map(({ assignment, recipe }) => ({
      value: `recipe:${assignment.id}`,
      label: `Recette · ${recipe.title} (précédente)`,
    })),
  ];
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
      id: "challenges",
      label: "Challenges",
      segment: "suivi",
      count: currentChallenge ? 1 : 0,
    },
    {
      id: "recommendations",
      label: "Recommandations",
      segment: "suivi",
      count: recommendations.length,
    },
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
    {
      id: "recipes",
      label: "Recettes",
      segment: "dossier",
      count: assignedRecipes.length,
    },
    {
      id: "documents",
      label: "Documents",
      segment: "dossier",
      count: documents.length,
    },
    {
      id: "messages",
      label: "Messages",
      segment: "journal",
      count: messages.length,
    },
    {
      id: "meals",
      label: "Journal des repas",
      segment: "journal",
      count: mealEntries.length,
    },
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
            href={
              fromConsultation
                ? `/patients/${patient.id}/consultation`
                : "/patients"
            }
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {fromConsultation ? "Retour à la consultation" : "Patients"}
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
              <CardTitle>Challenge</CardTitle>
              <CardDescription>
                L&apos;habitude en cours et ce que la personne en dit — lancer,
                modifier ou clore se fait dans la section Challenges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkingChallenge challenge={currentChallenge} />
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
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Ce que la personne écrit depuis son lien — répondre se fait dans
                la section Messages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkingMessages messages={messages} unread={unreadMessages} />
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

          <Card id="copy-context" className="scroll-mt-32">
            <CardHeader>
              <CardTitle>Copier le contexte</CardTitle>
              <CardDescription>
                Le contexte de la personne en texte clair, à coller dans le
                modèle de votre choix. Pseudonyme uniquement, aucun appel au
                modèle depuis REMI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CopyContextCard
                patientId={patient.id}
                context={patientContextInput({
                  patient,
                  goals,
                  instruction,
                  recommendations,
                  supplements,
                  essentials,
                  summary,
                })}
              />
            </CardContent>
          </Card>

          {/* It reads the segment from the URL, same as the navigation. */}
          <Suspense fallback={null}>
            <QuickActions patientId={patient.id} previewUrl={previewUrl} />
          </Suspense>
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
                lastWroteAt={patient.linkLastWroteAt}
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

              <div className="border-border flex flex-col gap-3 border-t pt-6">
                <InstructionBlock
                  patientId={patient.id}
                  pseudonym={patient.pseudonym}
                  instruction={instruction}
                  superseded={supersededInstructions}
                />
              </div>

              {archivedGoals.length > 0 ? (
                <SectionFold
                  id="archived-goals"
                  label="Objectifs archivés"
                  count={archivedGoals.length}
                >
                  <GoalList
                    goals={archivedGoals}
                    checkIns={checkIns}
                    ranked={false}
                    today={today}
                  />
                </SectionFold>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section id="challenges" data-segment="suivi" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Challenges</CardTitle>
              <CardDescription>
                Une habitude à la fois, écrite pour la personne. Elle indique
                sur son lien quand le challenge est acquis et quand elle est
                prête pour le suivant.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ChallengeSection
                patientId={patient.id}
                current={currentChallenge}
                today={todayAtPractice()}
              />

              {pastChallenges.length > 0 ? (
                <SectionFold
                  id="past-challenges"
                  label="Challenges passés"
                  count={pastChallenges.length}
                >
                  <ChallengeHistory challenges={pastChallenges} />
                </SectionFold>
              ) : null}
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
              <RecommendationSection
                patientId={patient.id}
                pseudonym={patient.pseudonym}
                recommendations={recommendations}
              >
                {recommendations.length === 0 ? (
                  <Typography size="sm" tone="muted">
                    Rien d&apos;encodé pour le moment.
                  </Typography>
                ) : (
                  <RecommendationGroups recommendations={recommendations} />
                )}
                <RecommendationAddForm patientId={patient.id} />
              </RecommendationSection>

              {archived.length > 0 ? (
                <SectionFold
                  id="archived-recommendations"
                  label="Recommandations archivées"
                  count={archived.length}
                >
                  <div className="flex flex-col gap-3">
                    <Typography size="sm" tone="muted">
                      Ce qui a été suivi puis arrêté. Invisible sur le lien
                      patient, gardé pour la suite du dossier.
                    </Typography>
                    <RecommendationGroups recommendations={archived} />
                  </div>
                </SectionFold>
              ) : null}
            </CardContent>
          </Card>
        </section>

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
              <SupplementSection
                patientId={patient.id}
                pseudonym={patient.pseudonym}
                supplements={supplements}
              >
                {supplements.length === 0 ? (
                  <Typography size="sm" tone="muted">
                    Aucun complément prescrit pour le moment.
                  </Typography>
                ) : (
                  <SupplementProtocol supplements={supplements} />
                )}
                <SupplementAddForm patientId={patient.id} />
              </SupplementSection>

              {archivedSupplements.length > 0 ? (
                <SectionFold
                  id="archived-supplements"
                  label="Compléments arrêtés"
                  count={archivedSupplements.length}
                >
                  <SupplementProtocol supplements={archivedSupplements} />
                </SectionFold>
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
              <PantrySection
                patientId={patient.id}
                pseudonym={patient.pseudonym}
                essentials={essentials}
              >
                {essentials.length === 0 ? (
                  <Typography size="sm" tone="muted">
                    Aucun essentiel pour le moment.
                  </Typography>
                ) : (
                  <PantryList essentials={essentials} />
                )}
                <PantryAddForm patientId={patient.id} />
              </PantrySection>

              {archivedEssentials.length > 0 ? (
                <SectionFold
                  id="archived-pantry"
                  label="Essentiels archivés"
                  count={archivedEssentials.length}
                >
                  <PantryList essentials={archivedEssentials} />
                </SectionFold>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section id="recipes" data-segment="dossier" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Recettes</CardTitle>
              <CardDescription>
                Les recettes que cette personne a en ce moment, avec le mot qui
                va avec chacune. Attribuez-en plusieurs d&apos;un coup,
                écrivez-en une ici, ou adaptez-en une en variante — la
                bibliothèque « Recettes » garde tout.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {assignedRecipes.length === 0 ? (
                <Typography size="sm" tone="muted">
                  Aucune recette attribuée pour le moment.
                </Typography>
              ) : (
                <RecipeAssignments entries={assignedRecipes} today={today} />
              )}

              <AssignRecipeForm
                patientId={patient.id}
                recipes={library}
                today={today}
              />

              {pastRecipes.length > 0 ? (
                <SectionFold
                  id="past-recipes"
                  label="Recettes précédentes"
                  count={pastRecipes.length}
                >
                  <RecipeAssignments entries={pastRecipes} today={today} />
                </SectionFold>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section id="documents" data-segment="dossier" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Les PDF, images et liens de cette personne — elle les lit dans «
                Mes documents », et ceux classés comme recette aussi dans « Mes
                recettes ».
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentSection
                patientId={patient.id}
                documents={documents}
                attachments={attachments}
                uploadsAvailable={fileStoreReady()}
              />
            </CardContent>
          </Card>
        </section>

        <section id="messages" data-segment="journal" className="scroll-mt-32">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                L&apos;endroit général où la personne dit comment se passe son
                accompagnement. Votre réponse s&apos;affiche sur son lien, sous
                votre nom.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {unreadMessages > 0 ? (
                <Typography size="sm" tone="muted">
                  {`${messagesAwaitingLabel(unreadMessages)}.`}
                </Typography>
              ) : null}
              <MessageThread
                patientId={patient.id}
                pseudonym={patient.pseudonym}
                messages={messages}
              />
            </CardContent>
          </Card>
        </section>

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

              {archivedMealEntries.length > 0 ? (
                <SectionFold
                  id="archived-meals"
                  label="Repas archivés"
                  count={archivedMealEntries.length}
                >
                  <MealJournal entries={archivedMealEntries} />
                </SectionFold>
              ) : null}
            </CardContent>
          </Card>
        </section>

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
                <SectionFold
                  id="archived-observations"
                  label="Observations archivées"
                  count={archivedObservations.length}
                >
                  <ArchivedObservations observations={archivedObservations} />
                </SectionFold>
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
                Le terrain, catégorie par catégorie : ce qui est renseigné
                d&apos;abord, le reste à compléter en dessous. Ne s&apos;affiche
                jamais sur le lien patient.
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
            <CardContent className="flex flex-col gap-6">
              <ProfileSummary
                patient={patient}
                lastEditedAt={formatDate(patient.lastEditedAt)}
                consent={consent}
              />

              <SectionFold id="danger-zone" label="Zone sensible" tone="error">
                <div className="flex flex-col gap-4">
                  <Typography size="sm" tone="muted">
                    La suppression retire le profil, ses recommandations, son
                    protocole de compléments, ses essentiels, ses notes, son
                    anamnèse, ses objectifs et leurs points d&apos;étape, ses
                    consignes, ses recettes attribuées, son journal des repas,
                    ses observations et le lien patient — définitivement. Les
                    recettes elles-mêmes restent dans la bibliothèque.
                  </Typography>
                  <DeletePatient
                    patientId={patient.id}
                    pseudonym={patient.pseudonym}
                  />
                </div>
              </SectionFold>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PatientDetail;
