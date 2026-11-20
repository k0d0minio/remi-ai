"use server";

import { revalidatePath } from "next/cache";
import { resetMealShareTable, setMealShareTable } from "@remi/services/server";
import { userMessage, type MealShareTable } from "@remi/services/shared";
import { requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

/**
 * The actions of the page « Parts des repas » (REM-197). Each one checks the
 * console session again: an action is an endpoint of its own. The service
 * checks the role, validates the table and writes the audit event of a change
 * itself (`meal_shares.set`, `meal_shares.reset`), so no action calls
 * `audit()` here.
 *
 * The table changes the meal targets of each patient file. Thus a save
 * revalidates the layout: each open file reads the new table.
 */

export type MealSharesSaveState =
  | { error: null; table: MealShareTable; source: "default" | "setting" }
  | { error: string; table: null; source: null };

const NOT_SAVED =
  "L'enregistrement a échoué. Rien n'a été enregistré : réessayez.";

const refused = (error: string): MealSharesSaveState => ({
  error,
  table: null,
  source: null,
});

/** `value` comes from the browser: the service reads it as an untyped value. */
export const saveMealSharesAction = async (
  value: unknown,
): Promise<MealSharesSaveState> => {
  const operator = await requireOperator();
  ensureDatabase();
  let result;
  try {
    result = await setMealShareTable(operator, value);
  } catch (cause) {
    console.error("[meal-shares] the save failed", cause);
    return refused(NOT_SAVED);
  }
  if (!result.ok) {
    return refused(userMessage(result));
  }
  revalidatePath("/", "layout");
  return { error: null, table: result.data.table, source: result.data.source };
};

export const resetMealSharesAction = async (): Promise<MealSharesSaveState> => {
  const operator = await requireOperator();
  ensureDatabase();
  let result;
  try {
    result = await resetMealShareTable(operator);
  } catch (cause) {
    console.error("[meal-shares] the reset failed", cause);
    return refused(NOT_SAVED);
  }
  if (!result.ok) {
    return refused(userMessage(result));
  }
  revalidatePath("/", "layout");
  return { error: null, table: result.data.table, source: result.data.source };
};
