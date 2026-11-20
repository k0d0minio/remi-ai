"use server";

import { revalidatePath } from "next/cache";
import { validateProtocol } from "@remi/services/server";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

/**
 * « Valider les recommandations » (story 20). The service copies the live
 * protocol into the next version and writes the audit event (D-32). It also
 * checks the actor: only the practitioner who holds the file may validate
 * (D-27). An admin's read-only open is refused there, as a missing file.
 */
export const validateProtocolAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  const id = String(formData.get("id") ?? "");
  const result = await validateProtocol(actor, id, {
    id: operator.id,
    email: operator.email,
    name: operator.name,
  });
  if (!result.ok) {
    console.error("[protocol] the recommendations were not validated", {
      patient: id,
      error: result.error,
      message: result.message,
    });
  }
  revalidatePath(`/patients/${id}`);
};
