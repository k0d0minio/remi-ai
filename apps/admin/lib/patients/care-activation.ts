"use server";

import { revalidatePath } from "next/cache";
import { activateCare, sendActivationEmail } from "@remi/services/server";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";
import { mailerReady } from "@/lib/mailer";
import { activationEmailInput } from "@/lib/patients/activation-email-input";

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
 *
 * After a successful activation, and only then, « Votre espace REMI est
 * prêt » goes to the patient (stories 19 and 22). A second call sends
 * nothing. A send that fails never undoes the activation and is not an error
 * of this action: the service records the reason, and the action card of the
 * active file shows it with « Renvoyer l'e-mail ».
 */
export const activateCareAction = async (
  _previous: ActivateCareState,
  formData: FormData,
): Promise<ActivateCareState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  const id = String(formData.get("id") ?? "");
  const practitioner = {
    id: operator.id,
    email: operator.email,
    name: operator.name,
  };
  const result = await activateCare(actor, id, practitioner);
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
  if (!result.data.alreadyActive) {
    try {
      // Registers the mailer of this deployment, if it has one. The service
      // records `no_mailer` when it has none.
      mailerReady();
      const email = await sendActivationEmail(
        actor,
        id,
        practitioner,
        activationEmailInput("activation"),
      );
      if (!email.ok) {
        console.error("[care-activation] the activation e-mail was not sent", {
          patient: id,
          error: email.error,
          message: email.message,
        });
      }
    } catch (cause) {
      // The care is active. A fault of the send must not read as a failed
      // activation: the card shows that no e-mail went out.
      console.error("[care-activation] the activation e-mail threw", {
        patient: id,
        cause: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }
  revalidatePath(`/patients/${id}`);
  revalidatePath("/patients");
  return { error: null };
};
