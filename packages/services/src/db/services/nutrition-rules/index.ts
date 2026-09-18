import { z } from "zod";
import {
  nutritionRuleKinds,
  type NutritionRuleKind,
  type NutritionRuleStatus,
} from "../../../shared/nutrition-rules";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { NutritionRule } from "../../models/nutrition-rule";

/**
 * The nutrition corpus — Morgane's own knowledge, written once and looked up by
 * tag. Two halves live here and they answer to different callers:
 *
 *   the console  authors, tags, validates, revises and archives
 *   a prompt     asks `retrieveNutritionRules` for the rules that apply
 *
 * The second half only ever sees `validated` rows that are neither superseded
 * nor archived. That is brainstorm § 6's « puis de les valider avant
 * intégration » expressed as a query rather than as a habit, and it is why
 * there is no flag anywhere to bypass it.
 *
 * Tags carry no taxonomy, exactly as the recipe library's do: normalised —
 * trimmed, lowercased, deduped — so « Saison » and « saison » are one tag, and
 * then left alone. `listNutritionRuleTags` reports what the corpus actually
 * carries rather than a vocabulary invented here.
 */

const corpus = () => getDatabase().collection<NutritionRule>("nutrition_rules");

const uuidSchema = z.uuid();

const MAX_TAGS = 8;

/**
 * The retrieval cap, as a name rather than a number at a call site: it is a
 * token budget for the block a prompt pastes, so the prompt that will do the
 * pasting imports this constant instead of repeating an 8 that then drifts.
 *
 * `limit` may lower it and may not raise it — a caller cannot widen a budget
 * it does not own.
 */
export const NUTRITION_RULE_RETRIEVAL_LIMIT = 8;

/** The corpus is tens of rows; one read serves every filter below. */
const PAGE = 500;

/**
 * Normalising inside the schema rather than at the call sites is what makes the
 * cap meaningful: eight tags means eight distinct tags, counted after dedupe.
 */
const tagsSchema = z
  .array(z.string())
  .transform((tags) => [
    ...new Set(
      tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag !== ""),
    ),
  ])
  .refine((tags) => tags.length <= MAX_TAGS, `at most ${MAX_TAGS} tags`)
  .refine(
    (tags) => tags.every((tag) => tag.length <= 32),
    "a tag is at most 32 characters",
  );

const ruleFields = z.object({
  title: z.string().trim().min(1, "a title is required").max(140),
  body: z
    .string()
    .trim()
    .min(1, "a rule needs a body — this is the text a prompt will quote")
    .max(8000),
  tags: tagsSchema,
  kind: z.enum(nutritionRuleKinds),
});

export type NutritionRuleInput = {
  title?: string;
  body?: string;
  tags?: readonly string[];
  kind?: string;
};

/** What the console's list is looking at. Superseded and archived are opt-in. */
export type NutritionRuleShelf = "current" | "superseded" | "archived";

export type NutritionRuleQuery = {
  tag?: string;
  kind?: NutritionRuleKind;
  status?: NutritionRuleStatus;
  search?: string;
  shelf?: NutritionRuleShelf;
};

const isCurrent = (rule: NutritionRule) =>
  rule.supersededBy === null && rule.archivedAt === null;

/** Most recently changed first — she edits what she is about to hand out. */
const byRecency = (a: NutritionRule, b: NutritionRule) =>
  b.updatedAt.getTime() - a.updatedAt.getTime();

const all = async (): Promise<readonly NutritionRule[]> => {
  const page = await corpus().findMany({}, { limit: PAGE });
  return [...page.items];
};

const onShelf = (rule: NutritionRule, shelf: NutritionRuleShelf) => {
  if (shelf === "superseded") {
    return rule.supersededBy !== null;
  }
  if (shelf === "archived") {
    return rule.archivedAt !== null && rule.supersededBy === null;
  }
  return isCurrent(rule);
};

/**
 * The corpus as the console lists it. Filtering happens here rather than at the
 * seam for the same reason the recipe library's does: the seam speaks
 * equality-and-limit, this is tens of rows, and pushing an array-contains down
 * would tie every adapter to Postgres.
 */
