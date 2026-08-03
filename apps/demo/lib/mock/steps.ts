import type { Step } from "./types";

/**
 * Camille's steps, in order. Exactly one is `current` — the product rule is one
 * change at a time, so the sequence is the design, not a backlog.
 */
export const steps: Step[] = [
  {
    id: "step_ferment",
    order: 1,
    title: "Un aliment fermenté par jour",
    why: "Votre praticien veut apaiser la digestion avant de toucher au reste.",
    status: "done",
    completedDays: 14,
    targetDays: 14,
  },
  {
    id: "step_breakfast",
    order: 2,
    title: "Des protéines au petit-déjeuner, cinq matins sur sept",
    why: "Pour éviter le creux de 11h qui vous envoie chercher du sucré.",
    status: "current",
    completedDays: 4,
    targetDays: 14,
  },
  {
    id: "step_oils",
    order: 3,
    title: "Remplacer l'huile de cuisson par de l'huile d'olive",
    why: "L'une des huiles dont votre praticien vous a demandé de vous éloigner.",
    status: "upcoming",
    completedDays: 0,
    targetDays: 14,
  },
  {
    id: "step_evening",
    order: 4,
    title: "Dîner avant 20h, trois soirs par semaine",
    why: "Laisser à la digestion le temps de finir avant le coucher.",
    status: "upcoming",
    completedDays: 0,
    targetDays: 21,
  },
];
