import type { Meal, Recipe } from "@remi/services/shared";

/**
 * Fixture data — see the note in `./practitioner.ts`.
 *
 * Every recipe carries `honours`: the line back to a recommendation the
 * practitioner actually confirmed. It is not decoration — it is the difference
 * between an accompaniment and a recipe app, and the meals screen renders it on
 * every card.
 */
export const recipes: readonly Recipe[] = [
  {
    id: "rcp_omelette",
    title: "Spinach and feta omelette",
    summary:
      "Five minutes of prep; the rest cooks itself while the coffee runs through.",
    minutes: 12,
    servings: 4,
    honours: ["Protein at breakfast", "Cooked vegetables rather than raw"],
    ingredients: [
      { name: "Eggs", quantity: "8", aisle: "Dairy and eggs" },
      { name: "Spinach", quantity: "200 g", aisle: "Produce" },
      { name: "Feta", quantity: "100 g", aisle: "Dairy and eggs" },
      { name: "Olive oil", quantity: "2 tbsp", aisle: "Pantry" },
    ],
    method: [
      "Wilt the spinach in olive oil, two minutes.",
      "Beat the eggs, season lightly, pour over the spinach.",
      "Crumble the feta on top, cover, cook six minutes over a low heat.",
    ],
    createdAt: new Date("2026-07-23T09:00:00Z"),
    updatedAt: new Date("2026-07-23T09:00:00Z"),
  },
  {
    id: "rcp_sardines",
    title: "Grilled sardines, roast fennel",
    summary:
      "The oily fish your practitioner asked for, with nothing to watch on the hob.",
    minutes: 25,
    servings: 4,
    honours: ["Oily fish twice a week", "Olive oil for cooking"],
    ingredients: [
      { name: "Sardines", quantity: "12", aisle: "Fish counter" },
      { name: "Fennel", quantity: "3 bulbs", aisle: "Produce" },
      { name: "Lemons", quantity: "1", aisle: "Produce" },
      { name: "Olive oil", quantity: "3 tbsp", aisle: "Pantry" },
    ],
    method: [
      "Oven to 200 °C. Fennel in quarters, olive oil, 20 minutes.",
      "Add the sardines to the tray for the last eight minutes.",
      "Lemon at the table, not before.",
    ],
    createdAt: new Date("2026-07-23T09:00:00Z"),
    updatedAt: new Date("2026-07-23T09:00:00Z"),
  },
  {
    id: "rcp_lentils",
    title: "Warm lentils, soft-boiled egg",
    summary: "Made the night before, eaten warm or cold the next day.",
    minutes: 30,
    servings: 4,
    honours: ["One fermented food a day", "Pulses in place of red meat"],
    ingredients: [
      { name: "Green lentils", quantity: "300 g", aisle: "Pantry" },
      { name: "Eggs", quantity: "4", aisle: "Dairy and eggs" },
      { name: "Raw sauerkraut", quantity: "150 g", aisle: "Chilled" },
      { name: "Shallots", quantity: "2", aisle: "Produce" },
    ],
    method: [
      "Simmer the lentils for 20 minutes with a whole shallot.",
      "Soft-boil the eggs: six minutes in barely trembling water.",
      "Assemble warm, and add the raw sauerkraut at the last moment.",
    ],
    createdAt: new Date("2026-07-23T09:00:00Z"),
    updatedAt: new Date("2026-07-23T09:00:00Z"),
  },
  {
    id: "rcp_chicken",
    title: "Roast chicken with lemon and courgettes",
    summary: "The Sunday tray that also makes Monday's lunch.",
    minutes: 55,
    servings: 4,
    honours: ["Cooked vegetables rather than raw", "Olive oil for cooking"],
    ingredients: [
      { name: "Chicken thighs", quantity: "6", aisle: "Butcher" },
      { name: "Courgettes", quantity: "4", aisle: "Produce" },
      { name: "Lemons", quantity: "2", aisle: "Produce" },
      { name: "Thyme", quantity: "a few sprigs", aisle: "Produce" },
    ],
    method: [
      "Oven to 190 °C. Chicken, sliced lemon, thyme, olive oil.",
      "Forty minutes, then add the courgettes in big pieces.",
      "Fifteen minutes more, until the skin has taken colour.",
    ],
    createdAt: new Date("2026-07-23T09:00:00Z"),
    updatedAt: new Date("2026-07-23T09:00:00Z"),
  },
];

/**
 * The recipes placed in Camille's week. `servedOn` carries the time of day as
 * well as the date, so the week reads in the order it is lived — breakfast
 * before dinner — without a second table saying which slot comes first.
 */
export const meals: readonly Meal[] = [
  {
    id: "meal_mon_breakfast",
    personId: "per_camille",
    planId: "plan_camille_jul",
    recipeId: "rcp_omelette",
    slot: "breakfast",
    servedOn: new Date("2026-08-03T08:00:00Z"),
    status: "suggested",
    createdAt: new Date("2026-08-01T06:00:00Z"),
    updatedAt: new Date("2026-08-01T06:00:00Z"),
  },
  {
    id: "meal_mon_dinner",
    personId: "per_camille",
    planId: "plan_camille_jul",
    recipeId: "rcp_sardines",
    slot: "dinner",
    servedOn: new Date("2026-08-03T19:00:00Z"),
    status: "suggested",
    createdAt: new Date("2026-08-01T06:00:00Z"),
    updatedAt: new Date("2026-08-01T06:00:00Z"),
  },
  {
    id: "meal_tue_lunch",
    personId: "per_camille",
    planId: "plan_camille_jul",
    recipeId: "rcp_lentils",
    slot: "lunch",
    servedOn: new Date("2026-08-04T12:30:00Z"),
    status: "suggested",
    createdAt: new Date("2026-08-01T06:00:00Z"),
    updatedAt: new Date("2026-08-01T06:00:00Z"),
  },
  {
    id: "meal_wed_dinner",
    personId: "per_camille",
    planId: "plan_camille_jul",
    recipeId: "rcp_chicken",
    slot: "dinner",
    servedOn: new Date("2026-08-05T19:00:00Z"),
    status: "suggested",
    createdAt: new Date("2026-08-01T06:00:00Z"),
    updatedAt: new Date("2026-08-01T06:00:00Z"),
  },
];
