"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addGoalCheckIn,
  addMealEntry,
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
  assignRecipe,
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
  getPatient,
  getPatientInstruction,
  movePantryEssential,
  movePatientGoal,
  movePatientRecommendation,
  movePatientSupplement,
  patientLinkEmail,
  regenerateShareToken,
  removeRecipeAssignment,
  sendEmail,
  setPatientAnamnesis,
  setPatientInstruction,
  updateGoalCheckIn,
  updateMealEntry,
  updatePantryEssential,
  updatePatient,
  updatePatientGoal,
  updatePatientNote,
  updatePatientObservation,
  updatePatientRecommendation,
  updatePatientSupplement,
  updateRecipeAssignment,
  type PatientInput,
} from "@remi/services/server";
import {
  appHref,
  consentChannels,
  cookingAffinities,
  goalDirections,
  isLocale,
  mealSlots,
  patientSexes,
  patientStatuses,
  recommendationCategories,
  type ConsentChannel,
  type CookingAffinity,
  type GoalDirection,
  type MealSlot,
  type PatientSex,
  type PatientStatus,
  type RecommendationCategory,
} from "@remi/services/shared";
import { audit } from "@/lib/audit";
import { requireOperator } from "@/lib/auth/session";
import { mailerReady } from "@/lib/mailer";

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

export type PatientFormState = { error: string | null; saved: boolean };
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
export type ShareFormState = { error: string | null; sent: boolean };

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

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

/** `""` is a real answer here — it is how Morgane clears a recorded channel. */
const asConsentChannel = (value: string): ConsentChannel | "" =>
  (consentChannels as readonly string[]).includes(value)
    ? (value as ConsentChannel)
    : "";

/** `""` is a real answer: § D lets a check-in carry a measure and no direction. */
const asGoalDirection = (value: string): GoalDirection | "" =>
  (goalDirections as readonly string[]).includes(value)
    ? (value as GoalDirection)
    : "";

/** `""` is a real answer here too — it is how Morgane clears a recorded one. */
const asCookingAffinity = (value: string): CookingAffinity | "" =>
  (cookingAffinities as readonly string[]).includes(value)
    ? (value as CookingAffinity)
    : "";

const asCategory = (value: string): RecommendationCategory =>
  (recommendationCategories as readonly string[]).includes(value)
    ? (value as RecommendationCategory)
    : "nutrition";

const patientInputFrom = (formData: FormData): PatientInput => {
  const locale = field(formData, "locale");
  return {
    pseudonym: field(formData, "pseudonym"),
    fullName: field(formData, "fullName"),
    email: field(formData, "email"),
    locale: isLocale(locale) ? locale : "fr",
    birthDate: field(formData, "birthDate"),
    sex: asSex(field(formData, "sex")),
    heightCm: field(formData, "heightCm"),
    weightKg: field(formData, "weightKg"),
    objective: field(formData, "objective"),
    dietaryRegime: field(formData, "dietaryRegime"),
    allergies: field(formData, "allergies"),
    intolerances: field(formData, "intolerances"),
    constraints: field(formData, "constraints"),
    preferences: field(formData, "preferences"),
    likesCooking: asCookingAffinity(field(formData, "likesCooking")),
    foodBudget: field(formData, "foodBudget"),
    medications: field(formData, "medications"),
    supplements: field(formData, "supplements"),
    referral: field(formData, "referral"),
    anamnesis: field(formData, "anamnesis"),
    consentDate: field(formData, "consentDate"),
    consentChannel: asConsentChannel(field(formData, "consentChannel")),
  };
};

const revalidatePatient = (id: string) => {
  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  revalidatePath("/");
};

export const savePatientAction = async (
  _previous: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const input = patientInputFrom(formData);

  if (!id) {
    const created = await createPatient(input);
    if (!created.ok) {
      return { error: created.message, saved: false };
    }
    await audit(operator, "patient.created", {
      type: "patient",
      id: created.data.id,
      label: created.data.pseudonym,
    });
    revalidatePath("/patients");
    revalidatePath("/");
    redirect(`/patients/${created.data.id}`);
  }

  const updated = await updatePatient(id, {
    ...input,
    status: asStatus(field(formData, "status")),
  });
  if (!updated.ok) {
    return { error: updated.message, saved: false };
  }
  await audit(operator, "patient.updated", {
    type: "patient",
    id,
    label: updated.data.pseudonym,
  });
  revalidatePatient(id);
  return { error: null, saved: true };
};

export const deletePatientAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const existing = await getPatient(id);
  const removed = await deletePatient(id);
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

export const regenerateShareTokenAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const result = await regenerateShareToken(id);
  if (result.ok) {
    await audit(operator, "share_link.regenerated", {
      type: "patient",
      id,
      label: result.data.pseudonym,
    });
  }
  revalidatePatient(id);
};

/**
 * Emails the patient their own link. Refuses rather than pretending when the
 * deployment cannot send: `consoleMailer` returns a success it did not earn,
 * and repeating that to Morgane is how a patient never gets their link and
 * nobody finds out.
 */
