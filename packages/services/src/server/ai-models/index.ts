/**
 * The model of each AI role, as a setting that an admin changes in the console
 * (Jamie, 2026-11-20). With no setting, the code default of the role applies
 * (`MODELS` of the AI seam).
 *
 * - `roleModel` is the read of a product call: the service that calls the seam
 *   reads the model here, one time, and gives it to `generateJson` in
 *   `options.model`. The seam itself reads no database. No value is kept in
 *   memory, so a change applies to the next call.
 * - The four other functions are the console's. Each checks that the caller
 *   is an admin (D-27), and each change writes an audit event (D-32).
 *
 * A save needs three checks on the provider's catalogue (`ai/model-checks`):
 * the id is listed, the model has structured output, and none of its
 * providers trains on the data. The third is a patient-data rule: the prompt
 * of a product call holds health data. It has no override. With no catalogue,
 * a save is refused.
 */

import { z } from "zod";

import {
  MODELS,
  checkModelForRole,
  generateJson,
  listProviderModels,
  type CatalogueModel,
  type ModelCheck,
  type ModelRole,
} from "../../ai";
import type { OperatorRole } from "../../db/models/operator";
import { aiModelRoles, type ModelTestOutcome } from "../../shared/ai-models";
import {
  clearAppSetting,
  getAppSetting,
  listAppSettings,
  setAppSetting,
} from "../../db/services/app-settings";
import { recordAuditEvent } from "../../db/services/audit";
import { canManageOperators } from "../../shared/operator";
import { err, ok, type Result } from "../../shared/result";
import type { Id } from "../../types";

const isModelRole = (value: string): value is ModelRole =>
  (aiModelRoles as readonly string[]).includes(value);

/** The key of a role in `app_settings`. */
export const aiModelSettingKey = (role: ModelRole) => `ai.model.${role}`;

const MODEL_ID_MAX_LENGTH = 200;

/** The console account that asks. The service reads its role, never a flag. */
export type AiModelsOperator = {
  id: Id;
  email: string;
  name: string;
  role: OperatorRole;
};

export type RoleModel = {
  role: ModelRole;
  /** The model that a call of this role uses now. */
  model: string;
  defaultModel: string;
  source: "default" | "setting";
  /** Who set the value and when. Null for the code default. */
  setByName: string | null;
  setAt: Date | null;
};

type Stored = { value: string; updatedByName: string; updatedAt: Date };

const roleModelOf = (role: ModelRole, stored: Stored | null): RoleModel => {
  const value = stored?.value.trim() ?? "";
  if (!stored || value === "") {
    return {
      role,
      model: MODELS[role],
      defaultModel: MODELS[role],
      source: "default",
      setByName: null,
      setAt: null,
    };
  }
  return {
    role,
    model: value,
    defaultModel: MODELS[role],
    source: "setting",
    setByName: stored.updatedByName,
    setAt: stored.updatedAt,
  };
};

/**
 * The model of a role for a product call: the setting, then the code default.
 * One read of the database. It checks no actor: it returns a model id only.
 */
export const roleModel = async (role: ModelRole): Promise<string> =>
  roleModelOf(role, await getAppSetting(aiModelSettingKey(role))).model;

const NOT_ADMIN = err(
  "not_permitted",
  "only an admin reads or changes the model of an AI role",
);

const isAdmin = (operator: AiModelsOperator) =>
  canManageOperators(operator.role);

/** The three roles with the model in use, in the order of `aiModelRoles`. */
export const listRoleModels = async (
  operator: AiModelsOperator,
): Promise<Result<RoleModel[]>> => {
  if (!isAdmin(operator)) {
    return NOT_ADMIN;
  }
  const rows = await listAppSettings();
  return ok(
    aiModelRoles.map((role) =>
      roleModelOf(
        role,
        rows.find((row) => row.key === aiModelSettingKey(role)) ?? null,
      ),
    ),
  );
};

/**
 * The provider's catalogue for the console page, or null when the list is not
 * available. Admin only, as the page is.
 */
export const listCatalogueModels = async (
  operator: AiModelsOperator,
): Promise<Result<CatalogueModel[] | null>> =>
  isAdmin(operator) ? ok(await listProviderModels()) : NOT_ADMIN;

