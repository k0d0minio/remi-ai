"use server";

import { revalidatePath } from "next/cache";
import { patientOf, updatePatientMealConfiguration } from "@remi/services/server";
import {
  userMessage,
  type MealConfiguration,
  type MealConfigurationChange,
} from "@remi/services/shared";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export type MealConfigurationSaveState =
  | { error: null; configuration: MealConfiguration }
  | { error: string; configuration: null };

const NO_SUCH_FILE = "Ce dossier patient est introuvable.";
const NOT_SAVED =
  "L'enregistrement a échoué. Rien n'a été enregistré : réessayez.";

/**
 * Saves one change of « Repas » (REM-68, REM-70): the switch of a meal, the
 * orientation of a meal, the fasting option, or Morgane's default table. The
 * service checks the change and the actor (D-27) and writes the audit event
 * (D-32). A refused change writes nothing.
 */
export const updateMealConfigurationAction = async (
  patientId: string,
  change: MealConfigurationChange,
): Promise<MealConfigurationSaveState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  if (!(await patientOf(actor, patientId, "write")).ok) {
    return { error: NO_SUCH_FILE, configuration: null };
  }
  let result;
  try {
    result = await updatePatientMealConfiguration(
      actor,
      patientId,
      { id: operator.id, email: operator.email, name: operator.name },
      change,
    );
  } catch (cause) {
    console.error("[meal-configuration] the save failed", cause);
    return { error: NOT_SAVED, configuration: null };
  }
  if (!result.ok) {
    console.error("[meal-configuration] the save was refused", {
      patient: patientId,
      error: result.error,
      message: result.message,
    });
    return {
      error: result.error === "not_found" ? NO_SUCH_FILE : userMessage(result),
      configuration: null,
    };
  }
  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
  return { error: null, configuration: result.data };
};
