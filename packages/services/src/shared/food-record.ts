/**
 * The vocabulary of a food record — REM-189.
 *
 * CIQUAL is the one identity of a food. A food record is what REMI needs to
 * cook with a CIQUAL food: whether it is « cuisinable », its allergen tags and
 * its role in a dish. REMI proposes a record and a person confirms it. Only a
 * confirmed record counts (D-30).
 *
 * The allergen tags are the tags of the compatibility gate
 * (`ai/compatibility.ts`): this file has no second list of them.
 */

/** The role of a food in a dish. */
export const dishRoles = [
  "protein",
  "starch",
  "vegetable",
  "fat",
  "acid",
  "aromatic",
  "herb_spice",
  "liquid",
] as const;

export type DishRole = (typeof dishRoles)[number];

export const dishRoleLabels: Record<DishRole, string> = {
  protein: "Protéine",
  starch: "Féculent",
  vegetable: "Légume",
  fat: "Matière grasse",
  acid: "Acide",
  aromatic: "Aromate",
  herb_spice: "Herbe ou épice",
  liquid: "Liquide",
};

export const isDishRole = (value: string): value is DishRole =>
  (dishRoles as readonly string[]).includes(value);

/** `proposed`: an aid to entry, never a safety decision. */
export const foodRecordStatuses = ["proposed", "confirmed"] as const;

export type FoodRecordStatus = (typeof foodRecordStatuses)[number];

/** Who wrote the values first: REMI's model, or a person in the console. */
export const foodRecordSources = ["remi", "person"] as const;

export type FoodRecordSource = (typeof foodRecordSources)[number];