export const listNutritionRules = async (
  query?: NutritionRuleQuery,
): Promise<readonly NutritionRule[]> => {
  const tag = query?.tag?.trim().toLowerCase() ?? "";
  const search = query?.search?.trim().toLowerCase() ?? "";
  const shelf = query?.shelf ?? "current";

  return (await all())
    .filter((rule) => onShelf(rule, shelf))
    .filter((rule) => tag === "" || rule.tags.includes(tag))
    .filter((rule) => !query?.kind || rule.kind === query.kind)
    .filter((rule) => !query?.status || rule.status === query.status)
    .filter(
      (rule) => search === "" || rule.title.toLowerCase().includes(search),
    )
    .sort(byRecency);
};

/**
 * Every tag in use across the corpus in force, alphabetical. The filter is
 * built from this rather than from a stored vocabulary, so a tag exists exactly
 * as long as a rule carries it — nothing to prune, no empty taxonomy.
 */
export const listNutritionRuleTags = async (): Promise<readonly string[]> => {
  const current = (await all()).filter(isCurrent);
  return [...new Set(current.flatMap((rule) => rule.tags))].sort();
};

export const getNutritionRule = async (
  id: Id,
): Promise<Result<NutritionRule>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such rule");
  }
  const rule = await corpus().findById(id);
  return rule ? ok(rule) : err("not_found", "no such rule");
};

/** Always `draft`, always version 1. Validating is a separate, human act. */
export const createNutritionRule = async (
  input: NutritionRuleInput,
): Promise<Result<NutritionRule>> => {
  const parsed = ruleFields
    .partial({ tags: true, kind: true })
    .safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  return ok(
    await corpus().insert({
      title: parsed.data.title,
      body: parsed.data.body,
      tags: parsed.data.tags ?? [],
      kind: parsed.data.kind ?? "principle",
      status: "draft",
      version: 1,
      validatedBy: null,
      validatedAt: null,
      supersededBy: null,
      archivedAt: null,
    }),
  );
};

/**
 * `revised` says which of the two things happened, because they are different
 * events and the caller records a different audit row for each.
 */
export type NutritionRuleEdit = {
  rule: NutritionRule;
  /** True when the edit opened a new version instead of changing this one. */
  revised: boolean;
};

/**
 * Editing splits on whether anyone has agreed to the wording yet.
 *
 * A `draft` is changed in place — nothing has trusted it, so there is no
 * history worth keeping. A `validated` rule is never overwritten: the edit
 * writes a NEW draft at `version + 1` and points the old row's `supersededBy`
 * at it, so what was in force, and until when, stays readable.
 *
 * Between the two, neither row is retrievable — the old one is superseded and
 * the new one is a draft. That gap is the gate doing its job: a rule under
 * revision is a rule not currently agreed.
 */
export const updateNutritionRule = async (
  id: Id,
  input: NutritionRuleInput,
): Promise<Result<NutritionRuleEdit>> => {
  const existing = await getNutritionRule(id);
  if (!existing.ok) {
    return err(existing.error, existing.message);
  }
  const rule = existing.data;
  if (rule.supersededBy !== null) {
    return err(
      "invalid_input",
      "this version was replaced — edit the current one",
    );
  }
  if (rule.archivedAt !== null) {
    return err("invalid_input", "restore this rule before editing it");
  }

  const parsed = ruleFields.partial().safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }

  if (rule.status === "draft") {
    const updated = await corpus().update(id, { ...parsed.data });
    return updated
      ? ok({ rule: updated, revised: false })
      : err("not_found", "no such rule");
  }

  const revision = await corpus().insert({
    title: parsed.data.title ?? rule.title,
    body: parsed.data.body ?? rule.body,
    tags: parsed.data.tags ?? rule.tags,
    kind: parsed.data.kind ?? rule.kind,
    status: "draft",
    version: rule.version + 1,
    validatedBy: null,
    validatedAt: null,
    supersededBy: null,
    archivedAt: null,
  });
  await corpus().update(id, { supersededBy: revision.id });
  return ok({ rule: revision, revised: true });
};

/**
 * The one act that puts a wording in front of a prompt, and the only way a row
 * ever becomes retrievable.
 *
 * There is no un-validate: withdrawing a rule is `archiveNutritionRule`, and
 * changing its wording is an edit, which opens a new draft. Un-validating in
 * place would leave the corpus with no record that the wording was ever agreed.
 */
