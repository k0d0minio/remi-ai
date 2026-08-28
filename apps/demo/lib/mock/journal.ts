import type { JournalEntry } from "./types";

/**
 * Camille's photo journal, newest first. Every entry carries `recognitions` —
 * the line from a plate back to a recommendation her practitioner actually
 * made. Without it this is a calorie app; with it, it is the evidence the
 * consultation runs on.
 *
 * The confidences are deliberately imperfect. A recognition that is right every
 * time is not a design worth reviewing: the interesting screens are the ones at
 * 61 %, where the patient has to be able to correct REMI without feeling caught.
 */
export const journalEntries: JournalEntry[] = [
  {
    id: "jrn_lunch_today",
    day: "Aujourd'hui",
    time: "12h40",
    slot: "déjeuner",
    photoTone: "protein",
    identified: "Assiette identifiée : saumon, quinoa, brocoli",
    items: ["Saumon", "Quinoa", "Brocoli", "Huile d'olive"],
    confidence: 94,
    recognitions: [
      {
        recommendation: "Poisson gras deux fois par semaine",
        verdict: "matches",
        detail: "Deuxième fois cette semaine, avec les sardines de lundi.",
      },
      {
        recommendation: "Légumes cuits plutôt que crus",
        verdict: "matches",
        detail: "Brocoli vapeur.",
      },
    ],
    note: null,
  },
  {
    id: "jrn_breakfast_today",
    day: "Aujourd'hui",
    time: "7h55",
    slot: "petit-déjeuner",
    photoTone: "grains",
    identified: "Assiette identifiée : tartines, confiture, café",
    items: ["Pain de mie", "Confiture", "Café"],
    confidence: 88,
    recognitions: [
      {
        recommendation: "Petit-déjeuner protéiné, cinq matins sur sept",
        verdict: "discuss",
        detail:
          "Troisième matin sans protéines cette semaine. À regarder ensemble le 19 août.",
      },
    ],
    note: "Réveillée à 3h, pas eu le courage de cuisiner.",
  },
  {
    id: "jrn_dinner_yesterday",
    day: "Hier",
    time: "19h20",
    slot: "dîner",
    photoTone: "greens",
    identified: "Assiette identifiée : lentilles, œuf mollet, choucroute crue",
    items: ["Lentilles vertes", "Œuf", "Choucroute crue", "Échalote"],
    confidence: 91,
    recognitions: [
      {
        recommendation: "Un aliment fermenté par jour",
        verdict: "matches",
        detail: "Choucroute crue, portion complète.",
      },
      {
        recommendation: "Pas de crudités le soir",
        verdict: "discuss",
        detail:
          "La choucroute crue est un fermenté, pas une crudité au sens de l'étape — à trancher avec votre praticien.",
      },
    ],
    note: null,
  },
  {
    id: "jrn_snack_yesterday",
    day: "Hier",
    time: "16h05",
    slot: "collation",
    photoTone: "fruit",
    identified: "Assiette identifiée : pomme, amandes",
    items: ["Pomme", "Amandes"],
    confidence: 96,
    recognitions: [
      {
        recommendation: "Petit-déjeuner protéiné, cinq matins sur sept",
        verdict: "matches",
        detail:
          "La collation tient jusqu'au dîner : c'est le creux de 11h qui recule.",
      },
    ],
    note: null,
  },
  {
    id: "jrn_lunch_saturday",
    day: "Samedi",
    time: "13h10",
    slot: "déjeuner",
    photoTone: "sweet",
    identified: "Assiette identifiée : quiche, salade verte",
    items: ["Quiche", "Salade verte"],
    confidence: 61,
    recognitions: [
      {
        recommendation: "Huile d'olive à la cuisson",
        verdict: "discuss",
        detail:
          "Plat du commerce : REMI ne sait pas quelle huile a servi. Une question, pas un constat.",
      },
    ],
    note: "Déjeuner chez ma sœur.",
  },
];

/**
 * What the fake capture produces in the "add" dialog. It is a fixture rather
 * than something generated at click time so the analysing state has a known
 * answer to land on — and so the reviewer sees the same plate every run.
 */
export const capturedEntry: JournalEntry = {
  id: "jrn_captured",
  day: "Aujourd'hui",
  time: "à l'instant",
  slot: "dîner",
  photoTone: "protein",
  identified: "Assiette identifiée : sardines, fenouil rôti, citron",
  items: ["Sardines", "Fenouil", "Citron", "Huile d'olive"],
  confidence: 89,
  recognitions: [
    {
      recommendation: "Poisson gras deux fois par semaine",
      verdict: "matches",
      detail: "Troisième fois cette semaine — au-dessus de ce qui est demandé.",
    },
    {
      recommendation: "Légumes cuits plutôt que crus",
      verdict: "matches",
      detail: "Fenouil rôti.",
    },
  ],
  note: null,
};

/**
 * The steps the analysing state walks through. Written out because the point of
 * showing them is that the patient can see what is being done to her photo —
 * a spinner with no words is where trust in an AI feature goes to die.
 */
export const analysisSteps = [
  "Lecture de la photo…",
  "Identification des aliments…",
  "Comparaison avec votre plan…",
];

export const slotLabels: Record<JournalEntry["slot"], string> = {
  "petit-déjeuner": "Petit-déjeuner",
  déjeuner: "Déjeuner",
  collation: "Collation",
  dîner: "Dîner",
};
