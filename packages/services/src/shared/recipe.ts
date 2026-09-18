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
