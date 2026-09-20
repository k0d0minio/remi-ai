/**
 * The runtime half of the recipe vocabulary — isomorphic, so the console's
 * variant form and the service that writes the variant agree on one rule
 * rather than each carrying its own copy of it.
 */

/** The title cap, mirrored from the `recipeFields` schema in `db/services/recipes/`. */
const MAX_TITLE = 140;

/** What a duplicate is called before she renames it. */
export const VARIANT_SUFFIX = " (variante)";

/**
 * The title a duplicate opens with.
 *
 * Two rules, and both exist because the form pre-fills what the service will
 * accept: the suffix never stacks, so duplicating a variant of a variant still
 * reads « … (variante) » rather than repeating itself; and the result always
 * fits `MAX_TITLE`, because `maxLength` on an input truncates nothing that was
 * put there as a default value — it would simply be refused on save.
 */
export const variantTitle = (title: string) => {
  const base = title.endsWith(VARIANT_SUFFIX)
    ? title.slice(0, -VARIANT_SUFFIX.length)
    : title;
  return `${base.slice(0, MAX_TITLE - VARIANT_SUFFIX.length)}${VARIANT_SUFFIX}`;
};

/**
 * § 7's four answers, as the patient gives them: « J'aime », « Pas pour moi »,
 * « Trop long », « À refaire ».
 *
 * A closed set, because the point of the answer is that the next propositions
 * can read it — « ce qui a été essayé, apprécié, refusé » is a query, not
 * prose. The keys are stable ASCII because they are what the assignment row
 * stores; Morgane's French lives in the console's `vocabulary.ts` and the
 * patient's in each locale dictionary, so rewording either is an edit there
 * and never a migration.
 *
 * `would_repeat` is « À refaire », and it doubles as the favourite: the shelf
 * the old version called « Mes recettes préférées » is this answer, read back.
 * A second flag would let a recipe be a favourite and not worth repeating,
 * which is a distinction nobody asked for and two things to keep in step.
 */
export const recipeResponses = [
  "liked",
  "not_for_me",
  "too_long",
  "would_repeat",
] as const;

export type RecipeResponse = (typeof recipeResponses)[number];

/** The answer that is also the favourite — named, so no call site spells it. */
export const FAVOURITE_RESPONSE: RecipeResponse = "would_repeat";