export const validateNutritionRule = async (
  id: Id,
  validatedBy: Id,
): Promise<Result<NutritionRule>> => {
  const existing = await getNutritionRule(id);
  if (!existing.ok) {
    return err(existing.error, existing.message);
  }
  const rule = existing.data;
  if (rule.status === "validated") {
    return err("invalid_input", "this rule is already validated");
  }
  if (rule.supersededBy !== null) {
    return err(
      "invalid_input",
      "this version was replaced — validate the current one",
    );
  }
  if (rule.archivedAt !== null) {
    return err("invalid_input", "restore this rule before validating it");
  }

  const updated = await corpus().update(id, {
    status: "validated",
    validatedBy,
    validatedAt: new Date(),
  });
  return updated ? ok(updated) : err("not_found", "no such rule");
};

/**
 * Out of the corpus and out of retrieval, without losing the row. There is no
 * delete counterpart on purpose: a rule a patient was told is part of the
 * record of what they were told.
 */
export const archiveNutritionRule = async (
  id: Id,
  archived: boolean,
): Promise<Result<NutritionRule>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such rule");
  }
  const updated = await corpus().update(id, {
    archivedAt: archived ? new Date() : null,
  });
  return updated ? ok(updated) : err("not_found", "no such rule");
};

export type NutritionRuleLineage = {
  /** The version this one replaced, if it replaced one. */
  previous: NutritionRule | null;
  /** The version that replaced this one, if it has been replaced. */
  next: NutritionRule | null;
};

/**
 * A rule's neighbours in its revision chain, so the console can say what this
 * wording came from and what replaced it. The backward link is a scan rather
 * than a column: pointing forward is what the write already does, and a second
 * pointer would be a second thing to keep true.
 */
export const getNutritionRuleLineage = async (
  id: Id,
): Promise<NutritionRuleLineage> => {
  const rules = await all();
  const rule = rules.find((candidate) => candidate.id === id) ?? null;
  return {
    previous: rules.find((candidate) => candidate.supersededBy === id) ?? null,
    next: rule?.supersededBy
      ? (rules.find((candidate) => candidate.id === rule.supersededBy) ?? null)
      : null,
  };
};

export type NutritionRuleRetrieval = {
  /** The recommendation categories, the meal's context — whatever applies. */
  tags: readonly string[];
  /** Narrow to some kinds; omitted means every kind. */
  kinds?: readonly NutritionRuleKind[];
  /** Lowers `NUTRITION_RULE_RETRIEVAL_LIMIT`; it can never raise it. */
  limit?: number;
};

const overlap = (rule: NutritionRule, wanted: ReadonlySet<string>) =>
  rule.tags.filter((tag) => wanted.has(tag)).length;

/**
 * The block a prompt pastes: the rules that apply, most relevant first, capped.
 *
 * Relevance is tag overlap and nothing cleverer — the epic rules out embeddings
 * and vector search, and a corpus this size does not need them. A rule sharing
 * no tag with the query is never returned: retrieval must not pad a prompt with
 * nutrition that has nothing to do with the question.
 *
 * The sort is TOTAL — overlap, then how recently the wording was agreed, then
 * the id — so the same query returns the same block every time. A prompt whose
 * context reshuffles between two identical calls is one nobody can debug.
 */
export const retrieveNutritionRules = async (
  query: NutritionRuleRetrieval,
): Promise<readonly NutritionRule[]> => {
  const wanted = new Set(
    query.tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag !== ""),
  );
  if (wanted.size === 0) {
    return [];
  }
  const kinds = query.kinds ? new Set<string>(query.kinds) : null;
  const cap = Math.max(
    0,
    Math.min(
      query.limit ?? NUTRITION_RULE_RETRIEVAL_LIMIT,
      NUTRITION_RULE_RETRIEVAL_LIMIT,
    ),
  );

  return (await all())
    .filter((rule) => rule.status === "validated" && isCurrent(rule))
    .filter((rule) => !kinds || kinds.has(rule.kind))
    .map((rule) => ({ rule, score: overlap(rule, wanted) }))
    .filter((scored) => scored.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.rule.validatedAt?.getTime() ?? 0) -
          (a.rule.validatedAt?.getTime() ?? 0) ||
        a.rule.id.localeCompare(b.rule.id),
    )
    .slice(0, cap)
    .map((scored) => scored.rule);
};
