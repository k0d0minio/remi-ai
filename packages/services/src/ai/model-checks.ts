import type { ModelCheck } from "../shared/ai-models";
import type { CatalogueModel } from "./index";

export type { ModelCheck } from "../shared/ai-models";

/**
 * The rules that a model must pass before an admin sets it for an AI role.
 * This file is pure: it reads the catalogue that the caller loaded.
 *
 * The order is the order of the checks. `may_train` is a patient-data rule:
 * the prompt of a product call holds health data of a patient, so a model
 * whose providers may train on the data is never used. No caller has an
 * override for it.
 *
 * A field that the catalogue did not send fails its check. An unknown value
 * is never read as a pass.
 */

export type ModelCheckResult =
  | { ok: true; model: CatalogueModel }
  | { ok: false; failed: ModelCheck; model: CatalogueModel | null };

const STRUCTURED_OUTPUT_TAG = "structured-output";

/** Every provider of the model must refuse to train on the data. */
const NO_TRAINING_REQUIRED = "all";

/** The checks that a listed model fails, in the order of the type `ModelCheck`. */
export const failedChecks = (model: CatalogueModel): ModelCheck[] => [
  ...(model.tags.includes(STRUCTURED_OUTPUT_TAG)
    ? []
    : (["no_structured_output"] as const)),
  ...(model.noTraining === NO_TRAINING_REQUIRED
    ? []
    : (["may_train"] as const)),
];

/** The first check that the model id fails, or the model when it passes all. */
export const checkModelForRole = (
  catalogue: readonly CatalogueModel[],
  modelId: string,
): ModelCheckResult => {
  const model = catalogue.find((entry) => entry.id === modelId) ?? null;
  if (!model) {
    return { ok: false, failed: "not_listed", model: null };
  }
  const [failed] = failedChecks(model);
  return failed ? { ok: false, failed, model } : { ok: true, model };
};
