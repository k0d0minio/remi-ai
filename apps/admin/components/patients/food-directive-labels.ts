import {
  formatDate,
  type FoodDirectiveFault,
  type FoodDirectiveKind,
  type FoodLimitLevel,
} from "@remi/services/shared";

/**
 * The words of the food directives (REM-54, story 13). The three field labels
 * are Morgane's. One home, so that the read view, the editor and the messages
 * of a refused save say the same thing.
 */
export const foodDirectiveKindLabels: Record<FoodDirectiveKind, string> = {
  favour: "À favoriser",
  limit: "À limiter",
  exclude: "Éviction totale",
};

/** The two default levels of the breakdown (food-directives, question 2). */
export const foodLimitLevelLabels: Record<FoodLimitLevel, string> = {
  reduce: "Réduire",
  rare: "Rare",
};

export const LIMIT_LEVEL_NOT_SET = "Niveau non précisé";

/** REMI has no term base yet: each term has this mark. */
export const TERM_NOT_RECOGNISED = "non reconnu";

type Period = {
  startsOn: string | null;
  endsOn: string | null;
  durable: boolean;
};

/** The period of one eviction, in words. */
export const evictionPeriodLabel = ({ startsOn, endsOn, durable }: Period) => {
  if (durable) {
    return "Exclusion durable";
  }
  if (endsOn === null) {
    return "Période non renseignée";
  }
  return startsOn === null
    ? `Jusqu'au ${formatDate(endsOn)}`
    : `Du ${formatDate(startsOn)} au ${formatDate(endsOn)}`;
};

const NOTHING_SAVED = "Rien n'a été enregistré.";

/** What is wrong with one directive, and what to do. It names the term. */
export const foodDirectiveFaultReason = ({
  code,
  term,
}: FoodDirectiveFault): string => {
  const named = `« ${term} »`;
  switch (code) {
    case "favour_and_exclude":
      return `${named} figure dans « À favoriser » et dans « Éviction totale ». Retirez ce terme de l'un des deux champs.`;
    case "eviction_without_period":
      return `L'éviction ${named} n'a ni date de fin ni statut durable. Indiquez une date de fin, ou cochez « Exclusion durable ».`;
    case "durable_with_end":
      return `L'éviction ${named} est durable et porte une date de fin. Gardez l'un des deux.`;
    case "invalid_date":
      return `Une date de l'éviction ${named} n'est pas valide.`;
    case "end_before_start":
      return `La date de fin de l'éviction ${named} est avant sa date de début.`;
    case "duplicate_term":
      return `${named} figure deux fois dans le même champ.`;
    case "term_too_long":
      return `Un terme est trop long (200 caractères au plus) : ${named}.`;
    case "unreadable_term":
      return `${named} ne contient ni lettre ni chiffre. Corrigez ce terme ou retirez-le.`;
    case "period_on_other_kind":
    case "level_on_other_kind":
      return `La consigne ${named} porte une valeur qui n'est pas de son champ. Rechargez la page, puis recommencez.`;
  }
};

/** The message of a refused save: the reason, then that nothing was saved. */
export const foodDirectiveFaultMessage = (fault: FoodDirectiveFault): string =>
  `${foodDirectiveFaultReason(fault)} ${NOTHING_SAVED}`;
