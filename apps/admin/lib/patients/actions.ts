"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addGoalCheckIn,
  addMealEntry,
  addPatientDocumentFile,
  addPatientDocumentLink,
  addPantryEssential,
  addPatientGoal,
  addPatientNote,
  addPatientObservation,
  addPatientRecommendation,
  addPatientSupplement,
  archiveMealEntry,
  archivePantryEssential,
  archivePatientGoal,
  archivePatientObservation,
  archivePatientRecommendation,
  archivePatientSupplement,
  archiveRecipeAssignment,
  assignRecipes,
  checkAllergenAnswer,
  checkQuestionnaireInput,
  closeChallenge,
  consentsOf,
  createAndAssignRecipe,
  createPatient,
  deleteGoalCheckIn,
  deleteMealEntry,
  deletePantryEssential,
  deletePatient,
  deletePatientGoal,
  deletePatientNote,
  deletePatientObservation,
  deletePatientRecommendation,
  deletePatientSupplement,
  describeConsultation,
  duplicateAndAssignRecipe,
  findPatientByEmail,
  getPatient,
  getPatientInstruction,
  getPatientQuestionnaire,
  getPatientSummary,
  markGoalCheckInSeen,
  markReadyWhenComplete,
  markPatientMessageRead,
  movePantryEssential,
  movePatientGoal,
  movePatientRecommendation,
  movePatientSupplement,
  patientOf,
  patientOfRecord,
  recordConsultation,
  removePatientDocument,
  replyToPatient,
  removeRecipeAssignment,
  savePantryEssentials,
  savePatientQuestionnaire,
  savePatientRecommendations,
  savePatientSupplements,
  setPatientAllergens,
  setPatientAnamnesis,
  setPatientInstruction,
  setPatientNextConsultationPrep,
  setPatientSummary,
  startChallenge,
  updateChallenge,
  updateGoalCheckIn,
  updateMealEntry,
  updatePantryEssential,
  updatePatient,
  updatePatientGoal,
  updatePatientNote,
  updatePatientObservation,
  updatePatientRecommendation,
  updatePatientDocument,
  updatePatientSupplement,
  updateRecipeAssignment,
  type ConsultationCheckInInput,
  type Operator,
  type PatientInput,
  type PatientQuestionnaireView,
  type QuestionnaireInput,
  type PatientRecordKind,
  type SectionSaveCounts,
  type Actor,
} from "@remi/services/server";
import {
  challengeOutcomes,
  contextBlocks,
  cookingAffinities,
  cookingTimes,
  documentTags,
  foodBudgets,
  goalDirections,
  defaultLocale,
  mealSlots,
  patientSexes,
  patientStatuses,
  recommendationCategories,
  userMessage,
  type ChallengeOutcome,
  type CookingAffinity,
  type CookingTime,
  type DocumentTag,
  type FoodBudget,
  type GoalDirection,
  type MealSlot,
  type PatientSex,
  type PatientStatus,
  type RecommendationCategory,
} from "@remi/services/shared";
import { audit } from "@/lib/audit";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { fileStoreReady } from "@/lib/files";
import {
  allergenAnswerFrom,
  postsGenotype,
  questionnaireInputFrom,
  type AllergenAnswer,
} from "@/lib/patients/questionnaire-form";

/**
 * Every action re-asserts the operator session before touching anything: the
 * layout guards what renders, an action is an endpoint of its own. Validation
 * lives in the service layer — these collect the form, narrow the enums, and
 * surface the service's `Result` message for the form to render.
 *
 * Every write that changes a patient's record also writes to the audit trail.
 * That is `apps/admin/AGENTS.md`'s rule, and it is why `audit()` appears after
 * the success branch of each one rather than before the attempt: a refused
 * write is not an action to record.
 */

export type PatientFormState = {
  error: string | null;
  saved: boolean;
  /**
   * The file of this practitioner that already carries the e-mail the save
   * tried to set. The form links to it next to the error.
   */
  existingId?: string | null;
};
export type RecommendationFormState = { error: string | null };
export type SupplementFormState = { error: string | null };
export type PantryFormState = { error: string | null };
export type AssignmentFormState = { error: string | null };
export type MealFormState = { error: string | null };
export type ObservationFormState = { error: string | null };
export type NoteFormState = { error: string | null };
export type AnamnesisFormState = { error: string | null };
export type GoalFormState = { error: string | null };
export type CheckInFormState = { error: string | null };
export type InstructionFormState = { error: string | null; saved: boolean };
export type ChallengeFormState = { error: string | null; saved: boolean };
export type MessageFormState = { error: string | null; saved: boolean };
export type SummaryFormState = { error: string | null; saved: boolean };
/** `stored` is the note that the save wrote. Null when it is empty or on an error. */
export type PrepFormState = {
  error: string | null;
  saved: boolean;
  stored: string | null;
};
export type ConsultationFormState = { error: string | null; saved: boolean };
export type DocumentFormState = { error: string | null; saved: boolean };
export type DeletePatientState = { error: string | null };

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

/** What an action answers for a file the signed-in practitioner does not hold. */
const NO_SUCH_FILE = "ce dossier patient est introuvable";

/**
 * D-27: an action writes only into a file the signed-in practitioner holds.
 * The form posts the ids, so each action checks them again: the page that
 * rendered the form is no guard. Another practitioner's file reads as missing.
 */
const holdsPatient = async (actor: Actor, patientId: string) =>
  (await patientOf(actor, patientId, "write")).ok;

/** The same check for an action that names a row of the file, not the file. */
const holdsRecord = async (actor: Actor, kind: PatientRecordKind, id: string) =>
  (await patientOfRecord(actor, kind, id, "write")).ok;

/**
 * `undefined` when the form did not carry the field at all, which is a
 * different statement from `""` — the latter is how a textarea is cleared.
 */
const optionalField = (formData: FormData, name: string) =>
  formData.has(name) ? String(formData.get(name) ?? "") : undefined;

const asStatus = (value: string): PatientStatus =>
  (patientStatuses as readonly string[]).includes(value)
    ? (value as PatientStatus)
    : "active";

/**
 * An empty select is a slot she left blank, which is a real answer rather
 * than a missing one — so it narrows to `null`, not to a default meal.
 */
const asMealSlot = (value: string): MealSlot | null =>
  (mealSlots as readonly string[]).includes(value) ? (value as MealSlot) : null;

const asSex = (value: string): PatientSex =>
  (patientSexes as readonly string[]).includes(value)
    ? (value as PatientSex)
    : "unspecified";

/** `""` is a real answer: § D lets a check-in carry a measure and no direction. */
const asGoalDirection = (value: string): GoalDirection | "" =>
  (goalDirections as readonly string[]).includes(value)
    ? (value as GoalDirection)
    : "";

/** `""` is a real answer here too — it is how Morgane clears a recorded one. */
const asChallengeOutcome = (value: string): ChallengeOutcome | null =>
  (challengeOutcomes as readonly string[]).includes(value)
    ? (value as ChallengeOutcome)
    : null;

/** Anything unrecognised files as a plain document — the default she sees. */
const asDocumentTag = (value: string): DocumentTag =>
  (documentTags as readonly string[]).includes(value)
    ? (value as DocumentTag)
    : "document";

