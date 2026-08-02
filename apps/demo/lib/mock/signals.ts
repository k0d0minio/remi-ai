import type { Signal } from "./types";

/**
 * What flows back up the loop between two consultations. This is the answer to
 * "puis vous ne voyez plus rien" — ordered so what needs attention is read
 * first, not buried under the good news.
 */
export const signals: Signal[] = [
  {
    id: "sig_thomas_silence",
    clientName: "Thomas Lemaire",
    kind: "adherence",
    severity: "attention",
    when: "il y a 9 jours",
    summary:
      "Plus aucune étape appliquée depuis le 24 juillet. Trois déplacements sur la période.",
  },
  {
    id: "sig_naima_bloat",
    clientName: "Naïma Benali",
    kind: "difficulty",
    severity: "attention",
    when: "il y a 2 jours",
    summary:
      "Ballonnements signalés trois fois, toujours les jours de déjeuner au bureau.",
  },
  {
    id: "sig_pierre_invite",
    clientName: "Pierre Janssens",
    kind: "engagement",
    severity: "neutral",
    when: "il y a 3 jours",
    summary: "Invitation envoyée, pas encore acceptée.",
  },
  {
    id: "sig_camille_streak",
    clientName: "Camille Dubois",
    kind: "win",
    severity: "positive",
    when: "hier",
    summary:
      "Quatorze jours consécutifs sur l'étape « un aliment fermenté par jour ». Étape tenue.",
  },
  {
    id: "sig_camille_breakfast",
    clientName: "Camille Dubois",
    kind: "adherence",
    severity: "positive",
    when: "hier",
    summary: "Nouvelle étape entamée : 4 matins sur 14 déjà appliqués.",
  },
];
