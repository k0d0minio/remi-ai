"use server";

import { revalidatePath } from "next/cache";
import {
  deleteLifestyleAdvice,
  patientOf,
  savePatientLifestyleAdvices,
  setLifestyleAdviceDisabled,
} from "@remi/services/server";
import {
  isLifestyleAdviceKey,
  lifestyleAdviceFaults,
  userMessage,
  type LifestyleAdviceDraft,
  type LifestyleAdviceEdit,
} from "@remi/services/shared";
import { lifestyleAdviceFaultMessage } from "@/components/patients/lifestyle-advice-labels";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export type LifestyleAdviceState = {
  error: string | null;
  saved: boolean;
};

const NO_SUCH_FILE = "Ce dossier patient est introuvable.";
const NOT_SAVED =
  "L'enregistrement a échoué. Rien n'a été enregistré : vos champs sont intacts, réessayez.";
const NOT_DONE = "L'action a échoué. Rien n'a changé, réessayez.";

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

const texts = (formData: FormData, name: string) =>
  formData
    .getAll(name)
    .map((value) => (typeof value === "string" ? value : ""));

const revalidate = (patientId: string) => {
  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
};

/**
 * Saves the new advice and the changed advice of « Hygiène de vie » in one act
 * (REM-65). The checks run here first, so that a refused save has a plain
 * message that names the line. The service runs them again, checks the actor
 * (D-27) and writes the audit event (D-32). A refused save writes nothing, and
 * the section keeps what the practitioner typed.
 */
export const saveLifestyleAdviceAction = async (
  formData: FormData,
): Promise<LifestyleAdviceState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  const patientId = text(formData, "patientId");
  if (!(await patientOf(actor, patientId, "write")).ok) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const categories = texts(formData, "new-category");
  const newTexts = texts(formData, "new-text");
  const newDetails = texts(formData, "new-details");
  const added: LifestyleAdviceDraft[] = [];
  for (const [index, category] of categories.entries()) {
    if (!isLifestyleAdviceKey(category)) {
      return { error: NOT_SAVED, saved: false };
    }
    added.push({
      category,
      text: newTexts[index] ?? "",
      details: newDetails[index] ?? "",
    });
  }
  const editTexts = texts(formData, "edit-text");
  const editDetails = texts(formData, "edit-details");
  const edited: LifestyleAdviceEdit[] = texts(formData, "edit-id").map(
    (id, index) => ({
      id,
      text: editTexts[index] ?? "",
      details: editDetails[index] ?? "",
    }),
  );
  const [fault] = lifestyleAdviceFaults(added, edited);
  if (fault) {
    return { error: lifestyleAdviceFaultMessage(fault), saved: false };
  }
  let result;
  try {
    result = await savePatientLifestyleAdvices(
      actor,
      patientId,
      { id: operator.id, email: operator.email, name: operator.name },
      { added, edited },
    );
  } catch (cause) {
    console.error("[lifestyle-advice] the save failed", cause);
    return { error: NOT_SAVED, saved: false };
  }
  if (!result.ok) {
    console.error("[lifestyle-advice] the save was refused", {
      patient: patientId,
      error: result.error,
      message: result.message,
    });
    return {
      error:
        result.error === "conflict"
          ? "Un conseil modifié n'est plus actif dans ce dossier. Rien n'a été enregistré : rechargez la page."
          : userMessage(result),
      saved: false,
    };
  }
  revalidate(patientId);
  return { error: null, saved: true };
};

/** « Désactiver » and « Réactiver » of one advice. The service audits (D-32). */
export const setLifestyleAdviceDisabledAction = async (
  patientId: string,
  adviceId: string,
  disabled: boolean,
): Promise<LifestyleAdviceState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  let result;
  try {
    result = await setLifestyleAdviceDisabled(
      actor,
      adviceId,
      { id: operator.id, email: operator.email, name: operator.name },
      disabled,
    );
  } catch (cause) {
    console.error("[lifestyle-advice] the change of state failed", cause);
    return { error: NOT_DONE, saved: false };
  }
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  revalidate(patientId);
  return { error: null, saved: true };
};

/** « Supprimer » of one advice, active or disabled. The service audits (D-32). */
export const deleteLifestyleAdviceAction = async (
  patientId: string,
  adviceId: string,
): Promise<LifestyleAdviceState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  let result;
  try {
    result = await deleteLifestyleAdvice(actor, adviceId, {
      id: operator.id,
      email: operator.email,
      name: operator.name,
    });
  } catch (cause) {
    console.error("[lifestyle-advice] the delete failed", cause);
    return { error: NOT_DONE, saved: false };
  }
  if (!result.ok) {
    return { error: userMessage(result), saved: false };
  }
  revalidate(patientId);
  return { error: null, saved: true };
};
