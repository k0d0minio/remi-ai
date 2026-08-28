import type { AdherencePoint, Recap } from "./types";

/**
 * Seven days of "how much of the day's plan was actually applied". Small
 * numbers on purpose: the sparkline exists to show the shape of a week — the
 * weekend dip — not to be read value by value. The exact figures live in the
 * table underneath it for anyone who does want them.
 */
const adherence: AdherencePoint[] = [
  { day: "Lundi", label: "Lu", value: 100 },
  { day: "Mardi", label: "Ma", value: 100 },
  { day: "Mercredi", label: "Me", value: 71 },
  { day: "Jeudi", label: "Je", value: 86 },
  { day: "Vendredi", label: "Ve", value: 57 },
  { day: "Samedi", label: "Sa", value: 43 },
  { day: "Dimanche", label: "Di", value: 71 },
];

/**
 * The weekly recap, written the way a practitioner would want it read: warm,
 * specific, and never diagnostic. Three movements — ce qui a marché, ce qui a
 * coincé, une seule suggestion — because a summary with six suggestions is a
 * list, and a list is what the patient already failed to act on.
 *
 * `reviewStatus` is the whole argument of the screen. The recap is prepared
 * *for* the practitioner, not sent instead of him: nothing here has been
 * validated until he has read it, and the card says so above the fold.
 */
export const weeklyRecap: Recap = {
  id: "recap_2026_w31",
  weekLabel: "Semaine du 27 juillet au 2 août",
  preparedOn: "dimanche 2 août, 20h00",
  reviewStatus: "awaiting-review",
  opening:
    "Une semaine à deux vitesses : très tenue jusqu'à jeudi, plus difficile ensuite. Rien d'inquiétant, et deux choses valent d'être dites.",
  sections: [
    {
      kind: "went-well",
      title: "Ce qui a bien marché",
      body: "Les fermentés sont devenus automatiques — vous n'y pensez plus, vous le faites.",
      points: [
        "Un aliment fermenté sept jours sur sept, sans exception.",
        "Deux repas de poisson gras, dont les sardines de lundi soir.",
        "Le creux de 11h n'est apparu que deux fois, contre cinq la semaine d'avant.",
      ],
    },
    {
      kind: "was-hard",
      title: "Ce qui a été difficile",
      body: "Les matins. Trois petits-déjeuners sur sept sans protéines, tous après une nuit fragmentée.",
      points: [
        "Mercredi, vendredi et samedi : tartines et café.",
        "Vous avez noté « réveillée à 3h » deux fois sur ces trois jours.",
        "Le week-end décroche : samedi est le jour le plus bas de la semaine.",
      ],
    },
    {
      kind: "suggestion",
      title: "Une chose pour la semaine prochaine",
      body: "Préparer le petit-déjeuner du lendemain la veille au soir, les soirs où vous cuisinez déjà.",
      points: [
        "Deux œufs durs cuits en même temps que le dîner, gardés au frigo.",
        "L'idée n'est pas de mieux tenir les matins difficiles, mais de ne plus avoir à décider à 7h.",
      ],
    },
  ],
  adherence,
  adherenceAverage: 75,
  adherenceDelta: 12,
  closing:
    "Ce bilan part à votre praticien avant votre consultation du 19 août. Il le lit, le corrige si besoin, et c'est lui qui décide de la suite — REMI ne change rien à votre plan.",
};