/**
 * The one parent a document may have, from the form's single picker: its value
 * is `goal:<id>`, `recipe:<id>` or empty — one control, so the form can never
 * post both (D-26).
 */
const attachmentFrom = (formData: FormData) => {
  const [kind, id] = field(formData, "attachTo").split(":");
  return {
    goalId: kind === "goal" ? (id ?? "") : "",
    recipeAssignmentId: kind === "recipe" ? (id ?? "") : "",
  };
};

const asCookingAffinity = (value: string): CookingAffinity | "" =>
  (cookingAffinities as readonly string[]).includes(value)
    ? (value as CookingAffinity)
    : "";

/** `""` clears it — the select's « non renseigné » posts a word outside the set. */
const asCookingTime = (value: string): CookingTime | "" =>
  (cookingTimes as readonly string[]).includes(value)
    ? (value as CookingTime)
    : "";

const asFoodBudget = (value: string): FoodBudget | "" =>
  (foodBudgets as readonly string[]).includes(value)
    ? (value as FoodBudget)
    : "";

const asCategory = (value: string): RecommendationCategory =>
  (recommendationCategories as readonly string[]).includes(value)
    ? (value as RecommendationCategory)
    : "nutrition";

/**
 * A field the form disabled posts nothing. `undefined` leaves the column as it
 * is, where `field()` would answer `""` and clear it.
 */
const postedField = (formData: FormData, name: string) =>
  formData.has(name) ? field(formData, name) : undefined;

/**
 * The profile half of the patient form. `objective`, `dietaryRegime`,
 * `allergies` and `intolerances` are absent on purpose: the questionnaire's
 * fields replaced them in the form (Jamie, 2026-11-03), so a save leaves the
 * old texts as they are. The file shows them read-only.
 *
 * « Prénom » and « Nom » fill `fullName`, as the sign-up does. Both empty
 * leaves `fullName` as it is: a file created before the split keeps its name.
 */
const patientInputFrom = (formData: FormData): PatientInput => {
  const firstName = field(formData, "firstName").trim();
  const lastName = field(formData, "lastName").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return {
    pseudonym: field(formData, "pseudonym"),
    firstName,
    lastName,
    ...(fullName ? { fullName } : {}),
    phone: field(formData, "phone"),
    email: field(formData, "email"),
    // The patient space is French only (Morgane, 2026-10-23). The form has no
    // language field: the column stays and holds `fr`.
    locale: defaultLocale,
    birthDate: field(formData, "birthDate"),
    sex: asSex(field(formData, "sex")),
    heightCm: field(formData, "heightCm"),
    weightKg: field(formData, "weightKg"),
    constraints: field(formData, "constraints"),
    preferences: field(formData, "preferences"),
    likesCooking: asCookingAffinity(field(formData, "likesCooking")),
    cookingTime: asCookingTime(field(formData, "cookingTime")),
    foodBudget: asFoodBudget(field(formData, "foodBudget")),
    // Locked without the care consent (story 3), so possibly absent.
    medications: postedField(formData, "medications"),
    supplements: postedField(formData, "supplements"),
    referral: field(formData, "referral"),
    anamnesis: field(formData, "anamnesis"),
  };
};

const revalidatePatient = (id: string) => {
  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  revalidatePath("/");
};

/** The audit actor of the signed-in practitioner. */
const actorOf = (operator: Operator) => ({
  id: operator.id,
  email: operator.email,
  name: operator.name,
});

/** Morgane's question 5: the genotype waits on the patient's genetic consent. */
const geneticConsentGiven = async (actor: Actor, patientId: string) =>
  (await consentsOf(actor, patientId)).genetic?.decision === "given";

const GENOTYPE_LOCKED =
  "Le génotype reste verrouillé tant que le patient n'a pas donné son consentement génétique.";

const EMAIL_TAKEN =
  "Ce dossier existe déjà : cette adresse est sur un autre de vos dossiers.";

/** One list's rows and flag, as a string, to tell whether a save changed it. */
const allergenSignature = (
  view: PatientQuestionnaireView | null,
  kind: "allergy" | "intolerance",
) => {
  if (!view) {
    return "";
  }
  const flag =
    kind === "allergy"
      ? view.answers.noKnownAllergies
      : view.answers.noKnownIntolerances;
  const rows = view.allergens
    .filter((row) => row.kind === kind)
    .map((row) => `${row.key}/${row.subKey ?? ""}/${row.otherText ?? ""}`);
  return JSON.stringify([flag, rows]);
};

/** `null`, `undefined` and `""` all read as « not filled ». */
const comparable = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

/**
 * The names of the fields a save changed, for the audit detail. Names only:
 * the trail holds no health value (Jamie, 2026-11-03).
 */
const changedFieldNames = (
  before: Record<string, unknown>,
  input: Record<string, unknown>,
) =>
  Object.entries(input)
    .filter(([name, value]) => comparable(before[name]) !== comparable(value))
    .map(([name]) => name);

/**
 * Writes the questionnaire half of one submit: the answers, then each list
 * the form rendered. Every part was checked before the first write.
 */
const writeQuestionnaire = async (
  operator: Operator,
  actor: Actor,
  patientId: string,
  answers: QuestionnaireInput,
  lists: { allergy?: AllergenAnswer; intolerance?: AllergenAnswer },
): Promise<string | null> => {
  // An empty patch is no write: the database refuses an update with no value.
  if (Object.keys(answers).length > 0) {
    const saved = await savePatientQuestionnaire(
      actor,
      patientId,
      answers,
      actorOf(operator),
    );
    if (!saved.ok) {
      return userMessage(saved);
    }
  }
  for (const kind of ["allergy", "intolerance"] as const) {
    const answer = lists[kind];
    if (answer) {
      const written = await setPatientAllergens(actor, patientId, kind, answer);
      if (!written.ok) {
        return userMessage(written);
      }
    }
  }
  return null;
};

/**
 * One submit of the patient form, on « Nouveau patient » and on « Modifier »
 * (story 1). It writes the profile, the questionnaire's answers and the two
 * allergen lists, then moves the file to « Prêt pour consultation » when the
 * last mandatory field is filled. Missing fields never block a save.
 *
 * It sends nothing: no invitation and no activation e-mail goes out on a
 * create or a save. The patient's activation e-mail belongs to
 * `care-activation`.
 */
