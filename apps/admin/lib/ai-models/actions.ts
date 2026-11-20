"use server";

import { revalidatePath } from "next/cache";
import {
  resetRoleModel,
  setRoleModel,
  testRoleModel,
} from "@remi/services/server";
import { userMessage } from "@remi/services/shared";
import {
  NO_KEY_MESSAGE,
  testOutcomeMessages,
} from "@/components/ai-models/vocabulary";
import { aiReady } from "@/lib/ai";
import { requireAdmin } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

/**
 * The actions of the page « Modèles d'IA ». Each one checks the admin again:
 * an action is an endpoint of its own, and the hidden nav row is no control.
 * The service checks the role a third time and writes the audit event of a
 * change itself (`ai_model.set`, `ai_model.reset`), so no action calls
 * `audit()` here.
 *
 * The gateway key stays in the adapter. No action reads it, returns it or
 * logs it.
 */

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

export type ModelSaveState = { error: string | null; saved: string | null };

export const saveRoleModelAction = async (
  _previous: ModelSaveState,
  formData: FormData,
): Promise<ModelSaveState> => {
  const operator = await requireAdmin();
  ensureDatabase();
  // The provider holds the list that the save checks. With no key there is
  // no list, and the service refuses the save.
  aiReady();
  const result = await setRoleModel(
    operator,
    field(formData, "role"),
    field(formData, "model"),
  );
  if (!result.ok) {
    return { error: userMessage(result), saved: null };
  }
  revalidatePath("/ai-models");
  return { error: null, saved: result.data.model };
};

export const resetRoleModelAction = async (
  _previous: ModelSaveState,
  formData: FormData,
): Promise<ModelSaveState> => {
  const operator = await requireAdmin();
  ensureDatabase();
  const result = await resetRoleModel(operator, field(formData, "role"));
  if (!result.ok) {
    return { error: userMessage(result), saved: null };
  }
  revalidatePath("/ai-models");
  return { error: null, saved: result.data.model };
};

export type ModelTestState = {
  /** The model that the call used, and what came back. Null before a test. */
  result: { model: string; ok: boolean; message: string } | null;
};

/** One small real call, with a prompt that holds no patient data. */
export const testRoleModelAction = async (
  _previous: ModelTestState,
  formData: FormData,
): Promise<ModelTestState> => {
  const operator = await requireAdmin();
  const model = field(formData, "model").trim();
  if (!aiReady()) {
    return { result: { model, ok: false, message: NO_KEY_MESSAGE } };
  }
  const outcome = await testRoleModel(operator, field(formData, "role"), model);
  if (!outcome.ok) {
    return { result: { model, ok: false, message: userMessage(outcome) } };
  }
  return {
    result: {
      model,
      ok: outcome.data === "ok",
      message: testOutcomeMessages[outcome.data],
    },
  };
};
