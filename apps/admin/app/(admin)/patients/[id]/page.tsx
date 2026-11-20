import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  adminOpenablePatient,
  consentsOf,
  countGoalCheckInsAwaitingAttention,
  countMealEntriesAwaitingFeedback,
  getCurrentChallenge,
  patientOf,
  getPatientInstruction,
  getPatientMealConfiguration,
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
  computePatientEstimates,
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
  listDisabledPatientFoodDirectives,
  listDisabledPatientLifestyleAdvices,
  listPatientFoodDirectives,
  listPatientLifestyleAdvices,
  listPatientSupplements,
  listRecipes,
  mealShareTable,
  missingQuestionnaireFields,
} from "@remi/services/server";
import {
  bmiIndicator,
  calculationKinds,
  canManageOperators,
  formatDate,
  missingCalculationInputs,
  missingOptionalFields,
  patientFileLayout,
  todayAtPractice,
  type CalculationInput,
  type CalculationKind,
} from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { AdminOpenForm } from "@/components/patients/admin-open-form";
import { AnamnesisBlock } from "@/components/patients/anamnesis-block";
import { CalculationsSummary } from "@/components/patients/calculations-summary";
import {
  ConsentsSection,
  ConsentWithdrawnNotice,
  consentsSummaryLine,
} from "@/components/patients/consents-section";
import { CopyContextCard } from "@/components/patients/copy-context-card";
import {
  DocumentSection,
  type AttachmentOption,
} from "@/components/patients/document-section";
import { ChallengesSection } from "@/components/patients/file/challenges";
import { countLabel } from "@/components/patients/file/count-label";
import { FoodDirectivesSection } from "@/components/patients/file/food-directives";
import { MealStructureSection } from "@/components/patients/file/meal-structure";
import { MealTargetsBlock } from "@/components/patients/file/meal-targets";
import { GoalsSection } from "@/components/patients/file/goals";
import { PatientHeader } from "@/components/patients/file/header";
import { LearningsSection } from "@/components/patients/file/learnings";
import { LifestyleAdviceSection } from "@/components/patients/file/lifestyle-advice";
import {
  MealsSection,
  mealsAwaitingLabel,
} from "@/components/patients/file/meals";
import { MessagesSection } from "@/components/patients/file/messages";
import { NextStepCard } from "@/components/patients/file/next-step";
import { PantryEssentialsSection } from "@/components/patients/file/pantry";
import { PreparationSection } from "@/components/patients/file/preparation";
import { ProfileSection } from "@/components/patients/file/profile";
import { RecipesSection } from "@/components/patients/file/recipes";
import { RecommendationsSection } from "@/components/patients/file/recommendations";
import {
  SectionRows,
  WorkColumn,
  type FileSectionViews,
} from "@/components/patients/file/sections";
import { SupplementsSection } from "@/components/patients/file/supplements";
import { NOT_ENTERED } from "@/components/patients/file/value";
import { mealConfigurationSummary } from "@/components/patients/meal-configuration-labels";
import { NoteTimeline } from "@/components/patients/note-timeline";
import {
  PatientNavigation,
  type PatientSectionEntry,
} from "@/components/patients/patient-navigation";
import { QuestionnaireFile } from "@/components/patients/questionnaire-file";
import { QuickActions } from "@/components/patients/quick-actions";
import { SafetyBlock } from "@/components/patients/safety-block";
import { SummaryBlock } from "@/components/patients/summary-block";
import {
  consentChannelLabels,
  fileGroupSegments,
  messagesAwaitingLabel,
  patientSegments,
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
 * One patient's file (stories 5 and 6). This file loads the data, checks the
 * access and composes the layout. It holds no section of its own.
 *
 * The page follows the file status (`patientFileLayout`): a header that stays
 * in view, one action card with the thing to do now, a work column whose
 * first block depends on the status, then every other section as one row that
 * opens in place. Navigation is a section index on desktop, a segmented
 * control on phone (Suivi · Journal · Dossier · Profil), an anchor row in
 * between. One DOM order — the views are classes and segments over it, never
 * a second tree.
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
  const [questionnaire, missing, calculations, computedEstimates] =
    await Promise.all([
      getPatientQuestionnaire(actor, patient.id),
      missingQuestionnaireFields(actor, patient.id),
      listPatientCalculations(actor, patient.id),
      computePatientEstimates(actor, patient.id),
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

  // The layout follows the file status: what the action card shows, which
  // sections are open in the work column and which are folded rows.
  const layout = patientFileLayout(patient.fileStatus);
  const validatedCalculations = calculations.filter(
    (row) => row.validatedValue !== null && !row.needsRevalidation,
  ).length;
  const missingCount = missingMandatory.length + missingOptional.length;

  const preparation = (
    <PreparationSection
      patientId={patient.id}
      pseudonym={patient.pseudonym}
      consultationDate={consultationDate}
      prepNote={patient.nextConsultationPrep}
    />
  );

  // The food directives (REM-54): the ones in force and the disabled ones.
  const [foodDirectives, disabledFoodDirectives] = await Promise.all([
    listPatientFoodDirectives(actor, patient.id),
    listDisabledPatientFoodDirectives(actor, patient.id),
  ]);

  // The lifestyle advice (REM-65): the advice in force and the disabled ones.
  const [lifestyleAdvices, disabledLifestyleAdvices] = await Promise.all([
    listPatientLifestyleAdvices(actor, patient.id),
    listDisabledPatientLifestyleAdvices(actor, patient.id),
  ]);

  // The meals and the fasting option (REM-68, REM-70). Null: not entered.
  const mealConfiguration = await getPatientMealConfiguration(
    actor,
    patient.id,
  );
  // The target of each meal (REM-197): from the validated values only. A
  // value that needs a new validation is not a target (D-30).
  const validatedValueOf = (kind: "energy" | "protein") =>
    calculations.find((row) => row.kind === kind && !row.needsRevalidation)
      ?.validatedValue ?? null;
  const mealShares = await mealShareTable();

  // Each section of the page: its words, its one line for a folded row, and
  // its body. `patientFileLayout` places them. To add a section, add its id in
  // `patient-file-layout.ts` and its entry here.
  const views: FileSectionViews = {
    "patient-file": {
      title: "Dossier patient",
      description:
        "Les réponses du questionnaire, dans son ordre. Un champ vide reste « Non renseigné ».",
      summary: countLabel(missingCount, {
        none: "Rien ne manque",
        one: "information manquante",
        many: "informations manquantes",
      }),
      empty: false,
      lead: (
        <SafetyBlock
          questionnaire={questionnaire.data}
          medications={patient.medications}
        />
      ),
      body: (
        <QuestionnaireFile
          patient={patient}
          questionnaire={questionnaire.data}
          genotypeOpen={genotypeOpen}
        />
      ),
    },
    calculations: {
      title: "Calculs",
      description:
        "Calculés à partir du dossier. Une valeur reste une estimation tant que vous ne l'avez pas validée.",
      summary: countLabel(validatedCalculations, {
        none: "Aucun calcul validé",
        one: "calcul validé",
        many: "calculs validés",
      }),
      empty: false,
      body: (
        <CalculationsSummary
          patientId={patient.id}
          readOnly={readOnly}
          calculations={calculations}
          missing={missingCalculation}
          bmi={bmiIndicator(calculationData)}
          computed={computedEstimates}
        />
      ),
    },
    objectifs: {
      title: "Objectifs et consigne",
      description:
        "Deux ou trois priorités, dans votre ordre, avec leur évolution — et la consigne que vous vous donnez pour cet accompagnement.",
      summary: `${countLabel(goals.length, {
        none: "Aucun objectif",
        one: "objectif",
        many: "objectifs",
      })} · ${instruction ? "consigne rédigée" : "aucune consigne"}`,
      empty: goals.length === 0 && !instruction,
      count: goals.length,
      body: (
        <GoalsSection
          patientId={patient.id}
          pseudonym={patient.pseudonym}
          goals={goals}
          archivedGoals={archivedGoals}
          checkIns={checkIns}
          awaitingAttention={goalsAwaitingAttention}
          instruction={instruction}
          supersededInstructions={supersededInstructions}
          today={today}
        />
      ),
    },
    recommendations: {
      title: "Recommandations",
      description:
        "Le protocole, encodé entrée par entrée — c'est ce que montre le lien patient.",
      summary: countLabel(recommendations.length, {
        none: "Aucune recommandation",
        one: "recommandation",
        many: "recommandations",
      }),
      empty: recommendations.length === 0,
      count: recommendations.length,
      body: (
        <RecommendationsSection
          patientId={patient.id}
          pseudonym={patient.pseudonym}
          recommendations={recommendations}
          archived={archived}
        />
      ),
    },
    "food-directives": {
      title: "Consignes alimentaires",
      description:
        "« À favoriser », « À limiter » et « Éviction totale » : un terme par consigne, séparés par « ; ». Une éviction porte une date de fin ou le statut durable.",
      summary: countLabel(foodDirectives.length, {
        none: "Aucune consigne",
        one: "consigne",
        many: "consignes",
      }),
      empty: foodDirectives.length === 0,
      count: foodDirectives.length,
      body: (
        <FoodDirectivesSection
          patientId={patient.id}
          pseudonym={patient.pseudonym}
          directives={foodDirectives}
          disabled={disabledFoodDirectives}
          today={today}
        />
      ),
    },
    "meal-structure": {
      title: "Repas",
      description:
        "Les repas que la personne prend, l'orientation de chacun et le jeûne intermittent. Chaque choix est enregistré aussitôt.",
      summary: mealConfigurationSummary(mealConfiguration),
      empty: mealConfiguration === null,
      body: (
        <>
          <MealStructureSection
            patientId={patient.id}
            configuration={mealConfiguration}
          />
          <MealTargetsBlock
            configuration={mealConfiguration}
            day={{
              energyKcal: validatedValueOf("energy"),
              proteinG: validatedValueOf("protein"),
            }}
            table={mealShares}
          />
        </>
      ),
    },
    supplements: {
      title: "Protocole de compléments",
      description:
        "Les compléments que vous prescrivez, avec dose, moment et raison. Ceux que la personne prend déjà d'elle-même se notent dans le profil.",
      summary: countLabel(supplements.length, {
        none: "Aucun complément prescrit",
        one: "complément",
        many: "compléments",
      }),
      empty: supplements.length === 0,
      count: supplements.length,
      body: (
        <SupplementsSection
          patientId={patient.id}
          pseudonym={patient.pseudonym}
          supplements={supplements}
          archived={archivedSupplements}
        />
      ),
    },
    "lifestyle-advice": {
      title: "Hygiène de vie",
      description:
        "Vos conseils hors alimentation, dans six catégories. Aucune n'est obligatoire. La personne les lit tels que vous les avez écrits, après la validation.",
      summary: countLabel(lifestyleAdvices.length, {
        none: "Aucun conseil",
        one: "conseil",
        many: "conseils",
      }),
      empty: lifestyleAdvices.length === 0,
      count: lifestyleAdvices.length,
      body: (
        <LifestyleAdviceSection
          patientId={patient.id}
          advices={lifestyleAdvices}
          disabled={disabledLifestyleAdvices}
        />
      ),
    },
    pantry: {
      title: "Essentiels placard / frigo",
      description:
        "La courte liste d'aliments à avoir sous la main, avec le pourquoi de chacun — pour cette personne.",
      summary: countLabel(essentials.length, {
        none: "Aucun essentiel",
        one: "essentiel",
        many: "essentiels",
      }),
      empty: essentials.length === 0,
      count: essentials.length,
      body: (
        <PantryEssentialsSection
          patientId={patient.id}
          pseudonym={patient.pseudonym}
          essentials={essentials}
          archived={archivedEssentials}
        />
      ),
    },
    messages: {
      title: "Messages",
      description:
        "L'endroit général où la personne dit comment se passe son accompagnement. Votre réponse s'affiche sur son lien, sous votre nom.",
      summary:
        unreadMessages > 0
          ? messagesAwaitingLabel(unreadMessages)
          : countLabel(messages.length, {
              none: "Aucun message",
              one: "message",
              many: "messages",
            }),
      empty: messages.length === 0,
      count: messages.length,
      body: (
        <MessagesSection
          patientId={patient.id}
          pseudonym={patient.pseudonym}
          messages={messages}
          unread={unreadMessages}
        />
      ),
    },
    meals: {
      title: "Journal des repas",
      description:
        "Ce que la personne a envoyé, transcrit ici, avec votre retour sous chaque repas. Texte seulement pour l'instant — les photos restent sur WhatsApp.",
      summary:
        awaitingFeedback > 0
          ? mealsAwaitingLabel(awaitingFeedback)
          : countLabel(mealEntries.length, {
              none: "Aucun repas noté",
              one: "repas",
              many: "repas",
            }),
      empty: mealEntries.length === 0,
      count: mealEntries.length,
      body: (
        <MealsSection
          patientId={patient.id}
          entries={mealEntries}
          archived={archivedMealEntries}
          awaitingFeedback={awaitingFeedback}
          today={today}
        />
      ),
    },
    retain: {
      title: "À retenir",
      description:
        "Ce que les semaines vous apprennent sur cette personne : ce qui est noté sur un repas, et ce que vous observez en dehors.",
      summary: countLabel(learnings.length, {
        none: "Rien à retenir pour le moment",
        one: "note",
        many: "notes",
      }),
      empty: learnings.length === 0,
      count: learnings.length,
      body: (
        <LearningsSection
          patientId={patient.id}
          learnings={learnings}
          archivedObservations={archivedObservations}
          today={today}
        />
      ),
    },
    consultations: {
      title: "Consultations",
      description:
        "Vos notes de séance, de la plus récente à la plus ancienne. Elles ne s'affichent jamais sur le lien patient.",
      summary: countLabel(notes.length, {
        none: "Aucune note de séance",
        one: "note de séance",
        many: "notes de séance",
      }),
      empty: notes.length === 0,
      count: notes.length,
      body: <NoteTimeline patientId={patient.id} notes={notes} today={today} />,
    },
    challenges: {
      title: "Challenges",
      description:
        "Une habitude à la fois, écrite pour la personne. Elle indique sur son lien quand le challenge est acquis et quand elle est prête pour le suivant.",
      summary: currentChallenge ? "1 challenge en cours" : "Aucun en cours",
      empty: !currentChallenge && pastChallenges.length === 0,
      count: currentChallenge ? 1 : 0,
      body: (
        <ChallengesSection
          patientId={patient.id}
          current={currentChallenge}
          past={pastChallenges}
          today={today}
        />
      ),
    },
    preparation: {
      title: "Préparation",
      description:
        "Le rendez-vous et ce que vous voulez avoir en tête pour la prochaine consultation.",
      summary: `Rendez-vous : ${
        consultationDate ? formatDate(consultationDate) : NOT_ENTERED
      }`,
      empty: !consultationDate && !patient.nextConsultationPrep,
      body: preparation,
    },
    summary: {
      title: "Résumé vivant",
      description:
        "La synthèse de la personne. Une seule, révisée à chaque consultation.",
      summary: summary ? "Rédigé" : "Aucun résumé",
      empty: !summary,
      body: (
        <SummaryBlock
          patientId={patient.id}
          pseudonym={patient.pseudonym}
          summary={summary}
        />
      ),
    },
    anamnesis: {
      title: "Anamnèse",
      description:
        "Le terrain, catégorie par catégorie. Ne s'affiche jamais sur le lien patient.",
      summary: countLabel(anamnesis.length, {
        none: "Aucune entrée",
        one: "entrée",
        many: "entrées",
      }),
      empty: anamnesis.length === 0,
      count: anamnesis.length,
      body: <AnamnesisBlock patientId={patient.id} entries={anamnesis} />,
    },
    "copy-context": {
      title: "Copier le contexte",
      description:
        "Le contexte de la personne en texte clair, à coller dans le modèle de votre choix. Pseudonyme uniquement, aucun appel au modèle depuis REMI.",
      summary: "Texte clair, pseudonyme uniquement",
      empty: false,
      body: (
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
      ),
    },
    recipes: {
      title: "Recettes",
      description:
        "Les recettes que cette personne a en ce moment, avec le mot qui va avec chacune. Attribuez-en plusieurs d'un coup, écrivez-en une ici, ou adaptez-en une en variante — la bibliothèque « Recettes » garde tout.",
      summary: countLabel(assignedRecipes.length, {
        none: "Aucune recette attribuée",
        one: "recette",
        many: "recettes",
      }),
      empty: assignedRecipes.length === 0,
      count: assignedRecipes.length,
      body: (
        <RecipesSection
          patientId={patient.id}
          assigned={assignedRecipes}
          past={pastRecipes}
          library={library}
          today={today}
        />
      ),
    },
    documents: {
      title: "Documents",
      description:
        "Les PDF, images et liens de cette personne — elle les lit dans « Mes documents », et ceux classés comme recette aussi dans « Mes recettes ».",
      summary: countLabel(documents.length, {
        none: "Aucun document",
        one: "document",
        many: "documents",
      }),
      empty: documents.length === 0,
      count: documents.length,
      body: (
        <DocumentSection
          patientId={patient.id}
          documents={documents}
          attachments={attachments}
          uploadsAvailable={fileStoreReady()}
        />
      ),
    },
    profile: {
      title: "Profil",
      description:
        "Le tableau de fond contre lequel les recommandations et les recettes sont personnalisées, et le consentement recueilli pour le tenir.",
      summary: `Consentement : ${consent ?? NOT_ENTERED}`,
      empty: false,
      body: (
        <ProfileSection
          summary={{
            patient,
            lastEditedAt: formatDate(patient.lastEditedAt),
            consent,
            careConsentGiven: consents.care?.decision === "given",
            patientEditedOn: Object.fromEntries(
              Object.entries(patient.patientEditedAt).flatMap(([field, at]) =>
                at ? [[field, formatDate(at)]] : [],
              ),
            ),
            questionnaire: questionnaire.data,
            consultationDate: consultationDate
              ? formatDate(consultationDate)
              : null,
            genotypeOpen,
          }}
          patientId={patient.id}
          pseudonym={patient.pseudonym}
          heldAt={patient.retentionHoldAt}
          canHold={canManageOperators(operator.role)}
          readOnly={readOnly}
        />
      ),
    },
    consents: {
      title: "Consentements",
      description:
        "Ce que le patient a accepté, refusé ou retiré dans son espace, avec la date et la version du texte.",
      summary: consentsSummaryLine(consents),
      empty: false,
      // Above the row, folded or not: the practitioner must see it.
      lead:
        consents.care?.decision === "withdrawn" ? (
          <ConsentWithdrawnNotice withdrawnAt={consents.care.decidedAt} />
        ) : undefined,
      body: <ConsentsSection latest={consents} />,
    },
  };

  // The section registry — the one list the desktop index, the phone segments
  // and the medium anchor row all read. Every rendered section, in DOM order.
  const sections: PatientSectionEntry[] = [
    { id: "next-step", label: "À faire", segment: "suivi" },
    ...layout.work.map((id) => ({
      id,
      label: views[id].title,
      segment: "suivi" as const,
      count: views[id].count,
    })),
    ...layout.rows.flatMap(({ group, sections: ids }) =>
      ids.map((id) => ({
        id,
        label: views[id].title,
        segment: fileGroupSegments[group],
        count: views[id].count,
      })),
    ),
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
        <PatientHeader
          patient={patient}
          name={name}
          questionnaire={questionnaire.data}
          readOnly={readOnly}
          back={
            fromConsultation
              ? {
                  href: `/patients/${patient.id}/consultation`,
                  label: "Retour à la consultation",
                }
              : { href: "/patients", label: "Patients" }
          }
        />

        {readOnly ? (
          <Typography size="sm" role="status" className="text-warning-text">
            Lecture seule : accès équipe REMI à un dossier suivi par un autre
            compte. Le motif est au journal. Toute modification est refusée.
          </Typography>
        ) : null}
        {alreadyExists ? (
          <Typography size="sm" role="status" className="text-info-text">
            Ce dossier existe déjà : l&apos;adresse email saisie est la sienne.
            Aucun second dossier n&apos;a été créé.
          </Typography>
        ) : null}

        {/* The anchor row — medium only; the rail takes over from lg, the
            segmented control below md. */}
        <nav
          aria-label="Sections de la page"
          className="hidden gap-2 overflow-x-auto pb-1 md:flex lg:hidden"
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="border-border text-muted-foreground hover:bg-accent hover:text-foreground inline-flex min-h-11 shrink-0 items-center rounded-full border px-3 text-sm transition-colors"
            >
              {section.label}
            </a>
          ))}
        </nav>

        {/* The one thing to do at this status (stories 5 and 6). */}
        <NextStepCard
          action={layout.action}
          patient={patient}
          readOnly={readOnly}
          missingMandatory={missingMandatory}
          missingOptional={missingOptional}
          preparation={
            layout.inAction.includes("preparation") ? preparation : null
          }
          protocol={{
            goals: goals.length,
            recommendations: recommendations.length,
            supplements: supplements.length,
            instruction: instruction !== null,
            validatedCalculations,
          }}
          shortcuts={
            // It reads the segment from the URL, same as the navigation.
            <Suspense fallback={null}>
              <QuickActions
                patientId={patient.id}
                withConsultation={layout.action !== "prepare"}
              />
            </Suspense>
          }
        />

        {/* The work column: the open blocks of this status. */}
        <WorkColumn sections={layout.work} views={views} />

        {/* Every other section: one row each, opening in place. */}
        <SectionRows rows={layout.rows} views={views} />
      </div>
    </div>
  );
};

export default PatientDetail;
