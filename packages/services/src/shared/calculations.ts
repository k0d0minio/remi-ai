/**
 * The automatic calculations of the file — stories 7, 8 and 9. This module is
 * the one home of their vocabulary and their pure functions: the BMI here,
 * the protein and energy estimates with `protein-needs` and `energy-needs`.
 *
 * Each result is an estimate until the practitioner validates it (D-30). The
 * storage is `patient_calculations`, one row per patient and kind, with the
 * estimate and the validated value in separate columns.
 *
 * Isomorphic: no I/O, so the console and the services import it as is.
 */

import type { Locale } from "./i18n";

/** One row of `patient_calculations` per kind and patient. */
export const calculationKinds = ["bmi", "protein", "energy"] as const;

export type CalculationKind = (typeof calculationKinds)[number];

/**
 * The practitioner's « situation particulière » (story 8), on
 * `patient_profiles.special_situation`. Null until the practitioner enters
 * it: `none` is an answer, not a default (D-30, Jamie accepted on
 * 2026-11-10). `other` carries its note in `special_situation_note`.
 * `protein-needs` reads it.
 */
export const specialSituations = [
  "none",
  "pregnancy_1",
  "pregnancy_2",
  "pregnancy_3",
  "lactation_first_6_months",
  "lactation_after_6_months",
  "pathology",
  "malnutrition",
  "other",
] as const;

export type SpecialSituation = (typeof specialSituations)[number];

/**
 * The four WHO classes, lowest first. A class holds every BMI under its
 * `below` bound and at or above the bound of the class before it. Obesity has
 * no upper bound. The French is Morgane's wording (story 7).
 */
export const bmiClasses = [
  {
    key: "underweight",
    below: 18.5,
    label: { fr: "Insuffisance pondérale", en: "Underweight" },
  },
  {
    key: "normal",
    below: 25,
    label: { fr: "Corpulence normale", en: "Normal weight" },
  },
  {
    key: "overweight",
    below: 30,
    label: { fr: "Surpoids", en: "Overweight" },
  },
  {
    key: "obesity",
    below: null,
    label: { fr: "Obésité", en: "Obesity" },
  },
] as const satisfies readonly {
  key: string;
  below: number | null;
  label: Readonly<Record<Locale, string>>;
}[];

export type BmiClass = (typeof bmiClasses)[number];

/**
 * The BMI, weight over height squared, rounded to one decimal: the value the
 * file shows (story 7: « 165 cm, 65 kg → IMC 23,9 »). The class and the alert
 * read this rounded value, so the screen and the class never disagree (Jamie
 * accepted on 2026-11-10).
 */
export const bmi = (weightKg: number, heightCm: number) => {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

/** The WHO class of a BMI. */
export const bmiClass = (value: number): BmiClass =>
  bmiClasses.find((entry) => entry.below === null || value < entry.below) ??
  bmiClasses[bmiClasses.length - 1];
