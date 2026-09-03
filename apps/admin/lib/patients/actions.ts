"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addPantryEssential,
  addPatientNote,
  addPatientRecommendation,
  archivePantryEssential,
  archivePatientRecommendation,
  archiveRecipeAssignment,
  assignRecipe,
  createPatient,
  deletePatient,
  deletePantryEssential,
  deletePatientNote,
  deletePatientRecommendation,
  getPatient,
  movePantryEssential,
  movePatientRecommendation,
  patientLinkEmail,
  regenerateShareToken,
  removeRecipeAssignment,
  sendEmail,
  updatePantryEssential,
  updatePatient,
  updatePatientNote,
  updatePatientRecommendation,
  updateRecipeAssignment,
  type PatientInput,
} from "@remi/services/server";
import {
  appHref,
  consentChannels,
  cookingAffinities,
  isLocale,
  patientSexes,
  patientStatuses,
  recommendationCategories,
  type ConsentChannel,
  type CookingAffinity,
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
export type PantryFormState = { error: string | null };
export type AssignmentFormState = { error: string | null };
export type NoteFormState = { error: string | null };
export type ShareFormState = { error: string | null; sent: boolean };

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

const asStatus = (value: string): PatientStatus =>
  (patientStatuses as readonly string[]).includes(value)
    ? (value as PatientStatus)
    : "active";

const asSex = (value: string): PatientSex =>
  (patientSexes as readonly string[]).includes(value)
    ? (value as PatientSex)
    : "unspecified";

/** `""` is a real answer here — it is how Morgane clears a recorded channel. */
const asConsentChannel = (value: string): ConsentChannel | "" =>
  (consentChannels as readonly string[]).includes(value)
    ? (value as ConsentChannel)
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
