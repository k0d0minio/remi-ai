import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  MAX_ACTIVE_GOALS,
  adminOpenablePatient,
  consentsOf,
  countGoalCheckInsAwaitingAttention,
  countMealEntriesAwaitingFeedback,
  getCurrentChallenge,
  patientOf,
  getPatientInstruction,
  getPatientQuestionnaire,
  getPatientSummary,
  listArchivedMealEntries,
  listArchivedPantryEssentials,
  listArchivedPatientGoals,
  listArchivedPatientInstructions,
  listArchivedPatientObservations,
  listArchivedPatientRecipes,
  listArchivedPatientRecommendations,
  listGoalCheckIns,
  listPatientCalculations,
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
  missingQuestionnaireFields,
} from "@remi/services/server";
import {
  appHref,
  calculationKinds,
  canManageOperators,
  fileStatusLabels,
  formatDate,
  missingCalculationInputs,
  missingOptionalFields,
  patientLinkPreviewParam,
  todayAtPractice,
  type CalculationInput,
  type CalculationKind,
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
import { AdminOpenForm } from "@/components/patients/admin-open-form";
import { AnamnesisBlock } from "@/components/patients/anamnesis-block";
import { AssignRecipeForm } from "@/components/patients/assign-recipe-form";
import { CalculationsSummary } from "@/components/patients/calculations-summary";
import { ChallengeHistory } from "@/components/patients/challenge-history";
import { ChallengeSection } from "@/components/patients/challenge-section";
import { ConsultationDate } from "@/components/patients/consultation-date";
import { CopyContextCard } from "@/components/patients/copy-context-card";
import { DeletePatient } from "@/components/patients/delete-patient";
import { FoldedCard } from "@/components/patients/folded-card";
import { RetentionHold } from "@/components/patients/retention-hold";
import {
  DocumentSection,
  type AttachmentOption,
} from "@/components/patients/document-section";
import { GoalAddForm } from "@/components/patients/goal-add-form";
import {
  GoalList,
  GoalsAwaitingAttention,
} from "@/components/patients/goal-list";
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
import { QuestionnaireFile } from "@/components/patients/questionnaire-file";
import { PrepNote } from "@/components/patients/prep-note";
import { QuickActions } from "@/components/patients/quick-actions";
import { RecipeAssignments } from "@/components/patients/recipe-assignments";
import { RecommendationAddForm } from "@/components/patients/recommendation-add-form";
import { RecommendationGroups } from "@/components/patients/recommendation-groups";
import { RecommendationSection } from "@/components/patients/recommendation-section";
import { SectionFold } from "@/components/patients/section-fold";
import { ShareLinkCard } from "@/components/patients/share-link-card";
import { SummaryBlock } from "@/components/patients/summary-block";
import { SupplementAddForm } from "@/components/patients/supplement-add-form";
import { SupplementProtocol } from "@/components/patients/supplement-protocol";
import { SupplementSection } from "@/components/patients/supplement-section";
import { MessageThread } from "@/components/patients/message-thread";
import {
  consentChannelLabels,
  messagesAwaitingLabel,
  patientSegments,
  patientStatusIntents,
  patientStatusLabels,
  type PatientSegment,
} from "@/components/patients/vocabulary";
import { patientContextInput } from "@/lib/patients/context";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";
import { fileStoreReady } from "@/lib/files";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { id: string };

type PageProps = {
  params: Promise<Params>;
  searchParams: Promise<{
    segment?: string | string[];
    from?: string;
    /** Set when « Nouveau patient » met an e-mail already on this file. */
    exists?: string;
  }>;
};

const isPatientSegment = (value: string): value is PatientSegment =>
  (patientSegments as readonly string[]).includes(value);

/**
 * One patient's file (story 6), opening on the questionnaire: the header names
 * the patient, the file status and the appointment, « Informations
 * manquantes » lists what is empty, and every answer follows in the order the
 * patient met it. The living summary and the anamnesis sit under it, folded,
 * then the preparation tools. Every other section is behind navigation: a
 * section index on desktop, a segmented control on phone (Suivi · Journal ·
 * Dossier · Profil), an anchor row in between. One DOM order — the views are
 * classes and segments over it, never a second tree.
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
  const alreadyExists = query.exists === "1";
  const segmentValue = Array.isArray(segmentParam)
    ? segmentParam[0]
    : segmentParam;
  const initialSegment: PatientSegment =
    segmentValue && isPatientSegment(segmentValue) ? segmentValue : "suivi";
  // Another practitioner's file answers 404, like a missing one (D-27). An
  // admin is asked for a reason first, then reads the file read-only (story 3).
  const operator = await requireOperator();
  const actor = await requireActor();
  const result = await patientOf(actor, id);
  if (!result.ok) {
    const openable = await adminOpenablePatient(actor, id);
    if (openable.ok) {
      return (
        <AdminOpenForm patientId={id} pseudonym={openable.data.pseudonym} />
      );
    }
    notFound();
  }
  const patient = result.data;
  // An admin's open of another practitioner's file: every write is refused.
  const readOnly = patient.practitionerId !== operator.id;

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
    goalsAwaitingAttention,
    messages,
    consents,
  ] = await Promise.all([
    listPatientRecommendations(actor, patient.id),
    listArchivedPatientRecommendations(actor, patient.id),
    listPatientSupplements(actor, patient.id),
    listArchivedPatientSupplements(actor, patient.id),
    listPantryEssentials(actor, patient.id),
    listArchivedPantryEssentials(actor, patient.id),
    listPatientRecipes(actor, patient.id),
    listArchivedPatientRecipes(actor, patient.id),
    // The picker offers the active library only — an archived recipe is out of
    // circulation, which is exactly what archiving it meant.
    listRecipes(),
    listMealEntries(actor, patient.id),
    listArchivedMealEntries(actor, patient.id),
    countMealEntriesAwaitingFeedback(actor, patient.id),
    listPatientLearnings(actor, patient.id),
    listArchivedPatientObservations(actor, patient.id),
    listPatientNotes(actor, patient.id),
    listPatientAnamnesis(actor, patient.id),
    listPatientGoals(actor, patient.id),
    listArchivedPatientGoals(actor, patient.id),
    getPatientInstruction(actor, patient.id),
    listArchivedPatientInstructions(actor, patient.id),
    getPatientSummary(actor, patient.id),
    getCurrentChallenge(actor, patient.id),
    listPastChallenges(actor, patient.id),
    listPatientDocuments(actor, patient.id),
    countGoalCheckInsAwaitingAttention(actor, patient.id),
    listPatientMessages(actor, patient.id),
    consentsOf(actor, patient.id),
  ]);
  // The questionnaire half of the file (story 1): its answers for the form,
  // what is still missing, and whether the genotype may be entered. Then the
  // automatic calculations that read those answers (stories 7, 8 and 9).
  const [questionnaire, missing, calculations] = await Promise.all([
    getPatientQuestionnaire(actor, patient.id),
    missingQuestionnaireFields(actor, patient.id),
    listPatientCalculations(actor, patient.id),
  ]);
  if (!questionnaire.ok) {
    notFound();
  }
  const missingMandatory = missing.ok ? missing.data : [];
  const answers = questionnaire.data.answers;
  const consultationDate = answers.consultationDate;
  const genotypeOpen = consents.genetic?.decision === "given";
  const missingOptional = missingOptionalFields({
    birthDate: patient.birthDate,
    phone: patient.phone,
    desiredWeightKg: answers.desiredWeightKg,
    consultationDate,
    diet: answers.diet,
    dietNote: answers.dietNote,
    celiacDisease: answers.celiacDisease,
    pathologies: answers.pathologies,
    medications: patient.medications,
    supplements: patient.supplements,
    geneticTest: answers.geneticTest,
    apoe: answers.apoe,
    dio2: answers.dio2,
    amy1a: answers.amy1a,
    genotypeOpen,
  });
  const calculationData = {
    sexForCalculation: answers.sexForCalculation,
    birthDate: patient.birthDate,
    heightCm: patient.heightCm,
    weightKg: patient.weightKg,
    activityLevel: answers.activityLevel,
  };
  const missingCalculation = Object.fromEntries(
    calculationKinds.map((kind) => [
      kind,
      missingCalculationInputs(kind, calculationData),
    ]),
  ) as Record<CalculationKind, CalculationInput[]>;
  // The name the patient gave, else the one the practitioner typed, else the
  // working name: the pseudonym always exists.
  const name =
    [patient.firstName, patient.lastName]
      .filter((part) => part !== null && part.trim() !== "")
      .join(" ") ||
    patient.fullName ||
    patient.pseudonym;

  // Derived from the thread already in hand rather than a second read.
  const unreadMessages = messages.filter(
    (message) => message.author === "patient" && message.readAt === null,
  ).length;

  // One trail per goal, active and archived alike: two or three goals plus
  // what has been set down is a handful of reads, and they run together.
  const trails = await Promise.all(
    [...goals, ...archivedGoals].map(async (goal) => ({
      id: goal.id,
      entries: await listGoalCheckIns(actor, goal.id),
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
  // The default consultation date, resolved server-side: a date input seeded
  // from the browser's clock disagrees with the server the moment someone is
  // working across midnight or from another timezone.
  const today = todayAtPractice();

  // The section registry — the one list the desktop index, the phone segments
  // and the medium anchor row all read. Every rendered section, in DOM order.
  const sections: PatientSectionEntry[] = [
    { id: "patient-file", label: "Dossier patient", segment: "suivi" },
    { id: "calculations", label: "Calculs", segment: "suivi" },
    { id: "summary", label: "Résumé vivant", segment: "suivi" },
    {
      id: "anamnesis",
      label: "Anamnèse",
      segment: "suivi",
      count: anamnesis.length,
    },
    { id: "preparation", label: "Préparation", segment: "suivi" },
    { id: "patient-link", label: "Lien patient", segment: "dossier" },
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
              {name}
            </Typography>
            <Badge
              variant={
                patient.fileStatus === "to_complete" ? "warning" : "info"
              }
              tone="subtle"
              size="sm"
            >
              {fileStatusLabels[patient.fileStatus].fr}
            </Badge>
            <Badge
              variant={patientStatusIntents[patient.status]}
              tone="subtle"
              size="sm"
            >
              {patientStatusLabels[patient.status]}
            </Badge>
          </div>
          <Typography size="sm" tone="muted">
            {`Pseudonyme : ${patient.pseudonym} · Rendez-vous : ${
              consultationDate ? formatDate(consultationDate) : "Non renseigné"
            }`}
          </Typography>
          {readOnly ? (
            <Typography size="sm" role="status" className="text-warning-text">
              Lecture seule : accès équipe REMI à un dossier suivi par un autre
              compte. Le motif est au journal. Toute modification est refusée.
            </Typography>
          ) : null}
          {alreadyExists ? (
            <Typography size="sm" role="status" className="text-info-text">
              Ce dossier existe déjà : l&apos;adresse email saisie est la
              sienne. Aucun second dossier n&apos;a été créé.
            </Typography>
          ) : null}
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

        {/* The patient file — the landing state (story 6). */}
        <section
          id="patient-file"
          data-segment="suivi"
          aria-label="Dossier patient"
          className="scroll-mt-32"
        >
          <Card>
            <CardHeader>
              <CardTitle>Dossier patient</CardTitle>
              <CardDescription>
                Les réponses du questionnaire, dans son ordre. Un champ vide
                reste « Non renseigné ».
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionnaireFile
                patient={patient}
                questionnaire={questionnaire.data}
                genotypeOpen={genotypeOpen}
                missingMandatory={missingMandatory}
                missingOptional={missingOptional}
              />
            </CardContent>
          </Card>
        </section>

        {/* « Calculs » — under the data, above the protocol (story 6). */}
        <section
          id="calculations"
          data-segment="suivi"
          className="scroll-mt-32"
        >
          <Card>
            <CardHeader>
              <CardTitle>Calculs</CardTitle>
              <CardDescription>
                Calculés à partir du dossier. Une valeur reste une estimation
                tant que vous ne l&apos;avez pas validée.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalculationsSummary
                calculations={calculations}
                missing={missingCalculation}
              />
            </CardContent>
          </Card>
        </section>

        <section id="summary" data-segment="suivi" className="scroll-mt-32">
          <FoldedCard
            id="summary-fold"
            title="Résumé vivant"
            description="La synthèse de la personne. Une seule, révisée à chaque consultation."
            openLabel="Afficher le résumé"
          >
            <SummaryBlock
              patientId={patient.id}
              pseudonym={patient.pseudonym}
              summary={summary}
            />
          </FoldedCard>
        </section>

        <section id="anamnesis" data-segment="suivi" className="scroll-mt-32">
          <FoldedCard
            id="anamnesis-fold"
            title="Anamnèse"
            description="Le terrain, catégorie par catégorie. Ne s'affiche jamais sur le lien patient."
            openLabel={`Afficher l'anamnèse · ${anamnesis.length}`}
          >
            <AnamnesisBlock patientId={patient.id} entries={anamnesis} />
          </FoldedCard>
        </section>

        {/* The preparation tools — kept from the September working view. */}
        <section
          id="preparation"
          data-segment="suivi"
          aria-label="Préparation"
          className="flex scroll-mt-32 flex-col gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Date de consultation</CardTitle>
              <CardDescription>
                Le rendez-vous de la personne. Le questionnaire écrit la même
                date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsultationDate
                patientId={patient.id}
                value={consultationDate}
                formatted={
                  consultationDate ? formatDate(consultationDate) : null
                }
              />
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
              <GoalsAwaitingAttention count={goalsAwaitingAttention} />
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
                careConsentGiven={consents.care?.decision === "given"}
                patientEditedOn={Object.fromEntries(
                  Object.entries(patient.patientEditedAt).flatMap(
                    ([field, at]) => (at ? [[field, formatDate(at)]] : []),
                  ),
                )}
                questionnaire={questionnaire.data}
                consultationDate={
                  consultationDate ? formatDate(consultationDate) : null
                }
                genotypeOpen={genotypeOpen}
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
                  {canManageOperators(operator.role) && !readOnly ? (
                    <RetentionHold
                      patientId={patient.id}
                      heldAt={patient.retentionHoldAt}
                    />
                  ) : null}
                  {readOnly ? null : (
                    <DeletePatient
                      patientId={patient.id}
                      pseudonym={patient.pseudonym}
                    />
                  )}
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
