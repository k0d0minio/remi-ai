"use server";

import { revalidatePath } from "next/cache";
import { acknowledgePatientChanges } from "@remi/services/server";
import { userMessage } from "@remi/services/shared";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export type AcknowledgeChangesState = { error: string | null };

/**
 * « Pris en compte » (story 21): the practitioner marks one patient change, or
 * each open change of the file, as taken into account. The form sends the id
 * of the file, and the id of one change. With no change id, the action closes
 * each open change.
 *
 * The service checks the actor: only the practitioner who holds the file may
 * acknowledge (D-27), and an admin's read-only open is refused there, as a
 * missing file. The service writes the audit event (D-32). No value of a
 * change goes to a log here: the values are health data.
 */
export const acknowledgePatientChangesAction = async (
  _previous: AcknowledgeChangesState,
  formData: FormData,
): Promise<AcknowledgeChangesState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  const id = String(formData.get("id") ?? "");
  const changeId = String(formData.get("changeId") ?? "");
  const result = await acknowledgePatientChanges(
    actor,
    id,
    { id: operator.id, email: operator.email, name: operator.name },
    changeId === "" ? "all" : [changeId],
  );
  revalidatePath(`/patients/${id}`);
  revalidatePath("/patients");
  if (!result.ok) {
    console.error("[patient-changes] the changes were not acknowledged", {
      patient: id,
      error: result.error,
      message: result.message,
    });
    return { error: userMessage(result) };
  }
  return { error: null };
};
