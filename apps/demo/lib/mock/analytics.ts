import type {
  AtRiskClient,
  CohortWeek,
  EngagementBand,
  ImpactStat,
} from "./types";

/**
 * The cohort behind `/practitioner/analytics`: twelve accompaniments over eight
 * weeks, of which four are the roster in `clients.ts`. The numbers here and the
 * numbers there are written to agree — Camille at 86 %, Thomas at 21 %, Naïma at
 * 64 %, Pierre not yet activated — because the first thing a practitioner does
 * with a cohort screen is pick a row and check it against the file.
 */
export const cohortSize = 12;
export const cohortWindow = "9 juin – 3 août 2026";

/**
 * The eight weeks. The dip at the end of June is the summer departures, and it
 * is left in: a trend fixture with no bad week teaches a stakeholder nothing
 * about how the screen reads when a week goes wrong.
 */
export const cohortWeeks: CohortWeek[] = [
  { id: "w1", label: "9 juin", range: "9 – 15 juin", adherence: 52 },
  { id: "w2", label: "16 juin", range: "16 – 22 juin", adherence: 55 },
  { id: "w3", label: "23 juin", range: "23 – 29 juin", adherence: 61 },
  { id: "w4", label: "30 juin", range: "30 juin – 6 juillet", adherence: 58 },
  { id: "w5", label: "7 juil.", range: "7 – 13 juillet", adherence: 64 },
  { id: "w6", label: "14 juil.", range: "14 – 20 juillet", adherence: 69 },
  { id: "w7", label: "21 juil.", range: "21 – 27 juillet", adherence: 66 },
  { id: "w8", label: "28 juil.", range: "28 juillet – 3 août", adherence: 74 },
];

/** Averages written out rather than recomputed per screen, as `recap.ts` does. */
export const cohortAverage = 62;
export const cohortDelta = 22;

/**
 * The bands are ordered from held to lost, and each one names the rule that puts
 * someone in it. A practitioner who cannot see the threshold cannot argue with
 * the bar, and a bar nobody can argue with is a bar nobody trusts.
 */
export const engagementBands: EngagementBand[] = [
  {
    level: "very-engaged",
    label: "Très engagée",
    criterion: "80 % et plus du plan appliqué",
    count: 3,
    intent: "success",
  },
  {
    level: "regular",
    label: "Régulière",
    criterion: "60 à 79 %",
    count: 4,
    intent: "info",
  },
  {
    level: "irregular",
    label: "Irrégulière",
    criterion: "30 à 59 %",
    count: 2,
    intent: "warning",
  },
  {
    level: "dropped",
    label: "Décrochée",
    criterion: "moins de 30 %",
    count: 2,
    intent: "error",
  },
  {
    level: "pending",
    label: "En attente d'activation",
    criterion: "invitation envoyée, jamais connectée",
    count: 1,
    intent: "neutral",
  },
];

/**
 * Low adherence alone is not a reason to be on this list — Naïma is at 64 % and
 * is here anyway, because hers is falling and she has said why. The list is
 * about direction and what to do next, not about a threshold.
 */
export const atRisk: AtRiskClient[] = [
  {
    clientId: "thomas",
    name: "Thomas Lemaire",
    initials: "TL",
    adherence: 21,
    delta: -34,
    lastActive: "il y a 9 jours",
    band: "Décrochée",
    intent: "error",
    trend: [
      { label: "9 juin", value: 55 },
      { label: "16 juin", value: 52 },
      { label: "23 juin", value: 44 },
      { label: "30 juin", value: 40 },
      { label: "7 juil.", value: 33 },
      { label: "14 juil.", value: 28 },
      { label: "21 juil.", value: 24 },
      { label: "28 juil.", value: 21 },
    ],
    reasons: [
      "Huit semaines de baisse continue, sans palier.",
      "Plus rien d'appliqué depuis le 24 juillet.",
      "Trois déplacements professionnels sur la période.",
    ],
    action: {
      label: "Proposer un point de quinze minutes",
      why: "Reprendre le contact avant de reposer une étape : ce qui a lâché est le cadre, pas la recommandation.",
      href: "/practitioner/messages",
    },
  },
  {
    clientId: null,
    name: "Sofia Marchetti",
    initials: "SM",
    adherence: 38,
    delta: -21,
    lastActive: "il y a 3 jours",
    band: "Irrégulière",
    intent: "warning",
    trend: [
      { label: "9 juin", value: 59 },
      { label: "16 juin", value: 62 },
      { label: "23 juin", value: 55 },
      { label: "30 juin", value: 48 },
      { label: "7 juil.", value: 44 },
      { label: "14 juil.", value: 41 },
      { label: "21 juil.", value: 39 },
      { label: "28 juil.", value: 38 },
    ],
    reasons: [
      "N'applique plus que le samedi et le dimanche depuis un mois.",
      "Étape en cours ciblée sur cinq jours par semaine.",
    ],
    action: {
      label: "Ramener la cible à trois jours",
      why: "Une cible plus basse tenue vaut mieux qu'une cible haute abandonnée — et la semaine de travail est le vrai obstacle ici.",
      href: "/practitioner/messages",
    },
  },
  {
    clientId: "naima",
    name: "Naïma Benali",
    initials: "NB",
    adherence: 64,
    delta: -12,
    lastActive: "ce matin, 7h15",
    band: "Régulière",
    intent: "warning",
    trend: [
      { label: "9 juin", value: 76 },
      { label: "16 juin", value: 74 },
      { label: "23 juin", value: 71 },
      { label: "30 juin", value: 69 },
      { label: "7 juil.", value: 70 },
      { label: "14 juil.", value: 66 },
      { label: "21 juil.", value: 63 },
      { label: "28 juil.", value: 64 },
    ],
    reasons: [
      "Douze points perdus depuis le 9 juin, sans rupture nette.",
      "Ballonnements signalés trois fois, toujours les jours de déjeuner au bureau.",
    ],
    action: {
      label: "Regarder les déjeuners au bureau",
      why: "Le contexte est peut-être en cause plutôt que l'étape. À trancher avant de changer quoi que ce soit au plan.",
      href: "/practitioner/clients/naima/plan",
    },
  },
];

/**
 * What the consultations produced. Each figure carries what it is measured
 * against, because "78 %" on its own is not a result — it is a number that
 * sounds like one.
 */
export const consultationImpact: ImpactStat[] = [
  {
    id: "impact_after",
    label: "Plan appliqué dans les 14 jours suivant une consultation",
    value: "78 %",
    delta: { text: "+21 pts", intent: "success" },
    detail: "Contre 57 % sur les quatorze jours qui la précèdent.",
  },
  {
    id: "impact_consultations",
    label: "Consultations tenues",
    value: "26",
    delta: null,
    detail: "Sur les huit semaines, pour douze accompagnements.",
  },
  {
    id: "impact_steps",
    label: "Étapes menées à terme",
    value: "17 sur 25",
    delta: { text: "+6 étapes", intent: "success" },
    detail: "Une étape est tenue quand sa cible de jours est atteinte.",
  },
  {
    id: "impact_review",
    label: "Personnes revues dans les six semaines",
    value: "9 sur 12",
    delta: { text: "3 sans date", intent: "warning" },
    detail: "Trois personnes n'ont pas de prochaine consultation posée.",
  },
];