export const emailShareLinkAction = async (
  _previous: ShareFormState,
  formData: FormData,
): Promise<ShareFormState> => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const found = await getPatient(id);
  if (!found.ok) {
    return { error: found.message, sent: false };
  }
  const patient = found.data;
  if (!patient.email) {
    return {
      error: "ce profil n'a pas d'adresse email — ajoutez-la d'abord",
      sent: false,
    };
  }
  if (!mailerReady()) {
    return {
      error:
        "l'envoi d'emails n'est pas configuré sur ce déploiement — copiez le lien et transmettez-le",
      sent: false,
    };
  }

  const url = appHref("web", `/p/${patient.shareToken}`, patient.locale);
  try {
    await sendEmail({
      to: patient.email,
      ...patientLinkEmail({
        name: patient.fullName ?? patient.pseudonym,
        practitionerName: operator.name,
        url,
        locale: patient.locale,
      }),
    });
  } catch (cause) {
    console.error(
      "[share-link] the patient link email could not be sent",
      cause,
    );
    return {
      error: "l'email n'a pas pu être envoyé — réessayez ou copiez le lien",
      sent: false,
    };
  }

  await audit(operator, "share_link.emailed", {
    type: "patient",
    id,
    label: patient.pseudonym,
    detail: patient.email,
  });
  return { error: null, sent: true };
};

