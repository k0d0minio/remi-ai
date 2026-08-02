import type { FramePrinciple } from "./types";

/**
 * The practitioner's therapeutic frame — the préceptes REMI generates inside.
 *
 * This is the screen that makes REMI a copilot for *this* practice rather than a
 * diet app: the practitioner sets the boundary, and nothing suggested may fall
 * outside it. `excluded` is a hard rule, `emphasised` is a preference — the
 * distinction is the whole design.
 */
export const frameName = "Médecine fonctionnelle — FunMedDev";

export const frameSummary =
  "Chercher les causes avant de traiter les symptômes, et ne changer qu'une chose à la fois.";

export const principles: FramePrinciple[] = [
  {
    id: "prin_causes",
    title: "Les causes avant les symptômes",
    detail:
      "Une suggestion s'attaque à ce qui produit le problème, pas à la gêne qu'il provoque.",
    active: true,
  },
  {
    id: "prin_progressive",
    title: "Un seul changement à la fois",
    detail:
      "Jamais plus d'une nouvelle habitude en cours. La suivante attend que la première tienne.",
    active: true,
  },
  {
    id: "prin_terrain",
    title: "Le terrain digestif en premier",
    detail: "Tout le reste du plan se construit une fois la digestion apaisée.",
    active: true,
  },
  {
    id: "prin_fasting",
    title: "Jeûne intermittent",
    detail:
      "Non activé : à réserver aux personnes dont le terrain est déjà stabilisé.",
    active: false,
  },
];

export const excluded = [
  "Huiles de graines raffinées",
  "Céréales contenant du gluten",
  "Lait de vache",
  "Édulcorants de synthèse",
];

export const emphasised = [
  "Aliments fermentés",
  "Poisson gras",
  "Légumes cuits",
  "Huile d'olive",
];

/** What the frame changes in practice, stated in REMI's own terms. */
export const frameEffects = [
  "Aucune recette proposée ne contient un aliment exclu, pour aucune personne accompagnée.",
  "Une seule étape est active à la fois — REMI n'en propose pas une deuxième tant que la première n'est pas tenue.",
  "Les suggestions du premier mois portent sur la digestion, quel que soit le motif de consultation.",
];
