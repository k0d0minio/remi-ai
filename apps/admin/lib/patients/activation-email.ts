"use server";

import { revalidatePath } from "next/cache";
import { sendActivationEmail } from "@remi/services/server";
import { userMessage } from "@remi/services/shared";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";
import { mailerReady } from "@/lib/mailer";
import { activationEmailInput } from "@/lib/patients/activation-email-input";

export type ResendActivationEmailState = { error: string | null };

/**
 * « Renvoyer l'e-mail » (story 19): the practitioner sends « Votre espace
 * REMI est prêt » again after a send that did not go out. The service checks
 * the actor: only the practitioner who holds the file may send (D-27), and an
 * admin's read-only open is refused there, as a missing file. The service
 * refuses when the audit trail shows a sent e-mail: the e-mail goes out once.
 *
 * A send that fails again is not an error of this action. The service
 * records the reason, and the card shows it after the revalidation.
 */
export const resendActivationEmailAction = async (
  _previous: ResendActivationEmailState,
  formData: FormData,
): Promise<ResendActivationEmailState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  // Registers the mailer of this deployment, if it has one. The service asks
  // the seam and records `no_mailer` when it has none.
  mailerReady();
  const id = String(formData.get("id") ?? "");
  const result = await sendActivationEmail(
    actor,
    id,
    { id: operator.id, email: operator.email, name: operator.name },
    activationEmailInput("resend"),
  );
  revalidatePath(`/patients/${id}`);
  if (!result.ok) {
    console.error("[care-activation] the activation e-mail was not sent again", {
      patient: id,
      error: result.error,
      message: result.message,
    });
    return { error: userMessage(result) };
  }
  return { error: null };
};
