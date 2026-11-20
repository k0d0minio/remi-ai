"use server";

import { revalidatePath } from "next/cache";
import { patientOf, savePatientFoodDirectives } from "@remi/services/server";
import {
  foodDirectiveFaults,
  foodDirectiveTermKey,
  foodLimitLevels,
  splitFoodDirectiveTerms,
  type FoodDirectiveDraft,
  type FoodLimitLevel,
} from "@remi/services/shared";
import { foodDirectiveFaultMessage } from "@/components/patients/food-directive-labels";
import { requireActor, requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export type FoodDirectivesSaveState = {
  error: string | null;
  saved: boolean;
};

const NO_SUCH_FILE = "Ce dossier patient est introuvable.";
const NOT_SAVED =
  "L'enregistrement a échoué. Rien n'a été enregistré : vos champs sont intacts, réessayez.";

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

const texts = (formData: FormData, name: string) =>
  formData
    .getAll(name)
    .map((value) => (typeof value === "string" ? value : ""));

const dayOrNull = (value: string | undefined) => {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
};

const levelOrNull = (value: string | undefined): FoodLimitLevel | null =>
  (foodLimitLevels as readonly string[]).includes(value ?? "")
    ? (value as FoodLimitLevel)
    : null;

/**
 * The drafts of the form. The three text fields are the source of the terms:
 * each splits on « ; ». The level of a limit and the period of an eviction
 * come from the rows under the fields, found by the key of their term. A term
 * with no row gets no value: an eviction with no period is then refused, never
 * completed by REMI.
 */
const draftsFrom = (formData: FormData): FoodDirectiveDraft[] => {
  const limitTerms = texts(formData, "limit-term");
  const limitLevels = texts(formData, "limit-level");
  const levelByKey = new Map(
    limitTerms.map((term, index) => [
      foodDirectiveTermKey(term),
      levelOrNull(limitLevels[index]),
    ]),
  );
  const evictionTerms = texts(formData, "exclude-term");
  const starts = texts(formData, "exclude-start");
  const ends = texts(formData, "exclude-end");
  const durables = texts(formData, "exclude-durable");
  const periodByKey = new Map(
    evictionTerms.map((term, index) => [
      foodDirectiveTermKey(term),
      {
        startsOn: dayOrNull(starts[index]),
        endsOn: dayOrNull(ends[index]),
        durable: durables[index] === "1",
      },
    ]),
  );
  const none = { limitLevel: null, startsOn: null, endsOn: null, durable: false };
  return [
    ...splitFoodDirectiveTerms(text(formData, "favour")).map(
      (term): FoodDirectiveDraft => ({ kind: "favour", term, ...none }),
    ),
    ...splitFoodDirectiveTerms(text(formData, "limit")).map(
      (term): FoodDirectiveDraft => ({
        kind: "limit",
        term,
        ...none,
        limitLevel: levelByKey.get(foodDirectiveTermKey(term)) ?? null,
      }),
    ),
    ...splitFoodDirectiveTerms(text(formData, "exclude")).map(
      (term): FoodDirectiveDraft => ({
        kind: "exclude",
        term,
        ...none,
        ...periodByKey.get(foodDirectiveTermKey(term)),
      }),
    ),
  ];
};

/**
 * Saves « À favoriser », « À limiter » and « Éviction totale » (REM-54). The
 * checks run here first, so that a refused save has a plain message that names
 * the term. The service runs them again, checks the actor (D-27) and writes
 * the audit event (D-32). A refused save writes nothing, and the editor keeps
 * what the practitioner typed.
 */
export const saveFoodDirectivesAction = async (
  formData: FormData,
): Promise<FoodDirectivesSaveState> => {
  const operator = await requireOperator();
  const actor = await requireActor();
  ensureDatabase();
  const patientId = text(formData, "patientId");
  if (!(await patientOf(actor, patientId, "write")).ok) {
    return { error: NO_SUCH_FILE, saved: false };
  }
  const drafts = draftsFrom(formData);
  const [fault] = foodDirectiveFaults(drafts);
  if (fault) {
    return { error: foodDirectiveFaultMessage(fault), saved: false };
  }
  let result;
  try {
    result = await savePatientFoodDirectives(
      actor,
      patientId,
      { id: operator.id, email: operator.email, name: operator.name },
      drafts,
      texts(formData, "seeded-id").filter((id) => id !== ""),
    );
  } catch (cause) {
    console.error("[food-directives] the save failed", cause);
    return { error: NOT_SAVED, saved: false };
  }
  if (!result.ok) {
    console.error("[food-directives] the save was refused", {
      patient: patientId,
      error: result.error,
      message: result.message,
    });
    return {
      error: result.error === "not_found" ? NO_SUCH_FILE : NOT_SAVED,
      saved: false,
    };
  }
  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
  return { error: null, saved: true };
};
