"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addPatientRecommendation,
  createPatient,
  deletePatient,
  deletePatientRecommendation,
  regenerateShareToken,
  updatePatient,
  updatePatientRecommendation,
  type PatientInput,
} from "@remi/services/server";
import {
  isLocale,
  patientStatuses,
  recommendationCategories,
  type PatientStatus,
  type RecommendationCategory,
} from "@remi/services/shared";
import { requireOperator } from "@/lib/auth/session";

/**
 * Every action re-asserts the operator session before touching anything: the
 * layout guards what renders, an action is an endpoint of its own. Validation
 * lives in the service layer — these collect the form, narrow the enums, and
 * surface the service's `Result` message for the form to render.
 */

export type PatientFormState = { error: string | null; saved: boolean };
export type RecommendationFormState = { error: string | null };

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

const asStatus = (value: string): PatientStatus =>
  (patientStatuses as readonly string[]).includes(value)
    ? (value as PatientStatus)
    : "active";

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
    objective: field(formData, "objective"),
    constraints: field(formData, "constraints"),
    preferences: field(formData, "preferences"),
    anamnesis: field(formData, "anamnesis"),
  };
};

export const savePatientAction = async (
  _previous: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> => {
  await requireOperator();
  const id = field(formData, "id");
  const input = patientInputFrom(formData);

  if (!id) {
    const created = await createPatient(input);
    if (!created.ok) {
      return { error: created.message, saved: false };
    }
    revalidatePath("/patients");
    redirect(`/patients/${created.data.id}`);
  }

  const updated = await updatePatient(id, {
    ...input,
    status: asStatus(field(formData, "status")),
  });
  if (!updated.ok) {
    return { error: updated.message, saved: false };
  }
  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  return { error: null, saved: true };
};

export const deletePatientAction = async (formData: FormData) => {
  await requireOperator();
  const id = field(formData, "id");
  await deletePatient(id);
  revalidatePath("/patients");
  redirect("/patients");
};

export const regenerateShareTokenAction = async (formData: FormData) => {
  await requireOperator();
  const id = field(formData, "id");
  await regenerateShareToken(id);
  revalidatePath(`/patients/${id}`);
};

export const addRecommendationAction = async (
  _previous: RecommendationFormState,
  formData: FormData,
): Promise<RecommendationFormState> => {
  await requireOperator();
  const patientId = field(formData, "patientId");
  const result = await addPatientRecommendation(patientId, {
    category: asCategory(field(formData, "category")),
    title: field(formData, "title"),
    detail: field(formData, "detail"),
  });
  if (!result.ok) {
    return { error: result.message };
  }
  revalidatePath(`/patients/${patientId}`);
  return { error: null };
};

export const updateRecommendationAction = async (
  _previous: RecommendationFormState,
  formData: FormData,
): Promise<RecommendationFormState> => {
  await requireOperator();
  const result = await updatePatientRecommendation(field(formData, "id"), {
    category: asCategory(field(formData, "category")),
    title: field(formData, "title"),
    detail: field(formData, "detail"),
  });
  if (!result.ok) {
    return { error: result.message };
  }
  revalidatePath(`/patients/${field(formData, "patientId")}`);
  return { error: null };
};

export const deleteRecommendationAction = async (formData: FormData) => {
  await requireOperator();
  await deletePatientRecommendation(field(formData, "id"));
  revalidatePath(`/patients/${field(formData, "patientId")}`);
};
