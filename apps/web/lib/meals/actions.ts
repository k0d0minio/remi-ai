"use server";

import {
  patientActor,
  planPatientMeal,
  suggestPlannedMeal,
} from "@remi/services/server";
import {
  checkPlannedMealText,
  isLocale,
  type MealSuggestion,
} from "@remi/services/shared";
import { aiReady } from "@/lib/ai";
import { patientLanding, requirePatient } from "@/lib/patient-auth/session";
import type { PlanMealError, PlanMealState } from "./state";

/**
 * The home page's save of a typed meal (stories 28 and 31). A public endpoint:
 * the text and the locale are caller input, and the patient's id comes from
 * the session, never from the page. The typed text is patient data: no line of
 * this file logs it.
 *
 * REMI's answer follows the save (REM-102). The meal is recorded first: a
 * failed answer never removes it.
 */

const failed = (error: PlanMealError): PlanMealState => ({
  status: "error",
  error,
});

/**
 * REMI's answer, or null. With no key, `aiReady()` registers no adapter and
 * the service answers `unavailable`, with the alerts of the gate.
 */
const suggestionFor = async (
  patientId: string,
  meal: string,
): Promise<MealSuggestion | null> => {
  try {
    aiReady();
    const suggested = await suggestPlannedMeal(
      patientActor(patientId),
      patientId,
      meal,
    );
    if (suggested.ok) {
      return suggested.data;
    }
    console.error("[meals] no suggestion", { error: suggested.error });
  } catch (error) {
    // The name only: a message can quote the meal.
    console.error("[meals] the suggestion failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
  }
  return null;
};

export const planMealAction = async (
  _previous: PlanMealState,
  formData: FormData,
): Promise<PlanMealState> => {
  const locale = formData.get("locale");
  if (typeof locale !== "string" || !isLocale(locale)) {
    return failed("unavailable");
  }
  const account = await requirePatient(locale);
  // The layout stops a patient before activation. An action is reachable
  // without the layout, so it checks again (story 31, criterion 7).
  if ((await patientLanding(account)) !== "home") {
    return failed("unavailable");
  }

  const checked = checkPlannedMealText(formData.get("meal"));
  if (!checked.ok) {
    return failed(checked.error);
  }

  const patientId = account.patientProfileId;
  const result = await planPatientMeal(
    patientActor(patientId),
    patientId,
    checked.text,
  );
  if (!result.ok) {
    if (result.error === "rate_limited") {
      return failed("daily_limit");
    }
    console.error("[meals] the meal was not saved", { error: result.error });
    return failed("unavailable");
  }

  return {
    status: "saved",
    meal: { id: result.data.id, description: result.data.description },
    suggestion: await suggestionFor(patientId, result.data.description),
  };
};
