import type {
  Biomarker,
  GenotypeMarker,
  LabPanel,
  ResultDrivenStep,
} from "./types";

/**
 * Camille's biology, over three panels. Only she has one in the fixtures — the
 * others show the empty case, as they do for the journal — because a functional
 * medicine practitioner reads a marker as a series, and three dated columns are
 * the smallest thing that shows a series rather than a snapshot.
 */
export const labsClientId = "camille";

export const labPanels: LabPanel[] = [
  {
    id: "panel_march",
    label: "12 mars",
    date: "12 mars 2026",
    lab: "Laboratoire Saint-Luc",
  },
  {
    id: "panel_may",
    label: "28 mai",
    date: "28 mai 2026",
    lab: "Laboratoire Saint-Luc",
  },
  {
    id: "panel_july",
    label: "24 juil.",
    date: "24 juillet 2026",
    lab: "Laboratoire Saint-Luc",
  },
];

/**
 * `values` runs in `labPanels` order, oldest first. Ranges are written as the
 * laboratory writes them — an interval, a ceiling or a floor — rather than
 * normalised into a pair of numbers, because the form of the reference is part
 * of what the practitioner reads.
 *
 * `status` is the latest value against that range; `reading` is the direction of
 * the series and whether that direction is good news. They are deliberately two
 * fields: ferritine is still under its range and improving, glycémie is barely
 * over and getting worse, and a screen that collapses those into one badge tells
 * the practitioner the opposite of what the panel says.
 */
export const biomarkers: Biomarker[] = [
  {
    id: "bm_vitd",
    name: "Vitamine D (25-OH)",
    unit: "ng/mL",
    values: [18, 24, 31],
    range: "30 – 60",
    status: "in-range",
    reading: "improving",
  },
  {
    id: "bm_ferritin",
    name: "Ferritine",
    unit: "µg/L",
    values: [18, 22, 27],
    range: "30 – 150",
    status: "below",
    reading: "improving",
  },
  {
    id: "bm_folates",
    name: "Folates sériques",
    unit: "ng/mL",
    values: [3.8, 5.1, 6.4],
    range: "> 5,0",
    status: "in-range",
    reading: "improving",
  },
  {
    id: "bm_homocysteine",
    name: "Homocystéine",
    unit: "µmol/L",
    values: [13.2, 12.8, 11.4],
    range: "< 10,0",
    status: "above",
    reading: "improving",
  },
  {
    id: "bm_b12",
    name: "Vitamine B12",
    unit: "pmol/L",
    values: [310, 388, 442],
    range: "200 – 600",
    status: "in-range",
    reading: "improving",
  },
  {
    id: "bm_crp",
    name: "CRP ultrasensible",
    unit: "mg/L",
    values: [4.8, 3.1, 1.9],
    range: "< 3,0",
    status: "in-range",
    reading: "improving",
  },
  {
    id: "bm_hba1c",
    name: "HbA1c",
    unit: "%",
    values: [5.7, 5.6, 5.4],
    range: "< 5,7",
    status: "in-range",
    reading: "improving",
  },
  {
    id: "bm_glucose",
    name: "Glycémie à jeun",
    unit: "g/L",
    values: [0.98, 0.95, 1.02],
    range: "0,70 – 1,00",
    status: "above",
    reading: "worsening",
  },
  {
    id: "bm_omega",
    name: "Rapport oméga-6 / oméga-3",
    unit: "",
    values: [12.4, 11.8, 9.6],
    range: "< 5,0",
    status: "above",
    reading: "improving",
  },
  {
    id: "bm_tsh",
    name: "TSH",
    unit: "mUI/L",
    values: [2.1, 2.3, 2.2],
    range: "0,4 – 4,0",
    status: "in-range",
    reading: "stable",
  },
];

/**
 * The thread from a result to a step. Steps are spelled exactly as `steps.ts`
 * spells them: this card exists to answer "pourquoi cette étape", and an answer
 * that names a step nobody can find on the plan is worse than no answer.
 */
export const resultDrivenSteps: ResultDrivenStep[] = [
  {
    id: "link_crp",
    marker: "CRP ultrasensible",
    measured: "4,8 mg/L — panel du 12 mars 2026",
    step: "Un aliment fermenté par jour",
    rationale:
      "Inflammation de bas grade avec ballonnements postprandiaux : le terrain digestif d'abord, le reste ensuite.",
  },
  {
    id: "link_ferritin",
    marker: "Ferritine",
    measured: "18 µg/L — panel du 12 mars 2026",
    step: "Des protéines au petit-déjeuner, cinq matins sur sept",
    rationale:
      "Réserves basses et creux de 11h : un même petit-déjeuner répond aux deux, sans empiler deux changements.",
  },
  {
    id: "link_omega",
    marker: "Rapport oméga-6 / oméga-3",
    measured: "11,8 — panel du 28 mai 2026",
    step: "Remplacer l'huile de cuisson par de l'huile d'olive",
    rationale:
      "Sortir des huiles de graines avant d'ajouter quoi que ce soit : c'est le retrait qui fait bouger le rapport.",
  },
  {
    id: "link_glucose",
    marker: "Glycémie à jeun",
    measured: "1,02 g/L — panel du 24 juillet 2026",
    step: "Dîner avant 20h, trois soirs par semaine",
    rationale:
      "La seule valeur qui se dégrade sur ce bilan. L'étape est posée pour la séquence suivante, pas ajoutée à celle en cours.",
  },
];

/**
 * The genetic report, read as what it is: something that modulates how a dosage
 * is interpreted, never something that replaces it. `gene` / `variant` / `note`
 * are the domain model's own field names — see `lib/mock/types.ts`.
 */
export const genotypeMarkers: GenotypeMarker[] = [
  {
    gene: "MTHFR",
    variant: "C677T hétérozygote",
    note: "Conversion des folates réduite. À croiser avec l'homocystéine et les folates sériques, jamais lu seul.",
  },
  {
    gene: "FUT2",
    variant: "Non-sécréteur",
    note: "Terrain digestif : microbiote souvent appauvri en bifidobactéries. Cohérent avec l'étape « fermentés » posée en premier.",
  },
  {
    gene: "APOE",
    variant: "ε3/ε4",
    note: "Sensibilité accrue aux graisses saturées. Pèse sur le choix des huiles, pas sur la quantité de lipides.",
  },
  {
    gene: "COMT",
    variant: "Val158Met",
    note: "Dégradation plus lente des catécholamines. À garder en tête pour les réveils de 3-4h.",
  },
  {
    gene: "VDR",
    variant: "Taq1 TT",
    note: "Réponse à la vitamine D atténuée. La cible se juge sur le dosage sérique, pas sur la dose administrée.",
  },
];

export const genotypeSource = "Rapport génétique — mars 2026";

export const genotypeCaveat =
  "Un génotype n'est pas un diagnostic : il module la lecture des dosages, il ne la remplace pas.";