export const savePatientAction = async (
  _previous: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  const id = field(formData, "id");
  const input = patientInputFrom(formData);
  const lists = {
    allergy: allergenAnswerFrom(formData, "allergy"),
    intolerance: allergenAnswerFrom(formData, "intolerance"),
  };

  if (id && !(await holdsPatient(actor, id))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  // A new file has no consent yet, so its genotype is always locked.
  const genotypeOpen = id ? await geneticConsentGiven(actor, id) : false;
  if (postsGenotype(formData) && !genotypeOpen) {
    return { error: GENOTYPE_LOCKED, saved: false };
  }
  const answers = questionnaireInputFrom(
    formData,
    genotypeOpen,
  ) as QuestionnaireInput;

  // Every part is checked before the first write, so a refused answer never
  // leaves a half-created file.
  const checks = [
    checkQuestionnaireInput(answers),
    ...(["allergy", "intolerance"] as const).flatMap((kind) => {
      const answer = lists[kind];
      return answer ? [checkAllergenAnswer(kind, answer)] : [];
    }),
  ];
  const refused = checks.find((check) => !check.ok);
  if (refused && !refused.ok) {
    return { error: userMessage(refused), saved: false };
  }

  const sameEmail = input.email
    ? await findPatientByEmail(actor, input.email)
    : null;

  if (!id) {
    // A known e-mail opens that file. No second file is created.
    if (sameEmail) {
      redirect(`/patients/${sameEmail.id}?exists=1`);
    }
    // The new file belongs to the practitioner who creates it (D-27).
    const created = await createPatient(actor, {
      ...input,
      pseudonym: input.pseudonym ?? "",
      practitionerId: operator.id,
      // The list shows this file at once, as « Dossier à compléter ».
      createdBy: "practitioner",
    });
    if (!created.ok) {
      return { error: userMessage(created), saved: false };
    }
    const failed = await writeQuestionnaire(
      operator,
      actor,
      created.data.id,
      answers,
      lists,
    );
    await audit(operator, "patient.created", {
      type: "patient",
      id: created.data.id,
      label: created.data.pseudonym,
    });
    if (failed) {
      // The file exists: the practitioner finishes it from its page.
      redirect(`/patients/${created.data.id}`);
    }
    await markReadyWhenComplete(actor, created.data.id, actorOf(operator));
    revalidatePath("/patients");
    revalidatePath("/");
    redirect(`/patients/${created.data.id}`);
  }

  if (sameEmail && sameEmail.id !== id) {
    return { error: EMAIL_TAKEN, saved: false, existingId: sameEmail.id };
  }

  const [before, beforeAnswers] = await Promise.all([
    getPatient(actor, id),
    getPatientQuestionnaire(actor, id),
  ]);
  const beforeView = beforeAnswers.ok ? beforeAnswers.data : null;
  const status = asStatus(field(formData, "status"));
  const updated = await updatePatient(actor, id, { ...input, status });
  if (!updated.ok) {
    return { error: userMessage(updated), saved: false };
  }
  const failed = await writeQuestionnaire(operator, actor, id, answers, lists);
  if (failed) {
    return { error: failed, saved: false };
  }
  const afterAnswers = await getPatientQuestionnaire(actor, id);
  const afterView = afterAnswers.ok ? afterAnswers.data : null;

  const changed = [
    ...changedFieldNames(before.ok ? { ...before.data } : {}, {
      ...input,
      status,
    }),
    ...changedFieldNames(
      { ...(beforeView?.answers ?? {}) },
      answers as Record<string, unknown>,
    ),
    ...(["allergy", "intolerance"] as const).filter(
      (kind) =>
        allergenSignature(beforeView, kind) !==
        allergenSignature(afterView, kind),
    ),
  ];
  await audit(operator, "patient.updated", {
    type: "patient",
    id,
    label: updated.data.pseudonym,
    detail: changed.length > 0 ? `champs : ${changed.join(", ")}` : "",
  });
  const fileStatus = await markReadyWhenComplete(actor, id, actorOf(operator));
  revalidatePatient(id);
  if (fileStatus.ok && fileStatus.data !== updated.data.fileStatus) {
    revalidatePath("/patients");
  }
  return { error: null, saved: true };
};

/**
 * Deletes the patient — and first their files in the store, which is why the
 * file store is registered before the call: `deletePatient` refuses to leave a
 * patient's files behind, and a refusal is shown in the dialog rather than
 * lost in a redirect.
 */
export const deletePatientAction = async (
  _previous: DeletePatientState,
  formData: FormData,
): Promise<DeletePatientState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  fileStoreReady();
  const existing = await getPatient(actor, id);
  const removed = await deletePatient(actor, id);
  if (!removed.ok && removed.error !== "not_found") {
    return { error: userMessage(removed) };
  }
  if (removed.ok) {
    await audit(operator, "patient.deleted", {
      type: "patient",
      id,
      label: existing.ok ? existing.data.pseudonym : "",
    });
  }
  revalidatePath("/patients");
  revalidatePath("/");
  redirect("/patients");
};

