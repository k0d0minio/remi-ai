import type { DraftRecommendation, NoteBlock } from "./types";

/**
 * The raw write-up, exactly as the practitioner typed it. It is kept verbatim so
 * the structuring step below is always reversible — REMI proposes a reading of
 * the notes, it does not replace them.
 */
export const notes: NoteBlock[] = [
  {
    id: "note_1",
    text: "Camille, 41 ans. Ballonnements postprandiaux depuis ~18 mois, pire en fin de journée. Sommeil fragmenté, réveils 3-4h.",
  },
  {
    id: "note_2",
    text: "Terrain digestif d'abord. Fermentés quotidiens, monter progressivement. Pas de crudités le soir.",
  },
  {
    id: "note_3",
    text: "Creux de 11h systématique → grignotage sucré. Petit-déj protéiné à installer une fois les fermentés tenus.",
  },
  {
    id: "note_4",
    text: "Sortir des huiles de graines. Olive à la cuisson. Poisson gras 2x/sem si elle accepte.",
  },
  {
    id: "note_5",
    text: "Revoir dans 4 semaines. Ne pas empiler les changements, elle se juge dur.",
  },
];

/**
 * What REMI proposes as a structuring of those notes. `confirmed` is the whole
 * point of this screen: nothing reaches Camille until the practitioner has
 * ticked it, and the unconfirmed one is deliberately left unticked here.
 */
export const draftRecommendations: DraftRecommendation[] = [
  {
    id: "draft_ferment",
    category: "nutrition",
    title: "Un aliment fermenté par jour",
    detail:
      "Monter progressivement : une cuillère au départ, puis une portion. Choucroute crue, kéfir, miso.",
    fromNoteId: "note_2",
    confirmed: true,
  },
  {
    id: "draft_raw",
    category: "nutrition",
    title: "Pas de crudités le soir",
    detail: "Légumes cuits au dîner, crus réservés au déjeuner.",
    fromNoteId: "note_2",
    confirmed: true,
  },
  {
    id: "draft_breakfast",
    category: "habit",
    title: "Petit-déjeuner protéiné, cinq matins sur sept",
    detail:
      "À installer seulement une fois l'étape « fermentés » tenue quatorze jours.",
    fromNoteId: "note_3",
    confirmed: true,
  },
  {
    id: "draft_oils",
    category: "nutrition",
    title: "Huile d'olive à la cuisson",
    detail: "Sortir des huiles de tournesol et de colza raffinées.",
    fromNoteId: "note_4",
    confirmed: true,
  },
  {
    id: "draft_fish",
    category: "nutrition",
    title: "Poisson gras deux fois par semaine",
    detail: "Sardines, maquereau, hareng. À proposer, pas à imposer.",
    fromNoteId: "note_4",
    confirmed: false,
  },
  {
    id: "draft_review",
    category: "monitoring",
    title: "Revoir dans quatre semaines",
    detail: "Consultation de suivi le 19 août.",
    fromNoteId: "note_5",
    confirmed: true,
  },
];

export const categoryLabels: Record<DraftRecommendation["category"], string> = {
  nutrition: "Nutrition",
  habit: "Habitude",
  supplement: "Complément",
  activity: "Activité",
  monitoring: "Suivi",
};
