"use server";

import { revalidatePath } from "next/cache";
import { validateEnergyTarget } from "@remi/services/server";
import { userMessage } from "@remi/services/shared";
import type { CalculationDetailState } from "@/components/patients/calculation-detail";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

/** A list that has no choice yet posts this value. It reads as null. */
const UNSET = "unset";

const choiceField = (formData: FormData, name: string) => {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" || value === UNSET ? null : value;
};

/**
 * An empty field is null. Text that is no number is `NaN`: the service
 * refuses it. A typed « − 300 » or « + 300 » reads as the number.
 */
const numberField = (formData: FormData, name: string) => {
  const value = String(formData.get(name) ?? "")
    .replace(/\s/g, "")
    .replace("−", "-")
    .replace(",", ".");
  return value === "" ? null : Number(value);
};

/**
 * « Valider » of the calorie target (story 9, REM-52). The service checks the
 * actor: only the practitioner who holds the file may validate (D-27), and an
 * admin's read-only open is refused there, as a missing file. The service
 * takes the estimate from the row, computes the target from what was typed,
 * writes the validated columns and writes the audit event with the goal, the
 * situation, the estimate and the target (D-32). It changes no estimate.
 */
export const validateEnergyTargetAction = async (
  _previous: CalculationDetailState,
  formData: FormData,
): Promise<CalculationDetailState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  const id = String(formData.get("id") ?? "");
  const result = await validateEnergyTarget(
    actor,
    id,
    {
      goal: choiceField(formData, "goal"),
      specialSituation: choiceField(formData, "specialSituation"),
      entry: choiceField(formData, "entry"),
      amount: numberField(formData, "amount"),
    },
    { id: operator.id, email: operator.email, name: operator.name },
  );
  if (!result.ok) {
    console.error("[energy-target] the calorie target was not validated", {
      patient: id,
      error: result.error,
      message: result.message,
    });
    return { error: userMessage(result) };
  }
  revalidatePath(`/patients/${id}`);
  return { error: null };
};
