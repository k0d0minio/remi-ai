/**
 * Puts values into a dictionary string's `{placeholder}` slots.
 *
 * It exists because word order is not the same in both languages: "Publish
 * Camille's plan?" and "Publier le plan de Camille ?" put the name in different
 * places, so a sentence assembled from fragments in JSX can only be right in
 * one of them. The whole sentence stays in the dictionary, and the values slot
 * into it.
 *
 * An unknown placeholder is left as written rather than blanked — a visible
 * `{name}` in a screenshot is a bug report; a missing subject is a mystery.
 *
 * Imported by path rather than through `./index`, so a client island can use it
 * without pulling both dictionaries into the browser bundle.
 */
export const fill = (
  template: string,
  values: Record<string, string | number>,
) =>
  template.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
