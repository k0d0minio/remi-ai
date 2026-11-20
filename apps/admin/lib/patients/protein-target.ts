"use server";

import { revalidatePath } from "next/cache";
import { validateProteinTarget } from "@remi/services/server";
import { userMessage } from "@remi/services/shared";
import type { CalculationDetailState } from "@/components/patients/calculation-detail";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

/** An empty field is null. Text that is no number is `NaN`: the service refuses it. */
const numberField = (formData: FormData, name: string) => {
  const value = String(formData.get(name) ?? "")
    .trim()
    .replace(",", ".");
  return value === "" ? null : Number(value);
};

/**
 * « Valider » of the protein target (story 8, REM-50). The service checks the
 * actor: only the practitioner who holds the file may validate (D-27), and an
 * admin's read-only open is refused there, as a missing file. The service
 * computes the value again from the reference weight and the coefficient,
 * writes the validated columns and writes the audit event (D-32). It changes
 * no weight of the file.
 */
export const validateProteinTargetAction = async (
  _previous: CalculationDetailState,
  formData: FormData,
): Promise<CalculationDetailState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  const id = String(formData.get("id") ?? "");
  const result = await validateProteinTarget(
    actor,
    id,
    {
      referenceWeightKg: numberField(formData, "referenceWeightKg"),
      coefficient: numberField(formData, "coefficient"),
      value: numberField(formData, "value"),
    },
    { id: operator.id, email: operator.email, name: operator.name },
  );
  if (!result.ok) {
    console.error("[protein-target] the protein target was not validated", {
      patient: id,
      error: result.error,
      message: result.message,
    });
    return { error: userMessage(result) };
  }
  revalidatePath(`/patients/${id}`);
  return { error: null };
};
