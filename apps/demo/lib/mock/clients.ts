import type { Client, Dimension } from "./types";

export const practitionerName = "Dr Hélène Vasseur";
export const clinicName = "Cabinet Vasseur";

export const clients: Client[] = [
  {
    id: "camille",
    name: "Camille Dubois",
    initials: "CD",
    status: "active",
    readiness: "committed",
    adherence: 86,
    since: "12 mai 2026",
    nextConsultation: "19 août 2026",
    lastActive: "hier, 19h42",
    currentStep: "Des protéines au petit-déjeuner, cinq matins sur sept",
    attention: null,
  },
  {
    id: "thomas",
    name: "Thomas Lemaire",
    initials: "TL",
    status: "active",
    readiness: "struggling",
    adherence: 21,
    since: "3 juin 2026",
    nextConsultation: "11 août 2026",
    lastActive: "il y a 9 jours",
    currentStep: "Un vrai déjeuner assis, trois jours sur cinq",
    attention:
      "Rien d'appliqué depuis neuf jours. Trois déplacements cette semaine-là.",
  },
  {
    id: "naima",
    name: "Naïma Benali",
    initials: "NB",
    status: "active",
    readiness: "exploring",
    adherence: 64,
    since: "21 avril 2026",
    nextConsultation: "2 septembre 2026",
    lastActive: "ce matin, 7h15",
    currentStep: "Un aliment fermenté par jour",
    attention: "Signale des ballonnements les jours où elle mange au bureau.",
  },
  {
    id: "pierre",
    name: "Pierre Janssens",
    initials: "PJ",
    status: "invited",
    readiness: "exploring",
    adherence: 0,
    since: "30 juillet 2026",
    nextConsultation: "14 août 2026",
    lastActive: "jamais",
    currentStep: "—",
    attention: "Invitation envoyée il y a trois jours, pas encore acceptée.",
  },
];

/**
 * The five axes a plan is adapted along ("personnalisation à 360°"). Four
 * describe Camille; the fifth is not hers to hold — it comes from her
 * practitioner's frame, which is why its source line names the practitioner
 * rather than Camille.
 */
export const dimensions: Dimension[] = [
  {
    key: "genotype",
    label: "Génotype",
    source: "Rapport génétique — mars 2026",
    points: [
      "MTHFR C677T hétérozygote",
      "Privilégier les légumes riches en folates",
    ],
  },
  {
    key: "preceptes",
    label: "Préceptes du praticien",
    source: `Cadre thérapeutique — ${practitionerName}`,
    points: [
      "Les causes avant les symptômes",
      "Un seul changement à la fois",
      "Terrain digestif en premier",
    ],
  },
  {
    key: "psychology",
    label: "Profil psychologique",
    source: "Questionnaire d'entrée + consultation du 22 juillet",
    points: [
      "Engagée, mais se juge durement en cas d'écart",
      "Motivée par : dormir d'une traite, suivre ses fils",
      "Frein : les soirées finissent tard",
    ],
  },
  {
    key: "habits",
    label: "Habitudes alimentaires",
    source: "Déclaré par Camille",
    points: [
      "Cuisine pour quatre",
      "N'aime pas : le foie, les anchois",
      "Allergie : noix",
    ],
  },
  {
    key: "rhythm",
    label: "Rythme de vie",
    source: "Déclaré par Camille",
    points: [
      "30 minutes en cuisine en semaine",
      "Deux repas dehors par semaine",
      "Courses le samedi",
    ],
  },
];