const refusalOf = (failed: ModelCheck) => {
  if (failed === "not_listed") {
    return err("invalid_input", "the gateway does not list this model");
  }
  if (failed === "no_structured_output") {
    return err("invalid_input", "this model has no structured output");
  }
  return err(
    "invalid_input",
    "the providers of this model may train on the data",
  );
};

type Checked = { role: ModelRole; modelId: string };

const checkedInput = (
  operator: AiModelsOperator,
  role: string,
  modelId: string,
): Result<Checked> => {
  if (!isAdmin(operator)) {
    return NOT_ADMIN;
  }
  if (!isModelRole(role)) {
    return err("invalid_input", "this AI role does not exist");
  }
  const id = modelId.trim();
  if (id === "" || id.length > MODEL_ID_MAX_LENGTH) {
    return err("invalid_input", "a model id is required");
  }
  return ok({ role, modelId: id });
};

const actorOf = (operator: AiModelsOperator) => ({
  id: operator.id,
  email: operator.email,
  name: operator.name,
});

/**
 * Set the model of a role. The save is refused unless the model passes the
 * three checks, and when the catalogue is not available.
 */
export const setRoleModel = async (
  operator: AiModelsOperator,
  role: string,
  modelId: string,
): Promise<Result<RoleModel>> => {
  const input = checkedInput(operator, role, modelId);
  if (!input.ok) {
    return input;
  }
  const catalogue = await listProviderModels();
  if (!catalogue) {
    return err("upstream_failed", "the model list is not available");
  }
  const checked = checkModelForRole(catalogue, input.data.modelId);
  if (!checked.ok) {
    return refusalOf(checked.failed);
  }

  const key = aiModelSettingKey(input.data.role);
  const { setting, previous } = await setAppSetting(key, input.data.modelId, {
    id: operator.id,
    name: operator.name,
  });
  await recordAuditEvent({
    actor: actorOf(operator),
    action: "ai_model.set",
    targetType: "setting",
    targetId: key,
    targetLabel: input.data.role,
    detail: JSON.stringify({
      role: input.data.role,
      from: previous ?? MODELS[input.data.role],
      to: input.data.modelId,
    }),
  });
  return ok(roleModelOf(input.data.role, setting));
};

/**
 * Remove the setting of a role: the code default applies again. With no
 * setting, nothing changes and no event is written.
 */
export const resetRoleModel = async (
  operator: AiModelsOperator,
  role: string,
): Promise<Result<RoleModel>> => {
  if (!isAdmin(operator)) {
    return NOT_ADMIN;
  }
  if (!isModelRole(role)) {
    return err("invalid_input", "this AI role does not exist");
  }
  const key = aiModelSettingKey(role);
  const previous = await clearAppSetting(key);
  if (previous !== null) {
    await recordAuditEvent({
      actor: actorOf(operator),
      action: "ai_model.reset",
      targetType: "setting",
      targetId: key,
      targetLabel: role,
      detail: JSON.stringify({ role, from: previous, to: MODELS[role] }),
    });
  }
  return ok(roleModelOf(role, null));
};

/** A neutral prompt. It holds no patient data, by construction. */
const TEST_PROMPT =
  'Réponds uniquement avec cet objet JSON, sans autre texte : {"ok": true}';

const testSchema = z.object({ ok: z.boolean() });

const TEST_MAX_TOKENS = 256;

/**
 * One small real call to a model, through the seam, as a product call does
 * it: JSON with a schema. It changes no setting and writes no audit event.
 * The outcome is a code: the console writes the French sentence.
 */
export const testRoleModel = async (
  operator: AiModelsOperator,
  role: string,
  modelId: string,
): Promise<Result<ModelTestOutcome>> => {
  const input = checkedInput(operator, role, modelId);
  if (!input.ok) {
    return input;
  }
  const result = await generateJson(TEST_PROMPT, testSchema, {
    role: input.data.role,
    model: input.data.modelId,
    maxTokens: TEST_MAX_TOKENS,
  });
  return ok(result.ok ? "ok" : result.error);
};
