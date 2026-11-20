"use server";

import {
  isSessionReadError,
  issueMealRetryTicket,
  patientActor,
  planPatientMeal,
  suggestAnotherMeal,
  suggestPlannedMeal,
  type PatientAccount,
} from "@remi/services/server";
import {
  checkPlannedMealText,
  isLocale,
  type Locale,
  type MealSuggestion,
} from "@remi/services/shared";
import { aiReady } from "@/lib/ai";
import { patientLanding, requirePatient } from "@/lib/patient-auth/session";
import type {
  AnotherSuggestionState,
  PlanMealError,
  PlanMealState,
} from "./state";

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
 * The patient of the session, or `null` when the session read failed. The
 * form then says that the service is not available, and the patient keeps
 * their session. With no session, `requirePatient` sends the
 * visitor to the sign-in page, as before: that redirect passes through here.
 */
const patientOrUnavailable = async (
  locale: Locale,
): Promise<PatientAccount | null> => {
  try {
    return await requirePatient(locale);
  } catch (cause) {
    if (isSessionReadError(cause)) {
      return null;
    }
    throw cause;
  }
};

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
  const account = await patientOrUnavailable(locale);
  if (!account) {
    return failed("unavailable");
  }
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

  const suggestion = await suggestionFor(patientId, result.data.description);
  return {
    status: "saved",
    meal: { id: result.data.id, description: result.data.description },
    suggestion,
    retry: suggestion ? issueMealRetryTicket(result.data, suggestion) : null,
  };
};

/**
 * « Une autre suggestion », after « Pas pour moi » (REM-103, story 28). A
 * public endpoint: the ticket is caller input, and the service checks its
 * signature, its patient and its one use. The patient's id comes from the
 * session. A hidden button is not the limit: the service refuses a ticket
 * that was used.
 *
 * The answer of the patient is not recorded: no table and no column holds it.
 */
export const anotherSuggestionAction = async (
  locale: unknown,
  ticket: unknown,
): Promise<AnotherSuggestionState> => {
  if (typeof locale !== "string" || !isLocale(locale)) {
    return { status: "none" };
  }
  const account = await patientOrUnavailable(locale);
  if (!account || (await patientLanding(account)) !== "home") {
    return { status: "none" };
  }
  const patientId = account.patientProfileId;
  try {
    aiReady();
    const suggested = await suggestAnotherMeal(
      patientActor(patientId),
      patientId,
      ticket,
    );
    if (suggested.ok) {
      return { status: "answered", suggestion: suggested.data };
    }
    // The code only: a ticket holds a food name.
    console.error("[meals] no second suggestion", { error: suggested.error });
  } catch (error) {
    console.error("[meals] the second suggestion failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
  }
  return { status: "none" };
};
