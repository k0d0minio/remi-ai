/**
 * Puts values into a dictionary string's `{placeholder}` slots.
 *
 * It exists because a sentence assembled from fragments in JSX fixes the word
 * order in the component: « Publier le plan de Camille ? » puts the name in the
 * middle. The whole sentence stays in the dictionary, and the values slot into
 * it.
 *
 * An unknown placeholder is left as written rather than blanked — a visible
 * `{name}` in a screenshot is a bug report; a missing subject is a mystery.
 *
 * Imported by path rather than through `./index`, so a client island can use it
 * without pulling the dictionary into the browser bundle.
 */
export const fill = (
  template: string,
  values: Record<string, string | number>,
) =>
  template.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
