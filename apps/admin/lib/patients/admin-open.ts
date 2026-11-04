"use server";

import { redirect } from "next/navigation";
import { adminOpenablePatient } from "@remi/services/server";
import { audit } from "@/lib/audit";
import { setOpenGrantCookie } from "@/lib/auth/cookie";
import { requireActor, requireAdmin } from "@/lib/auth/session";

export type AdminOpenState = { error: string | null };

/** One line, as the journal shows it. */
const REASON_MAX = 200;

/**
 * An admin opens a file of another practitioner (story 3, D-27). The reason is
 * one line and required. The action writes `patient.admin_opened` with the
 * reason, then sets the grant cookie: the file reads, read-only, for four
 * hours. A practitioner never reaches this: `requireAdmin` sends it home, and
 * the service refuses a non-admin actor again.
 */
export const openPatientFileAction = async (
  _previous: AdminOpenState,
  formData: FormData,
): Promise<AdminOpenState> => {
  const operator = await requireAdmin();
  const actor = await requireActor();
  const id = String(formData.get("patientId") ?? "");
  const reason = String(formData.get("reason") ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (reason === "") {
    return { error: "Indiquez le motif de l'accès." };
  }
  if (reason.length > REASON_MAX) {
    return { error: `Le motif tient en ${REASON_MAX} caractères au plus.` };
  }
  const file = await adminOpenablePatient(actor, id);
  if (!file.ok) {
    return { error: "Ce dossier patient est introuvable." };
  }
  await audit(operator, "patient.admin_opened", {
    type: "patient",
    id: file.data.id,
    label: file.data.pseudonym,
    detail: reason,
  });
  await setOpenGrantCookie(operator.id, file.data.id);
  redirect(`/patients/${file.data.id}`);
};
