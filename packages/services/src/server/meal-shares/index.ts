/**
 * The table of the meal shares, as a setting that the console corrects
 * (REM-197). With no setting, the code default applies
 * (`defaultMealShareTable` of `shared/meal-shares`).
 *
 * The table is one value of `app_settings`: the JSON of the whole table. It
 * holds no patient data. It applies to each patient file, so one practitioner
 * who corrects it changes the meal targets of each file.
 *
 * - `mealShareTable` is the read of a product call (the recipe generation):
 *   one read of the database, and no actor.
 * - The three other functions are the console's. Each checks that the caller
 *   holds a console role (D-27). Each change writes an audit event (D-32).
 *
 * A stored value that is not a valid table is never used: the code default
 * applies, and the console says so.
 */
import type { OperatorRole } from "../../db/models/operator";
import {
  clearAppSetting,
  getAppSetting,
  setAppSetting,
} from "../../db/services/app-settings";
import { recordAuditEvent } from "../../db/services/audit";
import {
  defaultMealShareTable,
  mealShareChanges,
  parseMealShareTable,
  type MealShareTable,
} from "../../shared/meal-shares";
import { operatorRoles } from "../../shared/operator";
import { err, ok, type Result } from "../../shared/result";
import type { Id } from "../../types";

/** The key of the table in `app_settings`. */
export const MEAL_SHARES_SETTING_KEY = "meals.shares";

/** The console account that asks. The service reads its role, never a flag. */
export type MealSharesOperator = {
  id: Id;
  email: string;
  name: string;
  role: OperatorRole;
};

export type MealShareSetting = {
  /** The table that a meal target uses now. */
  table: MealShareTable;
  source: "default" | "setting";
  /** Who set the value and when. Null for the code default. */
  setByName: string | null;
  setAt: Date | null;
  /** True when a stored value was not a valid table: the default applies. */
  storedValueRefused: boolean;
};

type Stored = { value: string; updatedByName: string; updatedAt: Date };

const defaultSetting = (storedValueRefused: boolean): MealShareSetting => ({
  table: defaultMealShareTable,
  source: "default",
  setByName: null,
  setAt: null,
  storedValueRefused,
});

const settingOf = (stored: Stored | null): MealShareSetting => {
  if (!stored) {
    return defaultSetting(false);
  }
  let value: unknown;
  try {
    value = JSON.parse(stored.value);
  } catch {
    return defaultSetting(true);
  }
  const parsed = parseMealShareTable(value);
  if (!parsed.ok) {
    return defaultSetting(true);
  }
  return {
    table: parsed.table,
    source: "setting",
    setByName: stored.updatedByName,
    setAt: stored.updatedAt,
    storedValueRefused: false,
  };
};

/**
 * The table for a product call: the setting, then the code default. One read
 * of the database. It checks no actor: the table holds no patient data.
 */
export const mealShareTable = async (): Promise<MealShareTable> =>
  settingOf(await getAppSetting(MEAL_SHARES_SETTING_KEY)).table;

const NO_ROLE = err(
  "not_permitted",
  "only a console account reads or changes the meal shares",
);

const hasConsoleRole = (operator: MealSharesOperator) =>
  (operatorRoles as readonly string[]).includes(operator.role);

const actorOf = (operator: MealSharesOperator) => ({
  id: operator.id,
  email: operator.email,
  name: operator.name,
});

/** The table in use, with where it comes from, for the console page. */
export const getMealShareSetting = async (
  operator: MealSharesOperator,
): Promise<Result<MealShareSetting>> =>
  hasConsoleRole(operator)
    ? ok(settingOf(await getAppSetting(MEAL_SHARES_SETTING_KEY)))
    : NO_ROLE;

/**
 * Store a corrected table. The value is refused unless it is a whole table,
 * each weight is a whole number from 1 to 100, and each column of the
 * reference day gives 100. A table equal to the table in use changes nothing
 * and writes no event, unless it replaces a stored value that was refused.
 */
export const setMealShareTable = async (
  operator: MealSharesOperator,
  value: unknown,
): Promise<Result<MealShareSetting>> => {
  if (!hasConsoleRole(operator)) {
    return NO_ROLE;
  }
  const parsed = parseMealShareTable(value);
  if (!parsed.ok) {
    const first = parsed.problems[0];
    if (first?.type === "reference_total") {
      return err(
        "invalid_input",
        "each column of the reference day must give 100",
      );
    }
    if (first?.type === "out_of_range") {
      return err(
        "invalid_input",
        "each meal share is a whole number from 1 to 100",
      );
    }
    return err("invalid_input", "the meal share table is not complete");
  }
  const before = settingOf(await getAppSetting(MEAL_SHARES_SETTING_KEY));
  const changes = mealShareChanges(before.table, parsed.table);
  if (changes.length === 0 && !before.storedValueRefused) {
    return ok(before);
  }
  const { setting } = await setAppSetting(
    MEAL_SHARES_SETTING_KEY,
    JSON.stringify(parsed.table),
    { id: operator.id, name: operator.name },
  );
  await recordAuditEvent({
    actor: actorOf(operator),
    action: "meal_shares.set",
    targetType: "setting",
    targetId: MEAL_SHARES_SETTING_KEY,
    targetLabel: "meal shares",
    detail: JSON.stringify({ changes }),
  });
  return ok(settingOf(setting));
};

/**
 * Remove the setting: the code default applies again. With no setting,
 * nothing changes and no event is written.
 */
export const resetMealShareTable = async (
  operator: MealSharesOperator,
): Promise<Result<MealShareSetting>> => {
  if (!hasConsoleRole(operator)) {
    return NO_ROLE;
  }
  const stored = await getAppSetting(MEAL_SHARES_SETTING_KEY);
  if (stored) {
    const before = settingOf(stored);
    await clearAppSetting(MEAL_SHARES_SETTING_KEY);
    await recordAuditEvent({
      actor: actorOf(operator),
      action: "meal_shares.reset",
      targetType: "setting",
      targetId: MEAL_SHARES_SETTING_KEY,
      targetLabel: "meal shares",
      detail: JSON.stringify({
        changes: mealShareChanges(before.table, defaultMealShareTable),
      }),
    });
  }
  return ok(defaultSetting(false));
};
