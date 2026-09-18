"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveNutritionRule,
  createNutritionRule,
  updateNutritionRule,
  validateNutritionRule,
} from "@remi/services/server";
import { audit } from "@/lib/audit";
import { requireOperator } from "@/lib/auth/session";

/**
 * The corpus' writes. Same shape as the recipe library's next door: the
 * operator session is re-asserted per action because an action is an endpoint
 * of its own, validation stays in the service, and the audit row is written
 * after the success branch — a refused write is not an action to record.
 *
 * Every action is open to any signed-in operator, `requireOperator` rather than
 * `requireOwner`, exactly as the recipe library is. Validating is the corpus'
 * consequential act, and what makes it accountable is the journal row naming
 * who did it, not a role that would leave Arnaud unable to correct a typo.
 *
 * There is no delete action here and no service function to call: the corpus
 * archives and supersedes, and never removes.
 */

export type RuleFormState = { error: string | null; saved: boolean };

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

/** One comma-separated box, as the library's is — the service normalises it. */
const tagsFrom = (formData: FormData) =>
  field(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");

const revalidateCorpus = (id?: string) => {
  revalidatePath("/knowledge");
  if (id) {
    revalidatePath(`/knowledge/${id}`);
  }
};

/** Lands on the new rule's own page: the next thing she does is validate it. */
export const createRuleAction = async (
  _previous: RuleFormState,
  formData: FormData,
): Promise<RuleFormState> => {
  const operator = await requireOperator();
  const result = await createNutritionRule({
    title: field(formData, "title"),
    body: field(formData, "body"),
    tags: tagsFrom(formData),
    kind: field(formData, "kind"),
  });
  if (!result.ok) {
    return { error: result.message, saved: false };
  }
  await audit(operator, "nutrition_rule.created", {
    type: "nutrition_rule",
    id: result.data.id,
    label: result.data.title,
  });
  revalidateCorpus(result.data.id);
  redirect(`/knowledge/${result.data.id}`);
};

/**
 * Editing a validated rule opens a new version rather than overwriting it, so
 * this may land on a different row than it started from — hence the redirect
 * when the service says it revised. The journal distinguishes the two, because
 * "modifiée" and "nouvelle version" are not the same event.
 */
export const updateRuleAction = async (
  _previous: RuleFormState,
  formData: FormData,
): Promise<RuleFormState> => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const result = await updateNutritionRule(id, {
    title: field(formData, "title"),
    body: field(formData, "body"),
    tags: tagsFrom(formData),
    kind: field(formData, "kind"),
  });
  if (!result.ok) {
    return { error: result.message, saved: false };
  }
  const { rule, revised } = result.data;
  await audit(
    operator,
    revised ? "nutrition_rule.revised" : "nutrition_rule.updated",
    {
      type: "nutrition_rule",
      id: rule.id,
      label: rule.title,
      detail: revised ? `version ${rule.version}` : "",
    },
  );
  revalidateCorpus(id);
  if (revised) {
    revalidateCorpus(rule.id);
    redirect(`/knowledge/${rule.id}`);
  }
  return { error: null, saved: true };
};

export const validateRuleAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const result = await validateNutritionRule(id, operator.id);
  if (result.ok) {
    await audit(operator, "nutrition_rule.validated", {
      type: "nutrition_rule",
      id,
      label: result.data.title,
      detail: `version ${result.data.version}`,
    });
  }
  revalidateCorpus(id);
};

export const archiveRuleAction = async (formData: FormData) => {
  const operator = await requireOperator();
  const id = field(formData, "id");
  const archived = field(formData, "archived") === "true";
  const result = await archiveNutritionRule(id, archived);
  if (result.ok) {
    await audit(
      operator,
      archived ? "nutrition_rule.archived" : "nutrition_rule.restored",
      { type: "nutrition_rule", id, label: result.data.title },
    );
  }
  revalidateCorpus(id);
};
