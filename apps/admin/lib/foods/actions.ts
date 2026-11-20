"use server";

import { revalidatePath } from "next/cache";
import {
  confirmFoodRecord,
  confirmFoodUnits,
  proposeFirstLot,
  proposeFoodRecord,
} from "@remi/services/server";
import {
  FOOD_UNITS_MAX,
  userMessage,
  type FoodUnit,
} from "@remi/services/shared";
import { NO_AI_MESSAGE } from "@/components/foods/vocabulary";
import { aiReady } from "@/lib/ai";
import { requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

/**
 * The actions of « Aliments » (REM-189, REM-190). The page is open to each
 * console account, and so are its actions: a food record is reference data and
 * holds no patient data. Each action checks the session again, because an
 * action is an endpoint of its own.
 *
 * The service writes the audit event of a proposal and of a confirmation
 * itself (`food_record.proposed`, `food_record.confirmed`,
 * `food_record.units_confirmed`), with the account. No action calls `audit()`.
 *
 * A proposal of REMI is an aid to entry. Only `confirmFoodRecordAction` and
 * `confirmFoodUnitsAction` make a value count, and a person starts them.
 */

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

const fields = (formData: FormData, name: string) =>
  formData.getAll(name).map((value) => String(value));

export type FoodFormState = { error: string | null; saved: string | null };

const refresh = (code: string) => {
  revalidatePath("/aliments");
  revalidatePath(`/aliments/${code}`);
};

/** A person confirms, or corrects and confirms, the record of a food. */
export const confirmFoodRecordAction = async (
  _previous: FoodFormState,
  formData: FormData,
): Promise<FoodFormState> => {
  const operator = await requireOperator();
  ensureDatabase();
  const code = field(formData, "code");
  // The select has no empty value: « aucun rôle » is `none`.
  const role = field(formData, "role");
  const result = await confirmFoodRecord(operator, code, {
    cookable: formData.get("cookable") !== null,
    containsTags: fields(formData, "contains"),
    mayContainTags: fields(formData, "mayContain"),
    role: role === "" || role === "none" ? null : role,
  });
  if (!result.ok) {
    return { error: userMessage(result), saved: null };
  }
  refresh(code);
  return { error: null, saved: "La fiche est confirmée." };
};

/** A French decimal: « 0,92 » and « 0.92 » are the same number. */
const decimal = (text: string) => Number(text.replace(",", "."));

const NOT_A_NUMBER =
  "Un poids ou la densité n'est pas un nombre. Écrivez par exemple 55 ou 0,92.";

/** A person confirms the density and the units of a food. */
export const confirmFoodUnitsAction = async (
  _previous: FoodFormState,
  formData: FormData,
): Promise<FoodFormState> => {
  const operator = await requireOperator();
  ensureDatabase();
  const code = field(formData, "code");

  const densityText = field(formData, "density");
  const densityGPerMl = densityText === "" ? null : decimal(densityText);
  const units: FoodUnit[] = [];
  for (let index = 0; index < FOOD_UNITS_MAX; index += 1) {
    const one = field(formData, `unit-one-${index}`);
    const many = field(formData, `unit-many-${index}`);
    const grams = field(formData, `unit-grams-${index}`);
    // An empty line is no unit. A line with one empty cell goes to the
    // service, which refuses it.
    if (one !== "" || many !== "" || grams !== "") {
      units.push({ one, many: many === "" ? one : many, grams: decimal(grams) });
    }
  }
  if (
    (densityGPerMl !== null && Number.isNaN(densityGPerMl)) ||
    units.some((unit) => Number.isNaN(unit.grams))
  ) {
    return { error: NOT_A_NUMBER, saved: null };
  }

  const result = await confirmFoodUnits(operator, code, {
    densityGPerMl,
    units,
  });
  if (!result.ok) {
    return { error: userMessage(result), saved: null };
  }
  refresh(code);
  return { error: null, saved: "Les unités sont confirmées." };
};

/** REMI proposes the record of one food that has none. */
export const proposeFoodRecordAction = async (
  _previous: FoodFormState,
  formData: FormData,
): Promise<FoodFormState> => {
  const operator = await requireOperator();
  ensureDatabase();
  if (!aiReady()) {
    return { error: NO_AI_MESSAGE, saved: null };
  }
  const code = field(formData, "code");
  const result = await proposeFoodRecord(operator, code);
  if (!result.ok) {
    return { error: userMessage(result), saved: null };
  }
  refresh(code);
  return {
    error: null,
    saved: "REMI a proposé une fiche. Vérifiez-la, puis confirmez-la.",
  };
};

const plural = (count: number, one: string, many: string) =>
  `${count} ${count >= 2 ? many : one}`;

/** REMI proposes a record for each food of the first lot that has none. */
export const proposeFirstLotAction = async (
  _previous: FoodFormState,
  _formData: FormData,
): Promise<FoodFormState> => {
  const operator = await requireOperator();
  ensureDatabase();
  if (!aiReady()) {
    return { error: NO_AI_MESSAGE, saved: null };
  }
  const outcome = await proposeFirstLot(operator);
  revalidatePath("/aliments");
  const parts = [
    `${plural(outcome.proposed, "fiche proposée", "fiches proposées")} par REMI, à confirmer`,
    ...(outcome.alreadyRecorded > 0
      ? [
          `${plural(outcome.alreadyRecorded, "aliment avait", "aliments avaient")} déjà une fiche`,
        ]
      : []),
    ...(outcome.failed > 0
      ? [
          `${plural(outcome.failed, "proposition a échoué", "propositions ont échoué")} : relancez le lot`,
        ]
      : []),
    ...(outcome.notFound.length > 0
      ? [`introuvable dans CIQUAL : ${outcome.notFound.join(", ")}`]
      : []),
  ];
  return { error: null, saved: `${parts.join(" · ")}.` };
};
