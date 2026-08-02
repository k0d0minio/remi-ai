import type { Recipe } from "./types";

/**
 * A week of suggestions for Camille. Every one carries `honours` — the line back
 * to a recommendation her practitioner actually made. That is the difference
 * between a meal plan and an accompaniment: nothing here comes from nowhere.
 */
export const recipes: Recipe[] = [
  {
    id: "rec_omelette",
    title: "Omelette aux épinards et féta",
    summary:
      "Cinq minutes de préparation, le reste cuit tout seul pendant que le café passe.",
    minutes: 12,
    servings: 4,
    slot: "petit-déjeuner",
    day: "Lundi",
    honours: ["Protéines au petit-déjeuner", "Légumes cuits plutôt que crus"],
    ingredients: [
      { name: "Œufs", quantity: "8", aisle: "Crèmerie" },
      { name: "Épinards frais", quantity: "200 g", aisle: "Fruits et légumes" },
      { name: "Féta", quantity: "100 g", aisle: "Crèmerie" },
      { name: "Huile d'olive", quantity: "2 c. à s.", aisle: "Épicerie" },
    ],
    method: [
      "Faire tomber les épinards à l'huile d'olive, deux minutes.",
      "Battre les œufs, saler légèrement, verser sur les épinards.",
      "Émietter la féta dessus, couvrir, cuire six minutes à feu doux.",
    ],
  },
  {
    id: "rec_sardines",
    title: "Sardines grillées, fenouil rôti",
    summary:
      "Le poisson gras que votre praticien met en avant, sans surveillance en cuisine.",
    minutes: 25,
    servings: 4,
    slot: "dîner",
    day: "Lundi",
    honours: [
      "Poisson gras deux fois par semaine",
      "Huile d'olive à la cuisson",
    ],
    ingredients: [
      { name: "Sardines", quantity: "12", aisle: "Poissonnerie" },
      { name: "Fenouil", quantity: "3 bulbes", aisle: "Fruits et légumes" },
      { name: "Citron", quantity: "1", aisle: "Fruits et légumes" },
      { name: "Huile d'olive", quantity: "3 c. à s.", aisle: "Épicerie" },
    ],
    method: [
      "Four à 200 °C. Fenouil en quartiers, huile d'olive, 20 minutes.",
      "Ajouter les sardines sur la plaque les 8 dernières minutes.",
      "Citron au moment de servir.",
    ],
  },
  {
    id: "rec_lentilles",
    title: "Lentilles tièdes, œuf mollet",
    summary: "Se prépare la veille et se mange froid ou tiède le lendemain.",
    minutes: 30,
    servings: 4,
    slot: "déjeuner",
    day: "Mardi",
    honours: ["Un aliment fermenté par jour", "Légumineuses en remplacement"],
    ingredients: [
      { name: "Lentilles vertes", quantity: "300 g", aisle: "Épicerie" },
      { name: "Œufs", quantity: "4", aisle: "Crèmerie" },
      { name: "Choucroute crue", quantity: "150 g", aisle: "Rayon frais" },
      { name: "Échalote", quantity: "2", aisle: "Fruits et légumes" },
    ],
    method: [
      "Cuire les lentilles 20 minutes avec une échalote entière.",
      "Œufs mollets : six minutes dans l'eau frémissante.",
      "Assembler tiède, ajouter la choucroute crue au dernier moment.",
    ],
  },
  {
    id: "rec_poulet",
    title: "Poulet rôti au citron, courgettes",
    summary: "Le plat du dimanche qui fait aussi les déjeuners du lundi.",
    minutes: 55,
    servings: 4,
    slot: "dîner",
    day: "Mercredi",
    honours: ["Légumes cuits plutôt que crus", "Éviter les huiles de graines"],
    ingredients: [
      { name: "Cuisses de poulet", quantity: "6", aisle: "Boucherie" },
      { name: "Courgettes", quantity: "4", aisle: "Fruits et légumes" },
      { name: "Citron", quantity: "2", aisle: "Fruits et légumes" },
      {
        name: "Thym",
        quantity: "quelques branches",
        aisle: "Fruits et légumes",
      },
    ],
    method: [
      "Four à 190 °C. Poulet, citron en rondelles, thym, huile d'olive.",
      "40 minutes, puis ajouter les courgettes en gros morceaux.",
      "Encore 15 minutes, jusqu'à ce que la peau soit dorée.",
    ],
  },
];

/** Grouped the way the shop is laid out, not the way the recipes are written. */
export const shoppingList = [
  {
    aisle: "Fruits et légumes",
    items: [
      "Épinards frais — 200 g",
      "Fenouil — 3 bulbes",
      "Courgettes — 4",
      "Citron — 3",
      "Échalote — 2",
      "Thym — quelques branches",
    ],
  },
  {
    aisle: "Crèmerie",
    items: ["Œufs — 12", "Féta — 100 g"],
  },
  {
    aisle: "Poissonnerie",
    items: ["Sardines — 12"],
  },
  {
    aisle: "Boucherie",
    items: ["Cuisses de poulet — 6"],
  },
  {
    aisle: "Épicerie",
    items: ["Lentilles vertes — 300 g", "Huile d'olive — 1 bouteille"],
  },
  {
    aisle: "Rayon frais",
    items: ["Choucroute crue — 150 g"],
  },
];