export const addRecommendationAction = async (
  _previous: RecommendationFormState,
  formData: FormData,
): Promise<RecommendationFormState> => {
  const operator = await requireOperator();
  const patientId = field(formData, "patientId");
  const result = await addPatientRecommendation(patientId, {
    category: asCategory(field(formData, "category")),
    title: field(formData, "title"),
    detail: field(formData, "detail"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const result = await updatePatientRecommendation(id, {
    category: asCategory(field(formData, "category")),
    title: field(formData, "title"),
    detail: field(formData, "detail"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  await requireOperator();
  const direction = field(formData, "direction") === "up" ? "up" : "down";
  await movePatientRecommendation(field(formData, "id"), direction);
  // Not audited: reordering changes how a protocol reads, never what it says,
  // and a journal full of nudges is a journal nobody reads.
  revalidatePatient(field(formData, "patientId"));
};

export const archiveRecommendationAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePatientRecommendation(id, archived);
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
  const id = field(formData, "id");
  const removed = await deletePatientRecommendation(id);
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
  const patientId = field(formData, "patientId");
  const result = await addPatientSupplement(patientId, {
    name: field(formData, "name"),
    dose: field(formData, "dose"),
    timing: field(formData, "timing"),
    reason: field(formData, "reason"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const result = await updatePatientSupplement(id, {
    name: field(formData, "name"),
    dose: field(formData, "dose"),
    timing: field(formData, "timing"),
    reason: field(formData, "reason"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  await requireOperator();
  const direction = field(formData, "direction") === "up" ? "up" : "down";
  await movePatientSupplement(field(formData, "id"), direction);
  // Not audited, like the recommendations: reordering changes how a protocol
  // reads, never what it prescribes.
  revalidatePatient(field(formData, "patientId"));
};

export const archiveSupplementAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePatientSupplement(id, archived);
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
  const id = field(formData, "id");
  const removed = await deletePatientSupplement(id);
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
  const patientId = field(formData, "patientId");
  const result = await addPantryEssential(patientId, {
    item: field(formData, "item"),
    why: field(formData, "why"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const result = await updatePantryEssential(id, {
    item: field(formData, "item"),
    why: field(formData, "why"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const direction = field(formData, "direction") === "up" ? "up" : "down";
  const result = await movePantryEssential(id, direction);
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
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePantryEssential(id, archived);
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
  const id = field(formData, "id");
  const removed = await deletePantryEssential(id);
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
  const patientId = field(formData, "patientId");
  const result = await addMealEntry(patientId, {
    eatenOn: field(formData, "eatenOn"),
    slot: asMealSlot(field(formData, "slot")),
    description: field(formData, "description"),
    patientComment: field(formData, "patientComment"),
    feedback: field(formData, "feedback"),
    learning: field(formData, "learning"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const result = await updateMealEntry(id, {
    eatenOn: field(formData, "eatenOn"),
    slot: asMealSlot(field(formData, "slot")),
    description: field(formData, "description"),
    patientComment: field(formData, "patientComment"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const feedback = field(formData, "feedback");
  const result = await updateMealEntry(id, {
    feedback,
    learning: field(formData, "learning"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archiveMealEntry(id, archived);
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
  const id = field(formData, "id");
  const removed = await deleteMealEntry(id);
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
  const patientId = field(formData, "patientId");
  const result = await addPatientObservation(patientId, {
    body: field(formData, "body"),
    observedOn: field(formData, "observedOn"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const result = await updatePatientObservation(id, {
    body: field(formData, "body"),
    observedOn: field(formData, "observedOn"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePatientObservation(id, archived);
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
  const id = field(formData, "id");
  const removed = await deletePatientObservation(id);
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
 * The cap on active goals is the service's; these actions surface its refusal
 * rather than repeating the count, so the form and the rule can never disagree.
 */
export const addGoalAction = async (
  _previous: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> => {
  const operator = await requireOperator();
  const patientId = field(formData, "patientId");
  const result = await addPatientGoal(patientId, {
    title: field(formData, "title"),
    baseline: field(formData, "baseline"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const result = await updatePatientGoal(id, {
    title: field(formData, "title"),
    baseline: field(formData, "baseline"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const direction = field(formData, "direction") === "up" ? "up" : "down";
  const result = await movePatientGoal(id, direction);
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
 * Archiving and restoring share a form, and restoring can be refused: the cap
 * counts active goals, so a restore into a full list is the same conflict an
 * add would hit. The refusal is silent here — the list re-renders unchanged,
 * which is what the operator sees — because this form posts without a state.
 */
export const archiveGoalAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archivePatientGoal(id, archived);
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
  const id = field(formData, "id");
  const removed = await deletePatientGoal(id);
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
  const goalId = field(formData, "goalId");
  const direction = asGoalDirection(field(formData, "direction"));
  const result = await addGoalCheckIn(goalId, {
    checkedOn: field(formData, "checkedOn"),
    direction: direction === "" ? null : direction,
    measure: field(formData, "measure"),
    note: field(formData, "note"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const direction = asGoalDirection(field(formData, "direction"));
  const result = await updateGoalCheckIn(id, {
    checkedOn: field(formData, "checkedOn"),
    direction: direction === "" ? null : direction,
    measure: field(formData, "measure"),
    note: field(formData, "note"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const removed = await deleteGoalCheckIn(id);
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
 * Replacing the consigne archives the one it replaces — that is the service's
 * doing, not a second call from here. An empty body is how Morgane says there
 * is no standing instruction, so it is a save, not a validation error.
 */
export const setInstructionAction = async (
  _previous: InstructionFormState,
  formData: FormData,
): Promise<InstructionFormState> => {
  const operator = await requireOperator();
  const patientId = field(formData, "patientId");
  const body = field(formData, "body");
  // Read before the write so the trail can tell a clearing from a save on a
  // patient who never had a consigne — the second changes nothing, and an
  // audit row for a non-event is worse than none.
  const before = await getPatientInstruction(patientId);
  const result = await setPatientInstruction(patientId, body);
  if (!result.ok) {
    return { error: result.message, saved: false };
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
 * Giving a recipe, and the weekly refresh that follows it.
 *
 * The refresh is archive-then-assign rather than a replace: what she gave in
 * September stays a row with its date on it, because that trail is the
 * WEEKLY_ADAPTATION record (§ 8) and not an intermediate state.
 *
 * The recipe itself is never edited from here — that is the library's, and one
 * edit there changes the recipe for everyone holding it.
 */
export const assignRecipeAction = async (
  _previous: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> => {
  const operator = await requireOperator();
  const patientId = field(formData, "patientId");
  const result = await assignRecipe(patientId, field(formData, "recipeId"), {
    note: field(formData, "note"),
    assignedOn: field(formData, "assignedOn"),
  });
  if (!result.ok) {
    return { error: result.message };
  }
  await audit(operator, "recipe.assigned", {
    type: "recipe_assignment",
    id: result.data.id,
    label: field(formData, "title"),
  });
  revalidatePatient(patientId);
  return { error: null };
};

export const updateRecipeAssignmentAction = async (
  _previous: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const result = await updateRecipeAssignment(id, {
    note: field(formData, "note"),
    assignedOn: field(formData, "assignedOn"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archiveRecipeAssignment(id, archived);
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
  const id = field(formData, "id");
  const removed = await removeRecipeAssignment(id);
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
  const patientId = field(formData, "patientId");
  const result = await addPatientNote(patientId, {
    occurredAt: field(formData, "occurredAt"),
    title: field(formData, "title"),
    body: field(formData, "body"),
    authorName: operator.name,
  });
  if (!result.ok) {
    return { error: result.message };
  }
  await audit(operator, "note.added", {
    type: "note",
    id: result.data.id,
    label: result.data.occurredAt,
  });
  revalidatePatient(patientId);
  return { error: null };
};

export const updateNoteAction = async (
  _previous: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const result = await updatePatientNote(id, {
    occurredAt: field(formData, "occurredAt"),
    title: field(formData, "title"),
    body: field(formData, "body"),
  });
  if (!result.ok) {
    return { error: result.message };
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
  const id = field(formData, "id");
  const removed = await deletePatientNote(id);
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
  const patientId = field(formData, "patientId");
  const category = field(formData, "category");
  const result = await setPatientAnamnesis(
    patientId,
    category,
    field(formData, "body"),
  );
  if (!result.ok) {
    return { error: result.message };
  }
  await audit(operator, "anamnesis.updated", {
    type: "anamnesis",
    id: result.data?.id ?? null,
    label: category,
  });
  revalidatePatient(patientId);
  return { error: null };
};
