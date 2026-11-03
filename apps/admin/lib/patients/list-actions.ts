"use server";

import { revalidatePath } from "next/cache";
import { setOperatorPatientListSort } from "@remi/services/server";
import { requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

/**
 * Remembers the patient list's order for the signed-in practitioner (story 5).
 * Only their own row: the id comes from the session, never from the form. A
 * preference is no change to a patient file, so it writes no audit event.
 */
export const setPatientListSortAction = async (sort: string): Promise<void> => {
  const operator = await requireOperator();
  ensureDatabase();
  await setOperatorPatientListSort(operator.id, sort);
  revalidatePath("/patients");
};
