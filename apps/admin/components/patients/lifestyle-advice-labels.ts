import {
  LIFESTYLE_ADVICE_DETAILS_MAX,
  LIFESTYLE_ADVICE_TEXT_MAX,
  type LifestyleAdviceFault,
  type LifestyleAdviceKey,
} from "@remi/services/shared";

/** The six categories of story 17, in Morgane's words. */
export const lifestyleAdviceLabels: Record<LifestyleAdviceKey, string> = {
  physical_activity: "Activité physique",
  stress_management: "Gestion du stress",
  sleep: "Sommeil",
  hydration: "Hydratation",
  eating_behaviour: "Comportements alimentaires / habitudes à table",
  lifestyle_other: "Autres conseils d'hygiène de vie",
};

const reasons: Record<LifestyleAdviceFault["code"], string> = {
  text_missing: "le texte du conseil est vide",
  text_too_long: `le texte dépasse ${LIFESTYLE_ADVICE_TEXT_MAX} caractères`,
  details_too_long: `les précisions dépassent ${LIFESTYLE_ADVICE_DETAILS_MAX} caractères`,
};

/** The refusal of a save, with the line that has the fault. */
export const lifestyleAdviceFaultMessage = (fault: LifestyleAdviceFault) =>
  fault.category === null
    ? `Conseil modifié n° ${fault.line} : ${reasons[fault.code]}. Rien n'a été enregistré.`
    : `${lifestyleAdviceLabels[fault.category]}, nouveau conseil n° ${fault.line} : ${reasons[fault.code]}. Rien n'a été enregistré.`;
