"use server";

import {
  patientActor,
  patientLandingFor,
  planPatientMeal,
} from "@remi/services/server";
import { checkPlannedMealText, isLocale } from "@remi/services/shared";
import { requirePatient } from "@/lib/patient-auth/session";
import type { PlanMealError, PlanMealState } from "./state";

/**
 * The home page's save of a typed meal (stories 28 and 31). A public endpoint:
 * the text and the locale are caller input, and the patient's id comes from
 * the session, never from the page. The typed text is patient data: no line of
 * this file logs it.
 *
 * The suggestion plugs in here: `meal-improvement/meal-suggestion` reads the
 * saved entry after `planPatientMeal` and adds its answer to the state.
 */

const failed = (error: PlanMealError): PlanMealState => ({
  status: "error",
  error,
});

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
  if (patientLandingFor(account) !== "home") {
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
  };
};
