"use server";

import { revalidatePath } from "next/cache";
import { patientOf, setRetentionHold } from "@remi/services/server";
import { canManageOperators } from "@remi/services/shared";
import { requireOperator } from "@/lib/auth/session";

/**
 * Sets or clears the retention hold on a file (`inactive-account-deletion`).
 * The hold stops the inactivity sweep: no notice, no deletion. Only an owner
 * may set it, and only on a file they hold (D-27). The page shows the control
 * to an owner only. This action checks both again, because an action is an
 * endpoint of its own. The service writes the audit event.
 */
export const setRetentionHoldAction = async (formData: FormData) => {
  const operator = await requireOperator();
  if (!canManageOperators(operator.role)) {
    return;
  }
  const id = String(formData.get("id") ?? "");
  if (!(await patientOf(operator.id, id)).ok) {
    return;
  }
  const held = formData.get("held") === "1";
  const result = await setRetentionHold(id, held, {
    id: operator.id,
    email: operator.email,
    name: operator.name,
  });
  if (!result.ok) {
    console.error("[retention] the hold was not changed", {
      patient: id,
      message: result.message,
    });
  }
  revalidatePath(`/patients/${id}`);
};
