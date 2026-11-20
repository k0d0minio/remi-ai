"use server";

import { revalidatePath } from "next/cache";
import { activateCare } from "@remi/services/server";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export type ActivateCareState = { error: string | null };

/**
 * « Activer l'accompagnement » (story 19). The practitioner confirms the
 * recap, and this action runs. The service checks the actor: only the
 * practitioner who holds the file may activate (D-27), and an admin's
 * read-only open is refused there, as a missing file. The service builds the
 * recap again, refuses when a blocker is present, moves the file to
 * « Accompagnement actif » and writes the audit event (D-32).
 *
 * A second call on an active file changes nothing and is not an error: the
 * page then shows the file as active.
 */
export const activateCareAction = async (
  _previous: ActivateCareState,
  formData: FormData,
): Promise<ActivateCareState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  const id = String(formData.get("id") ?? "");
  const result = await activateCare(actor, id, {
    id: operator.id,
    email: operator.email,
    name: operator.name,
  });
  if (!result.ok) {
    console.error("[care-activation] the care was not activated", {
      patient: id,
      error: result.error,
      message: result.message,
    });
    revalidatePath(`/patients/${id}`);
    return {
      error:
        result.error === "conflict"
          ? "L'activation est bloquée. Fermez cette fenêtre et relisez le récapitulatif : il indique ce qui manque."
          : "L'accompagnement n'a pas pu être activé. Réessayez dans un instant.",
    };
  }
  revalidatePath(`/patients/${id}`);
  revalidatePath("/patients");
  return { error: null };
};
