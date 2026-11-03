"use server";

import { revalidatePath } from "next/cache";
import { setLeadContacted } from "@remi/services/server";
import { audit } from "@/lib/audit";
import { requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

/**
 * The one write the console makes on a lead: Morgane's mark that she wrote
 * back, or its removal. The action re-asserts the guard: an action is an
 * endpoint of its own.
 */
export const setLeadContactedAction = async (formData: FormData) => {
  const operator = await requireOperator();
  ensureDatabase();

  const id = String(formData.get("id") ?? "");
  const contacted = formData.get("contacted") === "true";
  const result = await setLeadContacted(id, contacted);
  if (result.ok) {
    await audit(operator, contacted ? "lead.contacted" : "lead.reopened", {
      type: "lead",
      id,
      label: result.data.email,
    });
  }
  revalidatePath("/leads");
};
