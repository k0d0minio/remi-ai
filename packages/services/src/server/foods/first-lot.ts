/**
 * The first lot of everyday foods — REM-189.
 *
 * REMI proposes a record for each one, so that the tests of the recipe
 * generation can start. Each proposal waits for a person on « Aliments ».
 *
 * To change the lot, change this list. One line is a CIQUAL code and the start
 * of the CIQUAL name, in lower case. `proposeFirstLot` uses the code when the
 * name of that food starts with `name`. If it does not, it takes the shortest
 * CIQUAL name that starts with `name`. Thus a wrong code never proposes
 * another food.
 *
 * Debt: the codes are from memory of the CIQUAL table. The full export is not
 * in the repository, so nobody checked them against it. The name is the
 * guard.
 */
export type FirstLotFood = { code: string; name: string };

export const FIRST_LOT_FOODS: readonly FirstLotFood[] = [
  // Vegetables and aromatics.
  { code: "20047", name: "tomate, crue" },
  { code: "20009", name: "carotte, crue" },
  { code: "20034", name: "oignon, cru" },
  { code: "11000", name: "ail, cru" },
  { code: "20020", name: "courgette" },
  { code: "20059", name: "épinard" },
  { code: "20057", name: "brocoli" },
  // Starches.
  { code: "4003", name: "pomme de terre" },
  { code: "9100", name: "riz blanc, cru" },
  { code: "9810", name: "pâtes sèches, standard" },
  { code: "9310", name: "flocon d'avoine" },
  { code: "20505", name: "lentille" },
  // Proteins.
  { code: "22000", name: "oeuf, cru" },
  { code: "36018", name: "poulet, filet" },
  { code: "26036", name: "saumon" },
  { code: "20507", name: "pois chiche" },
  // Dairy.
  { code: "19023", name: "lait demi-écrémé" },
  { code: "19593", name: "yaourt" },
  // Fats.
  { code: "17270", name: "huile d'olive" },
  { code: "16400", name: "beurre" },
  // Acid, seasoning, fruit.
  { code: "13009", name: "citron" },
  { code: "11017", name: "sel blanc" },
  { code: "11015", name: "poivre noir" },
  { code: "13620", name: "pomme, " },
];