export const addRecommendationAction = async (
  _previous: RecommendationFormState,
  formData: FormData,
): Promise<RecommendationFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const result = await addPatientRecommendation(actor, patientId, {
    category: asCategory(field(formData, "category")),
    title: field(formData, "title"),
    detail: field(formData, "detail"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "recommendation.added", {
    type: "recommendation",
    id: result.data.id,
    label: result.data.title,
    detail: field(formData, "pseudonym"),
  });
  revalidatePatient(patientId);
  return { error: null };
};

export const updateRecommendationAction = async (
  _previous: RecommendationFormState,
  formData: FormData,
): Promise<RecommendationFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "recommendation", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const result = await updatePatientRecommendation(actor, id, {
    category: asCategory(field(formData, "category")),
    title: field(formData, "title"),
    detail: field(formData, "detail"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "recommendation.updated", {
    type: "recommendation",
    id,
    label: result.data.title,
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const moveRecommendationAction = async (formData: FormData) => {
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "recommendation", field(formData, "id")))) {
    return;
  }
  const direction = field(formData, "direction") === "up" ? "up" : "down";
  await movePatientRecommendation(actor, field(formData, "id"), direction);
  // Not audited: reordering changes how a protocol reads, never what it says,
  // and a journal full of nudges is a journal nobody reads.
  revalidatePatient(field(formData, "patientId"));
};

export const archiveRecommendationAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "recommendation", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePatientRecommendation(actor, id, archived);
  if (result.ok) {
    await audit(
      operator,
      archived ? "recommendation.archived" : "recommendation.restored",
      { type: "recommendation", id, label: result.data.title },
    );
  }
  revalidatePatient(field(formData, "patientId"));
};

export const deleteRecommendationAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "recommendation", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const removed = await deletePatientRecommendation(actor, id);
  if (removed.ok) {
    await audit(operator, "recommendation.deleted", {
      type: "recommendation",
      id,
      label: field(formData, "title"),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * The prescribed supplement protocol — brainstorm § G. Four fields and a flat
 * order: these collect them and let the service validate the name and place the
 * row. A reorder is silent, like the recommendations' and unlike the pantry's:
 * the order a protocol reads in is a presentation choice, not a change to what
 * it prescribes, and a journal full of nudges is a journal nobody reads.
 */
export const addSupplementAction = async (
  _previous: SupplementFormState,
  formData: FormData,
): Promise<SupplementFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const result = await addPatientSupplement(actor, patientId, {
    name: field(formData, "name"),
    dose: field(formData, "dose"),
    timing: field(formData, "timing"),
    reason: field(formData, "reason"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "supplement.added", {
    type: "patient_supplement",
    id: result.data.id,
    label: result.data.name,
  });
  revalidatePatient(patientId);
  return { error: null };
};

export const updateSupplementAction = async (
  _previous: SupplementFormState,
  formData: FormData,
): Promise<SupplementFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "supplement", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const result = await updatePatientSupplement(actor, id, {
    name: field(formData, "name"),
    dose: field(formData, "dose"),
    timing: field(formData, "timing"),
    reason: field(formData, "reason"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "supplement.updated", {
    type: "patient_supplement",
    id,
    label: result.data.name,
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const moveSupplementAction = async (formData: FormData) => {
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "supplement", field(formData, "id")))) {
    return;
  }
  const direction = field(formData, "direction") === "up" ? "up" : "down";
  await movePatientSupplement(actor, field(formData, "id"), direction);
  // Not audited, like the recommendations: reordering changes how a protocol
  // reads, never what it prescribes.
  revalidatePatient(field(formData, "patientId"));
};

export const archiveSupplementAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "supplement", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePatientSupplement(actor, id, archived);
  if (result.ok) {
    await audit(
      operator,
      archived ? "supplement.archived" : "supplement.restored",
      { type: "patient_supplement", id, label: result.data.name },
    );
  }
  revalidatePatient(field(formData, "patientId"));
};

export const deleteSupplementAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "supplement", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const removed = await deletePatientSupplement(actor, id);
  if (removed.ok) {
    await audit(operator, "supplement.deleted", {
      type: "patient_supplement",
      id,
      label: field(formData, "name"),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * The placard/frigo list — brainstorm § H. Two fields and nothing else, so
 * these actions collect a name and a why and let the service decide the rest.
 *
 * Every write here is audited, reordering included. That differs from the
 * recommendations above, where a reorder is deliberately silent: this list is
 * short and refreshed as a whole, so the order it was left in is part of what
 * changed between two consultations rather than an incidental nudge.
 */
export const addPantryEssentialAction = async (
  _previous: PantryFormState,
  formData: FormData,
): Promise<PantryFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const result = await addPantryEssential(actor, patientId, {
    item: field(formData, "item"),
    why: field(formData, "why"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "pantry.added", {
    type: "pantry_essential",
    id: result.data.id,
    label: result.data.item,
  });
  revalidatePatient(patientId);
  return { error: null };
};

export const updatePantryEssentialAction = async (
  _previous: PantryFormState,
  formData: FormData,
): Promise<PantryFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "pantryEssential", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const result = await updatePantryEssential(actor, id, {
    item: field(formData, "item"),
    why: field(formData, "why"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "pantry.updated", {
    type: "pantry_essential",
    id,
    label: result.data.item,
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const movePantryEssentialAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "pantryEssential", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const direction = field(formData, "direction") === "up" ? "up" : "down";
  const result = await movePantryEssential(actor, id, direction);
  if (result.ok) {
    await audit(operator, "pantry.reordered", {
      type: "pantry_essential",
      id,
      label: result.data.item,
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

export const archivePantryEssentialAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "pantryEssential", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePantryEssential(actor, id, archived);
  if (result.ok) {
    await audit(operator, archived ? "pantry.archived" : "pantry.restored", {
      type: "pantry_essential",
      id,
      label: result.data.item,
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

export const deletePantryEssentialAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "pantryEssential", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const removed = await deletePantryEssential(actor, id);
  if (removed.ok) {
    await audit(operator, "pantry.deleted", {
      type: "pantry_essential",
      id,
      label: field(formData, "item"),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * The meal journal — § 5's loop, and the learnings it leaves behind.
 *
 * Transcription and answer are two separate moments and two separate actions:
 * she logs the meal from the WhatsApp thread, and writes the feedback later,
 * often in a batch at the end of the week. `writeMealFeedbackAction` carries
 * both the feedback and the learning because that is the pass she makes over an
 * entry — reading it, answering it, and noting what it taught her, in one go.
 *
 * The audit distinguishes writing feedback from clearing it: "answered" is the
 * fact the journal, and later the patient link, read off an entry, so losing it
 * is a change worth its own row.
 */
const summarise = (description: string) =>
  description.length > 60 ? `${description.slice(0, 60)}…` : description;

export const addMealEntryAction = async (
  _previous: MealFormState,
  formData: FormData,
): Promise<MealFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const result = await addMealEntry(actor, patientId, {
    eatenOn: field(formData, "eatenOn"),
    slot: asMealSlot(field(formData, "slot")),
    description: field(formData, "description"),
    patientComment: field(formData, "patientComment"),
    feedback: field(formData, "feedback"),
    learning: field(formData, "learning"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "meal.logged", {
    type: "meal_entry",
    id: result.data.id,
    label: summarise(result.data.description),
    detail: result.data.eatenOn,
  });
  revalidatePatient(patientId);
  return { error: null };
};

/** The transcription itself — the meal, its day, its slot, their comment. */
export const updateMealEntryAction = async (
  _previous: MealFormState,
  formData: FormData,
): Promise<MealFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "mealEntry", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const result = await updateMealEntry(actor, id, {
    eatenOn: field(formData, "eatenOn"),
    slot: asMealSlot(field(formData, "slot")),
    description: field(formData, "description"),
    patientComment: field(formData, "patientComment"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "meal.updated", {
    type: "meal_entry",
    id,
    label: summarise(result.data.description),
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

/** Her answer, and what the meal taught her — the second pass over an entry. */
export const writeMealFeedbackAction = async (
  _previous: MealFormState,
  formData: FormData,
): Promise<MealFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "mealEntry", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const feedback = field(formData, "feedback");
  const result = await updateMealEntry(actor, id, {
    feedback,
    learning: field(formData, "learning"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(
    operator,
    feedback.trim() === "" ? "meal.feedback_cleared" : "meal.feedback_written",
    {
      type: "meal_entry",
      id,
      label: summarise(result.data.description),
    },
  );
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const archiveMealEntryAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "mealEntry", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archiveMealEntry(actor, id, archived);
  if (result.ok) {
    await audit(operator, archived ? "meal.archived" : "meal.restored", {
      type: "meal_entry",
      id,
      label: summarise(result.data.description),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

export const deleteMealEntryAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "mealEntry", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const removed = await deleteMealEntry(actor, id);
  if (removed.ok) {
    await audit(operator, "meal.deleted", {
      type: "meal_entry",
      id,
      label: summarise(field(formData, "description")),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * Observations that belong to the patient rather than to one meal.
 *
 * The second write path into the learnings view. Both exist because a week's
 * review produces both kinds, and hanging a week-level remark off whichever
 * entry happened to be on screen would record it as coming from a meal it did
 * not come from.
 */
export const addObservationAction = async (
  _previous: ObservationFormState,
  formData: FormData,
): Promise<ObservationFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const result = await addPatientObservation(actor, patientId, {
    body: field(formData, "body"),
    observedOn: field(formData, "observedOn"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "observation.added", {
    type: "patient_observation",
    id: result.data.id,
    label: summarise(result.data.body),
  });
  revalidatePatient(patientId);
  return { error: null };
};

export const updateObservationAction = async (
  _previous: ObservationFormState,
  formData: FormData,
): Promise<ObservationFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "observation", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const result = await updatePatientObservation(actor, id, {
    body: field(formData, "body"),
    observedOn: field(formData, "observedOn"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "observation.updated", {
    type: "patient_observation",
    id,
    label: summarise(result.data.body),
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const archiveObservationAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "observation", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePatientObservation(actor, id, archived);
  if (result.ok) {
    await audit(
      operator,
      archived ? "observation.archived" : "observation.restored",
      {
        type: "patient_observation",
        id,
        label: summarise(result.data.body),
      },
    );
  }
  revalidatePatient(field(formData, "patientId"));
};

export const deleteObservationAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "observation", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const removed = await deletePatientObservation(actor, id);
  if (removed.ok) {
    await audit(operator, "observation.deleted", {
      type: "patient_observation",
      id,
      label: summarise(field(formData, "body")),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * The steering — § D's priority goals with their check-ins, and § E's standing
 * consigne.
 *
 * A goal is one free text, and the service puts no limit on their number
 * (story 16). The actions do not write the starting point of September.
 */
export const addGoalAction = async (
  _previous: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const result = await addPatientGoal(actor, patientId, {
    title: field(formData, "title"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "goal.added", {
    type: "patient_goal",
    id: result.data.id,
    label: result.data.title,
  });
  revalidatePatient(patientId);
  return { error: null };
};

export const updateGoalAction = async (
  _previous: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "goal", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const result = await updatePatientGoal(actor, id, {
    title: field(formData, "title"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "goal.updated", {
    type: "patient_goal",
    id,
    label: result.data.title,
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const moveGoalAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "goal", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const direction = field(formData, "direction") === "up" ? "up" : "down";
  const result = await movePatientGoal(actor, id, direction);
  if (result.ok) {
    await audit(operator, "goal.reordered", {
      type: "patient_goal",
      id,
      label: result.data.title,
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * « Désactiver » and « Réactiver » share a form. The row stays in the data in
 * both directions, and each one writes its audit event (D-32). The event names
 * `goal.archived` and `goal.restored` are the names of the audit trail since
 * September: they do not change.
 */
export const archiveGoalAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "goal", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePatientGoal(actor, id, archived);
  if (result.ok) {
    await audit(operator, archived ? "goal.archived" : "goal.restored", {
      type: "patient_goal",
      id,
      label: result.data.title,
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

export const deleteGoalAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "goal", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const removed = await deletePatientGoal(actor, id);
  if (removed.ok) {
    await audit(operator, "goal.deleted", {
      type: "patient_goal",
      id,
      label: field(formData, "title"),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

export const addCheckInAction = async (
  _previous: CheckInFormState,
  formData: FormData,
): Promise<CheckInFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "goal", field(formData, "goalId")))) {
    return { error: NO_SUCH_FILE };
  }
  const goalId = field(formData, "goalId");
  const direction = asGoalDirection(field(formData, "direction"));
  const result = await addGoalCheckIn(actor, goalId, {
    checkedOn: field(formData, "checkedOn"),
    direction: direction === "" ? null : direction,
    measure: field(formData, "measure"),
    note: field(formData, "note"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "goal.checked_in", {
    type: "patient_goal_check_in",
    id: result.data.id,
    label: field(formData, "title"),
    detail: result.data.checkedOn,
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const updateCheckInAction = async (
  _previous: CheckInFormState,
  formData: FormData,
): Promise<CheckInFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "goalCheckIn", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const direction = asGoalDirection(field(formData, "direction"));
  const result = await updateGoalCheckIn(actor, id, {
    checkedOn: field(formData, "checkedOn"),
    direction: direction === "" ? null : direction,
    measure: field(formData, "measure"),
    note: field(formData, "note"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "goal.check_in_updated", {
    type: "patient_goal_check_in",
    id,
    label: field(formData, "title"),
    detail: result.data.checkedOn,
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const deleteCheckInAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "goalCheckIn", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const removed = await deleteGoalCheckIn(actor, id);
  if (removed.ok) {
    await audit(operator, "goal.check_in_deleted", {
      type: "patient_goal_check_in",
      id,
      label: field(formData, "title"),
      detail: field(formData, "checkedOn"),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * Her « vu » on a patient's lower weekly score (D-33): it leaves the awaiting
 * count and stays in the trail. The service keeps the first time she saw it,
 * so a second click changes nothing but the button is already gone by then.
 */
export const markCheckInSeenAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "goalCheckIn", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const seen = await markGoalCheckInSeen(actor, id);
  if (seen.ok) {
    await audit(operator, "goal.check_in_seen", {
      type: "patient_goal_check_in",
      id,
      label: field(formData, "title"),
      detail: seen.data.checkedOn,
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * Replacing the consigne archives the one it replaces — that is the service's
 * doing, not a second call from here. Empty fields are how Morgane says there
 * is no standing instruction, so that is a save, not a validation error.
 *
 * Both halves post together because they live on one row: sending only the one
 * she edited would clear the other.
 */
export const setInstructionAction = async (
  _previous: InstructionFormState,
  formData: FormData,
): Promise<InstructionFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const patientId = field(formData, "patientId");
  const body = field(formData, "body");
  const patientBody = field(formData, "patientBody");
  // Read before the write so the trail can tell a clearing from a save on a
  // patient who never had a consigne — the second changes nothing, and an
  // audit row for a non-event is worse than none.
  const before = await getPatientInstruction(actor, patientId);
  const result = await setPatientInstruction(actor, patientId, {
    body,
    patientBody,
  });
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  if (result.data && result.data.id !== before?.id) {
    await audit(operator, "instruction.updated", {
      type: "patient_instruction",
      id: result.data.id,
      label: field(formData, "pseudonym"),
    });
  } else if (!result.data && before) {
    await audit(operator, "instruction.cleared", {
      type: "patient_instruction",
      id: before.id,
      label: field(formData, "pseudonym"),
    });
  }
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

/**
 * The challenge she runs with the patient — one at a time (D-25). Starting one
 * while another runs closes the running one with the outcome picked in the
 * same form, in the service's one transaction; the trail records both halves,
 * because both are things she did.
 */
export const startChallengeAction = async (
  _previous: ChallengeFormState,
  formData: FormData,
): Promise<ChallengeFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const patientId = field(formData, "patientId");
  const posted = optionalField(formData, "closeCurrentWith");
  const closeCurrentWith =
    posted === undefined ? undefined : asChallengeOutcome(posted);
  if (closeCurrentWith === null) {
    return {
      error: "Choisissez comment se termine le challenge en cours.",
      saved: false,
    };
  }
  const result = await startChallenge(
    actor,
    patientId,
    {
      text: field(formData, "text"),
      why: field(formData, "why"),
      startedOn: field(formData, "startedOn"),
    },
    closeCurrentWith,
  );
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  const { created, closed } = result.data;
  if (closed) {
    await audit(operator, "challenge.closed", {
      type: "patient_challenge",
      id: closed.id,
      label: closed.text,
      detail: closed.outcome ?? "",
    });
  }
  await audit(operator, "challenge.started", {
    type: "patient_challenge",
    id: created.id,
    label: created.text,
  });
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

export const updateChallengeAction = async (
  _previous: ChallengeFormState,
  formData: FormData,
): Promise<ChallengeFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "challenge", field(formData, "id")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const id = field(formData, "id");
  const result = await updateChallenge(actor, id, {
    text: field(formData, "text"),
    why: field(formData, "why"),
    startedOn: field(formData, "startedOn"),
  });
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "challenge.updated", {
    type: "patient_challenge",
    id,
    label: result.data.text,
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null, saved: true };
};

export const closeChallengeAction = async (
  _previous: ChallengeFormState,
  formData: FormData,
): Promise<ChallengeFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "challenge", field(formData, "id")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const id = field(formData, "id");
  const outcome = asChallengeOutcome(field(formData, "outcome"));
  if (outcome === null) {
    return {
      error: "Choisissez comment se termine le challenge.",
      saved: false,
    };
  }
  const result = await closeChallenge(actor, id, outcome);
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "challenge.closed", {
    type: "patient_challenge",
    id,
    label: result.data.text,
    detail: outcome,
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null, saved: true };
};

/**
 * Her reply in the patient's general thread (§ 6). The service marks every
 * patient message sent up to the reply read in the same transaction (D-37), so
 * the trail records the reply with how many it answered.
 */
export const replyToPatientAction = async (
  _previous: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const patientId = field(formData, "patientId");
  const result = await replyToPatient(
    actor,
    patientId,
    operator.id,
    field(formData, "body"),
  );
  if (!result.ok) {
    return {
      error:
        result.error === "invalid_input"
          ? "Écrivez une réponse — 2000 caractères au plus."
          : userMessage(result),
      saved: false,
    };
  }
  await audit(operator, "message.replied", {
    type: "patient_message",
    id: result.data.reply.id,
    label: field(formData, "pseudonym"),
    detail:
      result.data.markedRead === 0
        ? undefined
        : `${result.data.markedRead} message(s) marqué(s) comme lu(s)`,
  });
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

/** « Marquer comme lu » — a patient message that needs no answer (D-37). */
export const markMessageReadAction = async (
  _previous: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "message", field(formData, "id")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const id = field(formData, "id");
  const result = await markPatientMessageRead(actor, id);
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "message.marked_read", {
    type: "patient_message",
    id,
    label: field(formData, "pseudonym"),
  });
  revalidatePatient(result.data.patientId);
  return { error: null, saved: true };
};

/**
 * The living summary — § C's synthesis, written for the patient and revised at
 * each consultation. It upserts one row: reading the state before the write is
 * what lets the trail tell a first draft and an edit (both `summary.updated`)
 * from a clearing (`summary.cleared`) and from a no-op that changed nothing.
 */
export const setSummaryAction = async (
  _previous: SummaryFormState,
  formData: FormData,
): Promise<SummaryFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const patientId = field(formData, "patientId");
  const body = field(formData, "body");
  const before = await getPatientSummary(actor, patientId);
  const result = await setPatientSummary(actor, patientId, body);
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  if (result.data && (!before || result.data.body !== before.body)) {
    await audit(operator, "summary.updated", {
      type: "patient_summary",
      id: result.data.id,
      label: field(formData, "pseudonym"),
    });
  } else if (!result.data && before) {
    await audit(operator, "summary.cleared", {
      type: "patient_summary",
      id: before.id,
      label: field(formData, "pseudonym"),
    });
  }
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

/**
 * The "à préparer pour la prochaine consultation" note on the working view.
 * Read-before-write mirrors the instruction and summary actions so a no-op
 * save — same text, or an empty one on a patient who never had a note — does
 * not mint an audit row for a non-event. `consultation-update` owns the
 * clear-and-revise flow; this stays a minimal single-field update.
 */
export const updateNextConsultationPrepAction = async (
  _previous: PrepFormState,
  formData: FormData,
): Promise<PrepFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false, stored: null };
  }
  const patientId = field(formData, "patientId");
  const before = await getPatient(actor, patientId);
  const result = await setPatientNextConsultationPrep(
    actor,
    patientId,
    field(formData, "body"),
  );
  if (!result.ok) {
    return { error: userMessage(result), saved: false, stored: null };
  }
  const changed =
    !before.ok ||
    before.data.nextConsultationPrep !== result.data.nextConsultationPrep;
  if (changed) {
    await audit(operator, "next_consultation_prep.updated", {
      type: "patient",
      id: patientId,
      label: field(formData, "pseudonym"),
    });
  }
  revalidatePatient(patientId);
  return {
    error: null,
    saved: true,
    stored: result.data.nextConsultationPrep,
  };
};

export type ConsultationDateFormState = {
  error: string | null;
  saved: boolean;
};

/**
 * Sets, changes or clears the file's consultation date from the working view
 * (`appointment-date`). An empty `consultationDate` clears it. The service
 * writes the `patient.consultation_date_changed` event with both values.
 */
export const setConsultationDateAction = async (
  _previous: ConsultationDateFormState,
  formData: FormData,
): Promise<ConsultationDateFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  const patientId = field(formData, "patientId");
  if (!(await holdsPatient(actor, patientId))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const saved = await savePatientQuestionnaire(
    actor,
    patientId,
    { consultationDate: field(formData, "consultationDate") },
    actorOf(operator),
  );
  if (!saved.ok) {
    return {
      error:
        saved.error === "invalid_input"
          ? "Cette date n'est pas valide."
          : NO_SUCH_FILE,
      saved: false,
    };
  }
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

/**
 * Giving a recipe, and the weekly refresh that follows it.
 *
 * The refresh is archive-then-assign rather than a replace: what she gave in
 * September stays a row with its date on it, because that trail is the
 * WEEKLY_ADAPTATION record (§ 8) and not an intermediate state.
 *
 * The recipe itself is never edited from here — that is the library's, and one
 * edit there changes the recipe for everyone holding it.
 */
/**
 * The three recipe gestures share this shape: the service writes the whole
 * thing in one unit, and one audit row names both halves — the recipe and the
 * person — because "recette attribuée" on its own does not say to whom.
 */
const recipeAudited = async (
  actor: Actor,
  patientId: string,
  recipes: string,
) => {
  const patient = await getPatient(actor, patientId);
  return patient.ok ? `${recipes} → ${patient.data.pseudonym}` : recipes;
};

export const assignRecipesAction = async (
  _previous: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  // One checkbox per recipe, so the selection arrives as repeats of one name.
  const recipeIds = formData.getAll("recipeId").map(String).filter(Boolean);
  const result = await assignRecipes(actor, patientId, recipeIds, {
    note: field(formData, "note"),
    assignedOn: field(formData, "assignedOn"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "recipe.assigned_bulk", {
    type: "recipe_assignment",
    id: result.data[0]?.id ?? null,
    label: await recipeAudited(actor, patientId, field(formData, "titles")),
    detail: `${result.data.length} attribution(s)`,
  });
  revalidatePatient(patientId);
  return { error: null };
};

/** Writes the library row and the giving in one save — no trip to /recipes. */
export const createAndAssignRecipeAction = async (
  _previous: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const result = await createAndAssignRecipe(
    actor,
    patientId,
    // No tags here on purpose: the in-place form is the fast path, and a
    // recipe written mid-consultation is tagged later from /recipes if at all.
    { title: field(formData, "title"), body: field(formData, "body") },
    {
      note: field(formData, "note"),
      assignedOn: field(formData, "assignedOn"),
    },
  );
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "recipe.created_and_assigned", {
    type: "recipe",
    id: result.data.recipe.id,
    label: await recipeAudited(actor, patientId, result.data.recipe.title),
  });
  revalidatePatient(patientId);
  revalidatePath("/recipes");
  return { error: null };
};

/**
 * Copy, adapt, hand over, and retire what it replaces — for this person only.
 */
export const duplicateAndAssignRecipeAction = async (
  _previous: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const result = await duplicateAndAssignRecipe(
    actor,
    patientId,
    field(formData, "recipeId"),
    { title: field(formData, "title"), body: field(formData, "body") },
    {
      note: field(formData, "note"),
      assignedOn: field(formData, "assignedOn"),
    },
  );
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "recipe.duplicated_as_variant", {
    type: "recipe",
    id: result.data.recipe.id,
    label: await recipeAudited(actor, patientId, result.data.recipe.title),
    detail: `variante de ${field(formData, "originTitle")}`,
  });
  revalidatePatient(patientId);
  revalidatePath("/recipes");
  return { error: null };
};

export const updateRecipeAssignmentAction = async (
  _previous: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "recipeAssignment", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const result = await updateRecipeAssignment(actor, id, {
    note: field(formData, "note"),
    assignedOn: field(formData, "assignedOn"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "recipe.assignment_updated", {
    type: "recipe_assignment",
    id,
    label: field(formData, "title"),
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const archiveRecipeAssignmentAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "recipeAssignment", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archiveRecipeAssignment(actor, id, archived);
  if (result.ok) {
    await audit(
      operator,
      archived ? "recipe.assignment_archived" : "recipe.assignment_restored",
      {
        type: "recipe_assignment",
        id,
        label: field(formData, "title"),
      },
    );
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * The permanent one, for the assignment written against the wrong patient.
 * Archiving is the everyday move — this is not how a recipe rotates out.
 */
export const removeRecipeAssignmentAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "recipeAssignment", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const removed = await removeRecipeAssignment(actor, id);
  if (removed.ok) {
    await audit(operator, "recipe.assignment_removed", {
      type: "recipe_assignment",
      id,
      label: field(formData, "title"),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

export const addNoteAction = async (
  _previous: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const result = await addPatientNote(actor, patientId, {
    occurredAt: field(formData, "occurredAt"),
    title: field(formData, "title"),
    body: field(formData, "body"),
    authorName: operator.name,
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "note.added", {
    type: "note",
    id: result.data.id,
    label: result.data.occurredAt,
  });
  revalidatePatient(patientId);
  return { error: null };
};

/**
 * The "Nouvelle consultation" screen's one save: the note, the check-ins that
 * carry something, and the consigne, the résumé and the preparation note when
 * their text changed — one transaction, one audit row.
 *
 * The five single-field actions above stay exactly as they are; they remain the
 * between-consultation edit path from the patient page. What this adds is the
 * unit: a failure part-way through leaves the record as it was, which is what
 * `recordConsultation` owns, and one `consultation.recorded` row naming the
 * fields that moved, which is what replaces five separate trails for one visit.
 */
export const recordConsultationAction = async (
  _previous: ConsultationFormState,
  formData: FormData,
): Promise<ConsultationFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const patientId = field(formData, "patientId");

  // One hidden id per rendered goal, with its three fields named after it: a
  // goal she left blank still arrives, and the service is what decides it
  // records nothing.
  const checkIns: ConsultationCheckInInput[] = formData
    .getAll("checkInGoalId")
    .map((value) => String(value))
    .map((goalId) => ({
      goalId,
      direction: asGoalDirection(field(formData, `direction-${goalId}`)),
      measure: field(formData, `measure-${goalId}`),
      note: field(formData, `note-${goalId}`),
    }));

  const result = await recordConsultation(actor, patientId, {
    note: {
      occurredAt: field(formData, "occurredAt"),
      title: field(formData, "title"),
      body: field(formData, "body"),
      authorName: operator.name,
    },
    checkIns,
    // A field the form did not send is a field this save must not touch, which
    // `""` would not say — that is how the consigne and the résumé are cleared.
    instruction: optionalField(formData, "instruction"),
    patientInstruction: optionalField(formData, "patientInstruction"),
    summary: optionalField(formData, "summary"),
    nextConsultationPrep: optionalField(formData, "nextConsultationPrep"),
  });

  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }

  await audit(operator, "consultation.recorded", {
    type: "note",
    id: result.data.note.id,
    label: field(formData, "pseudonym"),
    detail: describeConsultation(result.data),
  });
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

export const updateNoteAction = async (
  _previous: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "note", field(formData, "id")))) {
    return { error: NO_SUCH_FILE };
  }
  const id = field(formData, "id");
  const result = await updatePatientNote(actor, id, {
    occurredAt: field(formData, "occurredAt"),
    title: field(formData, "title"),
    body: field(formData, "body"),
  });
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "note.updated", {
    type: "note",
    id,
    label: result.data.occurredAt,
  });
  revalidatePatient(field(formData, "patientId"));
  return { error: null };
};

export const deleteNoteAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "note", field(formData, "id")))) {
    return;
  }
  const id = field(formData, "id");
  const removed = await deletePatientNote(actor, id);
  if (removed.ok) {
    await audit(operator, "note.deleted", {
      type: "note",
      id,
      label: field(formData, "occurredAt"),
    });
  }
  revalidatePatient(field(formData, "patientId"));
};

/**
 * One category of the anamnesis, written on its own. The other eleven are not
 * read and not sent, so a save mid-consultation touches exactly the area she
 * just asked about — and an empty body is how she clears one, which the service
 * turns into the row's deletion.
 */
export const saveAnamnesisAction = async (
  _previous: AnamnesisFormState,
  formData: FormData,
): Promise<AnamnesisFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE };
  }
  const patientId = field(formData, "patientId");
  const category = field(formData, "category");
  const result = await setPatientAnamnesis(
    actor,
    patientId,
    category,
    field(formData, "body"),
  );
  if (!result.ok) {
    return { error: userMessage(result) };
  }
  await audit(operator, "anamnesis.updated", {
    type: "anamnesis",
    id: result.data?.id ?? null,
    label: category,
  });
  revalidatePatient(patientId);
  return { error: null };
};

/**
 * Records that a patient's context left the console. Nothing is written to the
 * patient's record and nothing is revalidated — the only effect is the trail
 * line, which is why this takes the blocks rather than returning anything: what
 * left matters as much as that something left.
 *
 * `recordAuditEvent` swallows its own failures, so a copy is never blocked by a
 * trail that cannot be written (see the service).
 */
/**
 * A server action is an endpoint, so what the client sends is narrowed against
 * the closed list before it reaches the trail — same rule as `asStatus` and
 * `asCategory` above. Filtering the vocabulary rather than the argument also
 * bounds the length and canonicalises the order, so a row reads the same
 * whichever order the checkboxes were clicked in.
 */
const asContextBlocks = (values: readonly string[]): string[] =>
  contextBlocks.filter((block) => values.includes(block));

export const recordContextExportAction = async (
  patientId: string,
  blocks: readonly string[],
) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, patientId))) {
    return;
  }
  const found = await getPatient(actor, patientId);
  await audit(operator, "context.exported", {
    type: "patient",
    id: patientId,
    label: found.ok ? found.data.pseudonym : "",
    detail: asContextBlocks(blocks).join(", "),
  });
};

/**
 * The whole-section saves — one submit per section, against the batch service
 * functions. The single-row actions above stay exactly as they are: they are
 * the quick-add Morgane uses from a phone between two patients, and the
 * patient-loop writes through them too.
 */
export type SectionSaveState = { error: string | null; saved: boolean };

/**
 * Read the submitted rows out of a section form.
 *
 * Every row emits one input per field — including an empty `row-id` for a row
 * the operator just added — so `getAll` hands back each column in DOM order
 * and the columns line up index for index. That is what lets the order of the
 * rows in the form *be* the order she chose, with no index bookkeeping in the
 * field names and nothing that breaks when a row is removed from the middle.
 */
const sectionRows = <TField extends string>(
  formData: FormData,
  fields: readonly TField[],
): Record<TField, string>[] => {
  const columns = new Map<TField, string[]>(
    fields.map((name) => [
      name,
      formData.getAll(`row-${name}`).map((value) => String(value)),
    ]),
  );
  const height = Math.min(
    ...fields.map((name) => columns.get(name)?.length ?? 0),
  );
  return Array.from({ length: height }, (_unused, index) =>
    Object.fromEntries(
      fields.map((name) => [name, columns.get(name)?.[index] ?? ""]),
    ),
  ) as Record<TField, string>[];
};

/** An id is only an id once there is one — a new row submits an empty string. */
const rowId = (value: string) => (value.length > 0 ? value : undefined);

/**
 * The ids the editor was seeded with. Only these may be archived by the save,
 * so a row added through the quick-add form beside the open editor — or by
 * another operator — survives a submit that never saw it.
 */
const seededIds = (formData: FormData) =>
  formData.getAll("seeded-id").map((value) => String(value));

/**
 * A write that fails inside the transaction throws rather than returning a
 * `Result`, and an uncaught throw here reaches the error boundary and takes the
 * operator's whole unsaved section with it. Caught so it renders in the
 * section's own error slot instead, with the rows still on screen.
 */
const failedSave = (cause: unknown): SectionSaveState => {
  console.error("[patients] section save failed", cause);
  return {
    error:
      "L'enregistrement a échoué et rien n'a été modifié. Réessayez ; vos lignes sont toujours là.",
    saved: false,
  };
};

/** How the save reads in the journal: the counts, in the console's language. */
const countsSummary = (counts: SectionSaveCounts) =>
  [
    counts.added > 0 ? `${counts.added} ajoutée(s)` : null,
    counts.updated > 0 ? `${counts.updated} modifiée(s)` : null,
    counts.archived > 0 ? `${counts.archived} archivée(s)` : null,
    counts.reordered > 0 ? `${counts.reordered} déplacée(s)` : null,
  ]
    .filter((part) => part !== null)
    .join(", ") || "aucun changement";

export const saveRecommendationSectionAction = async (
  formData: FormData,
): Promise<SectionSaveState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const patientId = field(formData, "patientId");
  const rows = sectionRows(formData, ["id", "category", "title", "detail"]);

  let result;
  try {
    result = await savePatientRecommendations(
      actor,
      patientId,
      rows.map((row) => ({
        id: rowId(row.id),
        category: asCategory(row.category),
        title: row.title,
        detail: row.detail,
      })),
      seededIds(formData),
    );
  } catch (cause) {
    return failedSave(cause);
  }
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "recommendation.batch_saved", {
    type: "patient",
    id: patientId,
    label: field(formData, "pseudonym"),
    detail: countsSummary(result.data),
  });
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

export const saveSupplementSectionAction = async (
  formData: FormData,
): Promise<SectionSaveState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const patientId = field(formData, "patientId");
  const rows = sectionRows(formData, [
    "id",
    "name",
    "dose",
    "timing",
    "reason",
  ]);

  let result;
  try {
    result = await savePatientSupplements(
      actor,
      patientId,
      rows.map((row) => ({
        id: rowId(row.id),
        name: row.name,
        dose: row.dose,
        timing: row.timing,
        reason: row.reason,
      })),
      seededIds(formData),
    );
  } catch (cause) {
    return failedSave(cause);
  }
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "supplement.batch_saved", {
    type: "patient",
    id: patientId,
    label: field(formData, "pseudonym"),
    detail: countsSummary(result.data),
  });
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

export const savePantrySectionAction = async (
  formData: FormData,
): Promise<SectionSaveState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const patientId = field(formData, "patientId");
  const rows = sectionRows(formData, ["id", "item", "why"]);

  let result;
  try {
    result = await savePantryEssentials(
      actor,
      patientId,
      rows.map((row) => ({
        id: rowId(row.id),
        item: row.item,
        why: row.why,
      })),
      seededIds(formData),
    );
  } catch (cause) {
    return failedSave(cause);
  }
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "pantry.batch_saved", {
    type: "patient",
    id: patientId,
    label: field(formData, "pseudonym"),
    detail: countsSummary(result.data),
  });
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

/**
 * Her documents and links on the patient's page. A file has already reached
 * the store when this runs — the widget uploaded it under a grant — so this
 * records it, and the service checks what landed before the row exists.
 */
export const addDocumentLinkAction = async (
  _previous: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const patientId = field(formData, "patientId");
  const result = await addPatientDocumentLink(
    actor,
    patientId,
    {
      title: field(formData, "title"),
      url: field(formData, "url"),
      tag: asDocumentTag(field(formData, "tag")),
      ...attachmentFrom(formData),
    },
    operator.email,
  );
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "document.added", {
    type: "patient_document",
    id: result.data.id,
    label: result.data.title,
    detail: "link",
  });
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

export const addDocumentFileAction = async (
  _previous: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsPatient(actor, field(formData, "patientId")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  if (!fileStoreReady()) {
    return {
      error: "Aucun stockage de fichiers n’est configuré sur ce déploiement.",
      saved: false,
    };
  }
  const patientId = field(formData, "patientId");
  const result = await addPatientDocumentFile(
    actor,
    patientId,
    {
      title: field(formData, "title"),
      key: field(formData, "key"),
      tag: asDocumentTag(field(formData, "tag")),
      ...attachmentFrom(formData),
    },
    operator.email,
  );
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "document.added", {
    type: "patient_document",
    id: result.data.id,
    label: result.data.title,
    detail: result.data.mime ?? "file",
  });
  revalidatePatient(patientId);
  return { error: null, saved: true };
};

export const updateDocumentAction = async (
  _previous: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "document", field(formData, "id")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const id = field(formData, "id");
  const result = await updatePatientDocument(actor, id, {
    title: field(formData, "title"),
    tag: asDocumentTag(field(formData, "tag")),
    ...attachmentFrom(formData),
  });
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "document.updated", {
    type: "patient_document",
    id,
    label: result.data.title,
  });
  revalidatePatient(result.data.patientId);
  return { error: null, saved: true };
};

/** A removed file leaves the store first; the trail records it only then. */
export const removeDocumentAction = async (
  _previous: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  if (!(await holdsRecord(actor, "document", field(formData, "id")))) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  fileStoreReady();
  const id = field(formData, "id");
  const result = await removePatientDocument(actor, id);
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  await audit(operator, "document.removed", {
    type: "patient_document",
    id,
    label: result.data.title,
  });
  revalidatePatient(result.data.patientId);
  return { error: null, saved: true };
};
